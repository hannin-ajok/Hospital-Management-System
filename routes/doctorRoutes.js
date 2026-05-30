const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const { authMiddleware, adminMiddleware } = require("../auth");

// Get all doctors
router.get("/", async (req, res) => {
    try {
        const doctors = await pool.query(
            "SELECT id, fullname, specialization, phone, email, created_at FROM doctors ORDER BY fullname ASC"
        );

        res.json({
            message: "Doctors retrieved successfully",
            success: true,
            count: doctors.rows.length,
            data: doctors.rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch doctors",
            success: false,
            error: error.message
        });
    }
});

// Get doctor by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await pool.query(
            "SELECT id, fullname, specialization, phone, email, created_at FROM doctors WHERE id = $1",
            [id]
        );

        if (doctor.rows.length === 0) {
            return res.status(404).json({
                message: "Doctor not found",
                success: false
            });
        }

        res.json({
            message: "Doctor retrieved successfully",
            success: true,
            data: doctor.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch doctor",
            success: false,
            error: error.message
        });
    }
});

// Add new doctor (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    const { fullname, specialization, phone, email } = req.body;

    try {
        if (!fullname || !specialization) {
            return res.status(400).json({
                message: "Full name and specialization are required",
                success: false
            });
        }

        const newDoctor = await pool.query(
            `INSERT INTO doctors(fullname, specialization, phone, email)
             VALUES($1, $2, $3, $4)
             RETURNING id, fullname, specialization, phone, email, created_at`,
            [fullname, specialization, phone || null, email || null]
        );

        res.status(201).json({
            message: "Doctor added successfully",
            success: true,
            data: newDoctor.rows[0]
        });

    } catch (error) {
        console.error("Add doctor error:", error.message);
        if (error.code === '23505') {
            return res.status(409).json({
                message: "Email already exists",
                success: false
            });
        }
        res.status(500).json({
            message: "Failed to add doctor",
            success: false,
            error: error.message
        });
    }
});

// Update doctor (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { fullname, specialization, phone, email } = req.body;

    try {
        const updatedDoctor = await pool.query(
            `UPDATE doctors
             SET fullname = COALESCE($1, fullname),
                 specialization = COALESCE($2, specialization),
                 phone = COALESCE($3, phone),
                 email = COALESCE($4, email)
             WHERE id = $5
             RETURNING id, fullname, specialization, phone, email, created_at`,
            [fullname, specialization, phone, email, id]
        );

        if (updatedDoctor.rows.length === 0) {
            return res.status(404).json({
                message: "Doctor not found",
                success: false
            });
        }

        res.json({
            message: "Doctor updated successfully",
            success: true,
            data: updatedDoctor.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update doctor",
            success: false,
            error: error.message
        });
    }
});

// Delete doctor (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM doctors WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Doctor not found",
                success: false
            });
        }

        res.json({
            message: "Doctor deleted successfully",
            success: true,
            data: { id: result.rows[0].id }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete doctor",
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
