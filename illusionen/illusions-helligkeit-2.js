// Kategorie: Helligkeit & Farbe – Teil 2
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "koffka", cat: "helligkeit", name: "Koffka-Ring", short: "Ein Ring, der sich spaltet",
    hint: "Der graue Ring ist überall gleich hell. Solange er geschlossen ist, wirkt er einheitlich. Trenne die Hälften – plötzlich sind sie verschieden hell.",
    desc: "Ein gleichmäßig grauer Ring über einem hell-dunklen Hintergrund wirkt einheitlich. Verschiebt man die Hälften, erscheinen sie unterschiedlich hell.",
    why: "Das Sehsystem beurteilt Helligkeit pro „Objekt“: Als geschlossener Ring wird er als ein Ding mit einer Farbe gesehen. Getrennt gehört jede Hälfte zu ihrem Hintergrund – und der Simultankontrast schlägt zu.",
    params: [{ k: "split", label: "Trennung", min: 0, max: 60, def: 0 }, { k: "animate", label: "Auf- und zuschieben", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.26, r = R * 0.6, sp = p.animate ? 30 * (0.5 - 0.5 * Math.cos(t * 0.8)) : p.split;
      rect(ctx, 0, 0, w / 2, h, gray(60)); rect(ctx, w / 2, 0, w / 2, h, gray(200));
      const half = (side) => { ctx.save(); ctx.beginPath(); ctx.rect(side < 0 ? 0 : cx, 0, w / 2, h); ctx.clip(); ctx.translate(side * sp, side * sp * 0.6); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.arc(cx, cy, r, 0, TAU, true); ctx.fillStyle = gray(130); ctx.fill("evenodd"); ctx.restore(); };
      half(-1); half(1);
      if (reveal) { rect(ctx, cx - R, cy + R + 30, 2 * R, 16, gray(130)); badge(ctx, "Beide Hälften: Grauwert 130", cx, cy + R + 60); }
    }
  });

  addIllusion({
    id: "bezold", cat: "helligkeit", name: "Bezold-Effekt", short: "Dieselbe Farbe, hell und dunkel",
    hint: "Das Rot ist links und rechts identisch. Mit weißen Zwischenlinien wirkt es hell und blass, mit schwarzen satt und dunkel.",
    desc: "Eine Farbe ändert ihren Eindruck je nachdem, ob sie mit weißen oder schwarzen Linien durchzogen ist.",
    why: "Farbassimilation: Feine Linien verschmelzen wahrnehmungsmäßig mit der Nachbarfarbe. Anders als beim Simultankontrast gleicht sich die Farbe dabei der Umgebung an, statt sich abzuheben.",
    params: [{ k: "n", label: "Linien", min: 6, max: 40, def: 18 }, { k: "hue", label: "Farbton", min: 0, max: 360, def: 0 }, { k: "animate", label: "Linien laufen", type: "check", def: true }],
    bg: "#777",
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w * 0.42, h * 0.6), cy = h / 2, col = hsl(p.hue, 80, 50), sh = S / p.n, off = p.animate ? (t * 20) % sh : 0;
      [[w * 0.27, "#fff"], [w * 0.73, "#000"]].forEach(([cx, lc]) => {
        rect(ctx, cx - S / 2, cy - S / 2, S, S, col);
        if (!reveal) { ctx.save(); ctx.beginPath(); ctx.rect(cx - S / 2, cy - S / 2, S, S); ctx.clip(); for (let y = cy - S / 2 - sh + off; y < cy + S / 2; y += sh) rect(ctx, cx - S / 2, y, S, sh * 0.5, lc); ctx.restore(); }
      });
      if (reveal) badge(ctx, "Ohne Linien: beide Flächen " + col, w / 2, h - 26);
    }
  });

  addIllusion({
    id: "chubb", cat: "helligkeit", name: "Chubb-Täuschung", short: "Kontrast im Kontext",
    hint: "Beide inneren Rauschflecken sind identisch. Im kontrastreichen Umfeld wirkt der Fleck flau, auf grauem Grund kräftig.",
    desc: "Ein Texturfleck mit mittlerem Kontrast erscheint kontrastärmer, wenn er von einer kontrastreichen Textur umgeben ist (Chubb, Sperling & Solomon, 1989).",
    why: "Kontrast-Normalisierung: Neuronen skalieren ihre Antwort relativ zur Kontrastenergie der Umgebung. Ein starkes Umfeld dämpft die Antwort auf die Mitte.",
    params: [{ k: "c", label: "Kontrast Mitte", min: 0.1, max: 0.6, step: 0.01, def: 0.3 }, { k: "animate", label: "Umfeld blinken", type: "check", def: false }],
    init(p) { p._noise = null; },
    bg: "#808080",
    draw(ctx, w, h, p, t, reveal) {
      const N = 48; if (!p._noise) { const r = rnd(7); p._noise = Array.from({ length: N * N }, () => r() < 0.5 ? -1 : 1); }
      const S = Math.min(w * 0.42, h * 0.7), cell = S / N, cy = h / 2, rr = N / 4;
      [[w * 0.27, 1], [w * 0.73, 0]].forEach(([cx, strong]) => {
        const surroundC = strong ? (p.animate && Math.floor(t * 2) % 2 ? 0 : 1) : 0;
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const inside = Math.hypot(i - N / 2 + 0.5, j - N / 2 + 0.5) < rr;
          const c = inside ? p.c : surroundC; const v = 128 + p._noise[i * N + j] * c * 127;
          rect(ctx, Math.floor(cx - S / 2 + i * cell), Math.floor(cy - S / 2 + j * cell), Math.ceil(cell) + 1, Math.ceil(cell) + 1, gray(v));
        }
        if (reveal) circle(ctx, cx, cy, rr * cell, null, "#5ec8ff", 2);
      });
      if (reveal) badge(ctx, "Beide Mittelflecken: identisches Rauschen, Kontrast " + p.c.toFixed(2), w / 2, h - 26);
    }
  });

  addIllusion({
    id: "vasarely", cat: "helligkeit", name: "Vasarely-Pyramide", short: "Leuchtende Diagonalen aus dem Nichts",
    hint: "Verschachtelte Quadrate mit stufenweise steigender Helligkeit. Entlang der Diagonalen erscheinen helle Strahlen – sie existieren nicht.",
    desc: "Konzentrische Quadrate mit stufig zunehmender Helligkeit erzeugen leuchtende, illusorische Diagonalen (Victor Vasarely).",
    why: "An den Ecken treffen zwei Helligkeitsstufen auf einmal: Zellen mit Zentrum-Umfeld-Organisation bekommen dort doppelt so viel Kontrast wie an den Kanten – der Mach-Band-Effekt verstärkt sich an den Ecken.",
    params: [{ k: "n", label: "Stufen", min: 4, max: 24, def: 12 }, { k: "invert", label: "Innen dunkel", type: "check", def: false }, { k: "animate", label: "Helligkeit pulsieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w, h) * 0.85, cx = w / 2, cy = h / 2, k = p.animate ? 0.5 + 0.5 * Math.sin(t) : 1;
      for (let i = 0; i < p.n; i++) { const f = i / (p.n - 1), s = S * (1 - f * 0.96); let v = 30 + 210 * f * k; if (p.invert) v = 240 - 210 * f * k; rect(ctx, cx - s / 2, cy - s / 2, s, s, gray(v)); }
      if (reveal) { ctx.save(); ctx.setLineDash([4, 6]); line(ctx, cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2, "#ff3b3b", 1); line(ctx, cx + S / 2, cy - S / 2, cx - S / 2, cy + S / 2, "#ff3b3b", 1); ctx.restore(); badge(ctx, "Entlang der Diagonalen: nur die Quadratecken, kein Strahl", cx, h - 26); }
    }
  });

  addIllusion({
    id: "konfetti", cat: "helligkeit", name: "Konfetti-Täuschung", short: "Alle Kugeln haben dieselbe Farbe",
    hint: "Jede Kugel hat exakt denselben Beige-Ton. Die farbigen Streifen davor lassen sie grün, rot, blau oder gelb erscheinen (David Novick).",
    desc: "Zwölf identische beigefarbene Kugeln wirken durch dünne farbige Linien, die sie kreuzen, in vier verschiedenen Farben.",
    why: "Farbassimilation in kleinem Maßstab: Das Sehsystem mittelt Farbe über kleine Bereiche. Die Streifen „färben“ die Kugel in ihrer Farbe ein, weil sie als zur Kugel gehörig verrechnet werden.",
    params: [{ k: "lw", label: "Linienbreite", min: 1, max: 8, def: 3 }, { k: "gap", label: "Linienabstand", min: 6, max: 24, def: 11 }, { k: "animate", label: "Linien laufen", type: "check", def: true }],
    bg: "#f3e9d2",
    init(p) { p._pos = null; },
    draw(ctx, w, h, p, t, reveal) {
      const cols = ["#2bb24c", "#e0245e", "#1f77d0", "#f2c600"], R = Math.min(w, h) * 0.072;
      if (!p._pos) { const r = rnd(11); p._pos = Array.from({ length: 12 }, (_, i) => [0.12 + 0.76 * ((i % 4) + 0.5) / 4 + (r() - 0.5) * 0.03, 0.15 + 0.7 * (Math.floor(i / 4) + 0.5) / 3 + (r() - 0.5) * 0.05, (i + Math.floor(i / 4)) % 4]); }
      const spheres = p._pos.map(([fx, fy, c]) => [fx * w, fy * h, c]);
      spheres.forEach(([x, y]) => { const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R); g.addColorStop(0, "#e6d4b0"); g.addColorStop(1, "#c9b48a"); circle(ctx, x, y, R, g); });
      if (!reveal) {
        const off = p.animate ? (t * 15) % (p.gap * 4) : 0;
        for (let y = -p.gap * 4 + off; y < h; y += p.gap) { const k = Math.round(y / p.gap) % 4; rect(ctx, 0, y, w, p.lw, cols[(k + 4) % 4]); }
        spheres.forEach(([x, y, c]) => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip(); for (let yy = -p.gap * 4 + off; yy < h; yy += p.gap) { const k = (Math.round(yy / p.gap) % 4 + 4) % 4; rect(ctx, 0, yy, w, p.lw, k === c ? cols[c] : "rgba(0,0,0,0)"); if (k !== c) { /* nur die eigene Farbe liegt über der Kugel */ } } ctx.restore(); });
        // Streifen anderer Farben über den Kugeln abdecken
        spheres.forEach(([x, y, c]) => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip(); for (let yy = -p.gap * 4 + off; yy < h; yy += p.gap) { const k = (Math.round(yy / p.gap) % 4 + 4) % 4; if (k !== c) { const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R); g.addColorStop(0, "#e6d4b0"); g.addColorStop(1, "#c9b48a"); ctx.fillStyle = g; ctx.fillRect(0, yy, w, p.lw); } } ctx.restore(); });
      } else badge(ctx, "Ohne Streifen: alle Kugeln identisch beige", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "farbgitter", cat: "helligkeit", name: "Farbgitter-Täuschung", short: "Ein Graubild wird bunt",
    hint: "Die Landschaft ist komplett in Graustufen gezeichnet. Nur das dünne Gitter ist farbig – trotzdem wirkt das ganze Bild koloriert (Øyvind Kolås, 2019).",
    desc: "Ein Schwarz-Weiß-Bild mit einem feinen, farbigen Liniengitter erscheint vollständig in Farbe.",
    why: "Farbe wird vom Sehsystem räumlich sehr grob verarbeitet. Die spärlichen Farbhinweise des Gitters werden über die graue Fläche „verschmiert“ – das Gehirn füllt die Farbe auf.",
    params: [{ k: "gap", label: "Gitterabstand", min: 6, max: 40, def: 14 }, { k: "lw", label: "Linienbreite", min: 1, max: 6, def: 2 }, { k: "sat", label: "Sättigung", min: 0, max: 100, def: 100, unit: "%" }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      // Szene: Farbfunktion f(x,y) -> [h,s,l]
      const scene = (x, y) => { const u = x / w, v = y / h; if (v > 0.62 + 0.05 * Math.sin(u * 9)) return [100, 60, 32]; if (v > 0.52 + 0.08 * Math.sin(u * 5 + 1)) return [85, 55, 42]; if (Math.hypot(u - 0.75, (v - 0.22) * 1.4) < 0.09) return [48, 100, 60]; return [210, 80, 40 + 35 * v]; };
      const lum = ([hh, s, l]) => { // grobe Luminanz aus HSL
        const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100, hp = hh / 60, x = c * (1 - Math.abs(hp % 2 - 1)); let r = 0, g = 0, b = 0; if (hp < 1) [r, g, b] = [c, x, 0]; else if (hp < 2) [r, g, b] = [x, c, 0]; else if (hp < 3) [r, g, b] = [0, c, x]; else if (hp < 4) [r, g, b] = [0, x, c]; else if (hp < 5) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]; const m = l / 100 - c / 2; return Math.round(255 * (0.3 * (r + m) + 0.59 * (g + m) + 0.11 * (b + m))); };
      const cell = 6;
      for (let y = 0; y < h; y += cell) for (let x = 0; x < w; x += cell) rect(ctx, x, y, cell + 0.5, cell + 0.5, gray(lum(scene(x, y))));
      if (!reveal) {
        for (let x = 0; x < w; x += p.gap) for (let y = 0; y < h; y += p.gap) { const [hh, s, l] = scene(x + p.gap / 2, y + p.gap / 2); rect(ctx, x, 0, p.lw, h, hsl(hh, s * p.sat / 100, l)); }
        for (let y = 0; y < h; y += p.gap) for (let x = 0; x < w; x += p.gap) { const [hh, s, l] = scene(x + p.gap / 2, y + p.gap / 2); rect(ctx, x, y, p.gap, p.lw, hsl(hh, s * p.sat / 100, l)); }
      } else badge(ctx, "Ohne Gitter: reines Graustufenbild", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "lotto-wuerfel", cat: "helligkeit", name: "Lotto-Würfel", short: "Grau wird blau und gelb",
    hint: "Die markierten Kacheln auf der oberen (gelb beleuchteten) und der linken (blau beleuchteten) Fläche haben exakt denselben Grauwert. Oben wirken sie blau, links gelb.",
    desc: "Ein Würfel unter gelbem und blauem Licht: Kacheln mit identischem Grau erscheinen auf der einen Seite blau, auf der anderen gelb (Beau Lotto).",
    why: "Farbkonstanz: Das Gehirn zieht die geschätzte Beleuchtungsfarbe ab. Ein neutrales Grau unter gelbem Licht „müsste“ eigentlich bläulich sein, um so neutral zu erscheinen – also sehen wir es blau.",
    params: [{ k: "g", label: "Grauwert", min: 90, max: 170, def: 128 }, { k: "filt", label: "Lichtstärke", min: 0, max: 0.7, step: 0.01, def: 0.45 }],
    anim: false, bg: "#1a1a1a",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.3, r = rnd(5);
      const base = ["#e63946", "#2a9d8f", "#f4a261", "#8338ec", "#3a86ff", "#ffbe0b", "#06d6a0", "#ef476f"];
      const mix = (hex, tint, k) => { const c = parseInt(hex.slice(1), 16), rr = c >> 16, gg = (c >> 8) & 255, bb = c & 255; return `rgb(${Math.round(rr + (tint[0] - rr) * k)},${Math.round(gg + (tint[1] - gg) * k)},${Math.round(bb + (tint[2] - bb) * k)})`; };
      const yellow = [255, 220, 60], blue = [50, 90, 255];
      const faces = [
        { tint: yellow, pts: (i, j) => [cx + (j - i) * 0.866 * S / 3, cy - (i + j) * 0.5 * S / 3], gray: [[1, 1], [0, 2]] }, // oben
        { tint: blue, pts: (i, j) => [cx - i * 0.866 * S / 3, cy - i * 0.5 * S / 3 + j * S / 3], gray: [[1, 1], [2, 0]] }, // links
        { tint: yellow, pts: (i, j) => [cx + i * 0.866 * S / 3, cy - i * 0.5 * S / 3 + j * S / 3], gray: [] } // rechts
      ];
      faces.forEach((f, fi) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const q = [f.pts(i, j), f.pts(i + 1, j), f.pts(i + 1, j + 1), f.pts(i, j + 1)];
        const isGray = f.gray.some(([a, b]) => a === i && b === j);
        poly(ctx, q, isGray ? gray(p.g) : mix(base[Math.floor(r() * base.length)], f.tint, p.filt), "#111", 2);
        if (reveal && isGray) poly(ctx, q, null, "#fff", 3);
      } });
      if (reveal) { rect(ctx, cx - S * 0.9, h - 60, S * 1.8, 18, gray(p.g)); badge(ctx, "Markierte Kacheln = dieser Balken = Grauwert " + p.g, cx, h - 26); }
    }
  });
})();
