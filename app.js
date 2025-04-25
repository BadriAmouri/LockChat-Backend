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



// Test the connection with Supabase
app.get('/test-db-connection', async (req, res) => {
  try {
      // Query a table in your database (e.g., 'users')
      const { data, error } = await supabase.from('users').select('*').limit(1);

      if (error) {
          return res.status(500).json({ success: false, message: 'Error querying database', error: error.message });
      }

      // If the query is successful, return the data
      return res.status(200).json({ success: true, data });
  } catch (err) {
      return res.status(500).json({ success: false, message: 'Error connecting to Supabase', error: err.message });
  }
});

// Add this route to display the welcome message on the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the LockChat Backend API!');
  });

// Vercel expects you to export the app as the handler
module.exports = app;

// this one got removed for Deployment purposes 
//const PORT = 5001;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








