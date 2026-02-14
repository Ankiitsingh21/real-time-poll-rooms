require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const pollRoutes = require('./routes/pollRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 6000;

// Trust proxy for accurate IP detection
app.set('trust proxy', true);

// Middleware
// app.use(
//     cors({
//         origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//         credentials: true,
//     })
// );
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/polls', pollRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
connectDB().then(() => {
    // console.log("hello");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
