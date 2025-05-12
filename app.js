const express = require('express');
const supabase = require('./src/config/db');
const bodyParser = require('body-parser');
const encryptionRoutes = require('./src/routes/encryptionRoutes');
const decryptionRoutes = require('./src/routes/decryptionRoutes');
const authRoutes = require('./src/routes/authRoutes');
const invitation = require ('./src/routes/invitationRoutes')
const websocketRoutes = require('./src/routes/webSocketRoute');
const userRoutes = require('./src/routes/UserRoutes') // <-- NEW: Import WebSocket routes
const cors = require('cors');
const http = require('http'); // <-- NEW: Import http module
const { initializeSocketServer } = require('./src/websocket/websocket');

const app = express();
const server = http.createServer(app); // <-- NEW: create a server based on Express app

// Middleware
app.use(cors());
app.use(bodyParser.json()); 
app.use(express.json());

// Routes
app.use('/auth', authRoutes); 
app.use('/api/decryption', decryptionRoutes);
app.use('/api/encryption', encryptionRoutes); 
app.use('/api', invitation); // <-- NEW: Use the invitation routes
const chatroomRoutes = require('./src/routes/chatroomRoutes');
app.use('/api/users', userRoutes);
app.use('/api', chatroomRoutes);
// Add the WebSocket routes
app.use('/api/websocket', websocketRoutes);

// Test DB Connection Route
app.get('/test-db-connection', async (req, res) => {
  try {
      console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
      console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'KEY_PRESENT' : 'KEY_MISSING');

      const { data, error } = await supabase.from('users').select('*').limit(1);

      if (error) {
          console.error('Supabase Query Error:', error.message);
          return res.status(500).json({
              success: false,
              message: 'Error querying database',
              error: error.message
          });
      }

      console.log('Query Success:', data);
      return res.status(200).json({
          success: true,
          data
      });
  } catch (err) {
      console.error('Catch Error:', err.message);
      return res.status(500).json({
          success: false,
          message: 'Error connecting to Supabase',
          error: err.message
      });
  }
});

// Welcome Route
app.get('/', (req, res) => {
  res.send('Welcome to the LockChat Backend API!');
});

// Initialize the WebSocket server and pass the HTTP server
try {
    initializeSocketServer(server);
    console.log('✅ WebSocket server initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize WebSocket server:', err.message);
  }
// this one got removed for Deployment purposes 
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // <-- CHANGE app.listen to server.listen


// Vercel expects you to export the app as the handler
//module.exports = app;







