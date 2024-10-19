// src/components/PieChart.js
import React, { useEffect, useState } from 'react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { Typography, CircularProgress } from '@mui/material';

const PieChart = ({ selectedMonth }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        // Fetch the pie chart data from the API
        const fetchPieChartData = async () => {
            setLoading(true); // Set loading to true when fetching starts
            setError(null); // Reset error state before fetching
            try {
                const response = await axios.get(`http://localhost:5000/api/transactions/pie-chart?month=${selectedMonth}`);
                // Map the API response to match the structure needed for the PieChart component
                const formattedData = response.data.map(item => ({
                    name: item.category, // Map 'category' to 'name'
                    value: item.count    // Map 'count' to 'value'
                }));
                setData(formattedData); // Update the data state with the formatted data
            } catch (error) {
                console.error('Error fetching pie chart data:', error);
                setError('Failed to fetch data. Please try again later.'); // Set error message
            } finally {
                setLoading(false); // Set loading to false after fetching is complete
            }
        };

        fetchPieChartData();
    }, [selectedMonth]);

    // Define colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Pie Chart for {selectedMonth}
            </Typography>
            {loading ? (
                <CircularProgress /> // Show loading spinner while fetching data
            ) : error ? (
                <Typography color="error">{error}</Typography> // Show error message
            ) : (
                <RePieChart width={400} height={400}>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </RePieChart>
            )}
        </div>
    );
};

export default PieChart;
