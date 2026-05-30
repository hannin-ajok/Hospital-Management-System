const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const { authMiddleware, adminMiddleware } = require("../auth");

// Book appointment (users only)
router.post("/book", authMiddleware, async (req, res) => {
    const {
        doctor_id,
        appointment_date,
        appointment_time,
        reason
    } = req.body;

    try {
        // Validate input
        if (!doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({
                message: "Doctor, date, and time are required",
                success: false
            });
        }

        // Validate date is in future
        const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
        if (appointmentDateTime <= new Date()) {
            return res.status(400).json({
                message: "Appointment date and time must be in the future",
                success: false
            });
        }

        // Check if doctor exists
        const doctorCheck = await pool.query("SELECT id FROM doctors WHERE id = $1", [doctor_id]);
        if (doctorCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Doctor not found",
                success: false
            });
        }

        const newAppointment = await pool.query(
            `INSERT INTO appointments
            (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
            VALUES($1, $2, $3, $4, $5, 'pending')
            RETURNING *`,
            [
                req.user.id,
                doctor_id,
                appointment_date,
                appointment_time,
                reason || null
            ]
        );

        res.status(201).json({
            message: "Appointment booked successfully",
            success: true,
            data: newAppointment.rows[0]
        });

    } catch (error) {
        console.error("Appointment booking error:", error.message);
        res.status(500).json({
            message: "Failed to book appointment",
            success: false,
            error: error.message
        });
    }
});

// Get all appointments (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, 
                    u.fullname as patient_name, u.email as patient_email, u.phone as patient_phone,
                    d.fullname as doctor_name, d.specialization
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             JOIN doctors d ON a.doctor_id = d.id
             ORDER BY a.appointment_date DESC`
        );
        res.json({
            message: "Appointments retrieved successfully",
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch appointments",
            success: false,
            error: error.message
        });
    }
});

// Get user's own appointments
router.get("/my-appointments", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*,
                    d.fullname as doctor_name, d.specialization, d.phone as doctor_phone, d.email as doctor_email
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = $1
             ORDER BY a.appointment_date DESC`,
            [req.user.id]
        );

        res.json({
            message: "Your appointments retrieved successfully",
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch appointments",
            success: false,
            error: error.message
        });
    }
});

// Get single appointment
router.get("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT a.*,
                    u.fullname as patient_name, u.email as patient_email,
                    d.fullname as doctor_name, d.specialization
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found",
                success: false
            });
        }

        // Check authorization: user can view own, admin can view all
        if (req.user.role !== 'admin' && result.rows[0].patient_id !== req.user.id) {
            return res.status(403).json({
                message: "You don't have permission to view this appointment",
                success: false
            });
        }

        res.json({
            message: "Appointment retrieved successfully",
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch appointment",
            success: false,
            error: error.message
        });
    }
});

// Update appointment status (admin only)
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${validStatuses.join(', ')}`,
                success: false
            });
        }

        const result = await pool.query(
            "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found",
                success: false
            });
        }

        res.json({
            message: "Appointment status updated successfully",
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update appointment",
            success: false,
            error: error.message
        });
    }
});

// Cancel appointment (user or admin)
router.put("/:id/cancel", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await pool.query(
            "SELECT * FROM appointments WHERE id = $1",
            [id]
        );

        if (appointment.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found",
                success: false
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && appointment.rows[0].patient_id !== req.user.id) {
            return res.status(403).json({
                message: "You don't have permission to cancel this appointment",
                success: false
            });
        }

        const result = await pool.query(
            "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *",
            [id]
        );

        res.json({
            message: "Appointment cancelled successfully",
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel appointment",
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
