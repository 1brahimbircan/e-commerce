const jwt = require("jsonwebtoken");

function isAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false , message: "Access Denied: No token provided" });
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ success: false , message: "Access Denied: Invalid token format" });
        
    }

    const token = tokenParts[1];
    
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        if (!payload.isAdmin) {
            return res.status(403).json({ success: false , message: "Access Denied: Not an Admin" });
        }
        next();
    } catch (error) {
        return res.status(400).json({ success: false , message: "Invalid token" });
    }
}

module.exports = isAdmin;