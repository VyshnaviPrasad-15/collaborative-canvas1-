import { setupCanvas, redraw } from "./canvas.js";
import { setupSocket } from "./websocket.js";

const canvas = document.getElementById("canvas");
const ctx = setupCanvas(canvas);

let strokes = [];
let drawing = false;
let lastPos = null;
let strokeId = null;

let color = "#000000";
let lineWidth = 4;
let erasing = false;

// ---- SOCKET ----
const socket = setupSocket(
  (segment) => {
    addSegment(segment);
    redraw(ctx, strokes);
  },
  (state) => {
    strokes = state;
    redraw(ctx, strokes);
  }
);

function addSegment(segment) {
  let stroke = strokes.find((s) => s.id === segment.strokeId);
  if (!stroke) {
    stroke = {
      id: segment.strokeId,
      color: segment.color,
      width: segment.width,
      segments: [],
    };
    strokes.push(stroke);
  }
  stroke.segments.push(segment);
}

// ---- POINTER DRAWING ----
canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  strokeId = crypto.randomUUID();
  lastPos = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;

  const current = { x: e.offsetX, y: e.offsetY };

  const segment = {
    strokeId,
    from: lastPos,
    to: current,
    color: erasing ? "eraser" : color,
    width: lineWidth,
  };

  addSegment(segment); // local prediction
  socket.emit("draw_segment", segment);
  redraw(ctx, strokes);

  lastPos = current;
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
});

// ---- UI ----
document.getElementById("colorPicker").onchange = (e) => {
  color = e.target.value;
  erasing = false;
};

document.getElementById("strokeWidth").oninput = (e) => {
  lineWidth = +e.target.value;
};

document.getElementById("brush").onclick = () => (erasing = false);
document.getElementById("eraser").onclick = () => (erasing = true);

// ---- CURSOR ----
const cursor = document.getElementById("cursor");
canvas.addEventListener("pointermove", (e) => {
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
  cursor.style.width = lineWidth + "px";
  cursor.style.height = lineWidth + "px";
  cursor.style.borderColor = erasing ? "gray" : color;
});
