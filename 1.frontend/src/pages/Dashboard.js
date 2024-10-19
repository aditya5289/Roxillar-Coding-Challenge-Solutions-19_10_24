// src/pages/Dashboard.js
import React, { useState } from 'react';
import TransactionTable from '../components/TransactionTable';
import Statistics from '../components/Statistics';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart'; // Import PieChart component
import { Container, Typography, TextField, Grid, Paper } from '@mui/material';

// Define the Dashboard component
const Dashboard = () => {
    // State to manage the selected month
    const [selectedMonth, setSelectedMonth] = useState('January');

    // Handler for month selection change
    const handleMonthChange = (event) => {
        const selectedValue = event.target.value;
        console.log(`Month selected: ${selectedValue}`); // Log the selected month
        setSelectedMonth(selectedValue);
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom align="center">
                Transaction Dashboard
            </Typography>
            <TextField
                select
                label="Select Month"
                value={selectedMonth}
                onChange={handleMonthChange} // Use the handler function
                SelectProps={{
                    native: true,
                }}
                variant="outlined"
                style={{ marginBottom: '20px', width: '200px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
            >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </TextField>

            {/* Arrange components in a grid */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h5" gutterBottom align="center">
                            Statistics
                        </Typography>
                        <Statistics selectedMonth={selectedMonth} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h5" gutterBottom align="center">
                            Pie Chart
                        </Typography>
                        <PieChart selectedMonth={selectedMonth} />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h5" gutterBottom align="center">
                            Bar Chart
                        </Typography>
                        <BarChart selectedMonth={selectedMonth} />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h5" gutterBottom align="center">
                            Transaction Table
                        </Typography>
                        <TransactionTable selectedMonth={selectedMonth} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

// Export the Dashboard component
export default Dashboard;
