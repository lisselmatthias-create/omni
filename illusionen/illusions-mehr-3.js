// Weitere Täuschungen: Mehrdeutig & Konturen, Sehen & Gehirn
(function () {
  const { TAU, line, circle, rect, poly, text, measure, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "ames-raum", cat: "wahrnehmung", name: "Ames-Raum", short: "Riese und Zwerg im selben Zimmer",
    hint: "Durch das Guckloch sieht der Raum rechteckig aus – und die Person rechts wirkt doppelt so groß wie die links. Auflösen zeigt den Grundriss: Der Raum ist ein schiefes Trapez, die linke Person steht viel weiter weg.",
    desc: "Der Ames-Raum (1946) nutzt, dass ein verzerrter Raum aus genau einem Blickpunkt wie ein normaler aussieht. Alle Tiefenhinweise lügen gemeinsam.",
    why: "Das Gehirn vertraut der vertrauten Geometrie (rechte Winkel, gleich große Fenster) mehr als der Größe von Menschen. Also werden die Personen umgedeutet statt der Raum – die Grundlage vieler Filmtricks.",
    params: [{ k: "pos", label: "Position der Personen", min: 0, max: 1, step: 0.01, def: 0 }, { k: "animate", label: "Personen tauschen", type: "check", def: true }],
    bg: "#2a2622",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, k = p.animate ? 0.5 - 0.5 * Math.cos(t * 0.5) : p.pos;
      if (!reveal) {
        const bw = w * 0.5, bh = h * 0.5, bx = cx - bw / 2, by = cy - bh / 2;
        poly(ctx, [[0, 0], [w, 0], [bx + bw, by], [bx, by]], "#6d6358"); poly(ctx, [[0, h], [w, h], [bx + bw, by + bh], [bx, by + bh]], "#8a7a66");
        poly(ctx, [[0, 0], [bx, by], [bx, by + bh], [0, h]], "#5a5048"); poly(ctx, [[w, 0], [bx + bw, by], [bx + bw, by + bh], [w, h]], "#5a5048");
        rect(ctx, bx, by, bw, bh, "#7d7266"); [0.2, 0.7].forEach((f) => { rect(ctx, bx + bw * f, by + bh * 0.2, bw * 0.12, bh * 0.35, "#9fc5e8"); ctx.strokeStyle = "#3b332c"; ctx.lineWidth = 3; ctx.strokeRect(bx + bw * f, by + bh * 0.2, bw * 0.12, bh * 0.35); });
        for (let i = 1; i < 6; i++) line(ctx, bx + bw * i / 6, by + bh, bx + (bw * i / 6 - bw / 2) * 2.4 + bw / 2, h, "rgba(0,0,0,.25)", 1);
        const person = (x, yFeet, size, col) => { circle(ctx, x, yFeet - size * 0.86, size * 0.14, "#e9c46a"); rect(ctx, x - size * 0.15, yFeet - size * 0.72, size * 0.3, size * 0.42, col); rect(ctx, x - size * 0.13, yFeet - size * 0.3, size * 0.11, size * 0.3, "#264653"); rect(ctx, x + size * 0.02, yFeet - size * 0.3, size * 0.11, size * 0.3, "#264653"); };
        const sL = bh * (0.55 + 0.45 * k), sR = bh * (1 - 0.45 * k); person(bx + bw * 0.18, by + bh * 0.98, sL, "#e76f51"); person(bx + bw * 0.86, by + bh * 1.02, sR, "#2a9d8f");
        text(ctx, "Blick durchs Guckloch", cx, h - 24, "#ccc", 13);
      } else {
        // Grundriss
        const ox = w * 0.2, oy = h * 0.15, W = w * 0.6, Hh = h * 0.6;
        poly(ctx, [[ox, oy + Hh], [ox + W, oy + Hh], [ox + W, oy + Hh * 0.55], [ox, oy]], "#4a4038", "#ccc", 2);
        circle(ctx, ox + W * 0.5, oy + Hh + 40, 8, "#fff"); text(ctx, "Guckloch", ox + W * 0.5, oy + Hh + 62, "#ccc", 12);
        line(ctx, ox + W * 0.5, oy + Hh + 40, ox + W * 0.1, oy + Hh * 0.15, "rgba(255,255,255,.3)", 1); line(ctx, ox + W * 0.5, oy + Hh + 40, ox + W * 0.9, oy + Hh * 0.6, "rgba(255,255,255,.3)", 1);
        circle(ctx, ox + W * (0.12 + 0.76 * k), oy + Hh * (0.12 + 0.5 * k), 12, "#e76f51"); circle(ctx, ox + W * (0.88 - 0.76 * k), oy + Hh * (0.62 - 0.5 * k), 12, "#2a9d8f");
        text(ctx, "Rückwand schräg: links weit weg, rechts nah", cx, oy - 20, "#5ec8ff", 14);
        badge(ctx, "Beide Personen sind gleich groß – nur verschieden weit entfernt", cx, h - 26);
      }
    }
  });

  addIllusion({
    id: "penrose-treppe", cat: "wahrnehmung", name: "Penrose-Treppe", short: "Immer aufwärts, nie oben",
    hint: "Verfolge die Stufen im Kreis: Du steigst ständig auf und kommst doch wieder am Start an. Auflösen dreht den Blickwinkel ein wenig – und der Höhenversatz wird sichtbar. Die Animation dreht das echte 3D-Modell.",
    desc: "Die endlose Treppe (Lionel & Roger Penrose, 1958), berühmt durch M. C. Eschers „Treppauf, Treppab“.",
    why: "Wie beim Penrose-Dreieck: Die Treppe ist in Wirklichkeit offen und hat an einer Stelle einen Höhenversatz. Aus der richtigen Richtung fällt dieser Versatz genau auf die Blicklinie und wird unsichtbar – jedes lokale Stück ist stimmig, nur das Ganze nicht.",
    params: [{ k: "animate", label: "3D-Modell drehen", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, n = [7, 7, 5, 5], r = 0.3, sum = 24, D = 2, ratio = sum * r / D; // Sichtrichtung (1,1,ratio): Endversatz (2,2,sum·r) liegt genau darauf
      const steps = []; let x = 0, y = 0, z = 0; const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      for (let f = 0; f < 4; f++) for (let i = 0; i < n[f]; i++) { steps.push({ x, y, z, d: dirs[f], f }); x += dirs[f][0]; y += dirs[f][1]; z += r; }
      const yaw = p.animate ? t * 0.5 : (reveal ? 0.45 : 0), fwd0 = [1, 1, ratio], fn = Math.hypot(...fwd0), fwd = fwd0.map((v) => v / fn);
      const rotz = ([px, py, pz]) => [px * Math.cos(yaw) - py * Math.sin(yaw), px * Math.sin(yaw) + py * Math.cos(yaw), pz];
      const right = [1 / Math.SQRT2, -1 / Math.SQRT2, 0]; let up = [fwd[1] * right[2] - fwd[2] * right[1], fwd[2] * right[0] - fwd[0] * right[2], fwd[0] * right[1] - fwd[1] * right[0]]; if (up[2] < 0) up = up.map((v) => -v);
      const S = Math.min(w, h) * 0.085, c0 = rotz([3.5, 3, 3.6]);
      const proj = (pt) => { const q = rotz(pt).map((v, i) => v - c0[i]); return [cx + (q[0] * right[0] + q[1] * right[1] + q[2] * right[2]) * S, cy - (q[0] * up[0] + q[1] * up[1] + q[2] * up[2]) * S, q[0] * fwd[0] + q[1] * fwd[1] + q[2] * fwd[2]]; };
      const wdt = 1.6, Hb = 1.2, faces = [];
      steps.forEach((s, idx) => {
        const [dx, dy] = s.d, nx = -dy, ny = dx; const base = [s.x, s.y, s.z + r], top = s.z + r, bot = s.z + r - Hb;
        const corner = (a, b, zz) => [s.x + dx * a + nx * (b - wdt / 2), s.y + dy * a + ny * (b - wdt / 2), zz];
        const box = [[0, 0], [1, 0], [1, wdt], [0, wdt]];
        const quads = [[box.map(([a, b]) => corner(a, b, top)), "#e9d8b4"], [[corner(1, 0, top), corner(1, wdt, top), corner(1, wdt, bot), corner(1, 0, bot)], "#b89a6a"], [[corner(0, 0, top), corner(1, 0, top), corner(1, 0, bot), corner(0, 0, bot)], "#8d6e46"], [[corner(0, wdt, top), corner(1, wdt, top), corner(1, wdt, bot), corner(0, wdt, bot)], "#8d6e46"], [[corner(0, 0, top), corner(0, wdt, top), corner(0, wdt, bot), corner(0, 0, bot)], "#b89a6a"]];
        quads.forEach(([q, col]) => { const P = q.map(proj); const depth = P.reduce((a, b) => a + b[2], 0) / 4; faces.push({ P, col, depth, idx, f: s.f }); });
      });
      faces.sort((a, b) => a.depth - b.depth);
      faces.forEach((f) => poly(ctx, f.P.map((q) => [q[0], q[1]]), f.col, "#3b2d1c", 1.2));
      if (reveal) badge(ctx, "Leicht gedreht: die Treppe ist eine offene Spirale mit einem Höhenversatz", cx, h - 26);
    }
  });

  addIllusion({
    id: "verschlungene-kreise", cat: "wahrnehmung", name: "Verschlungene Kreise (Pinna)", short: "Kreise, die sich kreuzen",
    hint: "Das sind getrennte, konzentrische Kreise. Die schräg gestellten Kästchen lassen sie wie ineinander verschlungene Spiralen aussehen. Fahre mit der Maus darüber – die Auflösung zeigt die echten Ringe.",
    desc: "Pinnas Intertwining Illusion (2002): Ringe aus geneigten Quadraten scheinen sich zu überschneiden.",
    why: "Wie bei Fraser-Spirale und verdrilltem Seil: Die lokale Orientierung der Elemente wird in die globale Form integriert. Gegenläufig geneigte Nachbarringe drücken die Wahrnehmung in entgegengesetzte Spiralen.",
    params: [{ k: "tilt", label: "Neigung", min: 0, max: 45, def: 22, unit: "°" }, { k: "rings", label: "Ringe", min: 2, max: 6, def: 4 }, { k: "animate", label: "Neigung animieren", type: "check", def: true }],
    bg: "#8a8a8a",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.45, tilt = (p.animate ? 22 + 20 * Math.sin(t * 0.6) : p.tilt) * Math.PI / 180;
      for (let k = 0; k < p.rings; k++) { const r = R * (0.3 + 0.7 * k / (p.rings - 1 || 1)), n = Math.round(r / 9), sz = r * 0.11, dir = k % 2 ? 1 : -1;
        for (let i = 0; i < n; i++) { const a = i / n * TAU; ctx.save(); ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.rotate(a + tilt * dir); ctx.fillStyle = i % 2 ? "#fff" : "#000"; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.restore(); }
        if (reveal) circle(ctx, cx, cy, r, null, "#ff3b3b", 1.5); }
    }
  });

  addIllusion({
    id: "thatcher", cat: "wahrnehmung", name: "Thatcher-Effekt", short: "Kopfüber übersehen wir Grimassen",
    hint: "Beide Gesichter stehen auf dem Kopf und sehen fast gleich aus. Beim rechten sind Augen und Mund in sich umgedreht. Drehe die Gesichter aufrecht – plötzlich ist das rechte grotesk (Thompson, 1980).",
    desc: "Lokale Verdrehungen in einem umgedrehten Gesicht bleiben unbemerkt, weil die ganzheitliche Gesichtsverarbeitung nur aufrecht funktioniert.",
    why: "Gesichter werden konfigural verarbeitet (Fusiform Face Area): Das Verhältnis der Teile zueinander zählt. Auf dem Kopf fällt das System auf eine Teil-für-Teil-Analyse zurück – und die Teile sehen für sich genommen normal aus.",
    params: [{ k: "rot", label: "Drehung", min: 0, max: 180, def: 180, unit: "°" }, { k: "animate", label: "Langsam aufrichten", type: "check", def: false }],
    bg: "#1d1d24",
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w * 0.16, h * 0.28), cy = h / 2, rot = (p.animate ? 180 * (0.5 + 0.5 * Math.cos(t * 0.5)) : p.rot) * Math.PI / 180;
      const face = (cx, thatch) => {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
        ctx.fillStyle = "#f1c27d"; ctx.beginPath(); ctx.ellipse(0, 0, S * 0.75, S, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = "#5a3a1a"; ctx.beginPath(); ctx.ellipse(0, -S * 0.75, S * 0.78, S * 0.45, 0, Math.PI, TAU); ctx.fill();
        const part = (x, y, fn) => { ctx.save(); ctx.translate(x, y); if (thatch) ctx.scale(1, -1); fn(); ctx.restore(); };
        [-1, 1].forEach((s) => part(s * S * 0.3, -S * 0.2, () => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(0, 0, S * 0.16, S * 0.1, 0, 0, TAU); ctx.fill(); circle(ctx, 0, S * 0.02, S * 0.06, "#2a2a2a"); ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = S * 0.04; ctx.beginPath(); ctx.arc(0, S * 0.05, S * 0.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }));
        part(0, S * 0.45, () => { ctx.fillStyle = "#b03030"; ctx.beginPath(); ctx.arc(0, -S * 0.08, S * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(-S * 0.18, S * 0.02, S * 0.36, S * 0.06); });
        circle(ctx, 0, S * 0.12, S * 0.05, "#d9a066"); ctx.restore();
      };
      face(w * 0.3, false); face(w * 0.7, true);
      if (reveal) badge(ctx, "Rechts: Augen und Mund sind in sich um 180° gedreht", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "amodal", cat: "wahrnehmung", name: "Amodale Ergänzung", short: "Was hinter dem Balken ist",
    hint: "Hinter dem Balken „siehst“ du einen vollständigen Kreis. Nimm den Balken weg (Auflösen) – dahinter kann alles Mögliche sein. Wähle, was wirklich dort ist.",
    desc: "Verdeckte Objektteile werden ohne Sinneseindruck ergänzt – amodal, also ohne dass wir sie wirklich sehen (Michotte, 1964; Kanizsa).",
    why: "Das Gehirn bevorzugt die einfachste, regelmäßigste Fortsetzung von Konturen hinter Verdeckern (gute Fortsetzung). Ohne diese Ergänzung würde jedes Objekt beim Vorbeigehen hinter einem Baum „zerfallen“.",
    params: [{ k: "hidden", label: "Wirklich dahinter", type: "select", def: "gap", options: [["full", "vollständiger Kreis"], ["gap", "zwei getrennte Bögen"], ["square", "Bögen + Quadrat"], ["zigzag", "Zickzack-Kante"]] }, { k: "animate", label: "Balken bewegen", type: "check", def: false }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.28, bw = R * 0.9, bx = cx + (p.animate ? Math.sin(t) * R * 0.4 : 0);
      ctx.save(); if (!reveal) { ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.rect(bx - bw / 2, 0, bw, h); ctx.clip("evenodd"); }
      if (p.hidden === "full") circle(ctx, cx, cy, R, "#e63946");
      else if (p.hidden === "gap") { circle(ctx, cx, cy, R, "#e63946"); rect(ctx, cx - R * 0.3, cy - R - 2, R * 0.6, 2 * R + 4, "#fff"); }
      else if (p.hidden === "square") { circle(ctx, cx, cy, R, "#e63946"); rect(ctx, cx - R * 0.3, cy - R - 2, R * 0.6, 2 * R + 4, "#fff"); rect(ctx, cx - R * 0.28, cy - R * 0.4, R * 0.56, R * 0.8, "#2a9d8f"); }
      else { circle(ctx, cx, cy, R, "#e63946"); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(cx - R * 0.3, cy - R - 2); for (let i = 0; i <= 10; i++) ctx.lineTo(cx + (i % 2 ? R * 0.3 : -R * 0.1), cy - R + i * R * 0.2); ctx.lineTo(cx - R * 0.3, cy + R + 2); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      if (!reveal) rect(ctx, bx - bw / 2, 0, bw, h, "#333"); else badge(ctx, "Ohne Balken: so sieht es wirklich aus", cx, h - 26);
    }
  });

  addIllusion({
    id: "unmoeglicher-wuerfel", cat: "wahrnehmung", name: "Unmöglicher Würfel (Escher)", short: "Vorne und hinten zugleich",
    hint: "Ein Drahtwürfel aus Balken – aber an einer Kreuzung läuft der hintere Balken vor dem vorderen. Schalte die Kreuzung auf „korrekt“, dann ist es ein normaler Necker-Würfel.",
    desc: "Eschers unmöglicher Würfel (aus „Belvedere“, 1958): Eine einzige vertauschte Überdeckung macht das Objekt unbaubar.",
    why: "Überdeckung (Verdeckung) ist der stärkste Tiefenhinweis. Widersprechen sich zwei Verdeckungen, nimmt das Gehirn jede für sich hin – es prüft Tiefe nur lokal.",
    params: [{ k: "mode", label: "Kreuzung", type: "select", def: "impossible", options: [["impossible", "unmöglich"], ["correct", "korrekt"]] }, { k: "animate", label: "Langsam drehen", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.2, a = p.animate ? t * 0.3 : 0.5, el = 0.55;
      const V = []; for (let i = 0; i < 8; i++) { const x = (i & 1 ? 1 : -1) * S, y = (i & 2 ? 1 : -1) * S, z = (i & 4 ? 1 : -1) * S; const xr = x * Math.cos(a) - z * Math.sin(a), zr = x * Math.sin(a) + z * Math.cos(a); V.push([cx + xr, cy + y * Math.cos(el) - zr * Math.sin(el), y * Math.sin(el) + zr * Math.cos(el)]); }
      const E = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      const inter = (p1, p2, p3, p4) => { const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]); if (Math.abs(d) < 1e-6) return null; const tt = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d, u = -((p1[0] - p2[0]) * (p1[1] - p3[1]) - (p1[1] - p2[1]) * (p1[0] - p3[0])) / d; return tt > 0.05 && tt < 0.95 && u > 0.05 && u < 0.95 ? [tt, u] : null; };
      const LW = S * 0.14; E.forEach(([i, j]) => line(ctx, V[i][0], V[i][1], V[j][0], V[j][1], "#ddd", LW));
      let crossings = [];
      for (let e1 = 0; e1 < 12; e1++) for (let e2 = e1 + 1; e2 < 12; e2++) { const [i, j] = E[e1], [k, l] = E[e2]; if (i === k || i === l || j === k || j === l) continue; const r = inter(V[i], V[j], V[k], V[l]); if (r) crossings.push({ e1, e2, tt: r[0], u: r[1], d1: V[i][2] + (V[j][2] - V[i][2]) * r[0], d2: V[k][2] + (V[l][2] - V[k][2]) * r[1] }); }
      crossings.forEach((c, idx) => { let frontIsE1 = c.d1 > c.d2; if (p.mode === "impossible" && idx === 0) frontIsE1 = !frontIsE1; const fe = frontIsE1 ? c.e1 : c.e2; const [i, j] = E[fe]; const x = V[i][0] + (V[j][0] - V[i][0]) * (frontIsE1 ? c.tt : c.u), y = V[i][1] + (V[j][1] - V[i][1]) * (frontIsE1 ? c.tt : c.u); const dx = V[j][0] - V[i][0], dy = V[j][1] - V[i][1], n = Math.hypot(dx, dy); const ux = dx / n * LW * 1.3, uy = dy / n * LW * 1.3; line(ctx, x - ux, y - uy, x + ux, y + uy, "#000", LW * 2.2); line(ctx, x - ux, y - uy, x + ux, y + uy, "#ddd", LW); if (reveal && idx === 0) circle(ctx, x, y, LW * 2, null, "#ff3b3b", 2); });
      if (reveal) badge(ctx, "Rot: die vertauschte Kreuzung", cx, h - 26);
    }
  });

  addIllusion({
    id: "hybridbild", cat: "wahrnehmung", name: "Hybridbild", short: "Nah ein Quadrat, fern ein Kreis",
    hint: "Von nah siehst du die feinen Kanten eines Quadrats, von weit weg (oder blinzelnd) den unscharfen Kreis. Der Regler „Abstand simulieren“ verkleinert das Bild – so wie es aus der Ferne wirkt (Oliva & Schyns, 2006).",
    desc: "Hybridbilder überlagern die tiefen Ortsfrequenzen eines Bildes mit den hohen eines anderen. Welches man sieht, entscheidet der Betrachtungsabstand.",
    why: "Das Sehsystem verarbeitet Ortsfrequenzen in getrennten Kanälen. Aus der Nähe dominieren die scharfen Kanten die Wahrnehmung; aus der Ferne fallen sie unter die Auflösungsgrenze, und nur die grobe Struktur bleibt.",
    params: [{ k: "blur", label: "Unschärfe (tiefe Frequenzen)", min: 10, max: 60, def: 30 }, { k: "dist", label: "Abstand simulieren", min: 1, max: 6, step: 0.1, def: 1 }, { k: "animate", label: "Abstand animieren", type: "check", def: false }],
    bg: "#808080",
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w, h), off = H.offscreen(p, "hy", 400, 400), oc = off.getContext("2d"), key = p.blur + "," + reveal;
      if (p._hyKey !== key) { p._hyKey = key; oc.filter = "none"; oc.fillStyle = "#808080"; oc.fillRect(0, 0, 400, 400); oc.filter = `blur(${p.blur}px)`; oc.fillStyle = "#2a2a2a"; oc.beginPath(); oc.arc(200, 200, 120, 0, TAU); oc.fill(); oc.filter = "none";
        if (!reveal) { oc.strokeStyle = "#f2f2f2"; oc.lineWidth = 2; for (let k = 0; k < 6; k++) oc.strokeRect(90 + k * 6, 90 + k * 6, 220 - k * 12, 220 - k * 12); oc.strokeStyle = "#111"; for (let k = 0; k < 6; k++) oc.strokeRect(93 + k * 6, 93 + k * 6, 220 - k * 12, 220 - k * 12); } }
      const d = p.animate ? 1 + 2.5 * (0.5 + 0.5 * Math.sin(t * 0.5)) : p.dist, sz = S * 0.85 / d;
      ctx.imageSmoothingEnabled = true; ctx.drawImage(off, w / 2 - sz / 2, h / 2 - sz / 2, sz, sz);
      if (reveal) badge(ctx, "Nur der tieffrequente Anteil: der Kreis", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "buchstabensalat", cat: "wahrnehmung", name: "Buchstabensalat", short: "Lesen ohne richtige Reihenfolge",
    hint: "Die inneren Buchstaben jedes Wortes sind vertauscht – nur erster und letzter stimmen. Trotzdem kannst du den Text lesen. Erhöhe die Stärke oder vertausche auch die Randbuchstaben, dann bricht es zusammen.",
    desc: "Das berühmte „Cambridge-Mail“ von 2003: Wortlesen funktioniert über Wortform und Kontext, nicht Buchstabe für Buchstabe.",
    why: "Geübte Leser erkennen Wörter als Ganzes (visuelle Wortform-Areal, VWFA) und nutzen Erwartung und Kontext. Die Randbuchstaben und die Wortlänge sind die stärksten Hinweise – deshalb sind sie hier entscheidend.",
    params: [{ k: "strength", label: "Anteil vertauschter Wörter", min: 0, max: 1, step: 0.05, def: 0.8 }, { k: "edges", label: "Auch Randbuchstaben vertauschen", type: "check", def: false }, { k: "size", label: "Schriftgröße", min: 16, max: 40, def: 26 }],
    anim: false, bg: "#f4f1ea",
    init(p) { p._seed = 17; },
    draw(ctx, w, h, p, t, reveal) {
      const txt = "Nach einer Studie an einer englischen Universität ist es egal, in welcher Reihenfolge die Buchstaben in einem Wort stehen. Wichtig ist nur, dass der erste und der letzte Buchstabe am richtigen Platz sind. Der Rest kann völlig durcheinander sein und man kann es trotzdem ohne Probleme lesen. Das liegt daran, dass wir nicht jeden Buchstaben einzeln lesen, sondern das Wort als Ganzes erkennen.";
      const r = rnd(p._seed); const words = txt.split(" ").map((wd) => { if (reveal || r() > p.strength) return wd; const m = wd.match(/^([A-Za-zÄÖÜäöüß]+)(.*)$/); if (!m || m[1].length < 4) return wd; let core = m[1]; const a = p.edges ? 0 : 1, b = p.edges ? core.length : core.length - 1; const mid = core.slice(a, b).split(""); for (let i = mid.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [mid[i], mid[j]] = [mid[j], mid[i]]; } return core.slice(0, a) + mid.join("") + core.slice(b) + m[2]; });
      ctx.font = p.size + "px Georgia, serif"; ctx.fillStyle = "#222"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      const maxW = w * 0.8, x0 = w * 0.1; let x = x0, y = h * 0.1, lh = p.size * 1.5;
      words.forEach((wd) => { const ww = ctx.measureText(wd + " ").width; if (x + ww > x0 + maxW) { x = x0; y += lh; } ctx.fillText(wd, x, y); x += ww; });
    }
  });

  addIllusion({
    id: "aufmerksamkeitsblinzeln", cat: "effekte", name: "Aufmerksamkeitsblinzeln", short: "Das Gehirn blinzelt",
    hint: "Buchstaben rasen mit 10 pro Sekunde vorbei. Darunter sind zwei Ziffern. Danach klicke die beiden Ziffern an, die du gesehen hast. Bei kurzem Abstand (Lag 2) wird die zweite Ziffer meist übersehen, bei Lag 7 nicht (Raymond, Shapiro & Arnell, 1992).",
    desc: "Nach dem Erkennen eines Ziels ist die Aufmerksamkeit 200–500 ms lang „blind“ für ein zweites.",
    why: "Das erste Ziel belegt die Verarbeitungsstufe, die Reize ins Arbeitsgedächtnis überführt. Ein zweites Ziel im Zeitfenster wird zwar sensorisch verarbeitet, aber nicht gespeichert – und bleibt deshalb unbewusst.",
    params: [{ k: "lag", label: "Abstand T1 → T2", type: "select", def: 2, options: [[2, "Lag 2 (200 ms)"], [7, "Lag 7 (700 ms)"]] }],
    anim: true, noReveal: true,
    init(p) { p._phase = "idle"; p._t0 = 0; p._stream = null; p._picked = []; p._stats = { 2: [0, 0], 7: [0, 0] }; },
    onDown(io, p, w, h) { if (p._phase !== "answer") return; const cw = w / 10, i = Math.floor(io.x / cw); if (io.y > h * 0.55 && io.y < h * 0.75 && i >= 0 && i < 10 && !p._picked.includes(i)) { p._picked.push(i); if (p._picked.length === 2) { const st = p._stats[p.lag]; if (p._picked.includes(p._t1)) { st[1]++; if (p._picked.includes(p._t2)) st[0]++; } p._phase = "done"; p._t0 = 0; } } },
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h * 0.4;
      if (p._phase === "idle" || p._phase === "done") { if (!p._t0) p._t0 = t; text(ctx, p._phase === "done" ? `T1: ${p._picked.includes(p._t1) ? "✓" : "✗"}  T2: ${p._picked.includes(p._t2) ? "✓" : "✗"}  (Ziffern waren ${p._t1} und ${p._t2})` : "Gleich geht's los – auf die Mitte schauen", cx, cy, "#fff", 16); if (t - p._t0 > 2) { const L = "BCDFGHJKLMNPRSTVWXYZ"; const stream = Array.from({ length: 18 }, () => L[Math.floor(Math.random() * L.length)]); const i1 = 4 + Math.floor(Math.random() * 3); p._t1 = Math.floor(Math.random() * 10); do { p._t2 = Math.floor(Math.random() * 10); } while (p._t2 === p._t1); stream[i1] = String(p._t1); stream[i1 + p.lag] = String(p._t2); p._stream = stream; p._phase = "run"; p._t0 = t; p._picked = []; } }
      else if (p._phase === "run") { const i = Math.floor((t - p._t0) * 10); if (i >= p._stream.length) { p._phase = "answer"; } else text(ctx, p._stream[i], cx, cy, "#fff", 72); }
      else if (p._phase === "answer") { text(ctx, "Welche zwei Ziffern hast du gesehen?", cx, cy - 20, "#fff", 18); const cw = w / 10; for (let i = 0; i < 10; i++) { rect(ctx, i * cw + 6, h * 0.55, cw - 12, h * 0.2, p._picked.includes(i) ? "#ffb347" : "#2a2a34"); text(ctx, String(i), i * cw + cw / 2, h * 0.65, "#fff", 28); } }
      const s2 = p._stats[2], s7 = p._stats[7]; text(ctx, `T2 erkannt (wenn T1 richtig): Lag 2 → ${s2[0]}/${s2[1]} · Lag 7 → ${s7[0]}/${s7[1]}`, cx, h * 0.9, "#5ec8ff", 14);
    }
  });

  addIllusion({
    id: "maskierung", cat: "effekte", name: "Rückwärtsmaskierung", short: "Ausgelöscht, bevor es bewusst wird",
    hint: "Ein Buchstabe erscheint für 30 ms. Kurz danach folgt eine Maske an derselben Stelle. Bei kurzem Abstand (SOA) ist der Buchstabe unsichtbar, obwohl er auf der Netzhaut war. Klicke danach den gesehenen Buchstaben an. Verändere das SOA.",
    desc: "Ein nachfolgender Reiz kann einen vorausgehenden auslöschen – Rückwärtsmaskierung, ein Standardwerkzeug der Bewusstseinsforschung.",
    why: "Bewusste Wahrnehmung braucht rückläufige (reentrante) Verarbeitung zwischen höheren und frühen Arealen. Die Maske unterbricht diese Schleife, bevor sie den Zielreiz stabilisiert hat (Lamme, Di Lollo).",
    params: [{ k: "soa", label: "SOA (Ziel → Maske)", min: 0, max: 300, def: 50, unit: " ms" }, { k: "mask", label: "Maske an", type: "check", def: true }],
    anim: true, noReveal: true,
    init(p) { p._phase = "idle"; p._t0 = 0; p._res = []; p._opts = []; },
    onDown(io, p, w, h) { if (p._phase !== "answer") return; const cw = w / 4, i = Math.floor(io.x / cw); if (io.y > h * 0.6 && io.y < h * 0.8) { p._res.push(p._opts[i] === p._target); p._phase = "idle"; p._t0 = 0; } },
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h * 0.38, L = "ABCDEFGHKLMNPRSTUVXYZ";
      if (p._phase === "idle") { if (!p._t0) p._t0 = t; fixation(ctx, cx, cy, "#ff3b3b"); if (t - p._t0 > 1.5) { p._target = L[Math.floor(Math.random() * L.length)]; const opts = [p._target]; while (opts.length < 4) { const c = L[Math.floor(Math.random() * L.length)]; if (!opts.includes(c)) opts.push(c); } p._opts = opts.sort(() => Math.random() - 0.5); p._phase = "run"; p._t0 = t; } }
      else if (p._phase === "run") { const ms = (t - p._t0) * 1000; if (ms < 30) text(ctx, p._target, cx, cy, "#fff", 60); if (p.mask && ms >= p.soa && ms < p.soa + 120) { for (let i = 0; i < 40; i++) { const a = (i * 2.4) % TAU, r = (i * 7.3) % 40; line(ctx, cx + Math.cos(a) * r - 20, cy + Math.sin(a) * r, cx + Math.cos(a) * r + 20, cy + Math.sin(a) * r + 10, i % 2 ? "#fff" : "#000", 4); } } if (ms > Math.max(400, p.soa + 300)) p._phase = "answer"; }
      else if (p._phase === "answer") { text(ctx, "Welcher Buchstabe war es?", cx, cy, "#fff", 18); const cw = w / 4; p._opts.forEach((o, i) => { rect(ctx, i * cw + 10, h * 0.6, cw - 20, h * 0.2, "#2a2a34"); text(ctx, o, i * cw + cw / 2, h * 0.7, "#fff", 32); }); }
      const n = p._res.length, ok = p._res.filter(Boolean).length; text(ctx, `SOA ${p.soa} ms · Treffer: ${ok}/${n} (Raten: 25 %)`, cx, h * 0.9, "#5ec8ff", 14);
    }
  });
})();
