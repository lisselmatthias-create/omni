// Kategorie: Muster & Interferenz
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "moire-explorer", cat: "muster", name: "Moiré-Explorer", short: "Zwei Raster, ein neues Muster",
    hint: "Zwei identische Raster werden gegeneinander gedreht oder skaliert. Das grobe Überlagerungsmuster ist die „Differenzfrequenz“ – der gleiche Effekt wie bei Fliegengittern, Zäunen oder Streifenhemden im Fernsehen. Probiere alle Rastertypen.",
    desc: "Moiré entsteht, wenn sich zwei periodische Strukturen mit leicht unterschiedlicher Frequenz oder Orientierung überlagern.",
    why: "Mathematisch ist Moiré eine Schwebung im Raum: Wo die Raster in Phase sind, bleibt es hell, wo sie gegenphasig sind, dunkel. Die Schwebungsfrequenz ist die Differenz der beiden Rasterfrequenzen – deshalb erzeugen kleine Unterschiede große Muster.",
    params: [{ k: "type", label: "Rastertyp", type: "select", def: "lines", options: [["lines", "Linien"], ["rings", "Ringe"], ["radial", "Strahlen"], ["dots", "Punktgitter"], ["hex", "Sechseckgitter"]] }, { k: "ang", label: "Drehung", min: 0, max: 30, step: 0.1, def: 4, unit: "°" }, { k: "scale", label: "Skalierung Raster 2", min: 0.8, max: 1.25, step: 0.005, def: 1.0 }, { k: "pitch", label: "Rasterabstand", min: 4, max: 24, def: 9 }, { k: "animate", label: "Drehung animieren", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.hypot(w, h) / 2, ang = (p.animate ? 4 + 4 * Math.sin(t * 0.3) : p.ang) * Math.PI / 180;
      const layer = (rot, sc, dx) => {
        ctx.save(); ctx.translate(cx + dx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.fillStyle = "#000"; ctx.strokeStyle = "#000"; ctx.lineWidth = p.pitch * 0.4; ctx.beginPath();
        if (p.type === "lines") for (let x = -R; x < R; x += p.pitch) { ctx.moveTo(x, -R); ctx.lineTo(x, R); }
        else if (p.type === "rings") for (let r = p.pitch; r < R; r += p.pitch) { ctx.moveTo(r, 0); ctx.arc(0, 0, r, 0, TAU); }
        else if (p.type === "radial") { const n = Math.round(360 / p.pitch * 2); for (let i = 0; i < n; i++) { const a = i / n * TAU; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); } }
        else if (p.type === "dots") { for (let x = -R; x < R; x += p.pitch) for (let y = -R; y < R; y += p.pitch) { ctx.moveTo(x + p.pitch * 0.3, y); ctx.arc(x, y, p.pitch * 0.3, 0, TAU); } }
        else { const hh = p.pitch * Math.sqrt(3) / 2; let row = 0; for (let y = -R; y < R; y += hh, row++) for (let x = -R + (row % 2 ? p.pitch / 2 : 0); x < R; x += p.pitch) { ctx.moveTo(x + p.pitch * 0.28, y); ctx.arc(x, y, p.pitch * 0.28, 0, TAU); } }
        if (p.type === "dots" || p.type === "hex") ctx.fill(); else ctx.stroke(); ctx.restore();
      };
      ctx.globalAlpha = 0.75; layer(0, 1, p.type === "rings" || p.type === "radial" ? -w * 0.06 : 0);
      if (!reveal) layer(ang, p.scale, p.type === "rings" || p.type === "radial" ? w * 0.06 : 0);
      ctx.globalAlpha = 1;
      if (reveal) badge(ctx, "Nur Raster 1 – das Moiré-Muster entsteht erst durch die Überlagerung", cx, h - 26);
    }
  });

  addIllusion({
    id: "moire-lupe", cat: "muster", name: "Moiré-Lupe", short: "Vergrößerung ohne Linse",
    hint: "Unter der Lochmaske liegt ein Raster winziger Buchstaben. Weil die Löcher einen minimal anderen Abstand haben, erscheint der Buchstabe riesig – die Moiré-Vergrößerung. Die Maske wandert langsam, das große Bild wandert um den Vergrößerungsfaktor schneller. Auflösen zeigt das Raster ohne Maske.",
    desc: "Ein Raster aus Mini-Bildern plus eine Lochmaske mit leicht abweichendem Abstand erzeugt ein stark vergrößertes Bild (Moiré-Magnifier, Hutley et al. 1994).",
    why: "Jedes Loch zeigt einen etwas anderen Ausschnitt des darunterliegenden Mini-Bildes. Nebeneinander ergeben diese Ausschnitte das Mini-Bild im Großen – Vergrößerung = Abstand / Abstandsdifferenz. So funktionieren Sicherheitsmerkmale auf Banknoten und manche 3D-Verpackungen.",
    params: [{ k: "mag", label: "Vergrößerung", min: 4, max: 16, def: 8 }, { k: "pitch", label: "Rasterabstand", min: 10, max: 24, def: 14 }, { k: "hole", label: "Lochgröße", min: 0.2, max: 0.48, step: 0.01, def: 0.38 }, { k: "animate", label: "Maske bewegen", type: "check", def: true }],
    bg: "#fff", init(p) { p._glyph = false; p._off = null; },
    draw(ctx, w, h, p, t, reveal) {
      const P = p.pitch, P2 = P * (1 + 1 / p.mag); if (p._lp !== P) { p._lp = P; p._glyph = false; }
      const g = H.offscreen(p, "lupe" + P, Math.ceil(P), Math.ceil(P)); if (!p._glyph) { const gc = g.getContext("2d"); gc.fillStyle = "#fff"; gc.fillRect(0, 0, P, P); gc.fillStyle = "#1565c0"; gc.font = "bold " + Math.round(P * 1.05) + "px system-ui, sans-serif"; gc.textAlign = "center"; gc.textBaseline = "middle"; gc.fillText("F", P / 2, P * 0.55); p._glyph = true; }
      for (let y = 0; y < h + P; y += P) for (let x = 0; x < w + P; x += P) ctx.drawImage(g, x, y);
      if (reveal) { badge(ctx, "Das Raster ohne Maske: lauter identische kleine F", w / 2, h - 26); return; }
      const dx = p.animate ? (t * 4) % P2 : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h);
      for (let y = -P2; y < h + P2; y += P2) for (let x = -P2 + dx; x < w + P2; x += P2) { ctx.moveTo(x + P * p.hole, y); ctx.arc(x, y, P * p.hole, 0, TAU); }
      ctx.fillStyle = "#222"; ctx.fill("evenodd"); ctx.restore();
    }
  });

  addIllusion({
    id: "interferenz", cat: "muster", name: "Wellen-Interferenz", short: "Zwei Quellen, Streifen aus Nichts",
    hint: "Zwei Punktquellen senden Kreiswellen aus. Wo Berg auf Berg trifft, verstärken sie sich, wo Berg auf Tal trifft, löschen sie sich aus. Umschalten auf „Intensität“ zeigt die ortsfesten Streifen des Doppelspalts.",
    desc: "Die klassische Zweiquellen-Interferenz: Das Muster aus Verstärkung und Auslöschung ist die physikalische Grundlage von Doppelspalt, Hologramm und Moiré.",
    why: "Wellen addieren sich (Superposition). Entlang der Hyperbeln, auf denen der Wegunterschied ein halbzahliges Vielfaches der Wellenlänge ist, bleibt es dauerhaft dunkel – unabhängig von der Zeit. Das Auge sieht diese Knotenlinien als ruhendes Streifenmuster.",
    params: [{ k: "lam", label: "Wellenlänge", min: 8, max: 60, def: 24 }, { k: "d", label: "Quellenabstand", min: 20, max: 300, def: 120 }, { k: "mode", label: "Darstellung", type: "select", def: "amp", options: [["amp", "Momentane Auslenkung"], ["int", "Intensität (zeitlich gemittelt)"]] }],
    draw(ctx, w, h, p, t, reveal) {
      const sc = 3, W = Math.ceil(w / sc), Hh = Math.ceil(h / sc), off = H.offscreen(p, "i", W, Hh), octx = off.getContext("2d");
      if (!p._img) p._img = octx.createImageData(W, Hh);
      const d = p._img.data, cx = W / 2, cy = Hh / 2, k = TAU / (p.lam / sc), s1 = [cx - p.d / 2 / sc, cy], s2 = [cx + p.d / 2 / sc, cy], ph = t * 4;
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const d1 = Math.hypot(x - s1[0], y - s1[1]), d2 = Math.hypot(x - s2[0], y - s2[1]);
        let v; if (p.mode === "amp") v = 0.5 + 0.25 * (Math.sin(k * d1 - ph) + Math.sin(k * d2 - ph)); else v = Math.pow(Math.abs(Math.cos(k * (d1 - d2) / 2)), 1.5);
        const i = (y * W + x) * 4, c = v * 255; d[i] = c * 0.3; d[i + 1] = c * 0.7; d[i + 2] = c; d[i + 3] = 255;
      }
      octx.putImageData(p._img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, w, h);
      circle(ctx, s1[0] * sc, s1[1] * sc, 5, "#ff3b3b"); circle(ctx, s2[0] * sc, s2[1] * sc, 5, "#ff3b3b");
      if (reveal) badge(ctx, "Dunkle Streifen = Wegunterschied von ½, 1½, 2½ … Wellenlängen", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "op-art", cat: "muster", name: "Op-Art-Wellen (Riley)", short: "Flimmern aus Linien",
    hint: "Gestauchte Wellenlinien nach Art von Bridget Rileys „Fall“ (1963). Das Bild ist statisch, flimmert aber und scheint zu fließen. Verändere die Stauchung.",
    desc: "Dicht gepackte, phasenverschobene Wellenlinien erzeugen Flimmern, Scheinbewegung und sogar Farbschlieren.",
    why: "Die Linien überfordern das Sehsystem mit hohen Ortsfrequenzen bei hohem Kontrast. Winzige Augenbewegungen erzeugen starke Reizänderungen, Nachbilder überlagern sich – das Bild „lebt“. Die Op-Art nutzte diese Effekte gezielt als Kunstform.",
    params: [{ k: "n", label: "Linien", min: 20, max: 80, def: 48 }, { k: "squeeze", label: "Stauchung", min: 0, max: 1, step: 0.01, def: 0.6 }, { k: "animate", label: "Langsam fließen", type: "check", def: false }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      ctx.strokeStyle = "#000"; ctx.lineWidth = 2.5; const ph = p.animate ? t * 0.3 : 0;
      for (let i = 0; i < p.n; i++) {
        const u = i / (p.n - 1), y0 = h * (0.05 + 0.9 * Math.pow(u, 1 + p.squeeze * 1.5)); const amp = 10 + 20 * (1 - u);
        ctx.beginPath(); for (let x = 0; x <= w; x += 3) { const y = y0 + Math.sin(x / 55 + u * 6 + ph) * amp * (0.4 + 0.6 * Math.pow(u, 2)); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      }
      if (reveal) badge(ctx, "Alles statisch – das Flimmern entsteht erst im Auge", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "mackay", cat: "muster", name: "MacKay-Strahlen", short: "Flimmern im Zentrum, Ringe im Nachbild",
    hint: "Schau einige Sekunden ins Zentrum des Strahlenkranzes: Es flimmert und wabert. Dann wechselt die Anzeige auf Grau – im Nachbild erscheinen konzentrische Ringe, senkrecht zu den Strahlen (MacKay, 1957).",
    desc: "Ein dichtes Strahlenmuster erzeugt Scheinbewegung im Zentrum und ein Nachbild aus Ringen – der Beweis, dass das Gehirn Orientierungen adaptiert.",
    why: "Orientierungsselektive Neuronen in V1 ermüden an den Strahlen. Danach überwiegt die Antwort der orthogonal gestimmten Zellen: Ringe. Das Flimmern kommt von Mikrosakkaden, die das feine Muster über die Netzhaut schieben.",
    params: [{ k: "n", label: "Strahlen", min: 40, max: 200, def: 100 }, { k: "dur", label: "Betrachtungszeit", min: 5, max: 30, def: 12, unit: " s" }],
    noReveal: true, bg: "#fff",
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, R = Math.hypot(w, h), ph = t % (p.dur + 6), show = ph < p.dur;
      if (show) { for (let i = 0; i < p.n; i++) { const a0 = i / p.n * TAU, a1 = (i + 0.5) / p.n * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); } badge(ctx, "Noch " + Math.ceil(p.dur - ph) + " s ins Zentrum schauen", cx, h - 24); }
      else { rect(ctx, 0, 0, w, h, "#9a9a9a"); text(ctx, "Siehst du Ringe im Nachbild?", cx, h - 24, "#222", 13); }
      fixation(ctx, cx, cy, show ? "#ff3b3b" : "#222");
    }
  });

  addIllusion({
    id: "reaktion-diffusion", cat: "muster", name: "Reaktions-Diffusion (Turing-Muster)", short: "Wie Zebrastreifen entstehen",
    hint: "Zwei Chemikalien reagieren und diffundieren – nach Alan Turings Modell (1952). Aus homogenem Grau entstehen Flecken, Streifen oder Labyrinthe. Male mit der Maus hinein, um neue Keime zu setzen. Preset wechseln → Reset.",
    desc: "Das Gray-Scott-Modell: Ein simples Regelwerk aus Reaktion und Diffusion erzeugt die Muster von Fellen, Fischen, Korallen und Fingerabdrücken.",
    why: "Ein Aktivator, der sich selbst verstärkt, und ein schneller diffundierender Inhibitor reichen aus, damit sich ein gleichförmiger Zustand spontan in regelmäßige Muster aufspaltet – eine Symmetriebrechung, die die Natur unzählige Male nutzt.",
    params: [{ k: "preset", label: "Muster", type: "select", def: "spots", options: [["spots", "Flecken (Leopard)"], ["stripes", "Streifen (Zebra)"], ["maze", "Labyrinth (Koralle)"], ["worms", "Würmer"]] }, { k: "steps", label: "Tempo (Schritte/Bild)", min: 1, max: 30, def: 15 }],
    init(p) { p._U = null; },
    draw(ctx, w, h, p, t, reveal, io) {
      const N = 110, pre = { spots: [0.035, 0.065], stripes: [0.046, 0.063], maze: [0.029, 0.057], worms: [0.058, 0.065] }[p.preset];
      if (!p._U || p._preset !== p.preset) { p._preset = p.preset; const r = rnd(9); p._U = new Float32Array(N * N).fill(1); p._V = new Float32Array(N * N); p._U2 = new Float32Array(N * N); p._V2 = new Float32Array(N * N); for (let k = 0; k < 14; k++) { const x0 = Math.floor(r() * N), y0 = Math.floor(r() * N); for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const i = ((y0 + y + N) % N) * N + (x0 + x + N) % N; p._U[i] = 0.5; p._V[i] = 0.25; } } }
      const U = p._U, V = p._V, U2 = p._U2, V2 = p._V2, f = pre[0], k = pre[1], Du = 0.21, Dv = 0.105;
      if (io.down && io.inside) { const x0 = Math.floor(io.x / w * N), y0 = Math.floor(io.y / h * N); for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const i = ((y0 + y + N) % N) * N + (x0 + x + N) % N; U[i] = 0.5; V[i] = 0.25; } }
      for (let s = 0; s < p.steps; s++) {
        for (let y = 0; y < N; y++) { const yu = ((y + N - 1) % N) * N, yd = ((y + 1) % N) * N, yc = y * N; for (let x = 0; x < N; x++) {
          const i = yc + x, xl = (x + N - 1) % N, xr = (x + 1) % N;
          const lu = 0.2 * (U[yc + xl] + U[yc + xr] + U[yu + x] + U[yd + x]) + 0.05 * (U[yu + xl] + U[yu + xr] + U[yd + xl] + U[yd + xr]) - U[i];
          const lv = 0.2 * (V[yc + xl] + V[yc + xr] + V[yu + x] + V[yd + x]) + 0.05 * (V[yu + xl] + V[yu + xr] + V[yd + xl] + V[yd + xr]) - V[i];
          const uvv = U[i] * V[i] * V[i]; U2[i] = U[i] + (Du * lu - uvv + f * (1 - U[i])); V2[i] = V[i] + (Dv * lv + uvv - (f + k) * V[i]);
        } }
        U.set(U2); V.set(V2);
      }
      const off = H.offscreen(p, "rd", N, N), octx = off.getContext("2d"); if (!p._img) p._img = octx.createImageData(N, N);
      const d = p._img.data; for (let i = 0; i < N * N; i++) { const v = clamp(V[i] * 2.5, 0, 1); d[i * 4] = 20 + v * 230; d[i * 4 + 1] = 30 + v * 150; d[i * 4 + 2] = 60 + (1 - v) * 120; d[i * 4 + 3] = 255; }
      octx.putImageData(p._img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, w, h);
      if (reveal) badge(ctx, `Gray-Scott: F = ${f}, k = ${k} – nur zwei Zahlen bestimmen das Muster`, w / 2, h - 26);
    }
  });

  addIllusion({
    id: "phyllotaxis", cat: "muster", name: "Phyllotaxis (Sonnenblumenspirale)", short: "Der goldene Winkel",
    hint: "Jeder neue Punkt wird um denselben Winkel weitergedreht. Nur beim goldenen Winkel (137,508°) füllen die Punkte die Fläche gleichmäßig – und das Auge sieht Spiralen in Fibonacci-Zahlen. Weiche minimal ab: Die Spiralen „kippen“.",
    desc: "Blattstellung, Sonnenblumenkerne und Tannenzapfen folgen dem goldenen Winkel. Unser Mustersehen findet darin sofort Spiralfamilien (Parastichien).",
    why: "Der goldene Winkel ist die „irrationalste“ Drehung – kein Vielfaches davon kommt einem vollen Umlauf nahe, deshalb überlappen sich Punkte nie. Das Sehsystem gruppiert die nächsten Nachbarn zu Linien, und die liegen hier auf logarithmischen Spiralen.",
    params: [{ k: "ang", label: "Divergenzwinkel", min: 130, max: 145, step: 0.01, def: 137.508, unit: "°" }, { k: "n", label: "Punkte", min: 100, max: 1500, def: 700 }, { k: "animate", label: "Winkel langsam variieren", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, ang = (p.animate ? 137.508 + Math.sin(t * 0.2) * 1.5 : p.ang) * Math.PI / 180, c = Math.min(w, h) * 0.46 / Math.sqrt(p.n);
      for (let i = 0; i < p.n; i++) { const r = c * Math.sqrt(i), a = i * ang; circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(1.5, c * 0.38), reveal ? hsl((i % 21) * 360 / 21, 80, 60) : hsl(40 + i / p.n * 30, 90, 55)); }
      text(ctx, (p.animate ? (137.508 + Math.sin(t * 0.2) * 1.5).toFixed(2) : p.ang.toFixed(3)) + "°", cx, h - 24, "#9a9aa6", 13);
      if (reveal) badge(ctx, "Farbe = Index mod 21: eine Fibonacci-Spiralfamilie wird sichtbar", cx, 30);
    }
  });

  addIllusion({
    id: "symmetrie", cat: "muster", name: "Symmetrie-Erkennung", short: "Spiegelbilder springen ins Auge",
    hint: "Zufallspunkte, von denen ein Teil an einer Achse gespiegelt ist. Schon bei 30–40 % Symmetrie erkennst du die Achse sofort. Drehe die Achse – senkrecht wird Symmetrie am besten erkannt.",
    desc: "Spiegelsymmetrie wird vom Sehsystem extrem schnell und automatisch entdeckt – ein Hinweis auf spezialisierte Verarbeitung (Barlow & Reeves, 1979).",
    why: "Symmetrie verrät Lebewesen (Gesichter, Körper) und Objektachsen. Areale wie LOC und V4 reagieren stärker auf symmetrische Muster, besonders bei vertikaler Achse – vermutlich, weil Gesichter und Körper so orientiert sind.",
    params: [{ k: "sym", label: "Symmetrie-Anteil", min: 0, max: 100, def: 50, unit: " %" }, { k: "axis", label: "Achsenwinkel", min: 0, max: 180, def: 90, unit: "°" }, { k: "animate", label: "Achse rotieren", type: "check", def: false }],
    init(p) { p._pts = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._pts) { const r = rnd(21); p._pts = Array.from({ length: 300 }, () => [r() * 2 - 1, r() * 2 - 1, r()]); }
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.45, a = (p.animate ? t * 20 : p.axis) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a);
      p._pts.forEach(([x, y, q]) => { if (Math.hypot(x, y) > 1) return; const sym = q < p.sym / 100; const d = x * ux + y * uy; const px = x - d * ux, py = y - d * uy; // Komponente senkrecht zur Achse
        const mx = x - 2 * px, my = y - 2 * py; // gespiegelt
        circle(ctx, cx + x * R, cy + y * R, 3, "#fff"); if (sym) circle(ctx, cx + mx * R, cy + my * R, 3, reveal ? "#ff8c1a" : "#fff"); else { const rr = (q * 977) % 1; circle(ctx, cx + Math.cos(rr * TAU) * Math.sqrt(q) * R, cy + Math.sin(rr * TAU) * Math.sqrt(q) * R, 3, "#fff"); } });
      if (reveal) { line(ctx, cx - ux * R, cy - uy * R, cx + ux * R, cy + uy * R, "#5ec8ff", 1.5); badge(ctx, "Orange = gespiegelte Partner, blau = Achse", cx, h - 26); }
    }
  });

  addIllusion({
    id: "textur", cat: "muster", name: "Textur-Segregation (Julesz)", short: "Welche Region springt heraus?",
    hint: "Drei Regionen aus L-, T- und schräg gestellten L-Formen. Die gedrehten L trennen sich sofort vom Hintergrund, die T nicht – obwohl T und L sich klar unterscheiden. Auflösen zeigt die Grenzen.",
    desc: "Texturen trennen sich mühelos, wenn sie sich in elementaren Merkmalen (Textons wie Orientierung) unterscheiden, nicht aber bei gleicher Merkmalsstatistik (Béla Julesz, 1981).",
    why: "Frühe Sehareale verarbeiten Orientierung, Größe und Farbe parallel. T und L bestehen aus denselben Strichen in denselben Orientierungen – der Unterschied liegt nur in der Anordnung, und die muss mit Aufmerksamkeit Element für Element geprüft werden.",
    params: [{ k: "size", label: "Elementgröße", min: 10, max: 30, def: 16 }, { k: "jitter", label: "Zufallsdrehung", min: 0, max: 30, def: 10, unit: "°" }],
    anim: false, bg: "#fff",
    init(p) { p._r = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._r) { const r = rnd(5); p._r = Array.from({ length: 4000 }, () => r()); }
      const S = p.size, g = S * 1.6, cols = Math.floor(w / g), rows = Math.floor(h / g), ox = (w - cols * g) / 2, oy = (h - rows * g) / 2; let k = 0;
      ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.lineCap = "round";
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = ox + c * g + g / 2, y = oy + r * g + g / 2, inT = c < cols * 0.42 && r > rows * 0.25 && r < rows * 0.75, inTilt = c > cols * 0.58 && r > rows * 0.25 && r < rows * 0.75;
        const jit = (p._r[k++ % 4000] - 0.5) * p.jitter * Math.PI / 180 + (inTilt ? Math.PI / 4 : 0) + Math.floor(p._r[k++ % 4000] * 4) * Math.PI / 2;
        ctx.save(); ctx.translate(x, y); ctx.rotate(jit); ctx.beginPath();
        if (inT) { ctx.moveTo(-S / 2, -S / 2); ctx.lineTo(S / 2, -S / 2); ctx.moveTo(0, -S / 2); ctx.lineTo(0, S / 2); } else { ctx.moveTo(-S / 2, -S / 2); ctx.lineTo(-S / 2, S / 2); ctx.lineTo(S / 2, S / 2); }
        ctx.stroke(); ctx.restore();
      }
      if (reveal) { ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 2; ctx.strokeRect(ox, oy + Math.ceil(rows * 0.25) * g, Math.ceil(cols * 0.42) * g, (Math.floor(rows * 0.75) - Math.ceil(rows * 0.25)) * g); ctx.strokeRect(ox + Math.ceil(cols * 0.58) * g, oy + Math.ceil(rows * 0.25) * g, (cols - Math.ceil(cols * 0.58)) * g, (Math.floor(rows * 0.75) - Math.ceil(rows * 0.25)) * g); badge(ctx, "Links: T-Formen (schwer) · Rechts: gedrehte L (leicht)", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "campbell-robson", cat: "muster", name: "Kontrastempfindlichkeit (Campbell-Robson)", short: "Deine eigene Messkurve",
    hint: "Von links nach rechts steigt die Ortsfrequenz, von unten nach oben sinkt der Kontrast. Die Grenze, ab der du keine Streifen mehr siehst, ist deine Kontrastempfindlichkeitsfunktion – ein umgekehrtes U. Verändere den Abstand zum Bildschirm: Die Kurve wandert.",
    desc: "Das Campbell-Robson-Diagramm (1968) zeigt, dass wir mittlere Ortsfrequenzen am besten sehen und sowohl sehr feine als auch sehr grobe Muster schlechter.",
    why: "Das Sehsystem besteht aus mehreren Ortsfrequenz-Kanälen. Hohe Frequenzen begrenzen die Optik und die Rezeptordichte, niedrige werden durch laterale Hemmung (Zentrum-Umfeld-Organisation) unterdrückt.",
    params: [{ k: "fmax", label: "Max. Ortsfrequenz", min: 20, max: 120, def: 60 }, { k: "gamma", label: "Kontrast-Kurve", min: 1, max: 5, step: 0.1, def: 3 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const sc = 1, W = Math.floor(w), Hh = Math.floor(h), key = [W, Hh, p.fmax, p.gamma].join(",");
      const off = H.offscreen(p, key, W, Hh), octx = off.getContext("2d");
      if (!p._img) { p._img = octx.createImageData(W, Hh); const d = p._img.data; let phase = 0; const freqs = new Float32Array(W); for (let x = 0; x < W; x++) { const f = 0.5 * Math.pow(p.fmax, x / W); phase += f * TAU / W; freqs[x] = phase; }
        for (let y = 0; y < Hh; y++) { const c = Math.pow(1 - y / Hh, p.gamma); for (let x = 0; x < W; x++) { const v = 128 + 127 * c * Math.sin(freqs[x]); const i = (y * W + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } } octx.putImageData(p._img, 0, 0); }
      ctx.drawImage(off, 0, 0, w, h);
      text(ctx, "Ortsfrequenz →", w / 2, h - 16, "#000", 12); ctx.save(); ctx.translate(16, h / 2); ctx.rotate(-Math.PI / 2); text(ctx, "Kontrast →", 0, 0, "#000", 12); ctx.restore();
      if (reveal) { ctx.beginPath(); for (let x = 0; x <= w; x += 4) { const u = x / w, s = Math.exp(-Math.pow((u - 0.45) / 0.28, 2)) * 0.85; const y = h * (1 - s) * 0.95 + 10; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 3; ctx.stroke(); badge(ctx, "Typische Empfindlichkeitskurve (schematisch) – darüber sieht man nichts mehr", w / 2, 30); }
    }
  });
})();
