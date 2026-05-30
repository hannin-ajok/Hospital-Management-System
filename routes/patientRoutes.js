const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const bcrypt = require("bcrypt");
const { generateToken, authMiddleware } = require("../auth");

router.post("/register", async (req, res) => {
    const { fullname, email, password, phone, date_of_birth } = req.body;

    try {
        // Validate input
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "Full name, email, and password are required", success: false });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPatient = await pool.query(
            `INSERT INTO users(fullname, email, password, phone, date_of_birth, role)
             VALUES($1, $2, $3, $4, $5, 'user')
             RETURNING id, fullname, email, phone, role`,
            [fullname, email, hashedPassword, phone || null, date_of_birth || null]
        );

        const token = generateToken(newPatient.rows[0].id, 'user');

        res.status(201).json({
            message: "Account created successfully",
            success: true,
            data: {
                user: newPatient.rows[0],
                token: token
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);
        if (error.code === '23505') {
            return res.status(409).json({ message: "Email already exists", success: false });
        }
        res.status(500).json({ message: "Registration failed", success: false, error: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", success: false });
        }

        const patient = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND role = 'user'",
            [email]
        );

        if (patient.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password", success: false });
        }

        const validPassword = await bcrypt.compare(
            password,
            patient.rows[0].password
        );

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password", success: false });
        }

        const token = generateToken(patient.rows[0].id, patient.rows[0].role);

        res.status(200).json({
            message: "Login successful",
            success: true,
            data: {
                user: {
                    id: patient.rows[0].id,
                    fullname: patient.rows[0].fullname,
                    email: patient.rows[0].email,
                    role: patient.rows[0].role
                },
                token: token
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Login failed", success: false, error: error.message });
    }
});

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id, fullname, email, phone, date_of_birth, role, created_at FROM users WHERE id = $1",
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        res.json({
            message: "Profile retrieved successfully",
            success: true,
            data: user.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", success: false, error: error.message });
    }
});

module.exports = router;