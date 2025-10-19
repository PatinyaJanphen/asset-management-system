import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import router from './routes/router.js';
import { databaseconnect } from './config/databaseconnect.js';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = ['http://localhost:5174'];

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(cookieParser());

// Database
databaseconnect();

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to Asset Management System API');
});
app.use('/api', router);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;
