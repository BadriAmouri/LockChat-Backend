const express = require('express');
const supabase = require('./src/config/db');
const bodyParser = require('body-parser');
const encryptionRoutes = require('./src/routes/encryptionRoutes');
const decryptionRoutes = require('./src/routes/decryptionRoutes');
const authRoutes = require('./src/routes/authRoutes');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json()); // To parse JSON bodies 
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/auth', authRoutes); // Use the auth routes
app.use('/api/decryption', decryptionRoutes);
app.use('/api/encryption', encryptionRoutes); 

app.use(express.json());


const chatroomRoutes = require('./src/routes/chatroomRoutes');
app.use('/api', chatroomRoutes);

// Add this route to display the welcome message on the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the LockChat Backend API!');
  });

// Vercel expects you to export the app as the handler
module.exports = app;

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








