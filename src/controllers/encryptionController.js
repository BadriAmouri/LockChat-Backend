const Message = require('../models/Message');
const MessageKey = require('../models/MessageKey');

class EncryptionController {
    /**
     * Stores an encrypted message and its associated encrypted AES key.
     */
    static async storeEncryptedMessage(req, res) {
        try {
            console.log("Received request body:", req.body);
    
            const { senderId, recipientId, chatroomId, encryptedMessage,iv, messageType } = req.body;
    
            if (!recipientId) {
                return res.status(400).json({ error: "recipientId is missing in the request" });
            }
    
            // Save the encrypted key in MessageKeys table
            const keyId = await MessageKey.getLatestKey(senderId, true)
            // Store encrypted message with reference to key
            const messageId = await Message.storeMessage(
                senderId, 
                recipientId, 
                chatroomId, 
                encryptedMessage, 
                keyId.id, 
                iv,
                messageType
            );
    
            res.json({ messageId });
        } catch (error) {
            console.error("Error storing encrypted message:", error);
            res.status(500).json({ error: error.message });
        }
    }
    
}

module.exports = EncryptionController;
