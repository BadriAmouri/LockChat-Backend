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


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








