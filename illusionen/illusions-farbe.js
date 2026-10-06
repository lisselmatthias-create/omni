// Kategorie: Farbe & Licht
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  // Wellenlänge (nm) -> ungefähre RGB (Bruton)
  const wl2rgb = (l) => { let r = 0, g = 0, b = 0; if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1; const f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1; return [r * f, g * f, b * f].map((v) => Math.round(clamp(v, 0, 1) * 255)); };
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const hsl2rgb = (hh, ss, ll) => { const sN = ss / 100, lN = ll / 100, c = (1 - Math.abs(2 * lN - 1)) * sN, hp = (hh % 360) / 60, x = c * (1 - Math.abs(hp % 2 - 1)), m = lN - c / 2; let r = 0, g = 0, b = 0; if (hp < 1) [r, g, b] = [c, x, 0]; else if (hp < 2) [r, g, b] = [x, c, 0]; else if (hp < 3) [r, g, b] = [0, c, x]; else if (hp < 4) [r, g, b] = [0, x, c]; else if (hp < 5) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]; return [r + m, g + m, b + m].map((v) => Math.round(v * 255)); };

  addIllusion({
    id: "additive-mischung", cat: "farbe", name: "Additive & subtraktive Mischung", short: "Licht addiert, Farbe subtrahiert",
    hint: "Drei Scheinwerfer (Rot, Grün, Blau) ergeben überlagert Weiß – Licht addiert sich. Umschalten auf Pigmente (Cyan, Magenta, Gelb): Überlagerung ergibt Schwarz. Regle die Intensitäten.",
    desc: "Die zwei Arten der Farbmischung: Lichtquellen addieren Zapfenreize, Filter und Pigmente nehmen Anteile aus dem weißen Licht heraus.",
    why: "Unsere drei Zapfentypen (S, M, L) machen aus unendlich vielen Spektren einen dreidimensionalen Farbraum. Deshalb reichen drei Primärfarben – und deshalb können ganz verschiedene Spektren gleich aussehen (Metamerie).",
    params: [{ k: "mode", label: "Mischung", type: "select", def: "add", options: [["add", "Additiv (Licht, RGB)"], ["sub", "Subtraktiv (Pigment, CMY)"]] }, { k: "i1", label: "Intensität 1", min: 0, max: 1, step: 0.01, def: 1 }, { k: "i2", label: "Intensität 2", min: 0, max: 1, step: 0.01, def: 1 }, { k: "i3", label: "Intensität 3", min: 0, max: 1, step: 0.01, def: 1 }, { k: "animate", label: "Kreise kreisen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const add = p.mode === "add", cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.22, d = R * (p.animate ? 0.55 + 0.35 * Math.sin(t * 0.6) : 0.65);
      rect(ctx, 0, 0, w, h, add ? "#000" : "#fff"); ctx.globalCompositeOperation = add ? "lighter" : "multiply";
      const cols = add ? [[255, 0, 0], [0, 255, 0], [0, 0, 255]] : [[0, 255, 255], [255, 0, 255], [255, 255, 0]];
      [p.i1, p.i2, p.i3].forEach((it, i) => { const a = i / 3 * TAU - Math.PI / 2 + (p.animate ? t * 0.3 : 0); const c = cols[i].map((v) => add ? Math.round(v * it) : Math.round(255 - (255 - v) * it)); circle(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, R, rgb(c)); });
      ctx.globalCompositeOperation = "source-over";
      if (reveal) badge(ctx, add ? "Mitte: R+G+B = Weiß · R+G = Gelb · G+B = Cyan · R+B = Magenta" : "Mitte: C·M·Y = Schwarz · C·Y = Grün · M·Y = Rot · C·M = Blau", cx, h - 26);
    }
  });

  addIllusion({
    id: "farb-simultankontrast", cat: "farbe", name: "Farbiger Simultankontrast", short: "Grau nimmt die Gegenfarbe an",
    hint: "Alle inneren Quadrate sind dasselbe neutrale Grau. Auf Rot wirkt es grünlich, auf Blau gelblich, auf Grün rötlich. Verändere die Sättigung der Umgebung.",
    desc: "Ein neutrales Grau erscheint in der Komplementärfarbe seiner Umgebung getönt (Chevreul, 1839).",
    why: "Die Gegenfarbenkanäle (Rot–Grün, Blau–Gelb) arbeiten mit lateraler Hemmung: Starkes Rot im Umfeld hemmt das Rot-Signal in der Mitte, die Waage kippt Richtung Grün. Chevreul entdeckte das bei Beschwerden über „falsch gefärbte“ Gobelin-Garne.",
    params: [{ k: "sat", label: "Sättigung Umgebung", min: 0, max: 100, def: 80, unit: " %" }, { k: "g", label: "Grauwert", min: 80, max: 200, def: 140 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const hues = [0, 120, 230, 55], n = hues.length, cw = w / n;
      hues.forEach((hh, i) => { rect(ctx, i * cw, 0, cw + 1, h, hsl(hh, p.sat, 50)); const s = Math.min(cw, h) * 0.35; rect(ctx, i * cw + cw / 2 - s / 2, h / 2 - s / 2, s, s, gray(p.g)); });
      if (reveal) { rect(ctx, cw / 2, h / 2 - 8, w - cw, 16, gray(p.g)); badge(ctx, "Durchgehender Balken: identisches Grau " + p.g, w / 2, h / 2 + 30); }
    }
  });

  addIllusion({
    id: "helmholtz-kohlrausch", cat: "farbe", name: "Helmholtz-Kohlrausch-Effekt", short: "Bunt wirkt heller",
    hint: "Jedes farbige Feld hat dieselbe berechnete Leuchtdichte wie das graue Feld daneben. Trotzdem wirken die gesättigten Farben heller. Senke die Sättigung – der Unterschied verschwindet.",
    desc: "Bei gleicher Leuchtdichte erscheinen gesättigte Farben heller als neutrales Grau.",
    why: "Helligkeit ist nicht nur Leuchtdichte: Die Farbkanäle tragen zur wahrgenommenen Helligkeit bei. Ein Grund, warum Leuchtdichte-Messgeräte und Auge sich bei bunten Reklamen uneinig sind.",
    params: [{ k: "sat", label: "Sättigung", min: 0, max: 100, def: 100, unit: " %" }, { k: "Y", label: "Leuchtdichte", min: 0.2, max: 0.7, step: 0.01, def: 0.4 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const hues = [0, 60, 120, 200, 270, 320], n = hues.length, cw = w / n;
      const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b; const lin = (v) => Math.pow(v / 255, 2.2), enc = (v) => Math.round(Math.pow(clamp(v, 0, 1), 1 / 2.2) * 255);
      const key = p.sat + "," + p.Y;
      if (p._hkKey !== key) { p._hkKey = key; p._hk = hues.map((hh) => { let l = 50, c = [128, 128, 128]; for (let it = 0; it < 30; it++) { c = hsl2rgb(hh, p.sat, l); const Y = lum(lin(c[0]), lin(c[1]), lin(c[2])); if (Math.abs(Y - p.Y) < 0.003) break; l = clamp(l + (p.Y - Y) * 45, 2, 98); } return c; }); }
      p._hk.forEach((c, i) => { rect(ctx, i * cw, 0, cw + 1, h / 2, rgb(c)); rect(ctx, i * cw, h / 2, cw + 1, h / 2, gray(enc(p.Y))); });
      if (reveal) badge(ctx, "Oben und unten: gleiche Leuchtdichte Y = " + p.Y.toFixed(2), w / 2, h / 2);
    }
  });

  addIllusion({
    id: "chromostereopsis", cat: "farbe", name: "Chromostereopsis", short: "Rot schwebt vor Blau",
    hint: "Rote und blaue Flächen auf Schwarz liegen in derselben Ebene – für die meisten Menschen scheint Rot näher zu liegen, Blau weiter weg. Tausche die Farben oder den Hintergrund: Auf Weiß kehrt sich der Effekt oft um.",
    desc: "Farben erzeugen scheinbare Tiefe: Rot wirkt vorn, Blau hinten (oder umgekehrt, je nach Person und Hintergrund).",
    why: "Chromatische Aberration der Augenlinse: Blaues Licht wird stärker gebrochen als rotes, die Bilder beider Augen verschieben sich gegenläufig – das Gehirn liest den Versatz als Querdisparität, also als Tiefe.",
    params: [{ k: "swap", label: "Farben tauschen", type: "check", def: false }, { k: "bg", label: "Hintergrund", type: "select", def: "#000", options: [["#000", "Schwarz"], ["#fff", "Weiß"]] }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      rect(ctx, 0, 0, w, h, p.bg); const A = p.swap ? "#0033ff" : "#ff1a1a", B = p.swap ? "#ff1a1a" : "#0033ff", S = Math.min(w, h) * 0.12;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = w / 2 + (i - 1.5) * S * 2.1, y = h / 2 + (j - 1) * S * 2.1; if ((i + j) % 2) circle(ctx, x, y, S * 0.8, A); else rect(ctx, x - S * 0.7, y - S * 0.7, S * 1.4, S * 1.4, B); }
      text(ctx, "ROT", w / 2 - S * 3.3, h / 2 + S * 3.3, A, S); text(ctx, "BLAU", w / 2 + S * 3.3, h / 2 + S * 3.3, B, S);
      if (reveal) badge(ctx, "Alles in einer Ebene – die Tiefe entsteht in deiner Augenlinse", w / 2, 30);
    }
  });

  addIllusion({
    id: "farbfehlsicht", cat: "farbe", name: "Farbsehtest & Farbfehlsichtigkeit", short: "Ishihara-Tafel simuliert",
    hint: "Eine zufällig erzeugte Testtafel mit einer Ziffer. Schalte die Simulation um: So sieht die Tafel für Menschen mit Rot-Grün-Schwäche aus – die Ziffer verschwindet. Reset erzeugt eine neue Tafel.",
    desc: "Pseudoisochromatische Tafeln (Ishihara, 1917) verstecken eine Figur in Farbpunkten gleicher Helligkeit. Etwa 8 % der Männer und 0,5 % der Frauen sehen Rot und Grün ähnlich.",
    why: "Bei Protanopie oder Deuteranopie fehlt ein Zapfentyp (L oder M). Die Simulation (Machado et al., 2009) projiziert alle Farben auf die Ebene, die diese Augen noch unterscheiden können. Da die Punkte gleich hell sind, bleibt die Figur dann unsichtbar.",
    params: [{ k: "sim", label: "Simulation", type: "select", def: "none", options: [["none", "Normalsichtig"], ["protan", "Protanopie (kein L-Zapfen)"], ["deutan", "Deuteranopie (kein M-Zapfen)"], ["tritan", "Tritanopie (kein S-Zapfen)"]] }],
    anim: false, bg: "#eee",
    init(p) { p._dots = null; p._seed = Math.floor(Math.random() * 1e6); },
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44;
      if (!p._dots) {
        const r = rnd(p._seed), digit = String(Math.floor(r() * 9) + 1); p._digit = digit;
        const m = document.createElement("canvas"); m.width = m.height = 200; const mc = m.getContext("2d"); mc.fillStyle = "#000"; mc.font = "bold 170px system-ui, sans-serif"; mc.textAlign = "center"; mc.textBaseline = "middle"; mc.fillText(digit, 100, 110); const md = mc.getImageData(0, 0, 200, 200).data;
        const dots = []; for (let tries = 0; tries < 20000 && dots.length < 1100; tries++) { const a = r() * TAU, rr = Math.sqrt(r()) * 0.97; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; const rad = 0.012 + r() * 0.03; if (dots.some((d) => Math.hypot(d.x - x, d.y - y) < d.r + rad + 0.004)) continue; const mi = (Math.floor((y + 1) * 100) * 200 + Math.floor((x + 1) * 100)) * 4; const fig = md[mi + 3] > 128; dots.push({ x, y, r: rad, fig, l: r() }); }
        p._dots = dots;
      }
      const figC = [[200, 80, 60], [230, 120, 70], [190, 100, 40]], bgC = [[120, 170, 80], [160, 190, 90], [100, 150, 110]];
      const sim = { none: null, protan: [[0.152, 1.053, -0.205], [0.115, 0.786, 0.099], [-0.004, -0.048, 1.052]], deutan: [[0.367, 0.861, -0.228], [0.280, 0.673, 0.047], [-0.012, 0.043, 0.969]], tritan: [[1.256, -0.077, -0.179], [-0.078, 0.931, 0.147], [0.005, 0.691, 0.304]] }[p.sim];
      const apply = (c) => { if (!sim) return c; return sim.map((row) => clamp(Math.round(row[0] * c[0] + row[1] * c[1] + row[2] * c[2]), 0, 255)); };
      p._dots.forEach((d) => { const pal = d.fig ? figC : bgC; const c = pal[Math.floor(d.l * 3)].map((v) => clamp(Math.round(v * (0.85 + d.l * 0.3)), 0, 255)); circle(ctx, cx + d.x * R, cy + d.y * R, d.r * R, rgb(apply(c))); });
      if (reveal) { text(ctx, "Die Ziffer ist: " + p._digit, cx, h - 30, "#000", 18); }
    }
  });

  addIllusion({
    id: "peripheres-farbsehen", cat: "farbe", name: "Farbsehen im Augenwinkel", short: "Außen ist die Welt grau",
    hint: "Fixiere das Kreuz. Am Rand tauchen langsam farbige Scheiben auf. Kannst du ihre Farbe benennen, ohne hinzuschauen? Meist erst, wenn sie größer werden oder näher rücken. Auflösen zeigt die Farben.",
    desc: "In der Peripherie der Netzhaut gibt es kaum Zapfen – Farben werden dort schlecht erkannt, besonders Rot und Grün. Dass unsere Welt bunt wirkt, ist eine Konstruktion des Gehirns.",
    why: "Die Zapfendichte fällt außerhalb der Fovea steil ab, und große rezeptive Felder mitteln Farbe über weite Bereiche. Das Gehirn füllt die Peripherie mit der Farbe auf, die es beim letzten Hinschauen gesehen hat.",
    params: [{ k: "ecc", label: "Abstand vom Zentrum", min: 100, max: 500, def: 320 }, { k: "size", label: "Scheibengröße", min: 6, max: 40, def: 14 }],
    init(p) { p._seed = Math.floor(Math.random() * 1e6); },
    bg: "#777",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, r = rnd(p._seed), cols = ["#e63946", "#2a9d8f", "#4361ee", "#f4d35e", "#f77f00", "#9b5de5"], names = ["Rot", "Türkis", "Blau", "Gelb", "Orange", "Violett"];
      for (let i = 0; i < 6; i++) { const a = r() * TAU, k = Math.floor(r() * 6), ph = (t * 0.25 + i / 6) % 1, alpha = ph < 0.5 ? ph * 2 : 2 - ph * 2; const x = cx + Math.cos(a) * p.ecc, y = cy + Math.sin(a) * p.ecc * 0.6; ctx.globalAlpha = alpha; circle(ctx, x, y, p.size, cols[k]); ctx.globalAlpha = 1; if (reveal) text(ctx, names[k], x, y + p.size + 14, "#fff", 12); }
      fixation(ctx, cx, cy, "#fff");
    }
  });

  addIllusion({
    id: "purkinje", cat: "farbe", name: "Purkinje-Effekt", short: "Rot stirbt in der Dämmerung",
    hint: "Zwei Blumen, rot und blau, bei Tageslicht gleich hell. Regle das Licht herunter: Die rote Blume wird zuerst dunkel, die blaue bleibt hell – so wie abends im Garten.",
    desc: "Beim Übergang vom Tag- zum Nachtsehen verschiebt sich die Empfindlichkeit zu kürzeren Wellenlängen (Purkinje, 1825).",
    why: "Tagsüber sehen die Zapfen (Maximum bei 555 nm), nachts die Stäbchen (Maximum bei 507 nm). Stäbchen reagieren kaum auf tiefes Rot – also verblassen rote Dinge als erste, während Blau und Grün relativ heller werden.",
    params: [{ k: "light", label: "Licht (Tag → Nacht)", min: 0, max: 1, step: 0.01, def: 0 }, { k: "animate", label: "Dämmerung animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const k = p.animate ? 0.5 - 0.5 * Math.cos(t * 0.5) : p.light;
      const shade = (c) => { const scot = 0.02 * c[0] + 0.55 * c[1] + 0.43 * c[2]; const dim = 1 - k * 0.75; return rgb(c.map((v) => Math.round((v * (1 - k) + scot * k * 1.3) * dim))); };
      rect(ctx, 0, 0, w, h, shade([120, 160, 200])); rect(ctx, 0, h * 0.7, w, h * 0.3, shade([70, 130, 60]));
      const flower = (x, c) => { line(ctx, x, h * 0.75, x, h * 0.5, shade([60, 120, 50]), 6); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; circle(ctx, x + Math.cos(a) * 34, h * 0.5 + Math.sin(a) * 34, 24, shade(c)); } circle(ctx, x, h * 0.5, 18, shade([240, 200, 60])); };
      flower(w * 0.33, [220, 40, 40]); flower(w * 0.67, [60, 80, 220]);
      text(ctx, k < 0.3 ? "Tag" : k < 0.7 ? "Dämmerung" : "Nacht (Stäbchensehen)", w / 2, h - 24, "#fff", 13);
      if (reveal) badge(ctx, "Simulation: Mischung aus Zapfen- (V) und Stäbchen-Empfindlichkeit (V')", w / 2, 30);
    }
  });

  addIllusion({
    id: "zapfen", cat: "farbe", name: "Zapfen & Spektrum", short: "Drei Kurven, alle Farben",
    hint: "Bewege den Regler über das Spektrum: Die Balken zeigen, wie stark S-, M- und L-Zapfen reagieren. Vergleiche gelbes Licht (580 nm) mit Rot+Grün gemischt: Die Zapfen antworten gleich – ein Metamer. Deshalb funktioniert jeder Bildschirm.",
    desc: "Farbsehen beginnt mit nur drei Rezeptortypen. Was wir als Farbton erleben, ist das Verhältnis ihrer Antworten.",
    why: "Die Empfindlichkeitskurven überlappen stark. Jede Wellenlänge erzeugt ein Antwort-Tripel; verschiedene Spektren mit gleichem Tripel sind ununterscheidbar (Metamerie). Farbe ist also keine Eigenschaft des Lichts, sondern des Nervensystems.",
    params: [{ k: "wl", label: "Wellenlänge", min: 380, max: 700, def: 580, unit: " nm" }, { k: "metamer", label: "Vergleich: Rot (610) + Grün (540) gemischt", type: "check", def: false }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const x0 = 40, x1 = w - 40, y0 = h * 0.55, y1 = h * 0.12, wl2x = (l) => x0 + (l - 380) / 320 * (x1 - x0);
      for (let x = x0; x < x1; x += 2) rect(ctx, x, y0 + 10, 3, 30, rgb(wl2rgb(380 + (x - x0) / (x1 - x0) * 320)));
      const cones = [["S", 442, 28, "#4361ee"], ["M", 543, 45, "#2a9d8f"], ["L", 570, 50, "#e63946"]];
      const resp = (l) => cones.map(([n, mu, sig]) => Math.exp(-Math.pow((l - mu) / sig, 2) / 2));
      cones.forEach(([n, mu, sig, c]) => { ctx.beginPath(); for (let l = 380; l <= 700; l += 2) { const y = y0 - Math.exp(-Math.pow((l - mu) / sig, 2) / 2) * (y0 - y1); l === 380 ? ctx.moveTo(wl2x(l), y) : ctx.lineTo(wl2x(l), y); } ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.stroke(); text(ctx, n, wl2x(mu), y1 - 12, c, 14); });
      line(ctx, wl2x(p.wl), y1 - 4, wl2x(p.wl), y0 + 42, "#fff", 2); text(ctx, p.wl + " nm", wl2x(p.wl), y0 + 58, "#fff", 12);
      let r = resp(p.wl); if (p.metamer) { const a = resp(610), b = resp(540); r = [0, 1, 2].map((i) => (a[i] * 0.55 + b[i] * 0.45)); }
      const bx = w / 2 - 150, by = h * 0.92; cones.forEach(([n, , , c], i) => { const hh = r[i] * (h * 0.22); rect(ctx, bx + i * 70, by - hh, 44, hh, c); text(ctx, n + " " + Math.round(r[i] * 100) + "%", bx + i * 70 + 22, by + 14, "#ccc", 11); });
      circle(ctx, bx + 260, by - h * 0.11, 36, p.metamer ? "rgb(255,210,0)" : rgb(wl2rgb(p.wl))); text(ctx, p.metamer ? "Mischung R+G" : "Spektralfarbe", bx + 260, by + 14, "#ccc", 11);
      if (reveal) badge(ctx, "Gleiche Balken = gleiche Farbe, egal welches Spektrum (Metamerie)", w / 2, y0 + 85);
    }
  });

  addIllusion({
    id: "gegenfarben", cat: "farbe", name: "Gegenfarben (Hering)", short: "Rötliches Grün gibt es nicht",
    hint: "Mische Farben über die drei Gegenfarbenkanäle. Du findest bläuliches Rot und gelbliches Grün – aber nie rötliches Grün oder bläuliches Gelb. Diese Paare schließen sich im Sehsystem aus.",
    desc: "Nach den Zapfen rechnet das Sehsystem in Gegensatzpaaren: Rot–Grün, Blau–Gelb, Hell–Dunkel (Ewald Hering, 1878; Hurvich & Jameson, 1957).",
    why: "Ganglienzellen und Neuronen im Corpus geniculatum verrechnen Zapfensignale als Differenzen (L−M, S−(L+M)). Ein Kanal kann nur in eine Richtung ausschlagen, deshalb sind „rötlich-grün“ und „bläulich-gelb“ unmöglich – und deshalb gibt es genau vier Urfarben.",
    params: [{ k: "rg", label: "Grün ← → Rot", min: -1, max: 1, step: 0.01, def: 0.6 }, { k: "by", label: "Gelb ← → Blau", min: -1, max: 1, step: 0.01, def: -0.3 }, { k: "wk", label: "Dunkel ← → Hell", min: -1, max: 1, step: 0.01, def: 0 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const L = 128 + p.wk * 90; let r = L + p.rg * 110, g = L - p.rg * 110, b = L; if (p.by > 0) { b += p.by * 120; r -= p.by * 40; g -= p.by * 40; } else { r -= p.by * 80; g -= p.by * 80; b += p.by * 120; }
      const col = rgb([r, g, b].map((v) => clamp(Math.round(v), 0, 255)));
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.3; circle(ctx, cx, cy, R, col, "#333", 2);
      const names = []; if (Math.abs(p.rg) > 0.15) names.push(p.rg > 0 ? "rötlich" : "grünlich"); if (Math.abs(p.by) > 0.15) names.push(p.by > 0 ? "bläulich" : "gelblich");
      text(ctx, names.length ? names.join(" + ") : "neutral", cx, cy + R + 30, "#fff", 16);
      // Farbkreis mit den vier Urfarben
      [["Rot", 0, "#e63946"], ["Gelb", 90, "#ffd60a"], ["Grün", 180, "#2a9d8f"], ["Blau", 270, "#4361ee"]].forEach(([n, a, c]) => { const x = cx + Math.cos(a * Math.PI / 180) * (R + 70), y = cy - Math.sin(a * Math.PI / 180) * (R + 70); circle(ctx, x, y, 16, c); text(ctx, n, x, y + 30, "#aaa", 11); });
      if (reveal) badge(ctx, "Kanäle: L−M (Rot–Grün), S−(L+M) (Blau–Gelb), L+M (Hell–Dunkel)", cx, h - 26);
    }
  });

  addIllusion({
    id: "chromatische-adaptation", cat: "farbe", name: "Chromatische Adaptation", short: "Die Welt wird nachgefärbt",
    hint: "Fixiere das Kreuz, während die linke Hälfte rot und die rechte cyan getönt ist. Nach 15 s erscheint eine neutrale Szene: Links wirkt sie cyan, rechts rot – jede Hälfte deiner Netzhaut hat sich eigenständig angepasst.",
    desc: "Farbanpassung findet lokal in der Netzhaut statt. Dieselbe Szene kann gleichzeitig in zwei Farbtönen erscheinen.",
    why: "Jeder Zapfentyp regelt seine Verstärkung nach dem mittleren Licht, das er empfängt (von-Kries-Adaptation). Das ist die Basis der Farbkonstanz: Ein weißes Blatt sieht bei Glühlampen- und Tageslicht weiß aus – bis man die Anpassung so wie hier austrickst.",
    params: [{ k: "dur", label: "Adaptationszeit", min: 8, max: 30, def: 15, unit: " s" }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const ph = t % (p.dur + 10), adapt = ph < p.dur, cx = w / 2, cy = h / 2;
      // neutrale Szene
      rect(ctx, 0, 0, w, h, "#8a8a8a"); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const v = 90 + ((i * 3 + j) % 5) * 30; rect(ctx, w * (0.1 + i * 0.17), h * (0.15 + j * 0.27), w * 0.12, h * 0.18, gray(v)); }
      if (adapt) { ctx.globalAlpha = 0.55; rect(ctx, 0, 0, cx, h, "#ff2020"); rect(ctx, cx, 0, cx, h, "#20e0ff"); ctx.globalAlpha = 1; text(ctx, "Noch " + Math.ceil(p.dur - ph) + " s fixieren", cx, h - 24, "#fff", 13); }
      else text(ctx, "Neutrale Szene – sieht sie links und rechts gleich aus?", cx, h - 24, "#fff", 13);
      fixation(ctx, cx, cy, "#000");
    }
  });

  addIllusion({
    id: "stroop", cat: "farbe", name: "Stroop-Effekt (Reaktionstest)", short: "Lies nicht – nenne die Farbe!",
    hint: "Klicke so schnell wie möglich auf das Feld mit der SCHRIFTFARBE des Worts (nicht auf das, was es sagt). Nach 16 Durchgängen siehst du deine mittlere Reaktionszeit für passende und widersprüchliche Wörter.",
    desc: "Lesen ist so automatisiert, dass das Wort „GRÜN“ in roter Schrift das Benennen der Farbe messbar bremst (J. R. Stroop, 1935).",
    why: "Zwei Verarbeitungswege konkurrieren: Lesen ist schnell und unwillkürlich, Farbbenennen langsamer und kontrolliert. Bei Konflikt muss der präfrontale Kortex die Leseantwort unterdrücken – das kostet etwa 100–200 ms.",
    params: [],
    anim: false, noReveal: true,
    init(p) { p._trial = 0; p._res = { kong: [], ink: [] }; p._cur = null; p._t0 = 0; p._feedback = ""; },
    onDown(io, p, w, h) {
      if (!p._cur) return; const bw = w / 4, idx = Math.floor(io.x / bw); if (io.y < h * 0.65) return;
      const rt = performance.now() - p._t0; const ok = idx === p._cur.ink; p._feedback = ok ? `${Math.round(rt)} ms ✓` : "falsch ✗";
      if (ok) p._res[p._cur.kong ? "kong" : "ink"].push(rt); p._trial++; p._cur = null;
    },
    draw(ctx, w, h, p, t, reveal) {
      const cols = [["ROT", "#e63946"], ["GRÜN", "#2a9d8f"], ["BLAU", "#4361ee"], ["GELB", "#ffd60a"]];
      if (p._trial >= 16) { const m = (a) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0; text(ctx, "Ergebnis", w / 2, h * 0.3, "#fff", 24); text(ctx, "Passend (Wort = Farbe): " + m(p._res.kong) + " ms", w / 2, h * 0.45, "#5ec8ff", 18); text(ctx, "Widersprüchlich: " + m(p._res.ink) + " ms", w / 2, h * 0.55, "#ff8c1a", 18); text(ctx, "Stroop-Interferenz: +" + (m(p._res.ink) - m(p._res.kong)) + " ms · Reset für neuen Durchgang", w / 2, h * 0.68, "#ccc", 14); return; }
      if (!p._cur) { const word = Math.floor(Math.random() * 4); const kong = Math.random() < 0.5; const ink = kong ? word : (word + 1 + Math.floor(Math.random() * 3)) % 4; p._cur = { word, ink, kong }; p._t0 = performance.now(); }
      text(ctx, "Durchgang " + (p._trial + 1) + " / 16   " + p._feedback, w / 2, 40, "#9a9aa6", 13);
      text(ctx, cols[p._cur.word][0], w / 2, h * 0.38, cols[p._cur.ink][1], Math.min(w, h) * 0.18);
      const bw = w / 4; cols.forEach(([n, c], i) => { rect(ctx, i * bw + 10, h * 0.7, bw - 20, h * 0.22, c); });
      text(ctx, "Klicke auf die Schriftfarbe", w / 2, h * 0.64, "#ccc", 13);
    }
  });
})();
