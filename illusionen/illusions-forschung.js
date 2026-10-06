// Kategorie: Sehen & Gehirn – interaktive Experimente aus der Wahrnehmungsforschung
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  // Adaptive Treppe (1-up/2-down): nähert sich der 70,7-%-Schwelle
  const staircase = (p, startVal, step) => { p._sc = { val: startVal, step, correctRun: 0, rev: [], lastDir: 0, trials: 0, hist: [] }; };
  const scAnswer = (p, ok, minVal) => { const s = p._sc; s.trials++; s.hist.push([s.val, ok]); let dir = 0; if (ok) { s.correctRun++; if (s.correctRun >= 2) { s.val = Math.max(minVal, s.val * s.step); s.correctRun = 0; dir = -1; } } else { s.correctRun = 0; s.val = s.val / s.step; dir = 1; } if (dir && s.lastDir && dir !== s.lastDir) s.rev.push(s.val); if (dir) s.lastDir = dir; };
  const scThreshold = (p) => { const r = p._sc.rev.slice(-6); return r.length >= 4 ? r.reduce((a, b) => a + b, 0) / r.length : null; };
  const scPlot = (ctx, p, x, y, w, h, fmt) => { const s = p._sc; rect(ctx, x, y, w, h, "rgba(255,255,255,.06)"); if (s.hist.length < 2) return; const vals = s.hist.map((q) => q[0]), lo = Math.min(...vals), hi = Math.max(...vals); ctx.beginPath(); s.hist.forEach(([v, ok], i) => { const px = x + i / Math.max(1, s.hist.length - 1) * w, py = y + h - (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo) || 1) * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 1.5; ctx.stroke(); s.hist.forEach(([v, ok], i) => { const px = x + i / Math.max(1, s.hist.length - 1) * w, py = y + h - (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo) || 1) * h; circle(ctx, px, py, 3, ok ? "#3cff5a" : "#ff3b3b"); }); text(ctx, fmt(hi), x - 6, y + 6, "#888", 10, "right"); text(ctx, fmt(lo), x - 6, y + h - 6, "#888", 10, "right"); };

  addIllusion({
    id: "laterale-hemmung", cat: "effekte", name: "Laterale Hemmung (Simulation)", short: "Was die Netzhaut wirklich meldet",
    hint: "Links das Reizbild, rechts die berechnete Antwort von Zentrum-Umfeld-Zellen (Difference of Gaussians). Wähle Mach-Bänder, Hermann-Gitter oder Simultankontrast: Die Täuschungen stecken bereits in der Antwort der Netzhaut.",
    desc: "Ein Rechenmodell der retinalen Ganglienzellen: Jede Zelle wird von ihrem Zentrum erregt und vom Umfeld gehemmt. Das erklärt Mach-Bänder, Hermann-Gitter und Kontrastverstärkung (Hartline & Ratliff, 1950er).",
    why: "Laterale Hemmung komprimiert das Bild auf das, was zählt: Kanten und Unterschiede. Gleichmäßige Flächen liefern kaum Signal. Die Nebenwirkung sind Überschwinger an Kanten – genau die Säume, die wir als Täuschung erleben.",
    params: [{ k: "scene", label: "Reiz", type: "select", def: "mach", options: [["mach", "Mach-Bänder (Stufen)"], ["hermann", "Hermann-Gitter"], ["contrast", "Simultankontrast"], ["edge", "Einzelne Kante"]] }, { k: "surround", label: "Umfeld-Radius", min: 2, max: 10, def: 5 }, { k: "gain", label: "Hemmstärke", min: 0, max: 1, step: 0.01, def: 0.8 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const W = 120, Hh = 90, key = [p.scene, p.surround, p.gain].join(","); const off = H.offscreen(p, key, W, Hh), octx = off.getContext("2d");
      if (!p._img) {
        const img = new Float32Array(W * Hh);
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let v; if (p.scene === "mach") v = 0.15 + 0.7 * Math.floor(x / 15) / 7; else if (p.scene === "hermann") v = (x % 20 < 14 && y % 20 < 14) ? 0.05 : 0.95; else if (p.scene === "contrast") { v = x < W / 2 ? 0.15 : 0.85; if (Math.abs(x - (x < W / 2 ? W / 4 : 3 * W / 4)) < 12 && Math.abs(y - Hh / 2) < 12) v = 0.5; } else v = x < W / 2 ? 0.25 : 0.75; img[y * W + x] = v; }
        const R = p.surround, out = new Float32Array(W * Hh); let mn = 1e9, mx = -1e9;
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let c = 0, cw = 0, s = 0, sw = 0; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const xx = clamp(x + dx, 0, W - 1), yy = clamp(y + dy, 0, Hh - 1), d2 = dx * dx + dy * dy; const wc = Math.exp(-d2 / 2), ws = Math.exp(-d2 / (2 * R * R / 4)); c += img[yy * W + xx] * wc; cw += wc; s += img[yy * W + xx] * ws; sw += ws; } const r = c / cw - p.gain * s / sw; out[y * W + x] = r; mn = Math.min(mn, r); mx = Math.max(mx, r); }
        p._img = octx.createImageData(W * 2 + 6, Hh); const d = p._img.data;
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W * 2 + 6; x++) { let v; if (x < W) v = img[y * W + x] * 255; else if (x < W + 6) v = 40; else v = (out[y * W + x - W - 6] - mn) / (mx - mn || 1) * 255; const i = (y * (W * 2 + 6) + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
        off.width = W * 2 + 6; octx.putImageData(p._img, 0, 0);
      }
      ctx.imageSmoothingEnabled = false; const sc = Math.min(w / (W * 2 + 6), h * 0.8 / Hh); const dw = (W * 2 + 6) * sc, dh = Hh * sc; ctx.drawImage(off, (w - dw) / 2, (h - dh) / 2 - 10, dw, dh);
      text(ctx, "Reiz (Netzhautbild)", w / 2 - dw / 4, (h - dh) / 2 - 24, "#ccc", 13); text(ctx, "Antwort der Ganglienzellen", w / 2 + dw / 4, (h - dh) / 2 - 24, "#ccc", 13);
      if (reveal) badge(ctx, "Rechts: Überschwinger an Kanten, dunkle Kreuzungen, verstärkte Unterschiede", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "rezeptives-feld", cat: "effekte", name: "Rezeptives Feld (On-Zentrum-Zelle)", short: "Was eine Nervenzelle sieht",
    hint: "Bewege den Lichtfleck mit der Maus über das rezeptive Feld. Im Zentrum feuert die Zelle, im Umfeld wird sie gehemmt. Vergrößere den Fleck: Deckt er Zentrum und Umfeld ab, bleibt die Zelle fast stumm – Flächen sind uninteressant, Kanten nicht.",
    desc: "Das rezeptive Feld einer retinalen Ganglienzelle mit erregendem Zentrum und hemmendem Umfeld (Kuffler, 1953) – der Grundbaustein des Sehens.",
    why: "Die konzentrische Organisation macht die Zelle zu einem Kontrast-Detektor. Hubel und Wiesel zeigten später, wie aus vielen solcher Zellen im Kortex Orientierungsdetektoren werden – Nobelpreis 1981.",
    params: [{ k: "spot", label: "Fleckgröße", min: 5, max: 120, def: 30 }, { k: "type", label: "Zelltyp", type: "select", def: "on", options: [["on", "On-Zentrum"], ["off", "Off-Zentrum"]] }, { k: "animate", label: "Balken automatisch wandern", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal, io) {
      const cx = w * 0.4, cy = h / 2, Rc = Math.min(w, h) * 0.1, Rs = Rc * 2.6, sign = p.type === "on" ? 1 : -1;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rs); g.addColorStop(0, sign > 0 ? "rgba(60,255,90,.5)" : "rgba(255,59,59,.5)"); g.addColorStop(Rc / Rs, sign > 0 ? "rgba(60,255,90,.35)" : "rgba(255,59,59,.35)"); g.addColorStop(Rc / Rs + 0.01, sign > 0 ? "rgba(255,59,59,.3)" : "rgba(60,255,90,.3)"); g.addColorStop(1, "rgba(0,0,0,0)"); circle(ctx, cx, cy, Rs, g); circle(ctx, cx, cy, Rc, null, "#fff", 1); circle(ctx, cx, cy, Rs, null, "#666", 1);
      text(ctx, "+", cx, cy, "#fff", 18); text(ctx, "−", cx + (Rc + Rs) / 2, cy, "#fff", 18);
      const sx = p.animate ? cx + Math.sin(t * 0.7) * Rs * 1.5 : (io.inside ? io.x : cx + Rs * 1.3), sy = p.animate ? cy : (io.inside ? io.y : cy);
      // Antwort = Integral von Fleck × DoG
      let resp = 0, n = 0; for (let dy = -p.spot; dy <= p.spot; dy += 4) for (let dx = -p.spot; dx <= p.spot; dx += 4) { if (dx * dx + dy * dy > p.spot * p.spot) continue; const d = Math.hypot(sx + dx - cx, sy + dy - cy); resp += sign * (Math.exp(-d * d / (2 * Rc * Rc * 0.5)) - 0.55 * Math.exp(-d * d / (2 * Rs * Rs * 0.25))); n++; }
      const rate = clamp(10 + resp / Math.max(1, n) * 90 * Math.min(1, n / 40) * 6, 0, 100);
      ctx.globalAlpha = 0.85; circle(ctx, sx, sy, p.spot, "#fff"); ctx.globalAlpha = 1;
      // Spike-Anzeige
      const mx = w * 0.78, my = h / 2; text(ctx, "Feuerrate", mx, my - 120, "#ccc", 13); rect(ctx, mx - 20, my - 100, 40, 200, "#222"); rect(ctx, mx - 20, my + 100 - rate * 2, 40, rate * 2, rate > 20 ? "#3cff5a" : "#777"); text(ctx, Math.round(rate) + " Hz", mx, my + 120, "#fff", 14);
      for (let i = 0; i < Math.round(rate / 5); i++) { const x = w * 0.62 + (i * 37 + t * 200) % (w * 0.3); line(ctx, x, h * 0.85, x, h * 0.85 - 16, "#3cff5a", 2); } line(ctx, w * 0.62, h * 0.85, w * 0.92, h * 0.85, "#555", 1);
      if (reveal) badge(ctx, "Antwort = Fleckfläche × (Zentrum-Gewicht − Umfeld-Gewicht)", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "schwellenmessung", cat: "effekte", name: "Kontrastschwelle messen (Staircase)", short: "Psychophysik zum Mitmachen",
    hint: "Auf einer Seite ist ein schwaches Streifenmuster. Klicke auf die Seite (links/rechts), auf der du es siehst – auch wenn du raten musst. Der Kontrast passt sich an (2 richtig → schwerer, 1 falsch → leichter). Nach ~25 Durchgängen steht deine Schwelle.",
    desc: "Die adaptive Treppenmethode (Levitt, 1971) findet in wenigen Durchgängen den Kontrast, den du gerade noch erkennst – so werden Sehleistungen in Klinik und Forschung gemessen.",
    why: "Die 1-up/2-down-Regel konvergiert auf den Punkt, an dem 70,7 % der Antworten richtig sind. Die Umkehrpunkte der Treppe werden gemittelt. Der Zwangswahl-Ansatz (2AFC) macht das Ergebnis unabhängig von deiner Vorsicht.",
    params: [{ k: "freq", label: "Ortsfrequenz", min: 2, max: 30, def: 8 }],
    anim: false, noReveal: true,
    init(p) { staircase(p, 0.3, 0.7); p._side = Math.random() < 0.5 ? 0 : 1; p._fb = ""; },
    onDown(io, p, w, h) { const ans = io.x < w / 2 ? 0 : 1; const ok = ans === p._side; p._fb = ok ? "✓" : "✗"; scAnswer(p, ok, 0.002); p._side = Math.random() < 0.5 ? 0 : 1; },
    draw(ctx, w, h, p) {
      const c = p._sc.val, R = Math.min(w / 4, h * 0.3), cy = h * 0.42; rect(ctx, 0, 0, w, h, "#808080");
      [w * 0.27, w * 0.73].forEach((cx, i) => { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); if (i === p._side) { const per = 2 * R / p.freq; for (let x = cx - R; x < cx + R; x += 1) { const v = 128 + 127 * c * Math.sin((x - cx) / per * TAU); rect(ctx, x, cy - R, 1.5, 2 * R, gray(v)); } } ctx.restore(); circle(ctx, cx, cy, R, null, "#555", 1); });
      line(ctx, w / 2, 0, w / 2, h * 0.75, "#555", 1);
      const th = scThreshold(p); text(ctx, `Durchgang ${p._sc.trials} · Kontrast ${(c * 100).toFixed(1)} % ${p._fb}`, w / 2, h * 0.8, "#fff", 14);
      text(ctx, th ? `Deine Schwelle ≈ ${(th * 100).toFixed(1)} % Kontrast (Empfindlichkeit ${Math.round(1 / th)})` : "Schwelle: noch mindestens 4 Umkehrpunkte nötig …", w / 2, h * 0.87, th ? "#5ec8ff" : "#ccc", 14);
      scPlot(ctx, p, w * 0.3, h * 0.9, w * 0.4, h * 0.08, (v) => (v * 100).toFixed(1) + " %");
    }
  });

  addIllusion({
    id: "nonius", cat: "effekte", name: "Nonius-Sehschärfe (Hyperacuity)", short: "Feiner als die Rezeptoren",
    hint: "Zwei senkrechte Striche, der obere ist minimal nach links oder rechts versetzt. Klicke links oder rechts. Der Versatz wird kleiner, bis du nur noch rätst. Menschen erreichen hier Bruchteile eines Rezeptorabstands (Westheimer, 1975).",
    desc: "Nonius-(Vernier-)Sehschärfe liegt bei etwa 5 Winkelsekunden – zehnmal feiner als der Abstand der Zapfen. Das Gehirn interpoliert zwischen Rezeptoren.",
    why: "Viele Rezeptoren liefern zusammen eine Positionsschätzung, die genauer ist als jeder einzelne (Populationscodierung). Orientierungszellen in V1 reagieren extrem empfindlich auf den winzigen Knick zwischen den beiden Linienstücken.",
    params: [{ k: "gap", label: "Lücke zwischen Strichen", min: 0, max: 40, def: 6 }],
    anim: false, noReveal: true,
    init(p) { staircase(p, 6, 0.75); p._dir = Math.random() < 0.5 ? -1 : 1; p._fb = ""; },
    onDown(io, p, w, h) { const ans = io.x < w / 2 ? -1 : 1; const ok = ans === p._dir; p._fb = ok ? "✓" : "✗"; scAnswer(p, ok, 0.05); p._dir = Math.random() < 0.5 ? -1 : 1; },
    draw(ctx, w, h, p) {
      const cx = w / 2, cy = h * 0.42, L = h * 0.18, off = p._sc.val * p._dir;
      line(ctx, cx + off, cy - p.gap / 2 - L, cx + off, cy - p.gap / 2, "#fff", 3); line(ctx, cx, cy + p.gap / 2, cx, cy + p.gap / 2 + L, "#fff", 3);
      text(ctx, "◀ oben nach links", w * 0.25, h * 0.72, "#888", 13); text(ctx, "oben nach rechts ▶", w * 0.75, h * 0.72, "#888", 13);
      const th = scThreshold(p); text(ctx, `Durchgang ${p._sc.trials} · Versatz ${p._sc.val.toFixed(2)} px ${p._fb}`, cx, h * 0.8, "#fff", 14);
      text(ctx, th ? `Deine Nonius-Schwelle ≈ ${th.toFixed(2)} px` : "Schwelle: noch mindestens 4 Umkehrpunkte nötig …", cx, h * 0.87, th ? "#5ec8ff" : "#ccc", 14);
      scPlot(ctx, p, w * 0.3, h * 0.9, w * 0.4, h * 0.08, (v) => v.toFixed(2) + " px");
    }
  });

  addIllusion({
    id: "weber", cat: "effekte", name: "Weber-Fechner-Gesetz", short: "Wie viel mehr ist „mehr“?",
    hint: "Links der Standard, rechts der Vergleich. Stelle den Vergleich so ein, dass er gerade eben heller wirkt – bei dunklem und bei hellem Standard. Der nötige Unterschied wächst mit der Helligkeit, der relative Unterschied (Weber-Bruch) bleibt ähnlich.",
    desc: "Ernst Heinrich Weber (1834): Der eben merkliche Unterschied ist proportional zur Reizstärke. Fechner machte daraus das logarithmische Empfindungsgesetz.",
    why: "Neuronen kodieren Verhältnisse, nicht Differenzen – sinnvoll, weil Lichtstärken in der Natur über zehn Größenordnungen schwanken. Dasselbe Prinzip gilt für Gewicht, Lautstärke und sogar für Zahlen.",
    params: [{ k: "base", label: "Standard-Helligkeit", min: 10, max: 230, def: 60 }, { k: "delta", label: "Vergleich: Unterschied", min: 0, max: 60, step: 0.5, def: 8 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w, h) * 0.35, cy = h / 2; rect(ctx, 0, 0, w, h, gray(p.base * 0.6));
      rect(ctx, w * 0.3 - S / 2, cy - S / 2, S, S, gray(p.base)); rect(ctx, w * 0.7 - S / 2, cy - S / 2, S, S, gray(p.base + p.delta));
      text(ctx, "Standard", w * 0.3, cy + S / 2 + 24, "#fff", 13); text(ctx, "Vergleich", w * 0.7, cy + S / 2 + 24, "#fff", 13);
      const wb = p.delta / p.base; text(ctx, `ΔI = ${p.delta} · I = ${p.base} · Weber-Bruch ΔI/I = ${wb.toFixed(3)}`, w / 2, h - 40, "#5ec8ff", 15);
      if (reveal) badge(ctx, "Typischer Weber-Bruch für Helligkeit: etwa 0,01–0,08 (je nach Bedingungen)", w / 2, 30);
    }
  });

  addIllusion({
    id: "sehschaerfe", cat: "effekte", name: "Sehschärfe-Karte (Anstis)", short: "Alles gleich lesbar – wenn du fixierst",
    hint: "Fixiere den Punkt in der Mitte. Die Buchstaben wachsen nach außen genau so, wie die Sehschärfe abnimmt – alle wirken gleich groß und gleich lesbar. Schau auf einen äußeren Buchstaben: Jetzt ist er riesig und die inneren winzig.",
    desc: "Die Anstis-Karte (1974) macht die kortikale Vergrößerung sichtbar: Die Fovea deckt nur 1–2° ab, bekommt aber die Hälfte des Sehkortex.",
    why: "Die Zapfendichte und die kortikale Repräsentation fallen etwa linear mit der Exzentrizität. Ein Buchstabe muss proportional zu seinem Abstand vom Fixationspunkt wachsen, um gleich gut lesbar zu bleiben – etwa Faktor 1 pro 10° Exzentrizität.",
    params: [{ k: "k", label: "Vergrößerungsfaktor", min: 0.05, max: 0.3, step: 0.01, def: 0.14 }, { k: "rings", label: "Ringe", min: 3, max: 9, def: 6 }],
    anim: false,
    init(p) { p._seed = Math.floor(Math.random() * 1e6); },
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, r = rnd(p._seed), L = "ABCDEFGHKLMNPRSTUVXYZ"; let rad = 18;
      for (let k = 0; k < p.rings; k++) { const size = Math.max(6, rad * p.k * 2); const n = Math.max(6, Math.round(TAU * rad / (size * 1.6))); for (let i = 0; i < n; i++) { const a = i / n * TAU + k * 0.3; text(ctx, L[Math.floor(r() * L.length)], cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.8, reveal ? hsl(k * 50, 80, 60) : "#fff", size); } rad += size * 1.4 + 10; if (rad > Math.min(w, h) * 0.7) break; }
      circle(ctx, cx, cy, 3, "#ff3b3b");
      if (reveal) badge(ctx, "Jeder Ring liegt bei etwa gleicher kortikaler Auflösung", cx, h - 26);
    }
  });

  addIllusion({
    id: "gestalt", cat: "effekte", name: "Gestaltgesetze", short: "Wie das Gehirn gruppiert",
    hint: "Wähle ein Gesetz und spiele mit dem Regler: Nähe macht aus einem Gitter Zeilen oder Spalten, Ähnlichkeit gruppiert über die Distanz hinweg, Geschlossenheit und gute Fortsetzung erzeugen Formen, die nicht da sind.",
    desc: "Die Berliner Gestaltpsychologen (Wertheimer, Köhler, Koffka, ab 1912) beschrieben die Regeln, nach denen Einzelteile zu Ganzen werden – noch heute Grundlage von Design und Sehforschung.",
    why: "Gruppierung passiert früh und automatisch; sie reduziert die Komplexität der Szene, bevor Aufmerksamkeit ins Spiel kommt. Viele Regeln spiegeln Statistiken der natürlichen Welt: Nahe, ähnliche, kontinuierliche Dinge gehören meist tatsächlich zusammen.",
    params: [{ k: "law", label: "Gesetz", type: "select", def: "naehe", options: [["naehe", "Nähe"], ["aehnlichkeit", "Ähnlichkeit"], ["geschlossenheit", "Geschlossenheit"], ["fortsetzung", "Gute Fortsetzung"], ["schicksal", "Gemeinsames Schicksal"]] }, { k: "s", label: "Stärke", min: 0, max: 1, step: 0.01, def: 0.7 }, { k: "animate", label: "Stärke animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, s = p.animate ? 0.5 + 0.5 * Math.sin(t * 0.8) : p.s, g = Math.min(w, h) * 0.085;
      if (p.law === "naehe") { for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) circle(ctx, cx + i * g * (1 + s * 0.8), cy + j * g * (1.8 - s * 0.8), 9, "#fff"); if (reveal) badge(ctx, s > 0.5 ? "Spalten? Nein, Zeilen: der kleinere Abstand gewinnt" : "Zeilen? Nein, Spalten: der kleinere Abstand gewinnt", cx, h - 26); }
      else if (p.law === "aehnlichkeit") { for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const alt = (j % 2 + 2) % 2; const col = alt ? hsl(200, 80 * s, 60) : hsl(30, 80 * s, 60); const x = cx + i * g * 1.3, y = cy + j * g * 1.3; if (alt && s > 0.5) rect(ctx, x - 9, y - 9, 18, 18, col); else circle(ctx, x, y, 9, col); } if (reveal) badge(ctx, "Gleiche Abstände – nur Farbe/Form gruppieren in Zeilen", cx, h - 26); }
      else if (p.law === "geschlossenheit") { const R = Math.min(w, h) * 0.28, gap = (1 - s) * 0.5 + 0.05; for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU + gap, a1 = (i + 1) / 6 * TAU - gap; ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.strokeStyle = "#fff"; ctx.lineWidth = 5; ctx.stroke(); } if (reveal) { circle(ctx, cx, cy, R, null, "#5ec8ff", 1); badge(ctx, "Ein Kreis – obwohl nur Bruchstücke gezeichnet sind", cx, h - 26); } }
      else if (p.law === "fortsetzung") { const pts = (ph) => { const arr = []; for (let x = -w * 0.4; x <= w * 0.4; x += 4) arr.push([cx + x, cy + Math.sin(x / 60 + ph) * 60]); return arr; }; ctx.lineWidth = 4; [[0, "#fff"], [Math.PI, reveal ? "#ff8c1a" : "#fff"]].forEach(([ph, c]) => { const a = pts(ph); ctx.beginPath(); a.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.strokeStyle = c; ctx.stroke(); }); if (s > 0.5) { ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - w * 0.4, cy); ctx.lineTo(cx + w * 0.4, cy); ctx.stroke(); } if (reveal) badge(ctx, "Man sieht zwei glatte Wellen, nicht vier Bögen, die sich an den Kreuzungen treffen", cx, h - 26); }
      else { const r = rnd(3); for (let i = 0; i < 250; i++) { const fx = r(), fy = r(); const inn = Math.hypot(fx - 0.5, fy - 0.5) < 0.22; circle(ctx, fx * w + (inn ? Math.sin(t * 3) * 10 * s : 0), fy * h + (inn ? Math.cos(t * 2.1) * 6 * s : 0), 3, reveal && inn ? "#ff8c1a" : "#fff"); } if (reveal) badge(ctx, "Gemeinsam bewegte Punkte werden zur Figur", cx, h - 26); }
    }
  });

  addIllusion({
    id: "visuelle-suche", cat: "effekte", name: "Visuelle Suche (Pop-out vs. Konjunktion)", short: "Finde das rote O",
    hint: "Klicke so schnell du kannst auf das rote O. Bei der Merkmalssuche springt es heraus, egal wie viele Ablenker. Bei der Konjunktionssuche (rote X und grüne O als Ablenker) musst du Element für Element prüfen – die Zeit wächst mit der Anzahl (Treisman & Gelade, 1980).",
    desc: "Die Merkmalsintegrationstheorie: Einzelmerkmale werden parallel verarbeitet, Kombinationen von Merkmalen brauchen serielle Aufmerksamkeit.",
    why: "Farbe, Orientierung und Größe haben eigene Merkmalskarten im Kortex, in denen ein Ausreißer sofort auffällt. Ein Objekt, das sich nur durch die Kombination unterscheidet, existiert erst, wenn Aufmerksamkeit die Karten an einem Ort „zusammenbindet“.",
    params: [{ k: "mode", label: "Suchtyp", type: "select", def: "feature", options: [["feature", "Merkmalssuche (Ablenker: grüne X)"], ["conj", "Konjunktionssuche (rote X + grüne O)"]] }, { k: "n", label: "Elemente", min: 8, max: 60, def: 30 }],
    anim: false, noReveal: true,
    init(p) { p._items = null; p._res = []; p._t0 = 0; p._fb = ""; },
    onDown(io, p, w, h) { if (!p._items) return; const tgt = p._items.find((q) => q.t); if (Math.hypot(io.x - tgt.x * w, io.y - tgt.y * h) < 24) { const rt = performance.now() - p._t0; p._res.push(rt); p._fb = Math.round(rt) + " ms"; p._items = null; } },
    draw(ctx, p_ctx_w, h, p) {
      const w = p_ctx_w;
      if (!p._items || p._items.length !== p.n || p._mode !== p.mode) { p._mode = p.mode; const r = rnd(Math.floor(Math.random() * 1e6)); p._items = []; for (let tries = 0; tries < 5000 && p._items.length < p.n; tries++) { const x = 0.06 + r() * 0.88, y = 0.12 + r() * 0.72; if (p._items.some((q) => Math.hypot(q.x - x, q.y - y) < 0.07)) continue; const i = p._items.length; p._items.push({ x, y, t: i === 0, red: i === 0 || (p.mode === "conj" && r() < 0.5), O: i === 0 || (p.mode === "conj" && r() < 0.5) }); } if (p.mode === "conj") p._items.forEach((q, i) => { if (!q.t) { q.red = i % 2 === 0; q.O = i % 2 !== 0; } }); p._t0 = performance.now(); }
      p._items.forEach((q) => text(ctx, q.O ? "O" : "X", q.x * w, q.y * h, q.red ? "#e63946" : "#2a9d8f", 26));
      const m = p._res.length ? Math.round(p._res.reduce((a, b) => a + b, 0) / p._res.length) : 0;
      text(ctx, `Ziel: rotes O · ${p.mode === "feature" ? "Merkmalssuche" : "Konjunktionssuche"} · ${p.n} Elemente · letzte: ${p._fb} · Mittel: ${m} ms (${p._res.length})`, w / 2, h - 24, "#9a9aa6", 13);
    }
  });

  addIllusion({
    id: "kipp-nachwirkung", cat: "effekte", name: "Kipp-Nachwirkung (Tilt Aftereffect)", short: "Adaptation im Kortex",
    hint: "Fixiere das Kreuz, während das Gitter 15 s lang geneigt ist. Dann erscheint ein exakt senkrechtes Gitter – es wirkt in die Gegenrichtung gekippt (Gibson & Radner, 1937).",
    desc: "Nach Adaptation an eine Orientierung erscheint eine senkrechte Linie zur Gegenseite geneigt – ein Fenster in die Orientierungskanäle von V1.",
    why: "Orientierungsselektive Neuronen, die auf „15° rechts“ gestimmt sind, ermüden. Das senkrechte Testmuster aktiviert danach die links-gestimmten Zellen stärker als die rechts-gestimmten – die Populationsantwort kippt nach links.",
    params: [{ k: "tilt", label: "Adaptationsneigung", min: 5, max: 30, def: 15, unit: "°" }, { k: "dur", label: "Adaptationszeit", min: 8, max: 30, def: 15, unit: " s" }],
    noReveal: true, bg: "#808080",
    draw(ctx, w, h, p, t) {
      const ph = t % (p.dur + 6), adapt = ph < p.dur, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.3, ang = adapt ? p.tilt * Math.PI / 180 : 0, drift = adapt ? (t * 30) % 24 : 0;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.translate(cx, cy); ctx.rotate(ang); for (let x = -R - 24 + drift; x < R + 24; x += 24) rect(ctx, x, -R, 12, 2 * R, "#fff"); ctx.restore();
      fixation(ctx, cx, cy, "#ff3b3b"); text(ctx, adapt ? "Noch " + Math.ceil(p.dur - ph) + " s fixieren" : "Test: Dieses Gitter ist exakt senkrecht", cx, h - 24, "#fff", 14);
    }
  });
})();
