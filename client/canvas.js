export function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return ctx;
}

// Optimized redraw function
export function redraw(ctx, strokes) {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw all strokes
  for (const stroke of strokes) {
    if (!stroke.segments || stroke.segments.length === 0) continue;

    ctx.beginPath();
    ctx.lineWidth = stroke.width;
    ctx.globalCompositeOperation =
      stroke.color === "eraser" ? "destination-out" : "source-over";

    if (stroke.color !== "eraser") {
      ctx.strokeStyle = stroke.color;
    }

    // Optimize: draw connected path instead of individual segments
    const segs = stroke.segments;
    if (segs.length > 0) {
      ctx.moveTo(segs[0].from.x, segs[0].from.y);
      for (let i = 0; i < segs.length; i++) {
        ctx.lineTo(segs[i].to.x, segs[i].to.y);
      }
    }

    ctx.stroke();
  }

  // Reset composite operation
  ctx.globalCompositeOperation = "source-over";
}

// Draw user cursors (for visual feedback)
export function drawUserCursors(ctx, cursors) {
  // This is handled by DOM elements, not canvas
  // Kept for potential future use
}
