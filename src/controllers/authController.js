const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/User");
const nodemailer = require('nodemailer');
const twoFACodes = {}; // { username: { code: '123456', expires: Date } }

exports.register = async (req, res) => {
    try {
        const { fullName, username, email, password, publicKey, profileImageUrl } = req.body;

        console.log(" Full Name  From send to backend ***********************: $fullName");
        console.log(" Username  From send to backend ***********************: $username");
        console.log(" Email  From send to backend ***********************: $email");
        console.log(" Password  From send to backend ***********************: $password");
        console.log(" Public Key  From send to backend ***********************: $publicKey");
        console.log(" Profile Image URL  From send to backend ***********************: $profileImageUrl");
        // Check if all the required fields are filled
        if (!fullName || !username || !email || !password || !publicKey) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        // Check if the username already exists
        const userExists = await user.getUserByUsername(username);
        if (userExists) {
            return res.status(400).json({ success: false, usernameTaken: true, error: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 16);

        // Create the user in the database with the public key and profile image
        const newUser = await user.createUser(
            fullName,
            username,
            email,
            hashedPassword,
            publicKey,
            profileImageUrl
        );

        if (!newUser) {
            return res.status(500).json({ success: false, error: "Error creating user" });
        }

        // Generate Refresh Token (but do NOT send it to frontend)
        const refreshToken = jwt.sign(
            {
                user_id: newUser.user_id,
                username: newUser.username,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );

        // Store refresh token in DB for future verification
        await user.storeRefreshToken(newUser.user_id, refreshToken);

        res.status(200).json({
            success: true,
            message: "User registered successfully. Please log in."
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ success: false, error: "Error in signing the user up" });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userData = await user.getUserByUsername(username);
        if (!userData) {
            return res.status(400).json({ error: "User not found" });
        }

        const isCorrectPW = await bcrypt.compare(password, userData.password_hash);
        if (!isCorrectPW) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Generate Access Token (short expiration)
        const accessToken = jwt.sign(
            {
                user_id: userData.user_id,
                username: userData.username,
                email: userData.email,
                publicKey: userData.public_key,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '15m' } // Access token expires in 15 minutes
        );

        // Generate Refresh Token (long expiration)
        const refreshToken = jwt.sign(
            {
                user_id: userData.user_id,
                username: userData.username,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' } // Refresh token expires in 7 days
        );

        // Store the refresh token in the database (you can create a method for this)
        await user.storeRefreshToken(userData.user_id, refreshToken);

        res.status(200).json({
            message: "User logged in successfully",
            user_id: userData.user_id,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user"     });
    }
};
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }

            const userData = await user.getUserById(decoded.user_id);
            if (!userData || userData.refresh_token !== refreshToken) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }

            // Issue a new access token
            const newAccessToken = jwt.sign(
                {
                    user_id: userData.user_id,
                    username: userData.username,
                    email: userData.email,
                    publicKey: userData.public_key,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '15m' }
            );

            //  Issue a new refresh token
            const newRefreshToken = jwt.sign(
                {
                    user_id: userData.user_id,
                    username: userData.username,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '7d' }
            );

            //  Update the refresh token in the DB
            await user.storeRefreshToken(userData.user_id, newRefreshToken);

            res.status(200).json({
                message: "Token refreshed successfully",
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ error: "Error refreshing token" });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Decode token to get user ID
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
        const userData = await user.getUserById(decoded.user_id);

        if (!userData || userData.refresh_token !== refreshToken) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        await user.invalidateToken(decoded.user_id);
        res.status(200).json({ message: "User logged out successfully" });

    } catch (error) {
        console.error("Error logging out user:", error);
        res.status(500).json({ error: "Error logging out user" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        if (!username || !oldPassword || !newPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userData = await user.getUserByUsername(username);
        if (!userData) return res.status(404).json({ error: "User not found" });

        const isCorrect = await bcrypt.compare(oldPassword, userData.password_hash);
        if (!isCorrect) return res.status(401).json({ error: "Incorrect old password" });

        const newHashedPassword = await bcrypt.hash(newPassword, 16);
        const updated = await user.updatePassword(username, newHashedPassword);

        if (!updated) return res.status(500).json({ error: "Failed to update password" });

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Password reset error:", err);
        res.status(500).json({ error: "Error resetting password" });
    }
};
exports.updateusername = async (req, res) => {
    try {
        const { username, newUsername } = req.body;

        if (!username || !newUsername) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const updated = await user.updateUsername(username, newUsername);

        if (!updated) return res.status(500).json({ error: "Failed to update username" });

        res.status(200).json({ message: "Username updated successfully" });

    } catch (err) {
        console.error("Username update error:", err);
        res.status(500).json({ error: "Error updating username" });
    }
};

exports.updateUserEmail = async (req,res) => {
    // this function should ask for the password before updating the password
    try {
        const { username, newEmail, password } = req.body;

        if (!username || !newEmail || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userData = await user.getUserByUsername(username);
        if (!userData) return res.status(404).json({ error: "User not found" });

        const isCorrect = await bcrypt.compare(password, userData.password_hash);
        if (!isCorrect) return res.status(401).json({ error: "Incorrect password" });

        const updated = await user.updateEmail(username, newEmail);

        if (!updated) return res.status(500).json({ error: "Failed to update email" });

        res.status(200).json({ message: "Email updated successfully" });

    } catch (err) {
        console.error("Email update error:", err);
        res.status(500).json({ error: "Error updating email" });
    }
};

