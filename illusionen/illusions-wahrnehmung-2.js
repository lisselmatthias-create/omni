// Kategorie: Mehrdeutig & Konturen – Teil 2
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "blivet", cat: "wahrnehmung", name: "Unmögliche Gabel (Blivet)", short: "Zwei Zinken werden zu drei",
    hint: "Rechts zwei eckige Balken, links drei runde Zinken. Verfolge eine Kante von rechts nach links. Auflösen hebt die Linien hervor, die an beiden Enden etwas anderes bedeuten.",
    desc: "Die „Teufelsgabel“: Ein Objekt, das auf der einen Seite zwei und auf der anderen drei Zinken hat.",
    why: "Jede Linie wird lokal als Objektkante gedeutet. Die Kanten der zwei Balken werden links zu Kanten von drei Zylindern umgedeutet. Nur wer das ganze Bild zugleich prüft, bemerkt den Widerspruch.",
    params: [{ k: "animate", label: "Mitte abdecken (zeigt beide Enden als konsistent)", type: "check", def: false }],
    anim: true, bg: "#f4f1ea",
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w, h), ox = w / 2 - S * 0.45, oy = h / 2 - S * 0.3, sx = S * 0.9, sy = S * 0.6;
      const X = (u) => ox + u * sx, Y = (v) => oy + v * sy;
      const L1 = 0.2, N1 = 0.32, L2 = 0.44, L3 = 0.56, N2 = 0.68, L4 = 0.8, xl = 0.1, xr = 0.9, xs = 0.55, rr = 0.06;
      ctx.lineCap = "round";
      const col = (which) => reveal && which ? "#e63946" : "#222";
      line(ctx, X(xl), Y(L1), X(xr), Y(L1), col(0), 3); line(ctx, X(xl), Y(N1), X(xr), Y(N1), col(1), 3);
      line(ctx, X(xl), Y(L2), X(xs), Y(L2), col(0), 3); line(ctx, X(xl), Y(L3), X(xs), Y(L3), col(0), 3);
      line(ctx, X(xl), Y(N2), X(xr), Y(N2), col(1), 3); line(ctx, X(xl), Y(L4), X(xr), Y(L4), col(0), 3);
      line(ctx, X(xs), Y(L2), X(xs), Y(L3), "#222", 3); line(ctx, X(xr), Y(L1), X(xr), Y(L4), "#222", 3);
      line(ctx, X(xr), Y(L1), X(xr + 0.04), Y(L1 - 0.06), "#222", 3); line(ctx, X(xr + 0.04), Y(L1 - 0.06), X(xr + 0.04), Y(L4 - 0.06), "#222", 3); line(ctx, X(xr), Y(L4), X(xr + 0.04), Y(L4 - 0.06), "#222", 3); line(ctx, X(xr), Y(N1), X(xr + 0.04), Y(N1 - 0.06), "#222", 2); line(ctx, X(xr), Y(N2), X(xr + 0.04), Y(N2 - 0.06), "#222", 2);
      [[L1, N1], [L2, L3], [N2, L4]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(X(xl), Y((a + b) / 2), rr * sx * 0.5, (b - a) / 2 * sy, 0, Math.PI / 2, Math.PI * 1.5); ctx.strokeStyle = "#222"; ctx.lineWidth = 3; ctx.stroke(); });
      if (p.animate) { rect(ctx, X(0.38), Y(0.1), sx * 0.22, sy * 0.85, "#f4f1ea"); line(ctx, X(0.38), Y(0.1), X(0.38), Y(0.95), "#bbb", 1); line(ctx, X(0.6), Y(0.1), X(0.6), Y(0.95), "#bbb", 1); }
      if (reveal) badge(ctx, "Rot: links Unterkante/Oberkante eines Zylinders, rechts Vorderkante eines Balkens", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "schroeder", cat: "wahrnehmung", name: "Schröder-Treppe", short: "Von oben oder von unten?",
    hint: "Die Treppe kippt: Mal siehst du sie von oben (Stufen laufen nach rechts unten), mal von unten (als überhängende Decke). Wähle eine Deutung, um sie zu fixieren.",
    desc: "Eine Treppenzeichnung, die sich gleichwertig als Treppe von oben oder als Treppe von unten gesehen lesen lässt (Schröder, 1858).",
    why: "Die Zeichnung enthält keinen Tiefenhinweis, der die Zuordnung „Trittfläche vs. Setzstufe“ festlegt. Beide 3D-Hypothesen erklären das Bild exakt gleich gut.",
    params: [{ k: "mode", label: "Deutung", type: "select", def: "none", options: [["none", "Offen lassen"], ["oben", "Von oben (Trittflächen betont)"], ["unten", "Von unten (Unterseiten betont)"]] }, { k: "animate", label: "Langsam kippen (Rotation)", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const n = 6, S = Math.min(w, h) * 0.7, cx = w / 2, cy = h / 2, st = S / n, sk = st * 0.9;
      ctx.save(); ctx.translate(cx, cy); if (p.animate) ctx.rotate(Math.sin(t * 0.5) * Math.PI);
      const front = [], back = [];
      for (let i = 0; i <= n; i++) { const x = -S / 2 + i * st, y = -S / 2 + i * st; front.push([x, y]); if (i < n) front.push([x + st, y]); }
      const d = [sk, -sk * 0.55];
      // Flächen für Deutungen
      if (p.mode !== "none") for (let i = 0; i < n; i++) { const x = -S / 2 + i * st, y = -S / 2 + i * st; const quad = p.mode === "oben" ? [[x, y], [x + st, y], [x + st + d[0], y + d[1]], [x + d[0], y + d[1]]] : [[x + st, y], [x + st, y + st], [x + st + d[0], y + st + d[1]], [x + st + d[0], y + d[1]]]; poly(ctx, quad, "rgba(94,200,255,.35)"); }
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.beginPath(); front.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
      ctx.beginPath(); front.forEach((q, i) => { const r = [q[0] + d[0], q[1] + d[1]]; i ? ctx.lineTo(r[0], r[1]) : ctx.moveTo(r[0], r[1]); }); ctx.stroke();
      [front[0], front[front.length - 1]].forEach((q) => line(ctx, q[0], q[1], q[0] + d[0], q[1] + d[1], "#fff", 2.5));
      line(ctx, front[0][0], front[0][1], front[0][0], front[front.length - 1][1], "#fff", 2.5); line(ctx, front[0][0] + d[0], front[0][1] + d[1], front[front.length - 1][0] + d[0], front[0][1] + d[1], "#fff", 2.5);
      line(ctx, front[front.length - 1][0] + d[0], front[front.length - 1][1] + d[1], front[front.length - 1][0] + d[0], front[0][1] + d[1], "#fff", 2.5);
      line(ctx, front[0][0], front[front.length - 1][1], front[front.length - 1][0], front[front.length - 1][1], "#fff", 2.5);
      ctx.restore();
      if (reveal) badge(ctx, "Beide Deutungen passen exakt – es gibt keine „richtige“", cx, h - 26);
    }
  });

  addIllusion({
    id: "versetzte-gitter", cat: "wahrnehmung", name: "Versetzte Gitter (Abutting Gratings)", short: "Eine Kante aus Enden",
    hint: "Links und rechts liegen dieselben Linien, nur um eine halbe Periode versetzt. An der Grenze entsteht eine scharfe senkrechte Kontur – ohne eine einzige senkrechte Linie.",
    desc: "Zwei zueinander versetzte Liniengitter erzeugen an ihrer Grenze eine illusorische Linie.",
    why: "Linienenden („end-stopped cells“ in V1/V2) werden vom Sehsystem zu Konturen verbunden – die Grenze zwischen den Gittern wird als Verdeckungskante interpretiert.",
    params: [{ k: "shift", label: "Versatz", min: 0, max: 1, step: 0.01, def: 0.5 }, { k: "per", label: "Linienabstand", min: 6, max: 30, def: 12 }, { k: "animate", label: "Versatz animieren", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.4, sh = (p.animate ? 0.5 + 0.5 * Math.sin(t) : p.shift) * p.per;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      const curve = (x) => Math.sin((x - cx) / R * 3) * R * 0.15; // leicht gewellte Grenze
      for (let y = cy - R; y < cy + R; y += p.per) { for (let x = cx - R; x < cx + R; x += 2) { const left = x < cx + curve(y); const yy = y + (left ? 0 : sh); ctx.fillStyle = "#000"; ctx.fillRect(x, yy, 2.2, 2); } }
      ctx.restore();
      if (reveal) { ctx.save(); ctx.setLineDash([5, 5]); ctx.beginPath(); for (let y = cy - R; y <= cy + R; y += 4) { const x = cx + curve(y); y === cy - R ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); badge(ctx, "Hier verläuft keine Linie – nur Linienenden", cx, h - 26); }
    }
  });

  addIllusion({
    id: "glass-muster", cat: "wahrnehmung", name: "Glass-Muster", short: "Struktur aus Zufall",
    hint: "Zufällige Punkte plus eine leicht gedrehte (oder vergrößerte) Kopie: Sofort siehst du Kreise, Spiralen oder Strahlen. Ändere Transformation und Winkel.",
    desc: "Überlagert man eine Punktwolke mit einer transformierten Kopie, entstehen globale Strukturen (Leon Glass, 1969).",
    why: "Lokale Punktpaare bilden kleine Orientierungen. Das Sehsystem integriert diese über große Bereiche zu globalen Formen – ein Fenster in die Mechanik der Gestaltbildung in den Arealen V1 und V4.",
    params: [{ k: "type", label: "Transformation", type: "select", def: "rot", options: [["rot", "Drehung → Kreise"], ["exp", "Vergrößerung → Strahlen"], ["spiral", "Beides → Spirale"], ["trans", "Verschiebung → Streifen"]] }, { k: "amt", label: "Stärke", min: 0.5, max: 6, step: 0.1, def: 2.5 }, { k: "n", label: "Punkte", min: 300, max: 3000, def: 1500 }, { k: "animate", label: "Stärke animieren", type: "check", def: true }],
    init(p) { p._pts = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._pts || p._pts.length !== p.n) { const r = rnd(3); p._pts = Array.from({ length: p.n }, () => [r(), r()]); }
      const cx = w / 2, cy = h / 2, amt = (p.animate ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.7)) : 1) * p.amt;
      const a = amt * Math.PI / 180 * 2, s = 1 + amt * 0.012;
      p._pts.forEach(([fx, fy]) => {
        const x = fx * w, y = fy * h; let u = x - cx, v = y - cy, x2, y2;
        if (p.type === "rot") { x2 = cx + u * Math.cos(a) - v * Math.sin(a); y2 = cy + u * Math.sin(a) + v * Math.cos(a); }
        else if (p.type === "exp") { x2 = cx + u * s; y2 = cy + v * s; }
        else if (p.type === "spiral") { x2 = cx + (u * Math.cos(a) - v * Math.sin(a)) * s; y2 = cy + (u * Math.sin(a) + v * Math.cos(a)) * s; }
        else { x2 = x + amt * 2; y2 = y + amt; }
        circle(ctx, x, y, 1.6, "#fff"); circle(ctx, x2, y2, 1.6, reveal ? "#ff8c1a" : "#fff");
      });
      if (reveal) badge(ctx, "Orange = die transformierte Kopie jedes weißen Punkts", cx, h - 26);
    }
  });

  addIllusion({
    id: "sternenfunkeln", cat: "wahrnehmung", name: "Funkelnder Stern (Scintillating Starburst)", short: "Strahlen, die nicht da sind",
    hint: "Konzentrische Kränze aus Vielecken. Zwischen ihren Ecken scheinen helle, flüchtige Strahlen zu blitzen – nichts davon ist gezeichnet (Karlovich & Wallisch, 2021).",
    desc: "Verschachtelte Polygon-Kränze erzeugen flackernde, illusorische Strahlen vom Zentrum nach außen.",
    why: "Die Schnittpunkte der Vielecke liegen auf geraden Linien durch das Zentrum. Das Sehsystem verbindet diese Punkte zu Strahlen (illusorische Konturen), die aber nur kurz stabil bleiben – daher das Funkeln.",
    params: [{ k: "sides", label: "Ecken", min: 5, max: 9, def: 7 }, { k: "rings", label: "Kränze", min: 2, max: 7, def: 4 }, { k: "lw", label: "Linienbreite", min: 1, max: 6, def: 3 }, { k: "animate", label: "Langsam drehen", type: "check", def: false }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.45, rot = p.animate ? t * 0.05 : 0;
      for (let k = 0; k < p.rings; k++) {
        const r = R * (0.25 + 0.75 * k / (p.rings - 1 || 1));
        for (let m = 0; m < 2; m++) { const a0 = rot + (m ? Math.PI / p.sides : 0); const pts = Array.from({ length: p.sides }, (_, i) => { const a = a0 + i / p.sides * TAU; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); poly(ctx, pts, null, "#222", p.lw); }
      }
      if (reveal) { for (let i = 0; i < p.sides * 2; i++) { const a = rot + i / (p.sides * 2) * TAU + Math.PI / (p.sides * 2); line(ctx, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, "rgba(255,59,59,.5)", 1); } badge(ctx, "Rote Linien: hier verlaufen die illusorischen Strahlen – im Bild ist dort Weiß", cx, h - 26); }
    }
  });
})();
