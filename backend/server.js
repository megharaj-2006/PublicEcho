const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const db = require('./config/db'); // Runs db check on start

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development server
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with expanded limits for Base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PublicEcho Backend API Server is active.' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Global Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong on the server', 
    error: err.message || err.toString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 PublicEcho Express Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
