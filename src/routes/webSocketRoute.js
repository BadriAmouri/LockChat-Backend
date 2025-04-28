// routes/websocketRoute.js
const express = require('express');
const router = express.Router();
const { handleSocketId } = require('../controllers/webSocketController');

router.post('/get-socket-id', handleSocketId);

module.exports = router;
