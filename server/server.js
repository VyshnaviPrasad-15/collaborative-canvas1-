const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { 
  strokes, 
  addSeg, 
  addStroke,
  removeStroke,
  undo, 
  redo, 
  getState,
  saveToHistory
} = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "../client")));

// User management
const users = new Map(); // socketId -> user info
const userColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
];
let nextColorIndex = 0;

function getNextColor() {
  const color = userColors[nextColorIndex % userColors.length];
  nextColorIndex++;
  return color;
}

function getUserList() {
  return Array.from(users.values());
}

io.on("connection", (socket) => {
  // Assign user color and ID
  const userId = socket.id;
  const userColor = getNextColor();
  const userInfo = {
    id: userId,
    color: userColor,
    name: `User ${users.size + 1}`,
    cursor: null
  };
  users.set(socket.id, userInfo);

  // Send initial state and user info
  socket.emit("init", {
    strokes: getState(),
    userId: userId,
    userColor: userColor,
    users: getUserList()
  });

  // Notify others of new user
  socket.broadcast.emit("user_joined", userInfo);

  // Handle drawing segments
  socket.on("draw_segment", (seg) => {
    seg.userId = userId; // Attach user ID to segment
    addSeg(seg);
    socket.broadcast.emit("draw_segment", seg);
  });

  // Handle stroke completion (for better undo/redo)
  socket.on("stroke_complete", (strokeData) => {
    strokeData.userId = userId;
    // Ensure segments array exists
    if (!strokeData.segments) {
      strokeData.segments = strokeData.segs || [];
    }
    // Stroke already exists from segments, just save to history
    saveToHistory();
    socket.broadcast.emit("stroke_complete", strokeData);
  });

  // Handle cursor movement
  socket.on("cursor_move", (position) => {
    userInfo.cursor = position;
    socket.broadcast.emit("user_cursor", {
      userId: userId,
      position: position,
      color: userColor
    });
  });

  // Handle global undo
  socket.on("undo", () => {
    const success = undo();
    if (success) {
      const newState = getState();
      io.emit("state_update", newState);
    }
  });

  // Handle global redo
  socket.on("redo", () => {
    const success = redo();
    if (success) {
      const newState = getState();
      io.emit("state_update", newState);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    users.delete(socket.id);
    socket.broadcast.emit("user_left", userId);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
