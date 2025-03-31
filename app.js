const express = require('express');
const supabase = require('./src/config/db');
const bodyParser = require('body-parser');
const encryptionRoutes = require('./src/routes/encryptionRoutes');
const decryptionRoutes = require('./src/routes/decryptionRoutes');

const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json()); // To parse JSON bodies 
app.use('/api/decryption', decryptionRoutes);

// Register encryption routes
app.use('/api/encryption', encryptionRoutes); 
/* app.get('/test-db', async (req, res) => {
    console.log("Testing Supabase connection...");

    const { data, error } = await supabase.from('users').select('*'); // Fetch users

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ users: data });
});
 */
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








