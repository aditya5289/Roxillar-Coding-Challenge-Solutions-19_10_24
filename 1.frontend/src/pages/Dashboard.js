// src/pages/Dashboard.js
import React, { useState } from 'react';
import TransactionTable from '../components/TransactionTable';
import Statistics from '../components/Statistics';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import { Container, Typography, TextField, Grid, Paper, Box } from '@mui/material';

const Dashboard = () => {
    // Set default month to March
    const [selectedMonth, setSelectedMonth] = useState('March');

    const handleMonthChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedMonth(selectedValue);
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}>
            {/* Main Dashboard Title */}
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #1976d2, #ff9800)', // Gradient color from blue to orange
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // Light shadow for depth
                    marginBottom: '40px',
                }}
            >
                Transaction Dashboard
            </Typography>

            {/* Month Selector */}
            <TextField
                select
                label="Select Month"
                value={selectedMonth}
                onChange={handleMonthChange}
                SelectProps={{
                    native: true,
                }}
                variant="outlined"
                style={{ marginBottom: '30px', width: '220px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
            >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </TextField>

            {/* Grid Layout for Dashboard Components */}
            <Grid container spacing={4}>
                {/* Statistics Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={4} style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <Box style={{ backgroundColor: '#1976d2', padding: '15px' }}>
                            <Typography variant="h5" style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                                📊 Statistics -- ({selectedMonth})
                            </Typography>
                        </Box>
                        <Box style={{ padding: '20px' }}>
                            <Statistics selectedMonth={selectedMonth} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Pie Chart Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={4} style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <Box style={{ backgroundColor: '#ff9800', padding: '15px' }}>
                            <Typography variant="h5" style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                                🥧 Pie Chart -- ({selectedMonth})
                            </Typography>
                        </Box>
                        <Box style={{ padding: '20px' }}>
                            <PieChart selectedMonth={selectedMonth} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Bar Chart Section */}
                <Grid item xs={12}>
                    <Paper elevation={4} style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <Box style={{ backgroundColor: '#4caf50', padding: '15px' }}>
                            <Typography variant="h5" style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                                📈 Bar Chart -- ({selectedMonth})
                            </Typography>
                        </Box>
                        <Box style={{ padding: '20px' }}>
                            <BarChart selectedMonth={selectedMonth} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Transaction Table Section */}
                <Grid item xs={12}>
                    <Paper elevation={4} style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <Box style={{ backgroundColor: '#f44336', padding: '15px' }}>
                            <Typography variant="h5" style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                                📋 Transaction Table -- ({selectedMonth})
                            </Typography>
                        </Box>
                        <Box style={{ padding: '20px' }}>
                            <TransactionTable selectedMonth={selectedMonth} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
