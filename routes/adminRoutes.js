const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const bcrypt = require("bcrypt");
const { generateToken, authMiddleware, adminMiddleware } = require("../auth");

// Admin Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({
                message: "Admin username and password are required",
                success: false
            });
        }

        const admin = await pool.query(
            `SELECT * FROM users
             WHERE role = 'admin'
             AND (username = $1 OR fullname = $1 OR email = $1)`,
            [username]
        );

        if (admin.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid admin username or password",
                success: false
            });
        }

        const validPassword = await bcrypt.compare(password, admin.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid admin username or password",
                success: false
            });
        }

        const token = generateToken(admin.rows[0].id, "admin");

        res.status(200).json({
            message: "Admin login successful",
            success: true,
            data: {
                user: {
                    id: admin.rows[0].id,
                    fullname: admin.rows[0].fullname,
                    username: admin.rows[0].username,
                    email: admin.rows[0].email,
                    role: admin.rows[0].role
                },
                token
            }
        });

    } catch (error) {
        console.error("Admin login error:", error.message);
        res.status(500).json({
            message: "Login failed",
            success: false,
            error: error.message
        });
    }
});

// Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await pool.query(
            "SELECT id, fullname, email, phone, role, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
        );

        res.json({
            message: "Users retrieved successfully",
            success: true,
            count: users.rows.length,
            data: users.rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            success: false,
            error: error.message
        });
    }
});

// Get admin profile
router.get("/profile", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const admin = await pool.query(
            "SELECT id, fullname, username, email, phone, role, created_at FROM users WHERE id = $1 AND role = 'admin'",
            [req.user.id]
        );

        if (admin.rows.length === 0) {
            return res.status(404).json({
                message: "Admin not found",
                success: false
            });
        }

        res.json({
            message: "Admin profile retrieved",
            success: true,
            data: admin.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
