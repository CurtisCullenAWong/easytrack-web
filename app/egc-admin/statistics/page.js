'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, Divider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';

// Mock data
const shipmentData = [
    { id: '#12345', status: 'In Transit', origin: 'Lagos, Nig.', destination: 'Accra, Ghana', priority: 'High', type: 'Perishable Goods', etd: '12 Dec 2024' },
    { id: '#67810', status: 'Delayed', origin: 'Nairobi', destination: 'Kampala, Uga.', priority: 'Low', type: 'Electronics', etd: '14 Dec 2024' },
    { id: '#34150', status: 'Delivered', origin: 'Lagos, Nig.', destination: 'Accra, Ghana', priority: 'High', type: 'Documents', etd: '8 Dec 2024' },
];

const fleetData = [
    { date: 'Jan', value: 100 }, { date: 'Feb', value: 200 }, { date: 'Mar', value: 150 },
    { date: 'Apr', value: 300 }, { date: 'May', value: 250 },
];

const fuelData = [
    { month: 'Jan', spending: 300, allocation: 200 },
    { month: 'Feb', spending: 400, allocation: 300 },
    { month: 'Mar', spending: 350, allocation: 250 },
];

export default function Page() {
    // Styles
    const containerStyles = { p: 3 };
    const titleStyles = { mb: 3, color: "primary.main", fontWeight: "bold" };
    const cardStyles = { height: "100%" };
    const chartContainerStyles = { width: "100%", height: 200 };
    const dividerStyles = { my: 1 };
    const gridContainerStyles = { spacing: 2 };
    const gridItemStyles = { xs: 12, md: 4 };
    const gridItemLargeStyles = { xs: 12, md: 8 };
    const gridItemHalfStyles = { xs: 12, md: 6 };
    const gridItemFullStyles = { xs: 12 };
    const gridMarginStyles = { mt: 2 };

    return (
        <Box sx={containerStyles}>
            <Typography variant="h3" sx={titleStyles}>Statistics</Typography>

            <Grid container sx={gridContainerStyles}>
                <Grid item sx={gridItemStyles}>
                    <Card sx={cardStyles}>
                        <CardContent>
                            <Typography variant="subtitle2">Shipment Track</Typography>
                            <Typography variant="h5">4,425</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item sx={gridItemStyles}>
                    <Card sx={cardStyles}>
                        <CardContent>
                            <Typography variant="subtitle2">Fleet Performance</Typography>
                            <Typography variant="h5">134</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item sx={gridItemStyles}>
                    <Card sx={cardStyles}>
                        <CardContent>
                            <Typography variant="subtitle2">Delivery Status</Typography>
                            <Typography variant="h5">2,562</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container sx={{ ...gridContainerStyles, ...gridMarginStyles }}>
                <Grid item sx={gridItemLargeStyles}>
                    <Card>
                        <CardContent>
                            <Tabs value={0}>
                                <Tab label="Daily" />
                                <Tab label="Monthly" />
                                <Tab label="Year" />
                            </Tabs>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Shipment ID</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Origin</TableCell>
                                        <TableCell>Destination</TableCell>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>ETD</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {shipmentData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.status}</TableCell>
                                            <TableCell>{item.origin}</TableCell>
                                            <TableCell>{item.destination}</TableCell>
                                            <TableCell>{item.priority}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{item.etd}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item sx={gridItemStyles}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Performance Metrics</Typography>
                            <Divider sx={dividerStyles} />
                            <Typography variant="body2">Delivery Success Rate: 80%</Typography>
                            <Typography variant="body2">Average Shipment Time: 3.5 Days</Typography>
                            <Typography variant="body2">Fuel Efficiency: 18 MPG</Typography>
                            <Typography variant="body2">Active Shipments: 3.5 Days</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container sx={{ ...gridContainerStyles, ...gridMarginStyles }}>
                <Grid item sx={gridItemHalfStyles}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Fleet Performance</Typography>
                            <ResponsiveContainer sx={chartContainerStyles}>
                                <LineChart data={fleetData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item sx={gridItemHalfStyles}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Fuel Analysis</Typography>
                            <ResponsiveContainer sx={chartContainerStyles}>
                                <BarChart data={fuelData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="spending" fill="#8884d8" />
                                    <Bar dataKey="allocation" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container sx={{ ...gridContainerStyles, ...gridMarginStyles }}>
                <Grid item sx={gridItemFullStyles}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Weekly Overview</Typography>
                            <ResponsiveContainer sx={chartContainerStyles}>
                                <BarChart data={fleetData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}