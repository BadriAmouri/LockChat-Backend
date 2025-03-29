const express = require('express');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Main endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the LockChat Backend!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});