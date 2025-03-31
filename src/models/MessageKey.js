const db = require('../config/db');

class MessageKey {
   /**
     * Stores an encrypted AES key for both sender and recipient.
     * @param {string} senderId - ID of the sender.
     * @param {string} recipientId - ID of the recipient.
     * @param {string} encryptedKeyForSender - Encrypted AES key for the sender.
     * @param {string} encryptedKeyForRecipient - Encrypted AES key for the recipient.
     * @returns {Promise<number>} The inserted key ID.
     */
   static async storeEncryptedKey(senderId, recipientId, encryptedKeyForSender, encryptedKeyForRecipient) {
    console.log("storeEncryptedKey called with:", { senderId, recipientId, encryptedKeyForSender, encryptedKeyForRecipient });

    if (!recipientId) {
        throw new Error("recipientId is null or undefined before storing the encrypted key!");
    }

    const { data, error } = await db
        .from('message_keys')
        .insert([
            { 
                sender_id: senderId, 
                recipient_id: recipientId, 
                encrypted_key_for_sender: encryptedKeyForSender, 
                encrypted_key_for_recipient: encryptedKeyForRecipient ,
                created_at: new Date()
            }
        ])
        .select('encrypted_key_id')
        .single();

    if (error) throw new Error('Error storing encrypted key: ' + error.message);
    return data.encrypted_key_id;
}

/**
 * Retrieves the most recent key for a sender or recipient.
 * @param {string} userId - ID of the user (sender or recipient).
 * @param {boolean} isSender - Whether the user is the sender.
 * @returns {Promise<string>} The latest encrypted AES key.
 */
static async getLatestKey(userId, isSender) {
    console.log(`🔍 Fetching latest key for userId: ${userId}, isSender: ${isSender}`);

    const keyColumn = isSender ? 'encrypted_key_for_sender' : 'encrypted_key_for_recipient';
    console.log(`📌 Selecting column: ${keyColumn}`);

    try {
        const { data, error } = await db
            .from('message_keys')
            .select(`encrypted_key_id, ${keyColumn}`)
            .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false }) // Get the latest key
            .limit(1)
            .single();

        console.log(`📊 Query Result:`, data);

        if (error) {
            console.error(`❌ Error fetching latest key: ${error.message}`);
            throw new Error('Error fetching latest key: ' + error.message);
        }

        if (!data) {
            console.warn(`⚠️ No key found for userId: ${userId}`);
            return null;
        }

        return { id: data.encrypted_key_id, key: data[keyColumn] };
    } catch (err) {
        console.error(`🚨 Unexpected error in getLatestKey: ${err.message}`);
        throw err;
    }
}

/**
 * Retrieves the correct key for a specific message ID.
 * @param {number} messageId - The message ID.
 * @returns {Promise<string>} The correct AES key for decryption.
 */
static async getKeyForMessage(messageId) {
    const { data, error } = await db
        .from('messages')
        .select('encrypted_key_id')
        .eq('message_id', messageId)
        .single();

    if (error) throw new Error('Error fetching key for message: ' + error.message);
    return data.encrypted_key;
}

/**
 * Fetches an encrypted key using its ID.
 * @param {number} keyId - The encrypted key ID.
 * @returns {Promise<Object>} The encrypted key details.
 */
static async getKeyById(keyId) {
    console.log(`🔎 Fetching key by ID: ${keyId}`);
    try {
        const { data, error } = await db
            .from('message_keys')
            .select('encrypted_key_id, encrypted_key_for_sender, encrypted_key_for_recipient')
            .eq('encrypted_key_id', keyId)
            .single();

        if (error) {
            console.error(`❌ Error fetching key by ID: ${error.message}`);
            throw new Error('Error fetching key by ID: ' + error.message);
        }

        if (!data) {
            console.warn(`⚠️ No key found for keyId: ${keyId}`);
            return null;
        }

        return data;
    } catch (err) {
        console.error(`🚨 Unexpected error in getKeyById: ${err.message}`);
        throw err;
    }
}
}

module.exports = MessageKey;
