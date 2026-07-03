const mongoose = require('mongoose');

let cachedConnection = null;

async function connectDB() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log("Using cached database connection");
        return cachedConnection;
    }

    try {
        console.log("Establishing new database connection...");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        cachedConnection = conn;
        console.log("Database connected successfully");
        return cachedConnection;
    } catch (err) {
        console.error("Error connecting to database:", err);
        throw err;
    }
}

module.exports = connectDB;