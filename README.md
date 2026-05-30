# MedCore - Hospital Management System

A modern, professional hospital management system built with Node.js, Express, PostgreSQL, and responsive Tailwind CSS frontend.

## 🎯 Features

### Authentication & User Management
- ✅ Patient login with bcrypt password hashing
- ✅ Secure password validation (minimum 6 characters)
- ✅ Form validation with real-time error feedback
- ✅ Protected patient dashboard

### Patient Features
- ✅ Book appointments with department and doctor selection
- ✅ View appointment history
- ✅ Real-time form validation
- ✅ Appointment status tracking (Pending/Confirmed)

### Admin Dashboard
- ✅ Clinical analytics overview
- ✅ Real-time appointment queue management
- ✅ Patient and doctor statistics
- ✅ System efficiency monitoring

### Design & UX
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Professional healthcare-themed UI
- ✅ Beautiful background image with overlay
- ✅ Smooth animations and transitions
- ✅ Accessible color contrast and typography
- ✅ Mobile-friendly navigation with hamburger menu

## 🛠️ Technology Stack

**Frontend:**
- HTML5 / CSS3
- Tailwind CSS 3
- Font Awesome Icons
- Vanilla JavaScript with form validation

**Backend:**
- Node.js
- Express.js 5.2+
- PostgreSQL
- Bcrypt (password hashing)
- CORS enabled

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone/Setup the Project

```bash
cd Hospital-Management-system
npm install
```

### 2. Database Setup

Create a PostgreSQL database and tables:

```sql
-- Create patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(50) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_management

# Server Configuration
PORT=5000
NODE_ENV=production

# Optional: API Keys, etc.
# API_KEY=your_api_key
```

### 4. Database Connection

Update `database/db.js` with your database credentials:

```javascript
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hospital_management'
});
```

### 5. Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:5000`

## 📖 API Endpoints

### Authentication

**POST** `/patients/register`
```json
{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
}
```

**POST** `/patients/login`
```json
{
    "email": "john@example.com",
    "password": "securepass123"
}
```

### Appointments

**POST** `/appointments/book`
```json
{
    "patient_id": 1,
    "doctor_id": 1,
    "appointment_date": "2026-06-15",
    "appointment_time": "10:00 AM",
    "reason": "General checkup"
}
```

**GET** `/appointments` - Get all appointments

**GET** `/appointments/:id` - Get specific appointment

## 🎨 UI Preview

### Login Screen
- Professional background image with gradient overlay
- Responsive form with real-time validation
- Loading states and error messages
- Mobile-optimized keyboard

### Patient Dashboard
- Sidebar navigation (collapsible on mobile)
- Appointment booking form with validation
- Upcoming appointments display
- Medical history section (ready for expansion)

### Admin Dashboard
- Key metrics cards (Patients, Doctors, Appointments)
- Live appointment tracking table
- Doctor management interface
- System analytics

## ✅ Form Validation

The system includes comprehensive client-side validation:

### Username Validation
- Minimum 3 characters
- Alphanumeric, underscore, and hyphen only
- Required field

### Password Validation
- Minimum 6 characters
- Required field

### Appointment Validation
- Department and doctor selection required
- Date must be in the future
- Time slot selection required
- Real-time error feedback

## 📱 Responsive Design

All pages are optimized for:
- **Mobile** (320px - 640px): Stacked layout, touch-friendly buttons
- **Tablet** (641px - 1024px): Adjusted spacing, responsive grid
- **Desktop** (1025px+): Full sidebar navigation, multi-column layouts

Mobile features:
- Hamburger menu for navigation
- Full-screen sidebars on small screens
- Touch-optimized form inputs
- Readable font sizes

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS enabled for production
- ✅ Input validation on both client and server
- ✅ Error message sanitization

## 📊 Database Schema

### Patients Table
- id (Primary Key)
- fullname
- email (Unique)
- password (hashed)
- created_at (Timestamp)

### Doctors Table
- id (Primary Key)
- name
- specialization
- email
- phone
- created_at (Timestamp)

### Appointments Table
- id (Primary Key)
- patient_id (Foreign Key)
- doctor_id (Foreign Key)
- appointment_date
- appointment_time
- reason (optional)
- status (pending/confirmed/completed/cancelled)
- created_at (Timestamp)

## 🐛 Debugging

### Console Errors

If you see CORS errors:
```javascript
// Ensure CORS is enabled in server.js
const cors = require('cors');
app.use(cors());
```

If database connection fails:
- Check PostgreSQL is running
- Verify credentials in `.env`
- Check database exists
- Review `database/db.js`

### Network Errors

Open browser DevTools (F12) → Network tab to see API requests:
- Failed requests show red
- Check response status and message
- Verify backend is running on port 5000

## 📈 Performance Optimization

- Lazy loading for images
- CSS minification via Tailwind
- Database indexes on frequently queried columns
- Connection pooling for database
- GZIP compression ready

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `.env` with production database
- [ ] Verify all environment variables
- [ ] Test all API endpoints
- [ ] Check form validation works
- [ ] Verify responsive design on devices
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Add rate limiting
- [ ] Test error scenarios
- [ ] Verify API error messages
- [ ] Check console for warnings
- [ ] Test mobile navigation
- [ ] Verify appointment date restrictions
- [ ] Test background image loading

## 🔗 File Structure

```
Hospital-Management-system/
├── frontend/
│   └── index.html          # Main frontend with all views
├── routes/
│   ├── patientRoutes.js    # Patient auth & operations
│   ├── appointmentRoutes.js# Appointment management
│   └── doctorRoutes.js     # Doctor management (ready)
├── database/
│   └── db.js               # PostgreSQL connection
├── controllers/            # Business logic (ready for expansion)
├── server.js               # Express app setup
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## 🤝 Contributing

This is a portfolio project. For improvements:
1. Test all changes locally
2. Verify responsive design
3. Check form validation
4. Test API endpoints
5. Add error handling

## 📝 License

This project is part of a hospital management portfolio. Modify as needed for your use case.

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check server logs
3. Verify database connection
4. Review validation messages
5. Check API response in Network tab

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-29  
**Status**: Production Ready ✅
