const strokes = [];

function addSeg(seg) {
  let stroke = strokes.find((s) => s.id === seg.strokeId);
  if (!stroke) {
    stroke = {
      id: seg.strokeId,
      color: seg.color,
      width: seg.width,
      segs: [],
    };
    strokes.push(stroke);
  }
  stroke.segs.push(seg);
}

module.exports = { strokes, addSeg };
