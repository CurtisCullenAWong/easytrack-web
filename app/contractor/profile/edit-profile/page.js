"use client";

import { Box, Typography, Grid, TextField, MenuItem, InputAdornment, IconButton, Button, useTheme, Snackbar, Alert, Autocomplete } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/navigation";

export default function Page() {
  const theme = useTheme();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const fileInputRef = useRef(null);
  const fileInputBackRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [original, setOriginal] = useState(null);
  const [govIdTypes, setGovIdTypes] = useState([]);
  const [selectedGovIdType, setSelectedGovIdType] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [form, setForm] = useState({ first_name: "", middle_initial: "", last_name: "", suffix: "", contact_number: "", birth_date: "", emergency_contact_name: "", emergency_contact_number: "", gov_id_number: "", gov_id_proof: "", gov_id_proof_back: "" });

  // Suffix options
  const suffixes = ["", "Jr", "Jr.", "Sr", "Sr.", "II", "III", "IV", "V"];

  // Add phone number formatting function
  const formatPhoneNumber = (value) => {
    // If empty, return empty string
    if (!value) return '';
    
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Only allow up to 10 digits after the country code
    let trimmedNumber = phoneNumber;
    if (trimmedNumber.startsWith('63')) {
      trimmedNumber = trimmedNumber.slice(2);
    } else if (trimmedNumber.startsWith('0')) {
      trimmedNumber = trimmedNumber.slice(1);
    }
    trimmedNumber = trimmedNumber.slice(0, 10);
    
    // Format as +63 XXX XXX XXXX
    if (trimmedNumber.length === 0) return '+63 ';
    if (trimmedNumber.length <= 3) return `+63 ${trimmedNumber}`;
    if (trimmedNumber.length <= 6) return `+63 ${trimmedNumber.slice(0, 3)} ${trimmedNumber.slice(3)}`;
    return `+63 ${trimmedNumber.slice(0, 3)} ${trimmedNumber.slice(3, 6)} ${trimmedNumber.slice(6)}`;
  };

  // Add onFocus handler for phone number
  const handlePhoneFocus = () => {
    if (!form.contact_number) {
      setForm(prev => ({ ...prev, contact_number: '+63' }));
    }
  };

  const handleEmergencyPhoneFocus = () => {
    if (!form.emergency_contact_number) {
      setForm(prev => ({ ...prev, emergency_contact_number: '+63' }));
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) { setLoading(false); return; }
      const userEmail = session.user.email;
      const { data, error } = await supabase.from('profiles').select('first_name, middle_initial, last_name, suffix, contact_number, birth_date, emergency_contact_name, emergency_contact_number, gov_id_type, gov_id_number, gov_id_proof, gov_id_proof_back').eq('email', userEmail).single();
      if (data) {
        const cleanData = { first_name: data.first_name || "", middle_initial: data.middle_initial || "", last_name: data.last_name || "", suffix: data.suffix || "", contact_number: data.contact_number || "", birth_date: data.birth_date || "", emergency_contact_name: data.emergency_contact_name || "", emergency_contact_number: data.emergency_contact_number || "", gov_id_number: data.gov_id_number || "", gov_id_proof: data.gov_id_proof || "", gov_id_proof_back: data.gov_id_proof_back || "" };
        setForm(cleanData);
        setOriginal(cleanData);
        if (data.gov_id_type) setSelectedGovIdType(String(data.gov_id_type));
      }
      setLoading(false);
    };
    const fetchGovIdTypes = async () => {
      const { data, error } = await supabase.from('verify_info_type').select('id, id_type_name');
      if (data) setGovIdTypes(data);
    };
    fetchProfile();
    fetchGovIdTypes();
  }, []);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    if (name === 'middle_initial') {
      // Only allow a single letter
      const singleLetter = value.slice(0, 1).toUpperCase();
      if (singleLetter.match(/^[A-Z]$/) || singleLetter === '') {
        setForm(prev => ({ ...prev, [name]: singleLetter }));
      }
    } else if (name === 'contact_number' || name === 'emergency_contact_number') {
      // Handle phone number formatting
      const formatted = formatPhoneNumber(value);
      setForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleKeyPress = (event) => { if (event.key === 'Enter') handleSave(); };
  const handleClear = () => window.location.reload();
  const triggerFileInput = (type) => type === 'front' ? fileInputRef.current?.click() : fileInputBackRef.current?.click();

  const handleSave = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return;
    const userEmail = session.user.email;
    const updates = {};
    Object.keys(form).forEach(key => { if (form[key] !== (original ? original[key] : "")) { updates[key] = form[key]; } });
    if (selectedGovIdType) updates.gov_id_type = selectedGovIdType;
    if (Object.keys(updates).length === 0) { setLoading(false); router.push("/contractor/profile"); return; }
    updates.updated_at = new Date().toISOString();
    const { error } = await supabase.from('profiles').update(updates).eq('email', userEmail);
    setLoading(false);
    if (!error) router.push("/contractor/profile");
  };

  const handleFileUpload = async (event, type) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('id, gov_id_proof, gov_id_proof_back').eq('email', session.user.email).single();
      if (profileError || !profileData) throw new Error('Failed to get user profile');
      const oldUrl = type === 'front' ? profileData.gov_id_proof : profileData.gov_id_proof_back;
      if (oldUrl) {
        try {
          const url = new URL(oldUrl);
          const pathMatch = url.pathname.match(/airlines\/([^.]+_[^./]+)\.(\w+)/);
          if (pathMatch) {
            const fileName = pathMatch[1];
            const fileExt = pathMatch[2];
            const filePath = `airlines/${fileName}.${fileExt}`;
            await supabase.storage.from('gov-id').remove([filePath]);
          }
        } catch (e) {}
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileData.id}_${type}.${fileExt}`;
      const filePath = `airlines/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('gov-id').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { signedUrl } } = await supabase.storage.from('gov-id').createSignedUrl(filePath, 31536000);
      if (!signedUrl) throw new Error('Failed to get signed URL');
      const { error: updateError } = await supabase.from('profiles').update({ [type === 'front' ? 'gov_id_proof' : 'gov_id_proof_back']: signedUrl }).eq('email', session.user.email);
      if (updateError) throw updateError;
      setForm(prev => ({ ...prev, [type === 'front' ? 'gov_id_proof' : 'gov_id_proof_back']: signedUrl }));
      setSnackbarMessage('Image uploaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error uploading file. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const menuProps = { PaperProps: { style: { maxHeight: 48 * 5 } } };
  const containerStyles = { p: 4, maxWidth: "1400px", mx: "auto" };
  const headerStyles = { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 };
  const backButtonStyles = { display: "flex", alignItems: "center", gap: 2 };
  const formStyles = { minWidth: 300 };
  const buttonContainerStyles = { mt: 4, display: "flex", justifyContent: "center", gap: 2 };
  const fileInputStyles = { display: 'none' };

  return (
    <Box sx={containerStyles}>
      <Box sx={headerStyles}>
        <Box sx={backButtonStyles}>
          <IconButton onClick={() => router.push("/contractor/profile")} sx={{ color: "primary.main" }}><ChevronLeftIcon /></IconButton>
          <Typography variant="h4" fontWeight="bold" color="primary">Edit Profile</Typography>
        </Box>
      </Box>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">Personal Information</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={4}><TextField fullWidth sx={formStyles} label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required onKeyPress={handleKeyPress} inputProps={{ minLength: 2, maxLength: 50 }} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth sx={formStyles} label="Middle Initial" name="middle_initial" value={form.middle_initial} onChange={handleChange} required onKeyPress={handleKeyPress} inputProps={{ maxLength: 1 }} placeholder="A" /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth sx={formStyles} label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required onKeyPress={handleKeyPress} inputProps={{ minLength: 2, maxLength: 50 }} /></Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              freeSolo
              options={suffixes}
              value={form.suffix}
              onChange={(event, newValue) => {
                setForm(prev => ({ ...prev, suffix: newValue || "" }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={formStyles}
                  label="Suffix"
                  name="suffix"
                  onKeyPress={handleKeyPress}
                  inputProps={{
                    ...params.inputProps,
                    maxLength: 5
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth sx={formStyles} label="Contact Number" name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="+63 XXX XXX XXXX" required onKeyPress={handleKeyPress} onFocus={handlePhoneFocus} inputProps={{ pattern: '^\\+63\\s\\d{3}\\s\\d{3}\\s\\d{4}$' }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth sx={formStyles} label="Date of Birth" name="birth_date" value={form.birth_date} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} required onKeyPress={handleKeyPress} /></Grid>
        </Grid>

        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">Emergency Contact</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6}><TextField fullWidth sx={formStyles} label="Emergency Contact Name" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} required onKeyPress={handleKeyPress} inputProps={{ minLength: 2, maxLength: 100 }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth sx={formStyles} label="Contact Number" name="emergency_contact_number" value={form.emergency_contact_number} onChange={handleChange} required onKeyPress={handleKeyPress} onFocus={handleEmergencyPhoneFocus} placeholder="+63 XXX XXX XXXX" inputProps={{ pattern: '^\\+63\\s\\d{3}\\s\\d{3}\\s\\d{4}$' }} /></Grid>
        </Grid>

        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">Identification & Verification</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth sx={formStyles} label="Government ID Type" select SelectProps={{ MenuProps: menuProps }} value={selectedGovIdType ?? ""} onChange={e => setSelectedGovIdType(e.target.value)} required onKeyPress={handleKeyPress}>
              {govIdTypes.map((type) => <MenuItem key={type.id} value={String(type.id)}>{type.id_type_name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth sx={formStyles} label="Government ID Number" name="gov_id_number" value={form.gov_id_number} onChange={handleChange} onKeyPress={handleKeyPress} inputProps={{ minLength: 5, maxLength: 20 }} /></Grid>
          <Grid item xs={12} sm={6}>
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'front')} style={fileInputStyles} accept="image/*" />
            <TextField fullWidth sx={formStyles} label="Upload Government ID (Front)" value={form.gov_id_proof ? 'Image uploaded' : ''} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => triggerFileInput('front')} disabled={uploading}><UploadIcon /></IconButton></InputAdornment>, readOnly: true }} onKeyPress={handleKeyPress} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <input type="file" ref={fileInputBackRef} onChange={(e) => handleFileUpload(e, 'back')} style={fileInputStyles} accept="image/*" />
            <TextField fullWidth sx={formStyles} label="Upload Government ID (Back)" value={form.gov_id_proof_back ? 'Image uploaded' : ''} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => triggerFileInput('back')} disabled={uploading}><UploadIcon /></IconButton></InputAdornment>, readOnly: true }} onKeyPress={handleKeyPress} />
          </Grid>
        </Grid>

        <Box sx={buttonContainerStyles}>
          <Button variant="outlined" color="inherit" onClick={handleClear}>Clear All Fields</Button>
          <Button type="submit" variant="contained" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </Box>
      </form>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}