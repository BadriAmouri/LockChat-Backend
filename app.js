const express = require('express');
const supabase = require('./src/config/db');

const app = express();

app.get('/test-db', async (req, res) => {
    console.log("Testing Supabase connection...");

    const { data, error } = await supabase.from('users').select('*'); // Fetch users

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ users: data });
});

app.use(express.json());

const messageRoutes = require("./src/routes/MessageRoutes");
app.use("/api/messages", messageRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
