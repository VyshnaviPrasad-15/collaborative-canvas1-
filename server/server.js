const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { strokes, addSeg } = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("client"));

io.on("connection", (socket) => {
  socket.emit("init", strokes);

  socket.on("draw_segment", (seg) => {
    addSeg(seg);
    socket.broadcast.emit("draw_segment", seg);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
