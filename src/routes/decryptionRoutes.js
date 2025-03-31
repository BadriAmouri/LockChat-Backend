const express = require('express');
const DecryptionController = require('../controllers/decryptionController');

const router = express.Router();

// Route to get a specific encrypted message by message ID
router.get('/messages/:messageId', DecryptionController.getEncryptedMessage);

// Route to get all messages sent by a specific sender
router.get('/messages/sender/:senderId', DecryptionController.getMessagesBySender);

// Route to get all messages received by a specific recipient
router.get('/messages/recipient/:recipientId', DecryptionController.getMessagesByRecipient);

// Route to get all messages exchanged between a sender and recipient
router.get('/messages/conversation/:senderId/:recipientId', DecryptionController.getMessagesBetweenUsers);

// Route to get an encrypted key by key ID
router.get('/keys/:keyId', DecryptionController.getKeyById);

module.exports = router;
