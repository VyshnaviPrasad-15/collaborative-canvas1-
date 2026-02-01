# Server Deployment Guide

## ✅ Client Deployed

Your client is live at: **https://collaborative-canvas-orcin-seven.vercel.app**

## 🚀 Deploy Server to Railway (Easiest Method)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy Server
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your repository
4. Railway will auto-detect Node.js
5. **Important Settings:**
   - Root Directory: Leave as is (project root)
   - Build Command: `npm install` (or leave empty)
   - Start Command: `npm start`
   - Port: Railway will set this automatically via `PORT` environment variable

### Step 3: Get Server URL
After deployment, Railway will give you a URL like:
`https://your-app-name.up.railway.app`

### Step 4: Update Client
1. Go to your Vercel project: https://vercel.com
2. Navigate to your project → Settings → Environment Variables
3. Add new variable:
   - **Name**: `SOCKET_IO_SERVER_URL`
   - **Value**: `https://your-app-name.up.railway.app`
4. Redeploy: Go to Deployments → Click "..." → Redeploy

**OR** Update `client/websocket.js` directly:
```javascript
const serverUrl = "https://your-app-name.up.railway.app";
```

Then rebuild and redeploy:
```bash
npm run build
vercel --prod
```

---

## Alternative: Deploy to Render

### Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Deploy
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: collaborative-canvas-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is fine

### Step 3: Get URL and Update Client
Same as Railway steps 3-4 above.

---

## Alternative: Deploy to Fly.io

### Step 1: Install Fly CLI
```bash
npm install -g flyctl
```

### Step 2: Login
```bash
fly auth login
```

### Step 3: Deploy
```bash
fly launch
# Follow prompts, select your region
fly deploy
```

### Step 4: Get URL and Update Client
Your app will be at: `https://your-app-name.fly.dev`

---

## Quick Test

After deploying the server and updating the client:

1. Open your Vercel URL in multiple browser tabs
2. Draw in one tab - it should appear in others
3. Check browser console for any connection errors

## Troubleshooting

### Client can't connect to server
- Check CORS settings in `server/server.js`
- Verify server URL is correct
- Check server logs for errors

### Server not starting
- Check Railway/Render logs
- Verify `PORT` environment variable is set
- Ensure `npm start` command is correct

### WebSocket connection fails
- Make sure server supports WebSockets (Railway, Render, Fly.io all do)
- Check if server URL uses `https://` (not `http://`)
- Verify Socket.io CORS configuration allows your Vercel domain

