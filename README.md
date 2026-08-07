# Tak Cloth Store (Minimal Website)

This project includes:
- a public storefront (`index.html`)
- an admin panel (`admin.html`) with secure login
- a Node.js backend (`server.js`) using SQLite and file uploads

## Local setup

1. Copy `.env.example` to `.env`
2. Set your admin credentials and optional site origin:
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secret_password
   # Optional: set this if your app is hosted on a public URL.
   WEB_ORIGIN=http://localhost:3000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm start
   ```
5. Open in browser:
   - `http://localhost:3000/login.html`

> If you deploy to a hosted URL, use the platform-provided subdomain instead.

## Free deployment options

### Option 1: Render (recommended)
1. Create a free Render account.
2. Connect your GitHub repo.
3. Create a new Web Service.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables on Render:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `WEB_ORIGIN=https://<your-render-subdomain>.onrender.com`
6. Deploy.

### Option 2: Railway
1. Create a free Railway account.
2. Deploy from GitHub repository.
3. Set the same environment variables.
4. Use `npm install` and `npm start`.

### Option 3: Fly.io
1. Create a free Fly.io account.
2. Deploy the app with Node support.
3. Set env vars on Fly.

## Important notes for free hosting

- **No domain required**: free platforms give you a subdomain like `https://your-app.onrender.com`.
- **Database and uploads may not persist** on free tiers with ephemeral disks. If you need stable storage, use a proper hosted database and object storage.
- This project is fine for testing and small use, but for long-term public deployment you should eventually upgrade storage and HTTPS.

## Production readiness

The app is ready for a free deployment if:
- you use a supported Node host
- you set environment variables instead of hardcoding credentials
- you accept that file storage may be temporary on a free plan

If you want, I can also add a GitHub repo setup guide for free deployment on Render or Railway.