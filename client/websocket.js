export function setupSocket(onSeg, onInit) {
  const socket = io();

  socket.on("init", onInit);
  socket.on("draw_segment", onSeg);

  return socket;
}
