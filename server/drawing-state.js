// Drawing state management with undo/redo support
const strokes = [];
const history = []; // For undo/redo: stores snapshots of strokes array
let historyIndex = -1; // Current position in history

// Initialize with empty state
history.push(JSON.parse(JSON.stringify(strokes)));
historyIndex = 0;

function addSeg(seg) {
  let stroke = strokes.find((s) => s.id === seg.strokeId);
  if (!stroke) {
    stroke = {
      id: seg.strokeId,
      userId: seg.userId,
      color: seg.color,
      width: seg.width,
      segs: [],
      segments: [], // Support both naming conventions
      timestamp: Date.now()
    };
    strokes.push(stroke);
  }
  stroke.segs.push(seg);
  if (!stroke.segments) stroke.segments = [];
  stroke.segments.push(seg);
}

function addStroke(stroke) {
  // Check if stroke already exists (from segments)
  const existing = strokes.find(s => s.id === stroke.id);
  if (!existing) {
    strokes.push(stroke);
    saveToHistory();
  }
}

function removeStroke(strokeId) {
  const index = strokes.findIndex(s => s.id === strokeId);
  if (index !== -1) {
    strokes.splice(index, 1);
    saveToHistory();
    return true;
  }
  return false;
}

function saveToHistory() {
  // Remove any history after current index (when undo was done)
  if (historyIndex < history.length - 1) {
    history.splice(historyIndex + 1);
  }
  
  // Save current state
  history.push(JSON.parse(JSON.stringify(strokes)));
  historyIndex = history.length - 1;
  
  // Limit history size to prevent memory issues
  if (history.length > 100) {
    history.shift();
    historyIndex--;
  }
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    strokes.length = 0;
    strokes.push(...JSON.parse(JSON.stringify(history[historyIndex])));
    return true;
  }
  return false;
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    strokes.length = 0;
    strokes.push(...JSON.parse(JSON.stringify(history[historyIndex])));
    return true;
  }
  return false;
}

function getState() {
  return JSON.parse(JSON.stringify(strokes));
}

function setState(newState) {
  strokes.length = 0;
  strokes.push(...JSON.parse(JSON.stringify(newState)));
  saveToHistory();
}

module.exports = { 
  strokes, 
  addSeg, 
  addStroke,
  removeStroke,
  undo, 
  redo, 
  getState, 
  setState,
  saveToHistory
};
