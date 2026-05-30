# Quick Start Guide - MedCore

Get your Hospital Management System running in 5 minutes!

## Prerequisites
- Node.js (v14+)
- PostgreSQL installed and running

## Step 1: Install Dependencies (1 min)
```bash
cd Hospital-Management-system
npm install
```

## Step 2: Set Up Database (2 mins)

Open PostgreSQL and run this SQL:

```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Add sample data
INSERT INTO doctors (name, specialization) VALUES 
('Dr. Sarah Jenkins', 'General Medicine'),
('Dr. Michael Chang', 'Cardiology'),
('Dr. Elena Rostova', 'Pediatrics');
```

## Step 3: Create .env File (1 min)

Create `.env` in the root directory:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_management
NODE_ENV=development
PORT=5000
```

## Step 4: Start the Server (1 min)

```bash
npm start
```

You should see:
```
Server running on port 5000
```

## Step 5: Open in Browser

Visit: **http://localhost:5000**

---

## 🧪 Test the Application

### Register a New Patient
1. You'll need to add a patient via API or SQL first

Insert test patient:
```sql
INSERT INTO patients (fullname, email, password) 
VALUES ('John Doe', 'john@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyePEJrTb6UZhyL1jWM5Q...'); 
-- Use hashed password from bcrypt
```

Or via API:
```bash
curl -X POST http://localhost:5000/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
- Email: john@example.com
- Password: password123

### Book an Appointment
1. Login successfully
2. Go to "Request an Appointment"
3. Fill in the form
4. Click "Confirm Appointment Booking"

---

## 🧪 Test Form Validation

Try these to see validation in action:

**Login Form:**
- Username with < 3 characters → Error message
- Password with < 6 characters → Error message
- Both blank → Error message
- Invalid username format → Error message

**Appointment Form:**
- Select past date → Error message
- Leave fields blank → Error message
- All valid → Success message

---

## 📱 Test Mobile Responsiveness

1. Open browser DevTools (F12)
2. Click toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - iPhone 12 (390px)
   - iPad (768px)
   - Desktop (1920px)

Click hamburger menu (☰) on mobile to test sidebar toggle.

---

## 🔍 View Admin Dashboard

Update the URL to access admin view:
1. Login to patient dashboard
2. Look at the top navigation bar
3. Click "3. Admin Dashboard" to switch views

---

## 📊 Check API Responses

Open DevTools (F12) → Network tab

Try these API calls:

**Register:**
```bash
POST http://localhost:5000/patients/register
Body: {"fullname":"Jane","email":"jane@test.com","password":"test123"}
```

**Login:**
```bash
POST http://localhost:5000/patients/login
Body: {"email":"john@example.com","password":"password123"}
```

**Get Appointments:**
```bash
GET http://localhost:5000/appointments/
```

---

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Database connection error
- Check PostgreSQL is running
- Verify .env credentials
- Ensure database name exists
- Check PostgreSQL service status

### Form not submitting
- Open DevTools (F12)
- Check Network tab for API request
- Check Console tab for errors
- Verify backend is running on port 5000

### Styles look wrong
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check that Tailwind CDN is loading (check Network tab)

---

## 📚 Full Documentation

For more details, see:
- `README.md` - Complete project documentation
- `DEPLOYMENT.md` - Deployment options
- `PROJECT_SUMMARY.md` - Project overview
- FINAL_CHECKLIST.md - What's included

---

## 🚀 Next Steps

### To Customize
- Change colors in `frontend/index.html` (Tailwind classes)
- Update hospital name "MedCore" → Your Name
- Modify background image in `/images/`
- Update form fields and validation

### To Deploy
See DEPLOYMENT.md for:
- Heroku (free tier available)
- DigitalOcean (cheapest paid option)
- Railway (automatic deployment)

### To Add Features
- Doctor management API
- Appointment cancellation
- Email notifications
- Patient medical history

---

## 💡 Tips

1. **Save code changes** - Server auto-restarts with nodemon
2. **Test validation** - Try entering invalid data
3. **Check mobile** - Always test responsive design
4. **Read errors** - Error messages help debug issues
5. **Use DevTools** - F12 for debugging

---

## ✅ You're Ready!

Your hospital management system is now running locally. Next steps:

1. ✅ Test all features
2. ✅ Verify mobile responsiveness
3. ✅ Check form validation
4. ✅ Review code quality
5. ✅ Read documentation
6. ✅ Deploy to production (see DEPLOYMENT.md)

**Questions? Check the full README.md or DEPLOYMENT.md**

Happy coding! 🚀
