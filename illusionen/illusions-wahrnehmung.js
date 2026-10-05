// Kategorie: Mehrdeutig & Konturen
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;

  addIllusion({
    id: "kanizsa", cat: "wahrnehmung", name: "Kanizsa-Dreieck", short: "Ein Dreieck ohne Linien",
    hint: "Ein weißes Dreieck scheint über den Kreisen zu liegen – heller als der Hintergrund und mit klaren Kanten. Dreh die „Pac-Mans“ weg (Regler oder Animation) und es verschwindet.",
    desc: "Drei ausgeschnittene Kreise und drei Winkel erzeugen ein helles Dreieck mit scheinbaren Konturen, das gar nicht gezeichnet ist.",
    why: "Das Gehirn bevorzugt die einfachste Erklärung: Ein verdeckendes Dreieck erklärt alle Ausschnitte zugleich. Zellen im Areal V2 reagieren tatsächlich auf diese illusorischen Konturen, als wären sie real.",
    params: [{ k: "rot", label: "Pac-Man-Drehung", min: 0, max: 180, def: 0, unit: "°" }, { k: "animate", label: "Drehung animieren", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2 + 20, R = Math.min(w, h) * 0.3, r = R * 0.28;
      const rot = (p.animate ? 90 * (0.5 - 0.5 * Math.cos(t * 0.8)) : p.rot) * Math.PI / 180;
      const verts = [0, 1, 2].map((i) => { const a = -Math.PI / 2 + i * TAU / 3; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
      // inverted triangle outline (only shown as line segments)
      const verts2 = [0, 1, 2].map((i) => { const a = Math.PI / 2 + i * TAU / 3; return [cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95]; });
      ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const a = verts2[i], b = verts2[(i + 1) % 3]; ctx.beginPath(); ctx.moveTo(a[0] + (b[0] - a[0]) * 0.1, a[1] + (b[1] - a[1]) * 0.1); ctx.lineTo(a[0] + (b[0] - a[0]) * 0.38, a[1] + (b[1] - a[1]) * 0.38); ctx.moveTo(a[0] + (b[0] - a[0]) * 0.62, a[1] + (b[1] - a[1]) * 0.62); ctx.lineTo(a[0] + (b[0] - a[0]) * 0.9, a[1] + (b[1] - a[1]) * 0.9); ctx.stroke(); }
      verts.forEach(([x, y], i) => {
        const toC = Math.atan2(cy - y, cx - x) + rot, half = Math.PI / 6; // wedge of 60° facing center
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, toC + half, toC - half + TAU); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill();
      });
      if (reveal) { poly(ctx, verts, null, "#ff3b3b", 2); badge(ctx, "Hier ist nichts gezeichnet – nur Weiß", cx, h - 26); }
    }
  });

  addIllusion({
    id: "ehrenstein", cat: "wahrnehmung", name: "Ehrenstein-Scheibe", short: "Leuchtende Lücke",
    hint: "Wo die Linien nicht ganz zusammenlaufen, erscheint eine helle Scheibe – heller als der Hintergrund. Ein echter Kreis um die Lücke zerstört den Effekt (Auflösen).",
    desc: "An Kreuzungspunkten unterbrochener Linien entstehen leuchtende Scheiben ohne jede Kontur.",
    why: "Illusorische Kontur plus Helligkeits-Filling-in: Die Linienenden werden als Verdeckung durch eine Scheibe gelesen, die dann heller erscheint, um ihre Existenz zu rechtfertigen.",
    params: [{ k: "gap", label: "Lückengröße", min: 4, max: 40, def: 16 }, { k: "n", label: "Linien pro Stern", min: 4, max: 16, def: 8 }, { k: "animate", label: "Lücke pulsieren", type: "check", def: true }],
    bg: "#999",
    draw(ctx, w, h, p, t, reveal) {
      const g = Math.min(w, h) / 3.5, cols = Math.ceil(w / g), rows = Math.ceil(h / g), gap = p.animate ? p.gap * (0.6 + 0.4 * Math.sin(t * 2)) : p.gap;
      for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
        const x = c * g + g / 2, y = r * g + g / 2;
        for (let i = 0; i < p.n; i++) { const a = i / p.n * TAU; line(ctx, x + Math.cos(a) * gap, y + Math.sin(a) * gap, x + Math.cos(a) * g * 0.5, y + Math.sin(a) * g * 0.5, "#000", 3); }
        if (reveal) circle(ctx, x, y, gap, null, "#000", 1.5);
      }
    }
  });

  addIllusion({
    id: "necker", cat: "wahrnehmung", name: "Necker-Würfel", short: "Welche Seite ist vorn?",
    hint: "Der Drahtwürfel kippt beim Anschauen zwischen zwei Deutungen. Klicke in die Fläche, um die Deutung zu erzwingen (eine Fläche wird gefüllt), oder lass ihn langsam rotieren – dann scheint die Drehrichtung zu kippen.",
    desc: "Eine Drahtgitter-Projektion eines Würfels lässt zwei gleich gute 3D-Interpretationen zu; das Gehirn wechselt spontan zwischen ihnen.",
    why: "Ohne Tiefenhinweise (Verdeckung, Schattierung, Perspektive) ist das Bild mehrdeutig. Neuronale Adaption lässt die aktuelle Deutung ermüden, und die Alternative übernimmt.",
    params: [{ k: "mode", label: "Deutung", type: "select", def: "none", options: [["none", "Offen lassen"], ["a", "Links-unten vorn"], ["b", "Rechts-oben vorn"]] }, { k: "animate", label: "Rotieren (orthografisch)", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.22;
      const ang = p.animate ? t * 0.4 : 0;
      const V = []; for (let i = 0; i < 8; i++) { let x = (i & 1 ? 1 : -1) * S, y = (i & 2 ? 1 : -1) * S, z = (i & 4 ? 1 : -1) * S; const xr = x * Math.cos(ang) - z * Math.sin(ang), zr = x * Math.sin(ang) + z * Math.cos(ang); const off = p.animate ? 0 : S * 0.45; V.push([cx + xr + (zr > 0 ? off : -off) * (p.animate ? 0 : 1), cy + y + (zr > 0 ? -off : off) * (p.animate ? 0 : 1) + (p.animate ? zr * 0.4 : 0), zr]); }
      const E = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      if (!p.animate && p.mode !== "none") { const face = p.mode === "a" ? [0, 1, 3, 2] : [4, 5, 7, 6]; poly(ctx, face.map((i) => [V[i][0], V[i][1]]), "rgba(94,200,255,.35)"); }
      E.forEach(([a, b]) => { const front = reveal ? (V[a][2] + V[b][2]) > 0 : true; line(ctx, V[a][0], V[a][1], V[b][0], V[b][1], front ? "#fff" : "#555", front ? 3 : 2); });
      if (reveal) badge(ctx, p.animate ? "Grau = hinten (echte Tiefe)" : "Beide Deutungen sind gleich gültig", cx, h - 26);
    }
  });

  addIllusion({
    id: "zylinder", cat: "wahrnehmung", name: "Mehrdeutige Rotation", short: "Links- oder rechtsherum?",
    hint: "Punkte auf einem unsichtbaren Zylinder rotieren. Ohne Tiefeninformation kippt die Drehrichtung – wie bei der „tanzenden Silhouette“. Auflösen färbt vordere Punkte heller und zwingt eine Richtung.",
    desc: "Eine Punktwolke rotiert um eine senkrechte Achse. Mal scheint sie links-, mal rechtsherum zu laufen.",
    why: "Orthografische Projektion liefert keine Information darüber, ob ein Punkt vorn oder hinten läuft. Beide Richtungen passen exakt zu den Daten – das Gehirn wählt eine und wechselt gelegentlich.",
    params: [{ k: "n", label: "Punkte", min: 30, max: 300, def: 120 }, { k: "speed", label: "Tempo", min: 0.2, max: 2, step: 0.1, def: 0.8 }, { k: "shape", label: "Form", type: "select", def: "cyl", options: [["cyl", "Zylinder"], ["sphere", "Kugel"]] }],
    init(p) { p._pts = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._pts || p._pts.length !== p.n || p._shape !== p.shape) { p._shape = p.shape; p._pts = Array.from({ length: p.n }, () => { const a = Math.random() * TAU; if (p.shape === "cyl") return [a, Math.random() * 2 - 1, 1]; const y = Math.random() * 2 - 1; return [a, y, Math.sqrt(1 - y * y)]; }); }
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.3;
      p._pts.forEach(([a, y, rr]) => { const ang = a + t * p.speed; const x = Math.cos(ang) * rr, z = Math.sin(ang) * rr; const col = reveal ? gray(140 + z * 110) : "#fff"; circle(ctx, cx + x * R, cy + y * R * 1.2, reveal ? 3 + z * 1.5 : 3.5, col); });
      if (reveal) badge(ctx, "Hell = vorn, dunkel = hinten", cx, h - 26);
    }
  });

  addIllusion({
    id: "rubin", cat: "wahrnehmung", name: "Rubins Vase", short: "Vase oder zwei Gesichter?",
    hint: "Figur und Grund tauschen: Mal siehst du eine Vase, mal zwei Profile. Der Regler verschiebt die Helligkeit – was heller ist, wird eher als Figur gesehen.",
    desc: "Die berühmte Kippfigur: Dieselbe Kontur begrenzt entweder eine Vase oder zwei einander zugewandte Gesichter.",
    why: "Eine Kontur kann nur einer Seite „gehören“. Das Gehirn muss entscheiden, was Figur und was Hintergrund ist – und beide Zuweisungen sind hier gleich plausibel.",
    params: [{ k: "bal", label: "Hell: Vase ↔ Gesichter", min: 0, max: 1, step: 0.01, def: 0.5 }, { k: "animate", label: "Überblenden", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const k = p.animate ? 0.5 + 0.5 * Math.sin(t * 0.5) : p.bal, cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.42;
      const vase = gray(40 + 200 * k), faces = gray(40 + 200 * (1 - k));
      rect(ctx, 0, 0, w, h, faces);
      const prof = (s) => { // half profile as polyline, s = ±1
        const pts = [[0, -1], [0.22, -0.95], [0.3, -0.8], [0.22, -0.7], [0.28, -0.6], [0.42, -0.5], [0.36, -0.42], [0.42, -0.34], [0.33, -0.25], [0.4, -0.15], [0.3, -0.05], [0.33, 0.05], [0.22, 0.15], [0.2, 0.35], [0.35, 0.5], [0.5, 0.7], [0.5, 0.95], [0.45, 1], [0, 1]];
        return pts.map(([x, y]) => [cx + x * s * S, cy + y * S]);
      };
      const right = prof(1), left = prof(-1).reverse();
      poly(ctx, [...right, ...left], vase, null);
      if (reveal) { ctx.save(); ctx.setLineDash([6, 4]); poly(ctx, [...right, ...left], null, "#5ec8ff", 2); ctx.restore(); badge(ctx, "Eine Kontur, zwei Figuren", cx, h - 26); }
    }
  });

  addIllusion({
    id: "penrose", cat: "wahrnehmung", name: "Penrose-Dreieck", short: "Das unmögliche Objekt",
    hint: "Jede Ecke für sich ist eine korrekte 3D-Verbindung – das Ganze kann es nicht geben. Auflösen zeigt die echte Tiefenordnung: Ein Balken endet frei vor dem anderen. Die Animation dreht das wirkliche 3D-Modell – nur aus genau einem Blickwinkel schließt sich der Ring.",
    desc: "Ein Dreieck aus drei Balken, das sich räumlich nicht bauen lässt – und trotzdem wie ein massiver Körper aussieht.",
    why: "Das Sehsystem interpretiert lokal: Jede Ecke wird als rechtwinklige Verbindung gelesen. Die globale Unmöglichkeit fällt erst beim bewussten Nachverfolgen auf, weil lokale Tiefenhinweise stärker wiegen als die Gesamtlogik.",
    params: [{ k: "animate", label: "3D-Modell drehen", type: "check", def: false }, { k: "th", label: "Balkendicke", min: 0.15, max: 0.4, step: 0.01, def: 0.26 }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2 + 10, L = Math.min(w, h) * 0.5, th = L * p.th, e = th / 2;
      // three real cuboids; in the isometric view along (1,1,1) the end of C lands exactly on the start of A
      const boxes = [
        { n: "A", b: [[-e, L - e], [-e, e], [-e, e]], omit: "+x" },
        { n: "B", b: [[L - e, L + e], [-e, L - e], [-e, e]], omit: "+y" },
        { n: "C", b: [[L - e, L + e], [L - e, L + e], [-e, L + e]], omit: "" }
      ];
      const yaw = p.animate ? t * 0.7 : 0, cen = [2 * L / 3, L / 3, 0];
      const right = [1 / Math.SQRT2, -1 / Math.SQRT2, 0], up = [-1, -1, 2].map((v) => v / Math.sqrt(6)), fwd = [1, 1, 1].map((v) => v / Math.sqrt(3));
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const rotUp = (v) => { // rotate vector v about 'up' axis by yaw (Rodrigues)
        const c = Math.cos(yaw), s = Math.sin(yaw), k = up, kd = dot(k, v);
        const cr = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
        return [0, 1, 2].map((i) => v[i] * c + cr[i] * s + k[i] * kd * (1 - c));
      };
      const proj = (pt) => { const v = rotUp([pt[0] - cen[0], pt[1] - cen[1], pt[2] - cen[2]]); const sx = dot(v, right), sy = -dot(v, up); const a = Math.PI / 6; return [cx + sx * Math.cos(a) - sy * Math.sin(a), cy + sx * Math.sin(a) + sy * Math.cos(a), dot(v, fwd)]; };
      const faceDefs = [["+x", 0, 1], ["-x", 0, 0], ["+y", 1, 1], ["-y", 1, 0], ["+z", 2, 1], ["-z", 2, 0]];
      const faces = [];
      boxes.forEach((bx, bi) => faceDefs.forEach(([name, axis, hi]) => {
        const n = [0, 0, 0]; n[axis] = hi ? 1 : -1;
        const nr = rotUp(n); if (dot(nr, fwd) <= 0.02) return; // backface
        const o = [0, 1, 2].filter((i) => i !== axis), pts = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => { const q = [0, 0, 0]; q[axis] = bx.b[axis][hi]; q[o[0]] = bx.b[o[0]][u]; q[o[1]] = bx.b[o[1]][v]; return q; });
        const P = pts.map(proj), depth = P.reduce((s, q) => s + q[2], 0) / 4;
        const light = 0.55 + 0.45 * Math.max(0, dot(nr, [0.3, -0.5, 0.8].map((v) => v / Math.sqrt(0.98))));
        faces.push({ box: bi, name, P, depth, col: `hsl(28,70%,${Math.round(22 + light * 45)}%)` });
      }));
      const impossible = !p.animate && !reveal;
      let order = impossible ? faces.filter((f) => !(f.name === boxes[f.box].omit)).sort((a, b) => b.box - a.box) : faces.sort((a, b) => a.depth - b.depth);
      order.forEach((f) => poly(ctx, f.P.map((q) => [q[0], q[1]]), f.col, "#000", 1.5));
      if (reveal) badge(ctx, p.animate ? "Drei getrennte Balken – der Ring schließt sich nur aus einem Winkel" : "Echte Tiefenordnung: der senkrechte Balken endet frei vor dem Anfang des ersten", cx, h - 26);
    }
  });
  addIllusion({
    id: "moire", cat: "wahrnehmung", name: "Moiré-Muster", short: "Muster aus Überlagerung",
    hint: "Zwei identische Liniengitter überlagern sich; eines dreht sich langsam. Die großen, wandernden Streifen existieren in keinem der beiden Gitter.",
    desc: "Aus zwei feinen Gittern entstehen grobe, bewegte Interferenzmuster.",
    why: "Kein Wahrnehmungsfehler im engeren Sinn, sondern Mathematik: Die Differenzfrequenz zweier Muster ist niedrig und damit gut sichtbar. Das Auge tut nur, was ein Rasterdrucker auch tut.",
    params: [{ k: "pitch", label: "Linienabstand", min: 4, max: 20, def: 8 }, { k: "speed", label: "Drehtempo", min: 0, max: 0.3, step: 0.01, def: 0.05 }, { k: "type", label: "Gittertyp", type: "select", def: "lines", options: [["lines", "Linien"], ["rings", "Ringe"]] }],
    noReveal: true, bg: "#fff",
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, R = Math.hypot(w, h);
      const grid = (ang, dx) => { ctx.save(); ctx.translate(cx + dx, cy); ctx.rotate(ang); ctx.strokeStyle = "#000"; ctx.lineWidth = p.pitch * 0.45; ctx.beginPath(); if (p.type === "lines") for (let x = -R; x < R; x += p.pitch) { ctx.moveTo(x, -R); ctx.lineTo(x, R); } else for (let r = p.pitch; r < R; r += p.pitch) { ctx.moveTo(r, 0); ctx.arc(0, 0, r, 0, TAU); } ctx.stroke(); ctx.restore(); };
      ctx.globalAlpha = 0.8;
      if (p.type === "lines") { grid(0, 0); grid(t * p.speed, 0); } else { grid(0, -Math.min(w, h) * 0.08); grid(0, Math.min(w, h) * 0.08 + Math.sin(t * p.speed * 10) * 20); }
    }
  });

  addIllusion({
    id: "blinder-fleck", cat: "wahrnehmung", name: "Blinder Fleck", short: "Das Loch im Sehfeld",
    hint: "Linkes Auge schließen, mit dem rechten das Kreuz fixieren, dann langsam Abstand zum Bildschirm verändern (ca. 30–50 cm). Irgendwann verschwindet der Punkt – das Gehirn füllt die Lücke mit Hintergrund. Auch die Linie wird „repariert“.",
    desc: "An der Stelle, wo der Sehnerv die Netzhaut verlässt, gibt es keine Rezeptoren. Trotzdem sehen wir kein Loch.",
    why: "Das Gehirn füllt den blinden Fleck mit der Umgebung auf (Perceptual Filling-in). Deshalb verschwindet nicht nur der Punkt, sondern eine durchlaufende Linie wirkt auch durchgehend.",
    params: [{ k: "dist", label: "Abstand Kreuz–Punkt", min: 100, max: 400, def: 220 }, { k: "lineOn", label: "Linie durch den Punkt", type: "check", def: true }],
    anim: false, noReveal: true, bg: "#fff",
    draw(ctx, w, h, p) {
      const cy = h / 2, cx = w / 2 - p.dist / 2, px = cx + p.dist;
      if (p.lineOn) line(ctx, px, cy - h * 0.3, px, cy + h * 0.3, "#1565c0", 4);
      fixation(ctx, cx, cy, "#000"); circle(ctx, px, cy, 14, "#000");
      text(ctx, "Linkes Auge zu · rechtes Auge aufs Kreuz · Abstand verändern", w / 2, h - 24, "#777", 13);
    }
  });

  addIllusion({
    id: "kanizsa-quadrat", cat: "wahrnehmung", name: "Kanizsa-Quadrat (bewegt)", short: "Illusorische Form in Bewegung",
    hint: "Vier Pac-Mans erzeugen ein Quadrat. Die Animation bewegt die Pac-Mans synchron – das unsichtbare Quadrat scheint als festes Objekt mitzuwandern und sich zu drehen.",
    desc: "Ein weißes Quadrat ohne Kanten, das sich sogar als Ganzes bewegen und drehen kann.",
    why: "Illusorische Konturen werden wie echte Objekte verarbeitet – inklusive Bewegungsintegration. Die gemeinsame Bewegung der Ausschnitte verstärkt die Objekt-Hypothese noch.",
    params: [{ k: "size", label: "Quadratgröße", min: 80, max: 300, def: 180 }, { k: "r", label: "Kreisradius", min: 20, max: 80, def: 45 }, { k: "animate", label: "Bewegen & drehen", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2 + (p.animate ? Math.sin(t * 0.7) * w * 0.15 : 0), cy = h / 2 + (p.animate ? Math.cos(t * 0.5) * h * 0.12 : 0), rot = p.animate ? Math.sin(t * 0.6) * 0.5 : 0, s = p.size / 2;
      ctx.translate(cx, cy); ctx.rotate(rot);
      [[-s, -s], [s, -s], [s, s], [-s, s]].forEach(([x, y]) => { const toC = Math.atan2(-y, -x); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, p.r, toC + Math.PI / 4, toC - Math.PI / 4 + TAU); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); });
      if (reveal) { ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 2; ctx.strokeRect(-s, -s, 2 * s, 2 * s); }
    }
  });

  addIllusion({
    id: "hohlmaske", cat: "wahrnehmung", name: "Hohlmasken-Effekt (Dots)", short: "Innen wird zu außen",
    hint: "Ein rotierendes Gesichtsprofil aus Punkten. Wenn sich die Hohlseite zeigt, kippt es scheinbar zurück in ein normales Gesicht und die Drehrichtung dreht sich um.",
    desc: "Eine konkave (hohle) Form wird hartnäckig als konvex gesehen, besonders bei Gesichtern.",
    why: "Top-down-Wissen schlägt Sensorik: Wir haben noch nie ein hohles Gesicht gesehen. Das Gehirn zwingt die Daten in die bekannte Form – mit absurd wirkender Bewegungsumkehr als Nebenwirkung.",
    params: [{ k: "speed", label: "Drehtempo", min: 0.1, max: 1.5, step: 0.05, def: 0.5 }, { k: "n", label: "Punkte", min: 100, max: 800, def: 400 }],
    init(p) { p._pts = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._pts || p._pts.length !== p.n) p._pts = Array.from({ length: p.n }, () => { const u = Math.random() * TAU, v = Math.random() * 2 - 1; const nose = Math.exp(-((v - 0.05) ** 2) * 30) * 0.35, chin = Math.exp(-((v - 0.75) ** 2) * 20) * 0.1; const r = (Math.sqrt(1 - v * v) * 0.9 + (Math.cos(u) > 0 ? (nose + chin) * Math.max(0, Math.cos(u)) ** 3 : 0)); return [u, v, r]; });
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.32, ang = t * p.speed;
      p._pts.forEach(([u, v, r]) => { const a = u + ang; const x = Math.cos(a) * r, z = Math.sin(a) * r; const bright = reveal ? 120 + z * 120 : 220; circle(ctx, cx + x * R, cy + v * R * 1.25, reveal ? 2 + z : 2.2, gray(bright)); });
      if (reveal) badge(ctx, "Hell = nah: so sieht die echte Tiefe aus", cx, h - 26);
    }
  });
})();
