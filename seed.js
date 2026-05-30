const pool = require("./database/db");
const bcrypt = require("bcrypt");
require("dotenv").config();

const adminUsername = process.env.ADMIN_USERNAME || "Ajok Hanin Ajang";
const adminPassword = process.env.ADMIN_PASSWORD || "2004Tutu";

async function seedDatabase() {
    try {
        console.log("Starting database setup...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                date_of_birth DATE,
                role VARCHAR(50) DEFAULT 'user',
                admin_password VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_password VARCHAR(255);");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id SERIAL PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                specialization VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone VARCHAR(20);");
        await pool.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS email VARCHAR(255);");
        await pool.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                reason TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason TEXT;");
        await pool.query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';");
        await pool.query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
        await pool.query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
        await pool.query("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;");
        await pool.query("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;");
        await pool.query("DELETE FROM appointments WHERE patient_id NOT IN (SELECT id FROM users) OR doctor_id NOT IN (SELECT id FROM doctors);");
        await pool.query(`
            ALTER TABLE appointments
            ADD CONSTRAINT appointments_patient_id_fkey
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
        await pool.query(`
            ALTER TABLE appointments
            ADD CONSTRAINT appointments_doctor_id_fkey
            FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;
        `);

        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        const adminEmail = "admin@hospital.com";

        await pool.query(
            `INSERT INTO users(fullname, username, email, password, phone, role)
             VALUES($1, $2, $3, $4, $5, 'admin')
             ON CONFLICT (email)
             DO UPDATE SET
                fullname = EXCLUDED.fullname,
                username = EXCLUDED.username,
                password = EXCLUDED.password,
                role = 'admin',
                updated_at = CURRENT_TIMESTAMP`,
            [adminUsername, adminUsername, adminEmail, hashedAdminPassword, "+256000000000"]
        );

        const doctorCount = await pool.query("SELECT COUNT(*) FROM doctors");
        if (Number(doctorCount.rows[0].count) === 0) {
            const doctors = [
                ["Dr. John Smith", "Cardiology", "+256700111111", "john@hospital.com"],
                ["Dr. Sarah Johnson", "Pediatrics", "+256700222222", "sarah@hospital.com"],
                ["Dr. Michael Brown", "Orthopedics", "+256700333333", "michael@hospital.com"],
                ["Dr. Emily Davis", "Dermatology", "+256700444444", "emily@hospital.com"],
                ["Dr. Robert Wilson", "Neurology", "+256700555555", "robert@hospital.com"],
                ["Dr. Grace Akello", "General Medicine", "+256700666666", "grace@hospital.com"]
            ];

            for (const doctor of doctors) {
                await pool.query(
                    `INSERT INTO doctors(fullname, specialization, phone, email)
                     VALUES($1, $2, $3, $4)`,
                    doctor
                );
            }
        }

        console.log("Database setup completed.");
        console.log(`Admin username: ${adminUsername}`);
        console.log("Admin password: configured");
        process.exit(0);
    } catch (error) {
        console.error("Database setup failed:", error.message);
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();
