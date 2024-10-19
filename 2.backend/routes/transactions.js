const express = require('express');
const axios = require('axios');
const Transaction = require('../models/Transaction');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Fetch data from third-party API
const fetchDataFromSource = async () => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch data from the third-party API');
    }
};

/**
 * @swagger
 * /api/transactions/initialize:
 *   get:
 *     summary: Initialize the database with transaction data
 *     description: Fetches transaction data from a third-party API and populates the database.
 *     responses:
 *       200:
 *         description: Database initialized successfully
 *       500:
 *         description: Error initializing database
 */

// 1. Initialize Database API
router.get('/initialize', async (req, res) => {
    try {
        const data = await fetchDataFromSource();

        const transactions = data.map(item => ({
            id: uuidv4(),
            title: item.title,
            description: item.description,
            price: Number(item.price),
            category: item.category,
            sold: item.sold || false,
            dateOfSale: new Date(item.dateOfSale),
            image: item.image,
        }));

        // Clear and insert transactions
        await Transaction.deleteMany({});
        await Transaction.insertMany(transactions);

        res.json({ message: 'Database initialized successfully!', count: transactions.length });
    } catch (error) {
        res.status(500).json({ error: 'Error initializing database.', details: error.message });
    }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: List transactions with search and pagination
 *     description: Lists transactions filtered by month, with optional search and pagination parameters.
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month to filter transactions (default is January)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *       - in: query
 *         name: perPage
 *         required: false
 *         description: Number of transactions per page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search query for transactions
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 *       500:
 *         description: Error fetching transactions
 */
// 2. List Transactions with Search and Pagination
router.get('/', async (req, res) => {
    const { month = 'January', page = 1, perPage = 10, search = '' } = req.query;
    const monthIndex = new Date(Date.parse(`${month} 1`)).getMonth() + 1; // 1-indexed month
    const regex = new RegExp(search, 'i');

    try {
        const transactions = await Transaction.find({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
            $or: [
                { title: regex },
                { description: regex }
            ] // Removed the price from the $or condition
        })
        .skip((page - 1) * perPage)
        .limit(Number(perPage));

        const total = await Transaction.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
            $or: [
                { title: regex },
                { description: regex }
            ] // Removed the price from the $or condition
        });

        res.json({ transactions, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions.', details: error.message });
    }
});


/**
 * @swagger
 * /api/transactions/statistics:
 *   get:
 *     summary: Get statistics based on transaction data
 *     description: Provides statistics such as total sales, total sold items, and total not sold items for a given month.
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month to filter transactions (default is January)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction statistics
 *       500:
 *         description: Error fetching statistics
 */

// 3. Statistics API
router.get('/statistics', async (req, res) => {
    const { month = 'January' } = req.query;
    const monthIndex = new Date(Date.parse(`${month} 1`)).getMonth() + 1;

    try {
        const stats = await Transaction.aggregate([
            { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] } } },
            { $group: { _id: null, totalSales: { $sum: "$price" }, totalSoldItems: { $sum: { $cond: ["$sold", 1, 0] } }, totalItems: { $sum: 1 } } }
        ]);

        const totalSales = stats[0]?.totalSales || 0;
        const totalSoldItems = stats[0]?.totalSoldItems || 0;
        const totalNotSoldItems = (stats[0]?.totalItems || 0) - totalSoldItems;

        res.json({ totalSales, totalSoldItems, totalNotSoldItems });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching statistics.', details: error.message });
    }
});

/**
 * @swagger
 * /api/transactions/bar-chart:
 *   get:
 *     summary: Get data for bar chart based on price ranges
 *     description: Provides transaction data grouped by price ranges for bar chart visualization.
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month to filter transactions (default is January)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bar chart data based on price ranges
 *       500:
 *         description: Error fetching bar chart data
 */

// 4. Bar Chart API
router.get('/bar-chart', async (req, res) => {
    const { month = 'January' } = req.query;
    const monthIndex = new Date(Date.parse(`${month} 1`)).getMonth() + 1;

    try {
        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity }
        ];

        const data = await Promise.all(priceRanges.map(async (range) => {
            const count = await Transaction.countDocuments({
                $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
                price: { $gte: range.min, $lte: range.max }
            });
            return { range: range.range, count };
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bar chart data.', details: error.message });
    }
});

/**
 * @swagger
 * /api/transactions/pie-chart:
 *   get:
 *     summary: Get data for pie chart based on categories
 *     description: Provides aggregated transaction data based on product categories for pie chart visualization.
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month to filter transactions (default is January)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pie chart data based on categories
 *       500:
 *         description: Error fetching pie chart data
 */

// 5. Pie Chart API
router.get('/pie-chart', async (req, res) => {
    const { month = 'January' } = req.query;
    const monthIndex = new Date(Date.parse(`${month} 1`)).getMonth() + 1;

    try {
        const pieData = await Transaction.aggregate([
            { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const pieChart = pieData.map(data => ({ category: data._id, count: data.count }));

        res.json(pieChart);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching pie chart data.', details: error.message });
    }
});

/**
 * @swagger
 * /api/transactions/combined-response:
 *   get:
 *     summary: Get combined response from all endpoints
 *     description: Provides a combined response containing statistics, bar chart, and pie chart data.
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month to filter transactions (default is January)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Combined response of statistics, bar chart, and pie chart data
 *       500:
 *         description: Error fetching combined response
 */

//6. Combined API
router.get('/combined-response', async (req, res) => {
    const { month = 'January' } = req.query;
    try {
        const statistics = await axios.get(`http://localhost:5000/api/transactions/statistics?month=${month}`);
        const barChart = await axios.get(`http://localhost:5000/api/transactions/bar-chart?month=${month}`);
        const pieChart = await axios.get(`http://localhost:5000/api/transactions/pie-chart?month=${month}`);

        res.json({
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching combined response.', details: error.message });
    }
});

module.exports = router;
