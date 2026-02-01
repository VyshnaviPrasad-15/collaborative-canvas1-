const { DrawState } = require("./drawing-state").default;

const rooms = {};

function getRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = new DrawState();
  }
  return rooms[roomId];
}

module.exports = { getRoom };
export default { DrawState };
