// Import required packages
const express = require('express'); // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Middleware for enabling CORS
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const dotenv = require('dotenv'); // Module to load environment variables
const connectDB = require('./config/db'); // Database connection utility
const transactionRoutes = require('./routes/transactions'); // Routes for transaction API
const axios = require('axios'); // Import Axios for making HTTP requests
const { v4: uuidv4 } = require('uuid'); // Import UUID for generating unique IDs
const Transaction = require('./models/Transaction'); // Import Transaction model

// Import Swagger packages for API documentation
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Define the port to listen on
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Swagger configuration options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0", // OpenAPI version
        info: {
            title: "Transaction API", // Title of the API
            version: "1.0.0", // Version of the API
            description: "API documentation for managing transactions", // Description of the API
            contact: {
                name: "Support", // Contact name for API support
                email: "support@example.com", // Contact email for API support
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}`, // URL for the API server
            },
        ],
    },
    apis: ["./routes/*.js"], // Path to the API documentation files
};

// Initialize Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Serve Swagger UI documentation

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies

/**
 * Function to fetch data from the external API
 * @returns {Promise<Object[]>} - The data fetched from the external API
 */
const fetchDataFromSource = async () => {
    try {
        // Send a GET request to the API
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        return response.data; // Return the response data
    } catch (error) {
        console.error('Failed to fetch data from the third-party API:', error);
        throw new Error('Failed to fetch data from the third-party API');
    }
};

/**
 * Function to initialize the database with data from the API
 */
const initializeDatabase = async () => {
    try {
        // Fetch data from the API
        const data = await fetchDataFromSource();
        
        // Map the fetched data to the Transaction model structure
        const transactions = data.map(item => ({
            id: uuidv4(), // Generate a unique ID for each transaction
            title: item.title, // Set the title from the fetched data
            description: item.description, // Set the description from the fetched data
            price: parseFloat(item.price), // Convert price to a number using parseFloat
            category: item.category, // Set the category from the fetched data
            sold: item.sold || false, // Default sold status to false if not provided
            dateOfSale: new Date(item.dateOfSale), // Convert date of sale to Date object
            image: item.image, // Set the image URL from the fetched data
        }));

        // Clear existing transactions in the database
        await Transaction.deleteMany({});
        
        // Insert new transactions into the database
        await Transaction.insertMany(transactions);
        
        console.log('Database initialized successfully with fresh data!');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Call initializeDatabase when the application starts to populate the database
initializeDatabase();

// Define routes for the application
app.use('/api/transactions', transactionRoutes); // Use transaction routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack trace
    res.status(500).json({ error: 'Something went wrong!' }); // Send error response
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Log server startup message
});
