import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();



// Test route
app.get("/", (req, res) => {
    res.send("Hello from Node.js server!");
});


// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});