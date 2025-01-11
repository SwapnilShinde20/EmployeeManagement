import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

const app = express();
// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/User.routes.js';
import employeeRoutes from './routes/Employee.routes.js';
import { sendEmail } from './config/webhookConfig.js';
// const employeeRoutes = require('./routes/employeeRoutes');
// const calendarRoutes = require('./routes/calendarRoutes');
// const errorHandler = require('./middlewares/errorHandler');
// const { default: connectDB } = require('./config/db');

// Middleware setup
app.use(cors({
    origin: ["http://localhost:5173","http://localhost:5174","https://employee-management-pied.vercel.app"],
    credentials:true
})); // To enable cross-origin requests
app.use(express.json()); // To parse JSON requests
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(morgan('dev')); // For logging requests

// Database connection
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
          });
    })
    .catch((err) => {
    })
// API Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
// app.use('/api/calendar', calendarRoutes);

// Error handling middleware
// app.use(errorHandler);

