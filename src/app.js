const express=require('express');
const cookieParser=require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const authRouter=require('../src/routes/auth.routes');
const accountRouter=require('../src/routes/account.routes');
const transactionRouter=require('../src/routes/transaction.routes')

const app=express();

// Initialize database connection
connectDB().catch(err => {
    console.error("Database connection failed:", err);
});

app.use(cors({
    origin: process.env.FRONTEND_URL || true, // Allow frontend domain or fall back to true (reflects request origin)
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transaction",transactionRouter);


module.exports=app; 