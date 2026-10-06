// Kategorie: Bewegung – Teil 2
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "ternus", cat: "bewegung", name: "Ternus-Display", short: "Springt einer oder springen alle?",
    hint: "Drei Punkte wechseln zwischen zwei Positionen. Mit kurzer Pause (ISI) springt scheinbar nur der äußere Punkt über die anderen; mit langer Pause bewegt sich die ganze Gruppe.",
    desc: "Dieselben zwei Bilder werden je nach Dunkelpause dazwischen als Element-Bewegung oder als Gruppen-Bewegung gesehen (Ternus, 1926).",
    why: "Bei kurzem Abstand sorgt die Reizpersistenz dafür, dass die zwei überlappenden Punkte als stillstehend gelten – nur der Rest „muss“ springen. Bei längerem Abstand wird die gesamte Konfiguration als bewegtes Objekt interpretiert.",
    params: [{ k: "isi", label: "Dunkelpause (ISI)", min: 0, max: 400, def: 30, unit: " ms" }, { k: "dur", label: "Bilddauer", min: 100, max: 800, def: 250, unit: " ms" }],
    draw(ctx, w, h, p, t, reveal) {
      const cycle = 2 * (p.dur + p.isi) / 1000, ph = (t % cycle) * 1000, cx = w / 2, cy = h / 2, g = Math.min(w, h) * 0.18, r = g * 0.3;
      let frame = -1; if (ph < p.dur) frame = 0; else if (ph >= p.dur + p.isi && ph < 2 * p.dur + p.isi) frame = 1;
      if (frame >= 0) for (let i = 0; i < 3; i++) circle(ctx, cx + (i - 1.5 + frame) * g, cy, r, reveal ? ["#ff8c1a", "#5ec8ff", "#3cff5a"][i] : "#fff");
      if (reveal) badge(ctx, "Farben zeigen: physisch verschieben sich alle drei um eine Position", cx, h - 26);
    }
  });

  addIllusion({
    id: "induzierte-bewegung", cat: "bewegung", name: "Induzierte Bewegung (Duncker)", short: "Der Rahmen bewegt den Punkt",
    hint: "Der Punkt steht absolut still, nur der Rahmen pendelt. Trotzdem scheint der Punkt sich in Gegenrichtung zu bewegen – wie der Mond hinter ziehenden Wolken.",
    desc: "Ein ruhender Punkt in einem bewegten Rahmen wird als bewegt wahrgenommen.",
    why: "Das Sehsystem nimmt an, dass große Flächen (der Rahmen, die Umgebung) stillstehen, und schreibt Relativbewegung dem kleineren Objekt zu.",
    params: [{ k: "amp", label: "Rahmen-Auslenkung", min: 20, max: 200, def: 100 }, { k: "speed", label: "Tempo", min: 0.2, max: 2, step: 0.1, def: 0.6 }],
    noReveal: false,
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.5, fx = cx + Math.sin(t * p.speed * TAU) * p.amp;
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.strokeRect(fx - S / 2, cy - S / 2, S, S);
      circle(ctx, cx, cy, 10, "#ffe600");
      if (reveal) { line(ctx, cx, 0, cx, h, "#5ec8ff", 1); badge(ctx, "Punkt bleibt exakt auf der blauen Linie", cx, h - 26); }
    }
  });

  addIllusion({
    id: "autokinetisch", cat: "bewegung", name: "Autokinetischer Effekt", short: "Der wandernde Lichtpunkt",
    hint: "Schau in einem dunklen Raum eine Minute lang entspannt auf den Punkt (möglichst Vollbild). Er beginnt scheinbar zu wandern, obwohl er fest steht.",
    desc: "Ein einzelner Lichtpunkt in völliger Dunkelheit scheint nach einiger Zeit umherzuwandern.",
    why: "Ohne Bezugsrahmen fehlen dem Gehirn Referenzpunkte. Kleine, unbewusste Augenbewegungen und Drift der Augenmuskelsignale werden fälschlich als Bewegung des Punkts interpretiert.",
    params: [{ k: "size", label: "Punktgröße", min: 1, max: 8, def: 3 }],
    anim: false, noReveal: true,
    draw(ctx, w, h, p) { circle(ctx, w / 2, h / 2, p.size, "#fff"); }
  });

  addIllusion({
    id: "essstaebchen", cat: "bewegung", name: "Essstäbchen-Täuschung (Anstis)", short: "Kreuzung läuft falsch herum",
    hint: "Zwei Striche kreisen beide im Uhrzeigersinn (ohne sich zu drehen). Durch die runde Blende scheint ihr Kreuzungspunkt gegen den Uhrzeigersinn zu laufen. Blende ausschalten zum Vergleich.",
    desc: "Zwei gekreuzte Linien, die parallel verschoben kreisen, lassen ihren Schnittpunkt in Gegenrichtung kreisen – aber nur hinter einer Blende.",
    why: "Aperturproblem: Hinter der Blende sind die Linienenden unsichtbar. Das Sehsystem verfolgt den Schnittpunkt, der sich tatsächlich gegenläufig bewegt, und weist diese Bewegung den Linien zu.",
    params: [{ k: "mask", label: "Blende an", type: "check", def: true }, { k: "speed", label: "Tempo", min: 0.2, max: 1.5, step: 0.05, def: 0.5 }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.3, r = R * 0.35, a = t * p.speed * TAU, L = R * 2.2;
      ctx.save(); if (p.mask && !reveal) { ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); }
      [[a, 1], [a + Math.PI / 2, -1]].forEach(([ph, s]) => { const ox = cx + Math.cos(ph) * r, oy = cy + Math.sin(ph) * r; const dx = Math.cos(Math.PI / 4 * s) * L / 2, dy = Math.sin(Math.PI / 4 * s) * L / 2; line(ctx, ox - dx, oy - dy, ox + dx, oy + dy, "#fff", 5); if (reveal) circle(ctx, ox, oy, 6, "#ff3b3b"); });
      ctx.restore();
      if (p.mask) circle(ctx, cx, cy, R, null, "#444", 2);
      if (reveal) badge(ctx, "Rote Mittelpunkte: beide Linien kreisen im Uhrzeigersinn", cx, h - 26);
    }
  });

  addIllusion({
    id: "plaid", cat: "bewegung", name: "Plaid-Bewegung", short: "Zwei Gitter, eine Richtung",
    hint: "Zwei diagonal laufende Gitter überlagern sich. Bei gleichem Kontrast sieht man ein Rautenmuster, das sich nach rechts bewegt. Senke den Kontrast eines Gitters – sie trennen sich in zwei Schichten.",
    desc: "Zwei Streifengitter, die sich jeweils senkrecht zu ihren Streifen bewegen, verschmelzen zu einem Muster mit einer ganz neuen Richtung.",
    why: "Das Bewegungssystem löst das Aperturproblem, indem es die Bewegungen beider Komponenten zu einer gemeinsamen Lösung („Intersection of Constraints“) kombiniert. Unterscheiden sich die Gitter zu stark, werden sie als transparente Schichten getrennt.",
    params: [{ k: "c2", label: "Kontrast Gitter 2", min: 0, max: 1, step: 0.01, def: 1 }, { k: "ang", label: "Winkel", min: 20, max: 80, def: 45, unit: "°" }, { k: "speed", label: "Tempo", min: 10, max: 120, def: 50 }],
    bg: "#808080",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42, per = 36, ang = p.ang * Math.PI / 180;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      const grating = (a, contrast) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); const off = (t * p.speed) % per; ctx.globalAlpha = 0.5 * contrast; for (let x = -R * 1.5 + off; x < R * 1.5; x += per) rect(ctx, x, -R * 1.5, per / 2, R * 3, "#fff"); for (let x = -R * 1.5 + off + per / 2; x < R * 1.5; x += per) rect(ctx, x, -R * 1.5, per / 2, R * 3, "#000"); ctx.restore(); };
      grating(ang, 1); grating(-ang, p.c2); ctx.restore(); circle(ctx, cx, cy, R, null, "#444", 2);
      if (reveal) { const ax = cx, ay = cy + R + 24; line(ctx, ax - 30, ay, ax + 30, ay, "#5ec8ff", 3); poly(ctx, [[ax + 30, ay], [ax + 18, ay - 7], [ax + 18, ay + 7]], "#5ec8ff"); badge(ctx, "Komponenten laufen schräg – das Muster nach rechts", cx, h - 20); }
    }
  });

  addIllusion({
    id: "stereokinetisch", cat: "bewegung", name: "Stereokinetischer Effekt", short: "Flache Kreise werden zum Kegel",
    hint: "Versetzte Kreise drehen sich als flaches Muster. Nach kurzer Zeit erscheint ein dreidimensionaler Kegel, der taumelt (Musatti, 1924).",
    desc: "Ein rotierendes Muster aus exzentrischen Kreisen erzeugt den Eindruck eines räumlichen Kegels oder Trichters.",
    why: "Das Gehirn bevorzugt die Interpretation eines starren 3D-Objekts gegenüber einem sich verformenden 2D-Muster. Ein taumelnder Kegel erklärt die Bildbewegung „einfacher“.",
    params: [{ k: "n", label: "Kreise", min: 3, max: 12, def: 7 }, { k: "off", label: "Versatz", min: 0, max: 0.5, step: 0.01, def: 0.3 }, { k: "speed", label: "Tempo", min: 0.1, max: 1.5, step: 0.05, def: 0.4 }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.4, a = t * p.speed * TAU;
      for (let i = 0; i < p.n; i++) { const f = 1 - i / p.n, r = R * f, d = R * p.off * (1 - f); circle(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, r, null, i % 2 ? "#fff" : "#5ec8ff", 3); }
    }
  });

  addIllusion({
    id: "ames-fenster", cat: "bewegung", name: "Ames-Fenster", short: "Drehung wird zu Pendeln",
    hint: "Das trapezförmige Fenster dreht sich gleichmäßig in eine Richtung. Es scheint aber hin- und herzupendeln. Auflösen zeigt die Draufsicht mit dem echten Drehwinkel.",
    desc: "Ein rotierendes Trapez-Fenster erscheint zu oszillieren statt zu rotieren (Adelbert Ames, 1951).",
    why: "Das Trapez wird als perspektivisch gesehenes Rechteck interpretiert: Die längere Seite scheint immer näher. Da diese Deutung sich bei der Drehung nicht umkehren darf, muss das Fenster scheinbar zurückschwingen.",
    params: [{ k: "speed", label: "Tempo", min: 0.05, max: 0.6, step: 0.01, def: 0.2 }, { k: "trap", label: "Trapez-Stärke", min: 0, max: 0.6, step: 0.01, def: 0.4 }],
    bg: "#1a1a1a",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.32, a = t * p.speed * TAU, f = 900;
      const proj = ([x, y, z]) => { const xr = x * Math.cos(a) - z * Math.sin(a), zr = x * Math.sin(a) + z * Math.cos(a); const s = f / (f + zr + S * 2); return [cx + xr * s, cy + y * s]; };
      const hl = S * (1 + p.trap), hr = S * (1 - p.trap); // linke Seite höher
      const corners = [[-S, -hl / 2, 0], [S, -hr / 2, 0], [S, hr / 2, 0], [-S, hl / 2, 0]].map(proj);
      poly(ctx, corners, "#c9a070", "#3b2a14", 3);
      // Sprossen
      for (let i = 1; i < 3; i++) { const u = i / 3; line(ctx, ...proj([-S + 2 * S * u, -(hl + (hr - hl) * u) / 2, 0]), ...proj([-S + 2 * S * u, (hl + (hr - hl) * u) / 2, 0]), "#3b2a14", 3); }
      line(ctx, ...proj([-S, 0, 0]), ...proj([S, 0, 0]), "#3b2a14", 3);
      if (reveal) { const ox = w - 80, oy = 70; circle(ctx, ox, oy, 40, null, "#444", 1); line(ctx, ox - Math.cos(a) * 36, oy + Math.sin(a) * 36, ox + Math.cos(a) * 36, oy - Math.sin(a) * 36, "#5ec8ff", 4); circle(ctx, ox - Math.cos(a) * 36, oy + Math.sin(a) * 36, 5, "#ff3b3b"); text(ctx, "Draufsicht", ox, oy + 56, "#9a9aa6", 11); badge(ctx, "Rot = die lange (hohe) Kante; das Fenster dreht sich gleichmäßig", cx, h - 26); }
    }
  });

  addIllusion({
    id: "reverse-phi", cat: "bewegung", name: "Reverse Phi", short: "Rückwärts durch Kontrastumkehr",
    hint: "Das Muster springt in jedem Schritt nach rechts. Wird dabei jedes Mal der Kontrast umgekehrt, sieht man Bewegung nach links. Schalte die Umkehr aus – die Richtung kippt.",
    desc: "Ein Muster, das bei jedem Sprung seinen Kontrast umkehrt, scheint sich in die entgegengesetzte Richtung zu bewegen (Anstis, 1970).",
    why: "Bewegungsdetektoren (Reichardt-Detektoren) vergleichen Helligkeitsänderungen benachbarter Orte. Bei Kontrastumkehr passt ein dunkler Balken links besser zum nächsten hellen rechts – die Detektoren melden die falsche Richtung.",
    params: [{ k: "invert", label: "Kontrast umkehren", type: "check", def: true }, { k: "rate", label: "Schritte pro Sekunde", min: 2, max: 20, def: 8 }, { k: "step", label: "Schrittweite", min: 1, max: 4, def: 2 }],
    init(p) { p._arr = null; },
    draw(ctx, w, h, p, t, reveal) {
      const N = 120; if (!p._arr) { const r = rnd(99); p._arr = Array.from({ length: N }, () => r()); }
      const bw = w / N, k = Math.floor(t * p.rate), inv = p.invert && k % 2;
      for (let i = 0; i < N; i++) { let v = p._arr[((i - k * p.step) % N + N) % N]; if (inv) v = 1 - v; rect(ctx, i * bw, h * 0.2, bw + 0.5, h * 0.6, gray(v * 255)); }
      if (reveal) { const mx = w / 2, my = h * 0.88; line(ctx, mx - 30, my, mx + 30, my, "#5ec8ff", 3); poly(ctx, [[mx + 30, my], [mx + 18, my - 7], [mx + 18, my + 7]], "#5ec8ff"); badge(ctx, "Echte Verschiebung: nach rechts, " + p.step + " Balken pro Schritt", mx, my + 26); }
    }
  });

  addIllusion({
    id: "fraser-wilcox", cat: "bewegung", name: "Peripherer Drift (Fraser-Wilcox)", short: "Sägezahn-Ringe kreisen",
    hint: "Statisches Bild. Lass den Blick wandern oder blinzle – die Ringe drehen sich. Richtung hängt von der Helligkeitsrampe ab (dunkel → hell).",
    desc: "Ringe aus sägezahnförmigen Helligkeitsrampen scheinen zu rotieren, besonders im Augenwinkel (Fraser & Wilcox, 1979).",
    why: "Wie bei den rotierenden Schlangen: Helligkeitsrampen erzeugen asymmetrische Signale in Bewegungsdetektoren. Jede Augenbewegung oder jedes Blinzeln „startet“ die Scheinbewegung neu.",
    params: [{ k: "n", label: "Zähne pro Ring", min: 8, max: 48, def: 24 }, { k: "rings", label: "Ringe", min: 2, max: 6, def: 4 }, { k: "flip", label: "Richtung umkehren", type: "check", def: false }],
    anim: false, bg: "#808080",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
      for (let k = 0; k < p.rings; k++) {
        const r1 = R * (1 - k / p.rings), r0 = R * (1 - (k + 0.8) / p.rings), dir = (k % 2 ? 1 : -1) * (p.flip ? -1 : 1);
        for (let i = 0; i < p.n; i++) {
          const steps = 8;
          for (let s = 0; s < steps; s++) {
            const a0 = (i + s / steps) / p.n * TAU, a1 = (i + (s + 1) / steps) / p.n * TAU + 0.004; const v = dir > 0 ? s / (steps - 1) : 1 - s / (steps - 1);
            ctx.beginPath(); ctx.arc(cx, cy, r1, a0, a1); ctx.arc(cx, cy, r0, a1, a0, true); ctx.closePath(); ctx.fillStyle = gray(v * 255); ctx.fill();
          }
        }
      }
      fixation(ctx, cx, cy, "#000");
      if (reveal) badge(ctx, "Kreuz fixieren: nichts bewegt sich", cx, h - 26);
    }
  });

  addIllusion({
    id: "punktlicht-laeufer", cat: "bewegung", name: "Punktlicht-Läufer", short: "13 Punkte, ein Mensch",
    hint: "Nur 13 bewegte Punkte – und sofort siehst du einen gehenden Menschen. Stoppe die Animation: eine bedeutungslose Punktwolke. Auf den Kopf gestellt wird die Erkennung viel schwerer.",
    desc: "Biologische Bewegung: Wenige Lichtpunkte an den Gelenken genügen, um Gang, Richtung und sogar Geschlecht oder Stimmung zu erkennen (Johansson, 1973).",
    why: "Spezialisierte Areale (u. a. der Sulcus temporalis superior) sind auf die typische Kinematik von Körpern geeicht. Sie gruppieren die Punkte über die Zeit zu einem Körper – aber nur in der gewohnten Orientierung.",
    params: [{ k: "speed", label: "Gehtempo", min: 0.5, max: 2.5, step: 0.1, def: 1.3 }, { k: "flip", label: "Auf den Kopf stellen", type: "check", def: false }, { k: "dir", label: "Laufrichtung", type: "select", def: 1, options: [[1, "nach rechts"], [-1, "nach links"]] }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.3, ph = t * p.speed * TAU;
      const d = p.dir, sw = (a) => Math.sin(a);
      // Gelenkwinkel (Seitenansicht)
      const hipL = 0.45 * sw(ph), hipR = 0.45 * sw(ph + Math.PI);
      const kneeL = 0.6 * Math.max(0, sw(ph + 0.7)), kneeR = 0.6 * Math.max(0, sw(ph + Math.PI + 0.7));
      const shL = 0.35 * sw(ph + Math.PI), shR = 0.35 * sw(ph);
      const elL = 0.5 * Math.max(0, sw(ph + Math.PI + 0.5)) + 0.2, elR = 0.5 * Math.max(0, sw(ph + 0.5)) + 0.2;
      const bob = Math.abs(Math.cos(ph)) * S * 0.03;
      const hip = [cx, cy + S * 0.1 - bob], sh = [cx + S * 0.02 * d, cy - S * 0.5 - bob], head = [sh[0], sh[1] - S * 0.22];
      const seg = (from, ang, len) => [from[0] + Math.sin(ang) * len * d, from[1] + Math.cos(ang) * len];
      const kL = seg(hip, hipL, S * 0.45), aL = seg(kL, hipL - kneeL, S * 0.45), kR = seg(hip, hipR, S * 0.45), aR = seg(kR, hipR - kneeR, S * 0.45);
      const eL = seg(sh, shL + Math.PI, -S * 0.35), hL = seg(eL, shL + Math.PI - elL, -S * 0.32), eR = seg(sh, shR + Math.PI, -S * 0.35), hR = seg(eR, shR + Math.PI - elR, -S * 0.32);
      const pts = [head, sh, hip, kL, aL, kR, aR, eL, hL, eR, hR, [hip[0] - S * 0.08 * d, hip[1]], [sh[0] - S * 0.08 * d, sh[1]]];
      ctx.save(); if (p.flip) { ctx.translate(0, h); ctx.scale(1, -1); }
      if (reveal) { ctx.strokeStyle = "#444"; ctx.lineWidth = 3; [[head, sh], [sh, hip], [hip, kL], [kL, aL], [hip, kR], [kR, aR], [sh, eL], [eL, hL], [sh, eR], [eR, hR]].forEach(([a, b]) => line(ctx, a[0], a[1], b[0], b[1], "#444", 3)); }
      pts.forEach(([x, y]) => circle(ctx, x, y, 6, "#fff")); ctx.restore();
    }
  });

  addIllusion({
    id: "gemeinsames-schicksal", cat: "bewegung", name: "Gemeinsames Schicksal (Gestalt)", short: "Bewegung macht sichtbar",
    hint: "Im Punktfeld versteckt sich eine Form. Ruhend ist sie unsichtbar; sobald ihre Punkte sich gemeinsam bewegen, springt sie heraus. Animation stoppen – die Form verschwindet.",
    desc: "Punkte, die sich gemeinsam bewegen, werden als zusammengehörige Figur gruppiert – auch ohne jeden anderen Unterschied.",
    why: "Gestaltgesetz des gemeinsamen Schicksals: Das Bewegungssystem segmentiert die Szene nach Bewegungsvektoren. Gleiche Bewegung = ein Objekt.",
    params: [{ k: "form", label: "Form", type: "select", def: "kreis", options: [["kreis", "Kreis"], ["dreieck", "Dreieck"], ["quadrat", "Quadrat"]] }, { k: "amp", label: "Bewegungsweite", min: 2, max: 30, def: 10 }],
    init(p) { p._pts = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._pts) { const r = rnd(42); p._pts = Array.from({ length: 900 }, () => [r(), r()]); }
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.25, dx = Math.sin(t * 3) * p.amp, dy = Math.cos(t * 2.3) * p.amp * 0.5;
      const inside = (x, y) => { const u = x - cx, v = y - cy; if (p.form === "kreis") return Math.hypot(u, v) < R; if (p.form === "quadrat") return Math.abs(u) < R * 0.9 && Math.abs(v) < R * 0.9; return v > -R && v < R * 0.8 && Math.abs(u) < (v + R) * 0.6; };
      p._pts.forEach(([fx, fy]) => { const x = fx * w, y = fy * h, inn = inside(x, y); circle(ctx, inn ? x + dx : x, inn ? y + dy : y, 2.2, reveal && inn ? "#ff8c1a" : "#fff"); });
    }
  });
})();
