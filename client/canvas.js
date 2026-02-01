export function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  ctx.lineCap = "round";
  return ctx;
}

export function redraw(ctx, strokes) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const stroke of strokes) {
    ctx.beginPath();
    ctx.lineWidth = stroke.width;

    ctx.globalCompositeOperation =
      stroke.color === "eraser" ? "destination-out" : "source-over";

    if (stroke.color !== "eraser") {
      ctx.strokeStyle = stroke.color;
    }

    for (const seg of stroke.segments) {
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
    }

    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
}
