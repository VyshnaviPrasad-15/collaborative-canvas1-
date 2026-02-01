const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { strokes, addSeg } = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.emit("init", strokes);

  socket.on("draw_segment", (seg) => {
    addSeg(seg);
    socket.broadcast.emit("draw_segment", seg);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
