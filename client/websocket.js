export function setupSocket(onSeg, onInit) {
  const socket = io("http://localhost:3000");

  socket.on("init", onInit);
  socket.on("draw_segment", onSeg);

  return socket;
}
