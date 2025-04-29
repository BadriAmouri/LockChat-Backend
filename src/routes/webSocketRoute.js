// routes/websocketRoute.js
const express = require('express');
const router = express.Router();
const { handleSocketId } = require('../controllers/webSocketController');
const { checkUserConnection } = require('../websocket/websocket');


router.post('/get-socket-id', handleSocketId);

router.post('/check-user-connection', (req, res) => {
    const { userId } = req.body;
    const isConnected = checkUserConnection(userId);
    res.status(200).json({ isConnected });
  });

module.exports = router;
