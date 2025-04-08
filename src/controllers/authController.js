const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateECCKeyPair} = require("../utils/KeyGeneration");
const user = require("../models/User");

exports.register = async (req, res) => {
    try {
        const { username, email, password, publicKey } = req.body;

        // Check if all the required fields are filled
        if (!username ||  !email || !password || !publicKey) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if the username already exists
        const userExists = await user.getUserByUsername(username);
        if (userExists) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 16);

        // Create the user in the database with the public key from frontend
        const newUser = await user.createUser(username, email, hashedPassword, publicKey);

        if (!newUser) {
            return res.status(500).json({ error: "Error creating user" });
        }

        // Create a JWT token with user data
        const jwt_token = jwt.sign(
            {
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                publicKey: newUser.public_key,
            },
            process.env.JWT_SECRECT_KEY,
            {
                expiresIn: "24h",
            }
        );

        // Return the token and success message (no private key needed anymore)
        res.status(200).json({
            message: "User registered successfully!",
            token: jwt_token
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Error in signing the user up" });
    }
};
exports.login = async (req, res) => {
    try {
        //getting user data from the body 
        const {username, password} = req.body;

        //Check if all the fields are filled
        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        //fetch data from the data base 
        const userData = await user.getUserByUsername(username);
        console.log ("user data from the database: ");
        console.log(await user.getUserByUsername(username));
        //Check if the user exists  
        if (!userData) {
            return res.status(400).json({ error: "User not found" });
        }

        //Check if the password matches 
        const isCorrectPW = await bcrypt.compare (password, userData.password_hash);
        if (!isCorrectPW) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            {
                user_id : userData.user_id,
                username : userData.username,
                email : userData.email,
                publicKey : userData.public_key,
            },
            process.env.JWT_SECRECT_KEY,
            {
                expiresIn: "24h",
            }
        );
        //Return the token and the user data with the private key to be stored on the user device
        res.status(200).json({
            message:"user logged in successfully",
            token: token,
        });
    }catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user" });
    }
}
