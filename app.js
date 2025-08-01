import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js'
//import postRoutes from './routes/postRoutes.js';

// Load environment variables
dotenv.config({ path: './env/.env' });

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => res.send('API is up'));

// Mount routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
//app.use('/posts', postRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Optional: global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
