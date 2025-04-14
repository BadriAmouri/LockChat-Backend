const KeyManagementService = require('../services/keyManagementService');
const MessageKey = require('../models/MessageKey');
class KeyManagementController {
    static async storeEncryptedKey(req, res) {
        try {
            const { senderId, recipientId, encryptedKeyForSender, encryptedKeyForRecipient } = req.body;
            const insertedKeyId = await MessageKey.storeEncryptedKey(
                senderId,
                recipientId,
                encryptedKeyForSender,
                encryptedKeyForRecipient
            );
    
            res.json({ success: true, insertedKeyId }); // ✅ return the key ID
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getPublicKey(req, res) {
        try {
            const { userId } = req.params;
            const publicKey = await KeyManagementService.getPublicKey(userId);
            if (!publicKey) {
                return res.status(404).json({ error: "Public key not found" });
            }
            res.json({ publicKey });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = KeyManagementController;
