import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/router.js';
import { databaseconnect } from './config/databaseconnect.js';
import cookieParser from 'cookie-parser';

// configure environment
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Database connection
databaseconnect();

// Runing server on port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// API routes
app.get('/', (req, res) => { res.send('Welcome to Asset Management System API'); });
app.use('/api', router);


export default app;
