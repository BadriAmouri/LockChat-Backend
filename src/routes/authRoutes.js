express = require('express');
const { generateECCKeyPair } = require('../utils/KeyGeneration');
const supabase = require('../config/db');
const router = express.Router();   

router.post('/generate-keys', async(req, res) => {
    try {
        const {user_id} = req.body; // Extract user ID from request body
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        // Generate ECC key pair
        const { publicKey, privateKey } = await generateECCKeyPair();
        // Store keys in the database
        const {error} = await supabase
            .from('users')
            .update({public_key:publicKey})
            .eq('user_id', user_id)
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        // Return keys to the client
        res.json({ publicKey, privateKey });
    } catch (error) {
        console.error('Error generating keys:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });
module.exports = router;