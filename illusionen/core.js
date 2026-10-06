// Registry + shared drawing helpers for the Illusionslabor.
window.ILLUSIONS = [];
window.CATS = {
  geometrie: "Größe & Form",
  helligkeit: "Helligkeit & Farbe",
  bewegung: "Bewegung",
  wahrnehmung: "Mehrdeutig & Konturen",
  muster: "Muster & Interferenz",
  farbe: "Farbe & Licht",
  effekte: "Sehen & Gehirn"
};
window.addIllusion = function (def) { ILLUSIONS.push(def); };

window.H = {
  TAU: Math.PI * 2,
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  lerp(a, b, t) { return a + (b - a) * t; },
  line(ctx, x1, y1, x2, y2, color, w) {
    ctx.strokeStyle = color; ctx.lineWidth = w || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  },
  circle(ctx, x, y, r, fill, stroke, w) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 2; ctx.stroke(); }
  },
  rect(ctx, x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); },
  poly(ctx, pts, fill, stroke, w) {
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 2; ctx.stroke(); }
  },
  text(ctx, s, x, y, color, size, align) {
    ctx.fillStyle = color || "#fff"; ctx.font = (size || 13) + "px system-ui, sans-serif";
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle"; ctx.fillText(s, x, y);
  },
  // Reveal helpers (drawn when "Auflösen" is active)
  measure(ctx, x1, y1, x2, y2, label) {
    ctx.save(); ctx.setLineDash([6, 4]);
    H.line(ctx, x1, y1, x2, y2, "#5ec8ff", 1.5);
    ctx.setLineDash([]);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    if (label) { H.badge(ctx, label, mx, my - 14); }
    ctx.restore();
  },
  badge(ctx, s, x, y) {
    ctx.save(); ctx.font = "12px system-ui, sans-serif";
    const w = ctx.measureText(s).width + 12;
    ctx.fillStyle = "rgba(94,200,255,.92)"; ctx.beginPath();
    ctx.roundRect(x - w / 2, y - 10, w, 20, 6); ctx.fill();
    H.text(ctx, s, x, y, "#000", 12); ctx.restore();
  },
  gray(v) { v = Math.round(H.clamp(v, 0, 255)); return `rgb(${v},${v},${v})`; },
  hsl(h, s, l) { return `hsl(${h},${s}%,${l}%)`; },
  offscreen(p, key, w, h) { // kleines Offscreen-Canvas pro Illusion (für ImageData-Simulationen)
    if (!p._off || p._off.width !== w || p._off.height !== h || p._offKey !== key) { p._off = document.createElement("canvas"); p._off.width = w; p._off.height = h; p._offKey = key; p._img = null; }
    return p._off;
  },
  fixation(ctx, x, y, color) {
    ctx.save(); ctx.strokeStyle = color || "#ff3b3b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); ctx.stroke();
    ctx.restore();
  }
};
