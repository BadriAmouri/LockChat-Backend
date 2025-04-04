const express = require('express');
const EncryptionController = require('../controllers/encryptionController');
const KeyManagementService = require('../services/keyManagementService'); 
const KeyManagementController = require('../controllers/KeyManagementController');
const MessageKey = require('../models/MessageKey');
const router = express.Router();

router.post('/encrypt-message', EncryptionController.storeEncryptedMessage);
router.get('/shouldRotateKey/:senderId/:recipientId', async (req, res) => {
    try {
        const { senderId, recipientId } = req.params; // Extract both senderId and recipientId
        const shouldRotate = await KeyManagementService.shouldRotateKey(senderId, recipientId);
        res.json({ shouldRotate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/getEncryptedKey', async (req, res) => {
    try {
        const { userId, isSender } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const latestKey = await MessageKey.getLatestKey(userId, isSender === 'true'); // Convert isSender to boolean

        if (!latestKey) {
            return res.status(404).json({ error: 'No key found' });
        }

        res.json({ encryptedKey: latestKey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/storeEncryptedKey', KeyManagementController.storeEncryptedKey);
router.get('/users/:userId/publicKey', KeyManagementController.getPublicKey);

module.exports = router;
