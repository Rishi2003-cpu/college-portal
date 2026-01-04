# College Portal - Deployment Guide

## Quick Deployment to Render.com

### Step 1: Initialize Git Repository (if not already done)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - College Portal with all services"
```

### Step 2: Push to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: `college-portal`
   - Make it **Public** or **Private**
   - Don't initialize with README (we already have one)

2. Push your code:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/college-portal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render.com

1. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub (easiest)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `college-portal`
     - Environment: `Python 3`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
     - Plan: `Free`

3. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `portal-db`
   - Plan: `Free`
   - After creation, copy the "Internal Database URL"

4. **Configure Environment Variables:**
   - Go to your Web Service → "Environment"
   - Add these variables:
     ```
     DATABASE_URI=postgresql://... (from step 3)
     SECRET_KEY=your-super-secret-key-here
     DEBUG=False
     TWILIO_ACCOUNT_SID= (optional)
     TWILIO_AUTH_TOKEN= (optional)
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment

### Step 4: Access Your Website

Once deployed, Render will provide a URL like:
```
https://college-portal.onrender.com
```

**Share this link with anyone!**

---

## Alternative: Deploy to Railway.app

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `college-portal` repository
5. Railway will auto-detect it's a Python/Flask app
6. Add PostgreSQL plugin:
   - Click "New Plugin" → "PostgreSQL"
7. Set environment variables in Settings tab:
   ```
   DATABASE_URI=postgresql://... (from Railway)
   SECRET_KEY=your-secret-key
   DEBUG=False
   ```
8. Click "Deploy"

**Your URL will be:** `https://college-portal.up.railway.app`

---

## Local Testing with Tunnel (Quick Share)

If you want to share your local server temporarily:

```bash
# Install localtunnel (requires Node.js)
npm install -g localtunnel

# Start your Flask server
python app.py

# In another terminal, create tunnel
lt --port 5001
```

**You'll get a temporary URL like:** `https://abc123.loca.lt`

> ⚠️ This only works while your computer is on and server is running!

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URI` | Yes | Database connection string (SQLite for local, PostgreSQL for production) |
| `SECRET_KEY` | Yes | Secret key for session security |
| `DEBUG` | No | Set to "False" in production |
| `TWILIO_ACCOUNT_SID` | No | Twilio for WhatsApp integration |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `ADMIN_WHATSAPP` | No | Admin WhatsApp number |

---

## Troubleshooting

### "ModuleNotFoundError" during build
- Make sure all dependencies are in `requirements.txt`
- Check that virtual environment is activated locally

### Database connection errors
- Ensure `DATABASE_URI` is set correctly in Render
- For PostgreSQL, use the full connection string from Render dashboard

### Static files not loading
- Make sure `static/` folder is in root directory
- Check that `send_from_directory` routes are working

### App crashes on startup
- Check Render logs for error messages
- Ensure `PORT` environment variable is being read

---

## Demo Account

After deployment, use these credentials to test:
- **Student ID:** `21CS001`
- **Password:** `demo123`

---

## Support

For deployment issues:
1. Check Render's logs tab
2. Verify all environment variables are set
3. Ensure requirements.txt has correct versions

