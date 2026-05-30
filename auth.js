const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET || 'hospital-secret-key-change-in-production';
    const token = jwt.sign(
        { id: userId, role: role },
        secret,
        { expiresIn: '7d' }
    );
    return token;
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET || 'hospital-secret-key-change-in-production';
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

// Middleware: Authenticate User
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token', success: false });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed', success: false });
    }
};

// Middleware: Authorize Admin
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated', success: false });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required', success: false });
    }

    next();
};

module.exports = { generateToken, verifyToken, authMiddleware, adminMiddleware };
