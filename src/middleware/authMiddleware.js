const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const bearer = authHeader.split(" ");
  if (bearer.length !== 2 || bearer[0] !== "Bearer") {
    return res.status(401).json({ message: "Malformed token." });
  }

  const token = bearer[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    console.log("✅ Token verified. Decoded user:", decoded); // helpful for debugging
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
