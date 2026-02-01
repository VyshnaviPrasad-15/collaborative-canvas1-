export function setupSocket(callbacks) {
  // Use environment variable or default to localhost for development
  const serverUrl = window.SOCKET_IO_SERVER_URL || 
                    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);
  const socket = io(serverUrl);

  // Initialization
  socket.on("init", (data) => {
    callbacks.onInit(data.strokes, data.userId, data.userColor, data.users);
  });

  // Drawing events
  socket.on("draw_segment", callbacks.onSegment);
  socket.on("stroke_complete", callbacks.onStrokeComplete);
  socket.on("state_update", callbacks.onStateUpdate);

  // User management
  socket.on("user_joined", callbacks.onUserJoined);
  socket.on("user_left", callbacks.onUserLeft);
  socket.on("user_cursor", callbacks.onUserCursor);

  return socket;
}
