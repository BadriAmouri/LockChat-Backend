const Message = require('../models/Message');
const MessageKey = require('../models/MessageKey');

class DecryptionController {
    /**
     * Fetches encrypted message and AES key for client decryption.
     */
    static async getEncryptedMessage(req, res) {
        try {
            const { messageId } = req.params;

            // Retrieve the encrypted message and key ID
            const messageData = await Message.getMessageById(messageId);
            const encryptedKey = await MessageKey.getKeyForMessage(messageId);

            res.json({
                encryptedMessage: messageData.encryptedMessage,
                encryptedKey
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Fetches all messages sent by a specific sender.
     */
    static async getMessagesBySender(req, res) {
        try {
            const { senderId } = req.params;

            // Retrieve messages sent by the sender
            const messages = await Message.getMessagesBySender(senderId);

            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Fetches all messages received by a specific recipient.
     */
    static async getMessagesByRecipient(req, res) {
        try {
            const { recipientId } = req.params;

            // Retrieve messages received by the recipient
            const messages = await Message.getMessagesByRecipient(recipientId);

            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Fetches all messages exchanged between a specific sender and recipient.
     */
    static async getMessagesBetweenUsers(req, res) {
        try {
            const { senderId, recipientId } = req.params;

            // Retrieve messages between sender and recipient
            const messages = await Message.getMessagesBetweenUsers(senderId, recipientId);

            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Fetches an encrypted key using its ID.
     */
    static async getKeyById(req, res) {
        try {
            const { keyId } = req.params;

            // Retrieve the encrypted key by ID
            const keyData = await MessageKey.getKeyById(keyId);

            if (!keyData) {
                return res.status(404).json({ error: 'Key not found' });
            }

            res.json(keyData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = DecryptionController;
