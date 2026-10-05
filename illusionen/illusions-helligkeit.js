// Kategorie: Helligkeit & Farbe
(function () {
  const { TAU, line, circle, rect, poly, text, measure, badge, gray, hsl, fixation, clamp } = H;

  addIllusion({
    id: "hermann", cat: "helligkeit", name: "Hermann-Gitter", short: "Graue Flecken an den Kreuzungen",
    hint: "Graue Flecken erscheinen an den Kreuzungen – aber nie dort, wo du direkt hinschaust. Probiere die funkelnde Variante und ändere die Gitterweite.",
    desc: "In den weißen Kreuzungen tauchen dunkle Flecken auf, die verschwinden, sobald man sie fixiert. Mit Punkten wird daraus das „funkelnde Gitter“.",
    why: "Klassische Erklärung: Laterale Hemmung in der Netzhaut – rezeptive Felder an Kreuzungen bekommen mehr Umfeld-Weiß und werden stärker gehemmt. Modernere Modelle betonen Orientierungszellen im Kortex.",
    params: [{ k: "mode", label: "Variante", type: "select", def: "scint", options: [["classic", "Klassisch"], ["scint", "Funkelndes Gitter"]] }, { k: "size", label: "Kachelgröße", min: 30, max: 120, def: 60 }, { k: "bar", label: "Gitterbreite", min: 4, max: 30, def: 12 }, { k: "animate", label: "Gitter leicht bewegen", type: "check", def: false }],
    bg: "#111",
    draw(ctx, w, h, p, t, reveal) {
      const S = p.size + p.bar, ox = p.animate ? Math.sin(t) * 6 : 0, oy = p.animate ? Math.cos(t * 0.8) * 6 : 0;
      rect(ctx, 0, 0, w, h, p.mode === "scint" ? "#000" : "#111");
      ctx.fillStyle = p.mode === "scint" ? "#8c8c8c" : "#fff";
      for (let x = -S; x < w + S; x += S) ctx.fillRect(x + ox, 0, p.bar, h);
      for (let y = -S; y < h + S; y += S) ctx.fillRect(0, y + oy, w, p.bar);
      if (p.mode === "scint") for (let x = -S; x < w + S; x += S) for (let y = -S; y < h + S; y += S) circle(ctx, x + ox + p.bar / 2, y + oy + p.bar / 2, p.bar * 0.72, "#fff");
      if (reveal) { badge(ctx, "Jede Kreuzung ist exakt gleich hell", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "simultankontrast", cat: "helligkeit", name: "Simultankontrast", short: "Gleiches Grau, anderer Eindruck",
    hint: "Beide inneren Quadrate haben denselben Grauwert. Ändere die Hintergründe – oder lass sie animiert tauschen.",
    desc: "Das Grau auf dunklem Grund wirkt heller als das identische Grau auf hellem Grund.",
    why: "Die Netzhaut und der Kortex kodieren vor allem Unterschiede zu Nachbarregionen (laterale Hemmung). Helligkeit ist deshalb nie absolut, sondern immer relativ zur Umgebung.",
    params: [{ k: "g", label: "Innen-Grau", min: 0, max: 255, def: 128 }, { k: "l", label: "Linker Hintergrund", min: 0, max: 255, def: 40 }, { k: "r", label: "Rechter Hintergrund", min: 0, max: 255, def: 220 }, { k: "animate", label: "Hintergründe überblenden", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const k = p.animate ? 0.5 + 0.5 * Math.sin(t * 0.8) : 0, L = H.lerp(p.l, p.r, k), R = H.lerp(p.r, p.l, k);
      rect(ctx, 0, 0, w / 2, h, gray(L)); rect(ctx, w / 2, 0, w / 2, h, gray(R));
      const s = Math.min(w, h) * 0.25;
      rect(ctx, w * 0.25 - s / 2, h / 2 - s / 2, s, s, gray(p.g)); rect(ctx, w * 0.75 - s / 2, h / 2 - s / 2, s, s, gray(p.g));
      if (reveal) { rect(ctx, w * 0.25, h / 2 - 10, w * 0.5, 20, gray(p.g)); badge(ctx, "Verbindungsbalken: ein durchgehender Grauwert " + p.g, w / 2, h / 2 + 32); }
    }
  });

  addIllusion({
    id: "schachbrett-schatten", cat: "helligkeit", name: "Schachbrett-Schatten (Adelson)", short: "A und B sind gleich",
    hint: "Feld A und Feld B haben exakt denselben Grauwert (80). Auflösen verbindet beide mit einem Balken. Mit „Schatten wandern“ siehst du, wie B dunkel wird, sobald der Schatten weiterzieht.",
    desc: "Feld A sieht dunkel aus, Feld B hell. Beide Pixelwerte sind identisch.",
    why: "Das Sehsystem rechnet die Beleuchtung heraus: Ein Feld im Schatten, das gleich viel Licht sendet wie ein Feld im Licht, muss eigentlich heller sein. Das Gehirn zeigt uns die geschätzte Oberflächenfarbe, nicht das gemessene Licht.",
    params: [{ k: "shadow", label: "Schattenstärke", min: 0, max: 0.8, step: 0.01, def: 0.56 }, { k: "animate", label: "Schatten wandern", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const n = 6, S = Math.min(w, h) * 0.72 / n, ox = w / 2 - S * n / 2, oy = h / 2 - S * n / 2 + 20;
      const A = [1, 2], B = [3, 3], light = 180, dark = 80, V = 80; // A: dunkles Feld im Licht, B: helles Feld im Schatten
      const bx = ox + (B[0] + 0.5) * S, by = oy + (B[1] + 0.5) * S;
      const sx = p.animate ? bx + Math.sin(t * 0.6) * S * 2.5 : bx, sy = p.animate ? by + Math.cos(t * 0.6) * S * 0.8 : by, sr = S * 2.1;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        let v = (r + c) % 2 === 0 ? light : dark;
        const d = Math.hypot((c + 0.5) * S + ox - sx, (r + 0.5) * S + oy - sy), sh = Math.pow(clamp(1 - d / sr, 0, 1), 0.35);
        v = v * (1 - p.shadow * sh);
        if ((r === A[1] && c === A[0]) || (r === B[1] && c === B[0])) v = V;
        rect(ctx, ox + c * S, oy + r * S, S + 0.5, S + 0.5, gray(v));
      }
      // Zylinder als Schattenwerfer
      const zx = sx + sr * 0.75, zy = sy - sr * 0.95, rw = S * 0.55, rh = S * 0.22, zh = S * 1.3;
      rect(ctx, zx - rw, zy - zh, rw * 2, zh, "#2e8b3d"); ctx.fillStyle = "#3fa34d"; ctx.beginPath(); ctx.ellipse(zx, zy, rw, rh, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "#5ccf6a"; ctx.beginPath(); ctx.ellipse(zx, zy - zh, rw, rh, 0, 0, TAU); ctx.fill();
      if (reveal) { const ax = ox + (A[0] + 0.5) * S, ay = oy + (A[1] + 0.5) * S; rect(ctx, ax - S * 0.18, ay, S * 0.36, by - ay + S * 0.18, gray(V)); rect(ctx, ax - S * 0.18, by - S * 0.18, bx - ax + S * 0.18, S * 0.36, gray(V)); badge(ctx, "A = B = Grauwert " + V, w / 2, oy - 18); }
      text(ctx, "A", ox + (A[0] + 0.5) * S, oy + (A[1] + 0.5) * S, "#fff", S * 0.4); text(ctx, "B", bx, by, "#fff", S * 0.4);
    }
  });
  addIllusion({
    id: "mach", cat: "helligkeit", name: "Mach-Bänder", short: "Kanten, die es nicht gibt",
    hint: "Jeder Streifen ist in sich gleichmäßig gefüllt. Trotzdem wirkt jeder Streifen an seiner dunklen Nachbarseite heller und an der hellen dunkler.",
    desc: "An jeder Stufe erscheint ein heller und ein dunkler Saum, der im Pixelbild nicht existiert.",
    why: "Laterale Hemmung verstärkt Kontraste an Kanten: Zellen direkt neben einer helleren Fläche werden stärker gehemmt, Zellen neben einer dunkleren weniger.",
    params: [{ k: "n", label: "Stufen", min: 4, max: 16, def: 8 }, { k: "animate", label: "Stufen verschieben", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const off = p.animate ? (t * 40) % (w / p.n) : 0;
      for (let i = -1; i <= p.n; i++) { const x = i * w / p.n + off; rect(ctx, x, 0, w / p.n + 1, h, gray(40 + 190 * (((i % p.n) + p.n) % p.n) / (p.n - 1))); }
      if (reveal) { for (let i = 0; i <= p.n; i++) { const x = i * w / p.n + off; line(ctx, x, h * 0.75, x, h * 0.95, "#5ec8ff", 2); } badge(ctx, "Innerhalb jedes Streifens: konstanter Wert", w / 2, h - 20); }
    }
  });

  addIllusion({
    id: "white", cat: "helligkeit", name: "White-Täuschung", short: "Kontrast rückwärts",
    hint: "Die grauen Rechtecke links und rechts sind identisch. Das auf den schwarzen Streifen wirkt heller – obwohl es von mehr Weiß umgeben ist.",
    desc: "Die grauen Balken auf den schwarzen Streifen wirken heller als die auf den weißen Streifen – das Gegenteil des Simultankontrasts.",
    why: "Hier dominiert Assimilation: Die grauen Stücke werden zu dem Streifen gerechnet, dem sie geometrisch „gehören“ (sie unterbrechen ihn), und übernehmen dessen Helligkeitstendenz.",
    params: [{ k: "g", label: "Grau", min: 60, max: 200, def: 128 }, { k: "stripes", label: "Streifen", min: 6, max: 20, def: 12 }, { k: "animate", label: "Streifen laufen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const sh = h / p.stripes, off = p.animate ? (t * 30) % (2 * sh) : 0;
      for (let i = -2; i < p.stripes + 2; i++) rect(ctx, 0, i * sh + off, w, sh + 1, i % 2 ? "#000" : "#fff");
      const bw = w * 0.18;
      for (let i = -2; i < p.stripes + 2; i++) { if (i < 2 || i > p.stripes - 4) continue; const y = i * sh + off; if (i % 2) rect(ctx, w * 0.28 - bw / 2, y, bw, sh + 1, gray(p.g)); else rect(ctx, w * 0.72 - bw / 2, y, bw, sh + 1, gray(p.g)); }
      if (reveal) { rect(ctx, w * 0.28, h / 2 - 8, w * 0.44, 16, gray(p.g)); badge(ctx, "Alle grauen Flächen: Wert " + p.g, w / 2, h / 2 + 28); }
    }
  });

  addIllusion({
    id: "cornsweet", cat: "helligkeit", name: "Cornsweet-Kante", short: "Eine Kante färbt die ganze Fläche",
    hint: "Links und rechts der Kante ist die Fläche gleich hell – nur direkt an der Kante gibt es einen feinen Verlauf. Decke die Kante ab (Auflösen), dann sieht man es.",
    desc: "Die linke Hälfte wirkt heller als die rechte. Tatsächlich ist nur ein schmaler Streifen an der Grenze verändert.",
    why: "Das Sehsystem extrapoliert Helligkeitsinformation von Kanten in die Flächen hinein („filling-in“). Die Flächen selbst werden kaum direkt gemessen.",
    params: [{ k: "str", label: "Kantenstärke", min: 0, max: 80, def: 45 }, { k: "wid", label: "Kantenbreite", min: 10, max: 200, def: 70 }, { k: "animate", label: "Kante wandern", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const base = 128, cx = p.animate ? w / 2 + Math.sin(t * 0.5) * w * 0.15 : w / 2;
      rect(ctx, 0, 0, w, h, gray(base));
      const g = ctx.createLinearGradient(cx - p.wid, 0, cx, 0); g.addColorStop(0, gray(base)); g.addColorStop(1, gray(base + p.str));
      ctx.fillStyle = g; ctx.fillRect(cx - p.wid, 0, p.wid, h);
      const g2 = ctx.createLinearGradient(cx, 0, cx + p.wid, 0); g2.addColorStop(0, gray(base - p.str)); g2.addColorStop(1, gray(base));
      ctx.fillStyle = g2; ctx.fillRect(cx, 0, p.wid, h);
      if (reveal) { rect(ctx, cx - p.wid - 10, 0, 2 * p.wid + 20, h, "#5ec8ff"); badge(ctx, "Kante abgedeckt: beide Seiten Wert " + base, w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "aquarell", cat: "helligkeit", name: "Aquarell-Täuschung", short: "Farbe fließt in die Fläche",
    hint: "Die Innenfläche ist reines Weiß – wie der Außenbereich. Eine dünne farbige Innenlinie färbt sie scheinbar ein.",
    desc: "Eine Form mit violetter Außen- und oranger Innenkontur erscheint innen zart orange gefüllt.",
    why: "Wieder „filling-in“: Die Farbe der Innenkontur breitet sich wahrnehmungsmäßig über die Fläche aus, die durch die dunkle Außenlinie als Figur abgegrenzt wird.",
    params: [{ k: "lw", label: "Linienbreite", min: 1, max: 8, def: 3 }, { k: "hue", label: "Innenfarbe (Farbton)", min: 0, max: 360, def: 35 }, { k: "animate", label: "Form wabern", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36;
      const pts = []; for (let i = 0; i < 180; i++) { const a = i / 180 * TAU; const r = R * (1 + 0.12 * Math.sin(a * 7 + (p.animate ? t * 2 : 0)) + 0.06 * Math.sin(a * 3 - t * 0.5)); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      ctx.lineJoin = "round";
      poly(ctx, pts, reveal ? "rgba(94,200,255,.15)" : null, "#6a2d8a", p.lw * 2);
      const inner = pts.map(([x, y]) => [cx + (x - cx) * (1 - p.lw * 2.2 / R), cy + (y - cy) * (1 - p.lw * 2.2 / R)]);
      poly(ctx, inner, null, hsl(p.hue, 85, 60), p.lw * 2);
      if (reveal) badge(ctx, "Innenfläche: reines Weiß, nur markiert", cx, h - 26);
    }
  });

  addIllusion({
    id: "nachbild", cat: "helligkeit", name: "Farbiges Nachbild", short: "Komplementärfarben erscheinen",
    hint: "Fixiere das Kreuz ca. 20 Sekunden ohne zu blinzeln. Dann wechselt die Anzeige automatisch auf Weiß – du siehst die Komplementärfarben.",
    desc: "Nach längerem Anstarren farbiger Flächen erscheinen auf weißem Grund die Gegenfarben: aus Cyan wird Rot, aus Gelb Blau.",
    why: "Die farbempfindlichen Zapfen und nachgeschaltete Gegenfarbenkanäle adaptieren. Fällt dann neutrales Licht ein, überwiegt kurzzeitig der nicht-ermüdete Kanal.",
    params: [{ k: "dur", label: "Fixationszeit", min: 5, max: 40, def: 20, unit: " s" }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const phase = t % (p.dur + 8), showing = phase < p.dur, cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.22;
      rect(ctx, 0, 0, w, h, showing ? "#000" : "#fff");
      if (showing) {
        circle(ctx, cx - s * 1.2, cy, s * 0.8, "#00e5ff"); circle(ctx, cx + s * 1.2, cy, s * 0.8, "#ffe100");
        rect(ctx, cx - s * 0.6, cy - s * 1.9, s * 1.2, s * 0.8, "#ff2bd6"); rect(ctx, cx - s * 0.6, cy + s * 1.1, s * 1.2, s * 0.8, "#2bff52");
        text(ctx, "Noch " + Math.ceil(p.dur - phase) + " s fixieren", cx, h - 30, "#888", 14);
      } else text(ctx, "Weiter aufs Kreuz schauen …", cx, h - 30, "#aaa", 14);
      fixation(ctx, cx, cy, showing ? "#fff" : "#000");
    }
  });

  addIllusion({
    id: "troxler", cat: "helligkeit", name: "Troxler-Effekt", short: "Verschwindende Farbflecken",
    hint: "Fixiere das Kreuz in der Mitte. Nach einigen Sekunden verblassen die weichen Farbflecken und verschwinden ganz. Blinzeln setzt alles zurück.",
    desc: "Weiche, unscharfe Reize in der Peripherie verschwinden bei stabiler Fixation vollständig.",
    why: "Neuronen adaptieren an unveränderte Reize. Normalerweise verhindern winzige Augenbewegungen (Mikrosakkaden) das; bei weichen Kanten reichen sie nicht aus, und das Gehirn füllt den Hintergrund auf.",
    params: [{ k: "blur", label: "Weichheit", min: 10, max: 120, def: 70 }, { k: "n", label: "Flecken", min: 3, max: 12, def: 7 }],
    anim: false, noReveal: true, bg: "#bdbdbd",
    draw(ctx, w, h, p) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
      for (let i = 0; i < p.n; i++) { const a = i / p.n * TAU; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; const g = ctx.createRadialGradient(x, y, 0, x, y, p.blur); g.addColorStop(0, hsl(i * 360 / p.n, 70, 70)); g.addColorStop(1, "rgba(189,189,189,0)"); ctx.fillStyle = g; ctx.fillRect(x - p.blur, y - p.blur, 2 * p.blur, 2 * p.blur); }
      fixation(ctx, cx, cy, "#222");
    }
  });

  addIllusion({
    id: "benham", cat: "helligkeit", name: "Benham-Scheibe", short: "Farben aus Schwarz-Weiß",
    hint: "Die rotierende schwarz-weiße Scheibe erzeugt blasse Farbringe (Fechner-Farben). Spiele mit Drehzahl und Richtung – die Farben wechseln.",
    desc: "Eine rein schwarz-weiße Scheibe zeigt beim Drehen farbige Ringe.",
    why: "Die drei Zapfentypen reagieren unterschiedlich schnell auf Lichtblitze. Bei schnellen Hell-Dunkel-Wechseln geraten sie aus dem Takt – das Gehirn liest das als Farbe. Die genaue Ursache ist bis heute nicht vollständig geklärt.",
    params: [{ k: "rpm", label: "Drehzahl", min: 1, max: 12, step: 0.1, def: 5, unit: " U/s" }, { k: "dir", label: "Richtung", type: "select", def: 1, options: [[1, "Im Uhrzeigersinn"], [-1, "Gegen den Uhrzeigersinn"]] }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.45;
      circle(ctx, cx, cy, R, "#fff"); ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * p.rpm * TAU * p.dir);
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.lineWidth = R * 0.05; ctx.strokeStyle = "#000"; ctx.lineCap = "butt";
      for (let k = 0; k < 4; k++) { const r = R * (0.3 + k * 0.16); ctx.beginPath(); ctx.arc(0, 0, r, Math.PI + k * Math.PI / 4, Math.PI + (k + 1) * Math.PI / 4); ctx.stroke(); }
      ctx.restore();
    }
  });

  addIllusion({
    id: "munker", cat: "helligkeit", name: "Munker-White-Farbtäuschung", short: "Eine Farbe, zwei Eindrücke",
    hint: "Alle Kugeln haben exakt dieselbe Farbe. Die Streifen davor färben sie scheinbar unterschiedlich ein.",
    desc: "Die Kreise wirken links grünlich und rechts rötlich – ihr Farbwert ist identisch.",
    why: "Farbassimilation: Dünne farbige Streifen, die eine Fläche durchziehen, mischen sich wahrnehmungsmäßig mit ihr. Das Gehirn mittelt über kleine Bereiche.",
    params: [{ k: "stripes", label: "Streifen", min: 8, max: 40, def: 22 }, { k: "animate", label: "Streifen laufen", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cols = ["#ffd400", "#fff"], cx1 = w * 0.3, cx2 = w * 0.7, cy = h / 2, R = Math.min(w, h) * 0.22, base = "#f0b000";
      circle(ctx, cx1, cy, R, base); circle(ctx, cx2, cy, R, base);
      const sh = h / p.stripes, off = p.animate ? (t * 25) % (2 * sh) : 0;
      for (let i = -2; i < p.stripes + 2; i++) { const y = i * sh + off; const c = i % 2 ? "#00a86b" : "#e0245e"; ctx.save(); ctx.beginPath(); ctx.arc(cx1, cy, R, 0, TAU); ctx.clip(); if (i % 2) rect(ctx, 0, y, w, sh * 0.55, c); ctx.restore(); ctx.save(); ctx.beginPath(); ctx.arc(cx2, cy, R, 0, TAU); ctx.clip(); if (!(i % 2)) rect(ctx, 0, y, w, sh * 0.55, c); ctx.restore(); }
      for (let i = -2; i < p.stripes + 2; i++) { const y = i * sh + off; const c = i % 2 ? "#00a86b" : "#e0245e"; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.moveTo(cx1 + R, cy); ctx.arc(cx1, cy, R, 0, TAU, true); ctx.moveTo(cx2 + R, cy); ctx.arc(cx2, cy, R, 0, TAU, true); ctx.clip("evenodd"); rect(ctx, 0, y, w, sh * 0.55, c); ctx.restore(); }
      if (reveal) { rect(ctx, cx1, cy - 10, cx2 - cx1, 20, base); badge(ctx, "Beide Kugeln: " + base, w / 2, cy + 30); }
    }
  });

  addIllusion({
    id: "neon", cat: "helligkeit", name: "Neon-Farbausbreitung", short: "Leuchtender Fleck ohne Fläche",
    hint: "Nur die Linienstücke in der Mitte sind farbig. Trotzdem scheint dort eine leuchtende, transparente Scheibe zu schweben. Verändere Radius und Farbe.",
    desc: "Farbige Teilstücke eines schwarzen Gitters erzeugen eine scheinbar gefüllte, leuchtende Scheibe.",
    why: "Kombination aus illusorischer Kontur (der Kreis) und Farb-Filling-in. Das Gehirn erklärt sich die Farbwechsel am einfachsten durch eine transparente farbige Scheibe.",
    params: [{ k: "r", label: "Radius", min: 40, max: 200, def: 110 }, { k: "hue", label: "Farbton", min: 0, max: 360, def: 195 }, { k: "animate", label: "Scheibe wandern", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = p.animate ? w / 2 + Math.cos(t * 0.6) * w * 0.2 : w / 2, cy = p.animate ? h / 2 + Math.sin(t * 0.8) * h * 0.2 : h / 2, g = 26;
      ctx.lineWidth = 2;
      for (let x = (cx % g); x < w; x += g) { ctx.strokeStyle = "#222"; line(ctx, x, 0, x, h, "#222", 2); }
      for (let y = (cy % g); y < h; y += g) line(ctx, 0, y, w, y, "#222", 2);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, TAU); ctx.clip(); rect(ctx, 0, 0, w, h, "#fff");
      for (let x = (cx % g); x < w; x += g) line(ctx, x, 0, x, h, hsl(p.hue, 90, 55), 2);
      for (let y = (cy % g); y < h; y += g) line(ctx, 0, y, w, y, hsl(p.hue, 90, 55), 2);
      ctx.restore();
      if (reveal) { circle(ctx, cx, cy, p.r, null, "#ff4d4d", 2); badge(ctx, "Innerhalb: nur Linien auf weißem Grund", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "verlauf-kontrast", cat: "helligkeit", name: "Balken auf Verlauf", short: "Ein Grau, das sich verändert",
    hint: "Der Querbalken ist überall exakt gleich grau. Vor dem Verlauf scheint er selbst einen Verlauf zu haben – in Gegenrichtung.",
    desc: "Der gleichmäßig graue Balken wirkt links heller und rechts dunkler.",
    why: "Simultankontrast über die Länge des Balkens: Jeder Abschnitt wird relativ zu seiner lokalen Umgebung beurteilt.",
    params: [{ k: "g", label: "Balkengrau", min: 60, max: 200, def: 128 }, { k: "animate", label: "Verlauf drehen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const k = p.animate ? 0.5 + 0.5 * Math.sin(t * 0.6) : 0;
      const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, gray(H.lerp(20, 235, k))); g.addColorStop(1, gray(H.lerp(235, 20, k)));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      rect(ctx, w * 0.1, h / 2 - 30, w * 0.8, 60, gray(p.g));
      if (reveal) { rect(ctx, w * 0.1, h / 2 + 40, w * 0.8, 10, gray(p.g)); rect(ctx, 0, h / 2 + 60, w, 50, "#000"); rect(ctx, w * 0.1, h / 2 + 80, w * 0.8, 10, gray(p.g)); badge(ctx, "Gleicher Balken vor Schwarz", w / 2, h / 2 + 130); }
    }
  });
})();
