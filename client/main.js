import { setupCanvas, redraw, drawUserCursors } from "./canvas.js";
import { setupSocket } from "./websocket.js";

const canvas = document.getElementById("canvas");
const ctx = setupCanvas(canvas);

let strokes = [];
let drawing = false;
let currentStroke = null;
let lastPos = null;

let color = "#000000";
let lineWidth = 4;
let erasing = false;

// User management
let userId = null;
let userColor = null;
let users = new Map(); // userId -> user info
let otherCursors = new Map(); // userId -> cursor element

// ---- SOCKET ----
const socket = setupSocket({
  onInit: (initialStrokes, myUserId, myUserColor, userList) => {
    userId = myUserId;
    userColor = myUserColor;
    strokes = initialStrokes;
    redraw(ctx, strokes);
    
    // Update user list
    userList.forEach(user => {
      if (user.id !== userId) {
        users.set(user.id, user);
        createUserCursor(user.id, user.color);
      }
    });
    updateUsersList();
  },

  onSegment: (segment) => {
    addSegment(segment);
    redraw(ctx, strokes);
  },

  onStrokeComplete: (strokeData) => {
    // Stroke completed by another user
    if (!strokes.find(s => s.id === strokeData.id)) {
      strokes.push(strokeData);
      redraw(ctx, strokes);
    }
  },

  onStateUpdate: (newState) => {
    // Global state update (from undo/redo)
    strokes = newState;
    redraw(ctx, strokes);
  },

  onUserJoined: (userInfo) => {
    users.set(userInfo.id, userInfo);
    createUserCursor(userInfo.id, userInfo.color);
    updateUsersList();
  },

  onUserLeft: (leftUserId) => {
    users.delete(leftUserId);
    removeUserCursor(leftUserId);
    updateUsersList();
  },

  onUserCursor: (data) => {
    updateUserCursor(data.userId, data.position, data.color);
  }
});

function addSegment(segment) {
  let stroke = strokes.find(s => s.id === segment.strokeId);
  if (!stroke) {
    stroke = {
      id: segment.strokeId,
      userId: segment.userId,
      color: segment.color,
      width: segment.width,
      segments: []
    };
    strokes.push(stroke);
  }
  stroke.segments.push(segment);
}

function createUserCursor(userId, color) {
  const cursor = document.createElement("div");
  cursor.className = "other-cursor";
  cursor.style.borderColor = color;
  cursor.id = `cursor-${userId}`;
  cursor.style.display = "none";
  document.getElementById("otherCursors").appendChild(cursor);
  otherCursors.set(userId, cursor);
}

function removeUserCursor(userId) {
  const cursor = otherCursors.get(userId);
  if (cursor) {
    cursor.remove();
    otherCursors.delete(userId);
  }
}

function updateUserCursor(userId, position, color) {
  const cursor = otherCursors.get(userId);
  if (cursor) {
    cursor.style.left = position.x + "px";
    cursor.style.top = position.y + "px";
    cursor.style.display = "block";
    
    // Hide cursor after 2 seconds of no movement
    clearTimeout(cursor.hideTimeout);
    cursor.hideTimeout = setTimeout(() => {
      cursor.style.display = "none";
    }, 2000);
  }
}

function updateUsersList() {
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = "";
  
  // Add self
  const selfItem = document.createElement("div");
  selfItem.className = "user-item self";
    selfItem.innerHTML = `
    <div class="user-color" style="background-color: ${userColor}"></div>
    <span>You</span>
  `;
  usersList.appendChild(selfItem);
  
  // Add other users
  users.forEach((user, id) => {
    const userItem = document.createElement("div");
    userItem.className = "user-item";
    userItem.innerHTML = `
      <div class="user-color" style="background-color: ${user.color}"></div>
      <span>${user.name}</span>
    `;
    usersList.appendChild(userItem);
  });
}

// ---- POINTER DRAWING ----
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const strokeId = crypto.randomUUID();
  lastPos = { x: e.offsetX, y: e.offsetY };
  
  currentStroke = {
    id: strokeId,
    userId: userId,
    color: erasing ? "eraser" : color,
    width: lineWidth,
    segments: []
  };
});

canvas.addEventListener("pointermove", e => {
  const pos = { x: e.offsetX, y: e.offsetY };
  
  // Send cursor position
  socket.emit("cursor_move", {
    x: e.pageX,
    y: e.pageY
  });
  
  if (!drawing) return;

  const segment = {
    strokeId: currentStroke.id,
    userId: userId,
    from: lastPos,
    to: pos,
    color: erasing ? "eraser" : color,
    width: lineWidth
  };

  addSegment(segment);
  currentStroke.segments.push(segment);
  socket.emit("draw_segment", segment);
  redraw(ctx, strokes);

  lastPos = pos;
});

canvas.addEventListener("pointerup", () => {
  if (drawing && currentStroke) {
    // Send completed stroke
    socket.emit("stroke_complete", currentStroke);
    currentStroke = null;
  }
  drawing = false;
});

// Track cursor movement even when not drawing
canvas.addEventListener("pointermove", e => {
  socket.emit("cursor_move", {
    x: e.pageX,
    y: e.pageY
  });
});

// ---- UI ----
document.getElementById("colorPicker").onchange = e => {
  color = e.target.value;
  erasing = false;
};

const strokeWidthInput = document.getElementById("strokeWidth");
const strokeWidthValue = document.getElementById("strokeWidthValue");

strokeWidthInput.oninput = e => {
  lineWidth = +e.target.value;
  strokeWidthValue.textContent = lineWidth;
};

document.getElementById("brush").onclick = () => erasing = false;
document.getElementById("eraser").onclick = () => erasing = true;

// Undo/Redo
document.getElementById("undo").onclick = () => {
  socket.emit("undo");
};

document.getElementById("redo").onclick = () => {
  socket.emit("redo");
};

// ---- CURSOR ----
const cursor = document.getElementById("cursor");
canvas.addEventListener("pointermove", e => {
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
  cursor.style.width = lineWidth + "px";
  cursor.style.height = lineWidth + "px";
  cursor.style.borderColor = erasing ? "gray" : color;
});

// Initialize stroke width display
strokeWidthValue.textContent = lineWidth;
