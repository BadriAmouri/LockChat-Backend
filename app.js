const express = require('express');
const supabase = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/auth', authRoutes); // Use the auth routes

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
