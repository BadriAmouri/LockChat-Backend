// controllers/websocketController.js
const { getUserSocketId, updateUserSocketId } = require('../models/websocketModel');
const { v4: uuidv4 } = require('uuid');

async function handleSocketId(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const user = await getUserSocketId(user_id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.socket_id) {
            const newSocketId = uuidv4();
            await updateUserSocketId(user_id, newSocketId);
            return res.json({ socket_id: newSocketId });
        } else {
            return res.json({ socket_id: user.socket_id });
        }
    } catch (error) {
        console.error('Error in handleSocketId:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { handleSocketId };
