// src/components/BarChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { CircularProgress, Typography, Box } from '@mui/material'; // Import Box for styling
import { Chart, registerables } from 'chart.js';

// Register all necessary components and scales from Chart.js
Chart.register(...registerables);

const BarChart = ({ selectedMonth }) => {
    const [data, setData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to handle errors

    // Fetch bar chart data from the API
    const fetchBarData = async () => {
        setLoading(true); // Set loading to true when fetching starts
        setError(null); // Reset error state before fetching
        try {
            const response = await axios.get(`http://localhost:5000/api/transactions/bar-chart`, {
                params: { month: selectedMonth },
            });

            console.log("API Response:", response.data); // Log the API response for debugging

            // Check if the response contains data
            if (response.data.length === 0) {
                setError("No transactions available for this month."); // No data message
                setData({ labels: [], datasets: [] }); // Reset data
                return;
            }

            // Prepare the chart data
            const chartData = {
                labels: response.data.map(item => item.range), // Use 'range' instead of '_id'
                datasets: [
                    {
                        label: 'Number of Transactions',
                        data: response.data.map(item => item.count), // Assuming count is the data point
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };
            console.log("Formatted Chart Data:", chartData); // Log formatted chart data for debugging
            setData(chartData); // Update the data state with the formatted data
        } catch (err) {
            console.error("Error fetching bar chart data:", err); // Log error
            setError("Failed to load chart data. Please try again later."); // Set error message
        } finally {
            setLoading(false); // Set loading to false after fetching is complete
        }
    };

    useEffect(() => {
        fetchBarData(); // Fetch data when selectedMonth changes
    }, [selectedMonth]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allow full height usage
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Transactions', // Y-axis title
                },
                ticks: {
                    precision: 0, // Set tick precision to 0 for integer values
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Categories', // X-axis title
                },
            },
        },
        plugins: {
            legend: {
                display: true, // Show legend
                position: 'top', // Position of the legend
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`; // Custom tooltip label
                    },
                },
            },
        },
    };

    return (
        <Box sx={{ textAlign: 'center', margin: '20px 0', height: '400px', position: 'relative' }}>
            {loading ? (
                <CircularProgress style={{ marginTop: '20px' }} /> // Show loading spinner
            ) : error ? (
                <Typography color="error" variant="h6" style={{ margin: '20px 0' }}>
                    {error}
                </Typography> // Display error message
            ) : (
                <Bar data={data} options={chartOptions} /> // Render the Bar chart
            )}
        </Box>
    );
};

export default BarChart;
