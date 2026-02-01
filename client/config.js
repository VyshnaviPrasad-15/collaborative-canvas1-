// Configuration for Socket.io server URL
// For production, set this via Vercel environment variable SOCKET_IO_SERVER_URL
// Or update this file directly with your server URL
if (typeof window !== 'undefined') {
  // Set server URL from environment variable if available
  // You can set this in Vercel project settings -> Environment Variables
  window.SOCKET_IO_SERVER_URL = window.SOCKET_IO_SERVER_URL || null;
}
