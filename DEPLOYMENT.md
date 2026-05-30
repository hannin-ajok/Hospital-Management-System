# Deployment Guide - MedCore Hospital Management System

This guide covers deploying MedCore to production environments.

## Pre-Deployment Checklist

### Code Quality
- [x] All forms include client-side validation
- [x] All API endpoints have error handling
- [x] Responsive design tested on mobile/tablet/desktop
- [x] No console errors or warnings
- [x] Database connection properly configured
- [x] Environment variables properly used
- [x] Password hashing implemented (bcrypt)
- [x] CORS properly configured

### Testing
- [x] Login form validation works
- [x] Appointment booking form validation works
- [x] API endpoints return proper status codes
- [x] Error messages are user-friendly
- [x] Mobile navigation works
- [x] Background image loads correctly
- [x] All links functional
- [x] Date validation prevents past dates

## Local Testing Checklist

Before deploying, verify locally:

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with your database config
cp .env.example .env

# 3. Create database and tables
# (Run SQL from README.md database section)

# 4. Start server
npm start

# 5. Test in browser
# Open http://localhost:5000
# Test login with valid credentials
# Test appointment booking
```

## Deployment Options

### Option 1: Heroku (Recommended for Beginners)

1. **Install Heroku CLI**
   ```bash
   # Visit: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add PostgreSQL Add-on**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DB_USER=your_user
   heroku config:set DB_PASSWORD=your_password
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Option 2: DigitalOcean (VPS)

1. **Create Droplet**
   - Ubuntu 20.04 LTS
   - 2GB RAM minimum
   - Set SSH key

2. **Connect to Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Dependencies**
   ```bash
   apt update && apt upgrade
   apt install nodejs npm postgresql
   ```

4. **Clone Repository**
   ```bash
   cd /var/www
   git clone your-repo-url
   cd Hospital-Management-system
   npm install
   ```

5. **Configure PostgreSQL**
   ```bash
   sudo -u postgres createdb hospital_management
   sudo -u postgres createuser app_user
   sudo -u postgres psql
   # ALTER USER app_user WITH PASSWORD 'your_password';
   # GRANT ALL PRIVILEGES ON DATABASE hospital_management TO app_user;
   ```

6. **Create .env File**
   ```bash
   cat > .env << EOF
   DB_USER=app_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hospital_management
   NODE_ENV=production
   PORT=5000
   EOF
   ```

7. **Set Up PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "medcore"
   pm2 startup
   pm2 save
   ```

8. **Configure Nginx (Reverse Proxy)**
   ```bash
   apt install nginx
   
   # Create config file
   cat > /etc/nginx/sites-available/medcore << EOF
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }
   }
   EOF
   
   ln -s /etc/nginx/sites-available/medcore /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. **Enable HTTPS (Let's Encrypt)**
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

### Option 3: Railway (Simple)

1. **Create Account** at https://railway.app

2. **Connect GitHub Repository**

3. **Add PostgreSQL Database**

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   DB_*=auto (Railway provides these)
   ```

5. **Deploy** - Automatic on git push

## Production Environment Setup

### Environment Variables

Create `.env` file with:
```env
# Database
DB_USER=production_user
DB_PASSWORD=strong_password_here
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=hospital_management

# Server
NODE_ENV=production
PORT=5000

# Optional Security
JWT_SECRET=your-secret-key
```

### Security Configurations

1. **Update package.json scripts**
   ```json
   {
       "scripts": {
           "start": "node server.js",
           "dev": "nodemon server.js"
       }
   }
   ```

2. **Enable HTTPS/SSL**
   - Use Let's Encrypt for free SSL
   - Configure automatic renewal

3. **Rate Limiting** (Optional Addition)
   ```bash
   npm install express-rate-limit
   ```

4. **Database Backups**
   ```bash
   # Weekly backup
   0 2 * * 0 pg_dump hospital_management > /backups/backup-$(date +\%Y\%m\%d).sql
   ```

## Post-Deployment

### Verify Deployment

1. **Check Server Status**
   ```bash
   curl https://your-domain.com
   ```

2. **Test Endpoints**
   ```bash
   # Test login
   curl -X POST https://your-domain.com/patients/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Monitor Logs**
   ```bash
   # Using PM2
   pm2 logs medcore
   
   # Using systemctl
   journalctl -u medcore -f
   ```

4. **Check Database Connection**
   ```bash
   # Login to your database
   psql -h your_host -U app_user -d hospital_management
   \dt  # List tables
   ```

### Monitoring & Maintenance

1. **Set Up Error Tracking** (Sentry)
   ```javascript
   // In server.js
   const Sentry = require("@sentry/node");
   Sentry.init({ dsn: "your_sentry_dsn" });
   ```

2. **Monitor Performance**
   - Use New Relic or DataDog
   - Monitor response times
   - Check database query performance

3. **Automated Backups**
   - Daily database backups
   - Store in separate location
   - Test restore procedure

## Troubleshooting Deployment

### Database Connection Issues
```bash
# Test connection
psql -h your_host -U user -d database -c "SELECT 1"

# Check connection string in .env
# Verify firewall rules
```

### Application Won't Start
```bash
# Check logs
npm start

# Check Node version
node --version  # Should be 14+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors in Production
```javascript
// Ensure in server.js:
const cors = require('cors');
app.use(cors());
```

### Slow Performance
1. Check database indexes
2. Monitor slow queries
3. Enable query caching
4. Check server resources

## Scaling Considerations

For future growth:

1. **Database Optimization**
   - Add more indexes
   - Implement connection pooling
   - Consider read replicas

2. **Caching Layer**
   - Implement Redis for session storage
   - Cache appointment data

3. **Load Balancing**
   - Use Nginx load balancing
   - Deploy multiple Node instances

4. **CDN**
   - Host static files on CDN
   - Serve images from CDN

## Rollback Procedures

If deployment fails:

```bash
# Using PM2
pm2 restart medcore

# Using Docker
docker rollback previous_version

# Using git
git revert last_commit
git push production main
```

## Support & Logs

### Where to Check Errors

1. **Browser Console** (F12)
   - Client-side errors
   - Network issues

2. **Server Logs**
   ```bash
   pm2 logs  # PM2 logs
   journalctl -u app_name  # Systemd logs
   ```

3. **Database Logs**
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

## Health Checks

Add health endpoint for monitoring:

```javascript
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});
```

## Certificate Management

For HTTPS renewal:

```bash
# Auto-renewal with Certbot
certbot renew --dry-run  # Test

# Set up cron job
0 3 * * * certbot renew --quiet
```

---

**Deployment Version**: 1.0.0  
**Last Updated**: 2026-05-29
