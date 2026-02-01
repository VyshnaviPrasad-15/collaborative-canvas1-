# Deployment Guide

## ✅ Client Deployed to Vercel

Your client is now live at:
- **Preview**: https://collaborative-canvas-13pedc3c3.vercel.app
- **Production**: https://collaborative-canvas-orcin-seven.vercel.app

To deploy to production, run:
```bash
vercel --prod
```

## ⚠️ Next Step: Deploy Socket.io Server

The Socket.io server needs to be deployed to a platform that supports persistent WebSocket connections.

### Quick Deploy to Railway (Recommended)

1. Go to https://railway.app and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Add environment variable: `PORT` (Railway provides this automatically)
6. Deploy!

After deployment, Railway will give you a URL like: `https://your-app.railway.app`

### Configure Client to Connect

Once your server is deployed, update `client/config.js`:

```javascript
window.SOCKET_IO_CONFIG = {
  serverUrl: "https://your-app.railway.app"  // Replace with your server URL
};
```

Then redeploy to Vercel:
```bash
vercel --prod
```

**Alternative: Use Environment Variable**
If you prefer using Vercel environment variables, you can set `SOCKET_IO_SERVER_URL` in Vercel project settings, but you'll need to add a build step to inject it into the client code.

### Alternative: Deploy to Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy!

### Alternative: Deploy to Fly.io

```bash
fly launch
fly deploy
```

## Testing

1. Open your Vercel URL in multiple browser tabs
2. Draw on one tab - it should appear on the other tabs in real-time
3. If it doesn't work, check the browser console for connection errors

