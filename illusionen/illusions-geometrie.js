// Kategorie: Größe & Form
(function () {
  const { TAU, line, circle, rect, poly, text, measure, badge, clamp, gray } = H;

  addIllusion({
    id: "mueller-lyer", cat: "geometrie", name: "Müller-Lyer-Täuschung", short: "Gleich lange Linien wirken ungleich",
    hint: "Verändere den Winkel der Pfeilspitzen. Die Animation klappt die Spitzen um – beobachte, wie die Linie zu „atmen“ scheint.",
    desc: "Beide waagerechten Linien sind exakt gleich lang. Die Linie mit nach außen zeigenden Spitzen wirkt länger als die mit nach innen zeigenden.",
    why: "Das Sehsystem interpretiert die Pfeilenden wie Raumecken (innere vs. äußere Hausecke) und korrigiert die wahrgenommene Länge entsprechend. Zusätzlich verschiebt die Pfeilform den wahrgenommenen Schwerpunkt der Linienenden.",
    params: [
      { k: "ang", label: "Spitzenwinkel", min: 10, max: 80, def: 35, unit: "°" },
      { k: "len", label: "Spitzenlänge", min: 10, max: 80, def: 40 },
      { k: "animate", label: "Spitzen animieren", type: "check", def: true }
    ],
    draw(ctx, w, h, p, t, reveal) {
      const L = Math.min(w * 0.5, 420), cx = w / 2;
      const a = p.ang * Math.PI / 180, f = p.animate ? Math.cos(t * 1.2) : 1;
      [[h * 0.38, 1 * f], [h * 0.62, -1 * f]].forEach(([y, dir]) => {
        line(ctx, cx - L / 2, y, cx + L / 2, y, "#fff", 3);
        [[cx - L / 2, -1], [cx + L / 2, 1]].forEach(([x, s]) => {
          const dx = Math.cos(a) * p.len * dir * s, dy = Math.sin(a) * p.len;
          line(ctx, x, y, x + dx, y - dy, "#fff", 3); line(ctx, x, y, x + dx, y + dy, "#fff", 3);
        });
        if (reveal) measure(ctx, cx - L / 2, y + 30, cx + L / 2, y + 30, Math.round(L) + " px");
      });
      if (reveal) { line(ctx, cx - L / 2, h * 0.3, cx - L / 2, h * 0.72, "#5ec8ff", 1); line(ctx, cx + L / 2, h * 0.3, cx + L / 2, h * 0.72, "#5ec8ff", 1); }
    }
  });

  addIllusion({
    id: "ponzo", cat: "geometrie", name: "Ponzo-Täuschung", short: "Perspektive macht groß",
    hint: "Schiebe den oberen Balken mit dem Regler nach oben und unten. Je enger die Schienen, desto größer wirkt er.",
    desc: "Die beiden gelben Balken sind gleich lang. Der obere Balken zwischen den zusammenlaufenden Linien wirkt deutlich länger.",
    why: "Die konvergierenden Linien werden als Eisenbahnschienen in der Tiefe gelesen. Ein Objekt, das „weiter weg“ gleich groß auf der Netzhaut erscheint, muss real größer sein – das Gehirn skaliert es hoch (Größenkonstanz).",
    params: [
      { k: "pos", label: "Position oberer Balken", min: 0.15, max: 0.6, step: 0.01, def: 0.3 },
      { k: "conv", label: "Konvergenz", min: 0, max: 1, step: 0.01, def: 0.7 },
      { k: "animate", label: "Balken wandern lassen", type: "check", def: true }
    ],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, topW = w * 0.5 * (1 - p.conv * 0.9), botW = w * 0.5;
      for (let i = -1; i <= 1; i += 2) line(ctx, cx + i * topW / 2, h * 0.08, cx + i * botW / 2, h * 0.92, "#ddd", 3);
      for (let k = 0; k < 8; k++) { const y = h * 0.08 + (h * 0.84) * (k + 0.5) / 8, f = (y - h * 0.08) / (h * 0.84); const ww = topW + (botW - topW) * f; line(ctx, cx - ww / 2, y, cx + ww / 2, y, "#444", 1); }
      const L = w * 0.22; const pos = p.animate ? 0.3 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.8)) : p.pos;
      [[h * pos], [h * 0.78]].forEach(([y]) => { rect(ctx, cx - L / 2, y - 7, L, 14, "#ffcc33"); if (reveal) measure(ctx, cx - L / 2, y + 22, cx + L / 2, y + 22, Math.round(L) + " px"); });
      if (reveal) { line(ctx, cx - L / 2, h * 0.1, cx - L / 2, h * 0.9, "#5ec8ff", 1); line(ctx, cx + L / 2, h * 0.1, cx + L / 2, h * 0.9, "#5ec8ff", 1); }
    }
  });

  addIllusion({
    id: "ebbinghaus", cat: "geometrie", name: "Ebbinghaus-Täuschung", short: "Umgebung bestimmt Größe",
    hint: "Verändere die Größe der umgebenden Kreise. Die Animation pulsiert die Umgebung – der orange Kreis scheint mitzuwachsen und zu schrumpfen.",
    desc: "Die beiden orangen Kreise sind gleich groß. Umgeben von großen Kreisen wirkt der linke kleiner, umgeben von kleinen Kreisen wirkt der rechte größer.",
    why: "Größe wird relativ zum Kontext beurteilt (Kontrast-Effekt). Außerdem spielen Abstand und Dichte der Nachbarn eine Rolle: enge, kleine Nachbarn „stützen“ die Mitte, weit entfernte große lassen sie schrumpfen.",
    params: [
      { k: "big", label: "Große Nachbarn", min: 30, max: 90, def: 60 },
      { k: "small", label: "Kleine Nachbarn", min: 5, max: 30, def: 12 },
      { k: "animate", label: "Umgebung pulsieren", type: "check", def: true }
    ],
    draw(ctx, w, h, p, t, reveal) {
      const r = Math.min(w, h) * 0.07, cy = h / 2, s = p.animate ? 1 + 0.25 * Math.sin(t * 1.5) : 1;
      const left = w * 0.3, right = w * 0.7;
      const big = p.big * s, small = p.small / s;
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; circle(ctx, left + Math.cos(a) * (r + big + 14), cy + Math.sin(a) * (r + big + 14), big, "#5ec8ff"); }
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; circle(ctx, right + Math.cos(a) * (r + small + 8), cy + Math.sin(a) * (r + small + 8), small, "#5ec8ff"); }
      circle(ctx, left, cy, r, "#ff8c1a"); circle(ctx, right, cy, r, "#ff8c1a");
      if (reveal) { measure(ctx, left - r, cy + r + 90 + big, left + r, cy + r + 90 + big, "Ø " + Math.round(2 * r)); measure(ctx, right - r, cy + r + 90 + big, right + r, cy + r + 90 + big, "Ø " + Math.round(2 * r)); }
    }
  });

  addIllusion({
    id: "delboeuf", cat: "geometrie", name: "Delboeuf-Täuschung", short: "Der Teller macht die Portion",
    hint: "Verändere die Ringgröße. Die beiden inneren Scheiben sind identisch – wie auf einem kleinen vs. großen Teller.",
    desc: "Die inneren Scheiben sind gleich groß. Mit engem Ring wirkt die Scheibe größer, mit weitem Ring kleiner.",
    why: "Ein naher Ring wird perzeptuell mit der Scheibe „verschmolzen“ (Assimilation) und vergrößert sie; ein weiter Ring wirkt als Kontrast und verkleinert sie.",
    params: [{ k: "ring", label: "Großer Ring", min: 1.3, max: 3, step: 0.05, def: 2.2 }, { k: "animate", label: "Ring animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const r = Math.min(w, h) * 0.08, cy = h / 2, l = w * 0.3, rt = w * 0.7;
      const ring = p.animate ? 1.3 + (p.ring - 1.3) * (0.5 + 0.5 * Math.sin(t)) : p.ring;
      circle(ctx, l, cy, r * 1.15, null, "#fff", 2); circle(ctx, rt, cy, r * ring, null, "#fff", 2);
      circle(ctx, l, cy, r, "#ff8c1a"); circle(ctx, rt, cy, r, "#ff8c1a");
      if (reveal) { measure(ctx, l - r, cy + r * 3.2, l + r, cy + r * 3.2, "Ø " + Math.round(2 * r)); measure(ctx, rt - r, cy + r * 3.2, rt + r, cy + r * 3.2, "Ø " + Math.round(2 * r)); }
    }
  });

  addIllusion({
    id: "jastrow", cat: "geometrie", name: "Jastrow-Täuschung", short: "Zwei identische Bögen",
    hint: "Die beiden Bogenstücke sind deckungsgleich. Die Animation schiebt sie übereinander, zum Beweis.",
    desc: "Das untere Bogenstück wirkt größer als das obere – obwohl beide exakt gleich sind.",
    why: "Wir vergleichen die kurze Innenkante des oberen Stücks direkt mit der langen Außenkante des unteren. Die benachbarten Kanten sind unterschiedlich lang, und das färbt auf die Gesamtbewertung ab.",
    params: [{ k: "animate", label: "Übereinander legen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, R = Math.min(w, h) * 0.55, r = R * 0.72, a0 = -0.42, a1 = 0.42;
      const piece = (x, y, color) => { ctx.beginPath(); ctx.arc(x, y, R, Math.PI / 2 + a0, Math.PI / 2 + a1); ctx.arc(x, y, r, Math.PI / 2 + a1, Math.PI / 2 + a0, true); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke(); };
      const gap = (p.animate ? (0.5 - 0.5 * Math.cos(t * 0.9)) : 1) * (R - r + 12);
      const topY = h / 2 - R + (R - r) * 0.15 - gap / 2, botY = topY + gap;
      const shift = (R - r) * 0.55 * (gap / (R - r + 12));
      piece(cx - shift, topY, "#e9c46a"); piece(cx + shift, botY, "#e76f51");
      if (reveal) badge(ctx, "Beide Teile sind identisch", cx, h * 0.9);
    }
  });

  addIllusion({
    id: "vertikal-horizontal", cat: "geometrie", name: "Vertikal-Horizontal-Täuschung", short: "Senkrecht wirkt länger",
    hint: "Die senkrechte Linie wirkt länger – verschiebe sie mit dem Regler seitlich. Die Animation lässt die Länge gleich, dreht aber das T.",
    desc: "Beide Linien sind gleich lang. Die senkrechte Linie, die die waagerechte halbiert, wirkt rund 10–20 % länger.",
    why: "Vertikale Strecken werden generell überschätzt (unsere Sehfeldform ist breiter als hoch), und eine halbierte Linie wirkt kürzer als eine ungeteilte.",
    params: [{ k: "x", label: "Position Senkrechte", min: 0, max: 1, step: 0.01, def: 0.5 }, { k: "animate", label: "Drehen", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const L = Math.min(w, h) * 0.5, cx = w / 2, cy = h / 2;
      ctx.translate(cx, cy); if (p.animate) ctx.rotate(t * 0.5);
      line(ctx, -L / 2, L / 2, L / 2, L / 2, "#fff", 3);
      const x = -L / 2 + L * p.x; line(ctx, x, L / 2, x, -L / 2, "#fff", 3);
      if (reveal) { measure(ctx, -L / 2, L / 2 + 28, L / 2, L / 2 + 28, Math.round(L) + " px"); measure(ctx, x + 28, L / 2, x + 28, -L / 2, Math.round(L) + " px"); }
    }
  });

  addIllusion({
    id: "sander", cat: "geometrie", name: "Sander-Parallelogramm", short: "Zwei gleich lange Diagonalen",
    hint: "Die Diagonalen sind gleich lang. Verändere die Scherung – bei 0 verschwindet die Täuschung.",
    desc: "Die lange Diagonale durch das große Parallelogramm wirkt länger als die kurze Diagonale im kleinen – beide sind gleich.",
    why: "Das Parallelogramm wird als perspektivisch verzerrtes Rechteck gelesen; Strecken im „fernen“ Teil werden hochskaliert.",
    params: [{ k: "shear", label: "Scherung", min: 0, max: 1, step: 0.01, def: 0.75 }, { k: "animate", label: "Scherung animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const s = Math.min(w, h) * 0.65, cx = w / 2, cy = h / 2;
      const sh = (p.animate ? 0.5 + 0.5 * Math.sin(t * 0.7) : 1) * p.shear * s * 0.55;
      const A = [cx - s / 2 - sh / 2, cy + s * 0.25], B = [cx + s / 2 - sh / 2, cy + s * 0.25], C = [cx + s / 2 + sh / 2, cy - s * 0.25], D = [cx - s / 2 + sh / 2, cy - s * 0.25];
      // Teilung so wählen, dass beide Diagonalen exakt gleich lang sind (Bisektion)
      let lo = 0.3, hi = 0.95, fx = 0.6;
      for (let it = 0; it < 30; it++) { fx = (lo + hi) / 2; const Ex = D[0] + (C[0] - D[0]) * fx, Fx = A[0] + (B[0] - A[0]) * fx; const l1 = Math.hypot(Fx - D[0], A[1] - D[1]), l2 = Math.hypot(B[0] - Ex, B[1] - D[1]); if (l1 > l2) hi = fx; else lo = fx; }
      const E = [D[0] + (C[0] - D[0]) * fx, D[1]], F = [A[0] + (B[0] - A[0]) * fx, A[1]];
      poly(ctx, [A, B, C, D], "rgba(255,255,255,.08)", "#fff", 2); line(ctx, E[0], E[1], F[0], F[1], "#fff", 2);
      const d1 = Math.hypot(F[0] - D[0], F[1] - D[1]), d2 = Math.hypot(B[0] - E[0], B[1] - E[1]);
      line(ctx, D[0], D[1], F[0], F[1], "#ff8c1a", 3); line(ctx, E[0], E[1], B[0], B[1], "#5ec8ff", 3);
      if (reveal) { badge(ctx, Math.round(d1) + " px", (D[0] + F[0]) / 2, (D[1] + F[1]) / 2 - 16); badge(ctx, Math.round(d2) + " px", (E[0] + B[0]) / 2, (E[1] + B[1]) / 2 - 16); }
      else text(ctx, "Orange vs. Blau – welche Diagonale ist länger?", cx, h - 24, "#9a9aa6", 12);
    }
  });

  addIllusion({
    id: "shepard", cat: "geometrie", name: "Shepard-Tische", short: "Zwei identische Tischplatten",
    hint: "Die beiden Tischplatten sind kongruent. Die Animation dreht die linke Platte um 90° und schiebt sie auf die rechte – sie passen exakt.",
    desc: "Der linke Tisch wirkt lang und schmal, der rechte kurz und breit. Beide Platten sind das gleiche Parallelogramm, nur um 90° gedreht.",
    why: "Das Gehirn sieht die Tische als 3D-Objekte und „entzerrt“ die Perspektive automatisch: Die in die Tiefe laufende Kante wird gedanklich verlängert, die quer liegende nicht.",
    params: [{ k: "animate", label: "Überlagern", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const s = Math.min(w, h) * 0.32, wd = s * 0.42, lg = s * 1.0, sk = s * 0.42, legLen = s * 0.45;
      const local = [[-wd / 2, lg / 2], [wd / 2, lg / 2], [wd / 2 + sk, -lg / 2], [-wd / 2 + sk, -lg / 2]].map(([x, y]) => [x - sk / 2, y]);
      const table = (x, y, rot, color, ghost) => {
        const pts = local.map(([px, py]) => [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]);
        if (!ghost) { ctx.strokeStyle = "#8a5a2b"; ctx.lineWidth = 6; ctx.lineCap = "round"; pts.forEach((q) => line(ctx, q[0], q[1], q[0], q[1] + legLen, "#8a5a2b", 6)); }
        poly(ctx, pts, ghost ? "rgba(255,255,255,.12)" : color, ghost ? "#5ec8ff" : "#000", 2);
      };
      const k = p.animate ? clamp(((t % 7) - 2.5) / 2.5, 0, 1) : 0, e = k * k * (3 - 2 * k);
      table(w * 0.7, h * 0.55, Math.PI / 2, "#c8a26a");
      table(H.lerp(w * 0.28, w * 0.7, e), h * 0.55, H.lerp(0, Math.PI / 2, e), "#e9c46a");
      if (reveal) { table(w * 0.7, h * 0.55, Math.PI / 2, null, true); table(w * 0.28, h * 0.55, Math.PI / 2, null, true); badge(ctx, "Blau: die linke Platte um 90° gedreht – deckungsgleich mit rechts", w / 2, h * 0.92); }
    }
  });
  addIllusion({
    id: "zoellner", cat: "geometrie", name: "Zöllner-Täuschung", short: "Parallele Linien kippen",
    hint: "Verändere den Winkel der Querstriche. Die langen Linien bleiben immer exakt parallel.",
    desc: "Die langen diagonalen Linien sind parallel, scheinen sich aber abwechselnd zu neigen.",
    why: "Spitze Winkel werden vom Sehsystem überschätzt (Winkelexpansion). Die kurzen Querstriche „drücken“ die lange Linie wahrnehmungsmäßig in die Gegenrichtung.",
    params: [{ k: "ang", label: "Querstrich-Winkel", min: 0, max: 80, def: 55, unit: "°" }, { k: "n", label: "Linien", min: 3, max: 9, def: 6 }, { k: "animate", label: "Winkel animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const a = (p.animate ? 20 + 50 * (0.5 + 0.5 * Math.sin(t)) : p.ang) * Math.PI / 180;
      ctx.translate(w / 2, h / 2); ctx.rotate(-Math.PI / 5);
      const L = Math.max(w, h) * 1.2, gap = Math.min(w, h) / (p.n + 1);
      for (let i = 0; i < p.n; i++) {
        const y = (i - (p.n - 1) / 2) * gap, dir = i % 2 ? 1 : -1;
        line(ctx, -L / 2, y, L / 2, y, reveal ? "#5ec8ff" : "#fff", 2);
        for (let x = -L / 2; x < L / 2; x += 22) { const dx = Math.cos(a) * 12 * dir, dy = Math.sin(a) * 12; line(ctx, x - dx, y - dy, x + dx, y + dy, "#fff", 2); }
      }
    }
  });

  addIllusion({
    id: "poggendorff", cat: "geometrie", name: "Poggendorff-Täuschung", short: "Versetzte Gerade",
    hint: "Welche der rechten Linien führt die linke fort? Verschiebe die Vermutung mit dem Regler, dann auflösen.",
    desc: "Eine Gerade wird von einem Balken verdeckt. Die Fortsetzung scheint tiefer zu liegen, als sie wirklich ist.",
    why: "Der spitze Winkel zwischen Diagonale und Balkenkante wird überschätzt; dadurch wird die verdeckte Strecke gedanklich steiler fortgesetzt als real.",
    params: [{ k: "guess", label: "Deine Vermutung (Versatz)", min: -80, max: 80, def: 0, unit: " px" }, { k: "wide", label: "Balkenbreite", min: 40, max: 200, def: 110 }, { k: "ang", label: "Steigung", min: 20, max: 70, def: 40, unit: "°" }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, a = p.ang * Math.PI / 180, k = Math.tan(a);
      const x0 = cx - p.wide / 2, x1 = cx + p.wide / 2, L = Math.min(w, h) * 0.45;
      line(ctx, x0 - L * Math.cos(a), cy + L * Math.sin(a), x0, cy, "#fff", 3);
      rect(ctx, x0, 0, p.wide, h, "#3a3a46");
      const yTrue = cy - k * p.wide, yGuess = yTrue + p.guess;
      line(ctx, x1, yGuess, x1 + L * Math.cos(a), yGuess - L * Math.sin(a), "#ff8c1a", 3);
      for (let d = -120; d <= 120; d += 60) if (Math.abs(d - p.guess) > 8) line(ctx, x1, yTrue + d, x1 + L * Math.cos(a), yTrue + d - L * Math.sin(a), "#555", 1.5);
      if (reveal) { ctx.save(); ctx.setLineDash([6, 4]); line(ctx, x0, cy, x1, yTrue, "#5ec8ff", 2); line(ctx, x1, yTrue, x1 + L * Math.cos(a), yTrue - L * Math.sin(a), "#5ec8ff", 2); ctx.restore(); badge(ctx, p.guess === 0 ? "Treffer – Versatz 0" : "Dein Versatz: " + p.guess + " px", cx, h * 0.9); }
    }
  });

  addIllusion({
    id: "hering", cat: "geometrie", name: "Hering-Täuschung", short: "Gerade Linien biegen sich",
    hint: "Die beiden roten Linien sind gerade. Verschiebe das Strahlenzentrum – die Linien scheinen sich nach außen zu wölben.",
    desc: "Zwei parallele Geraden vor einem Strahlenbündel wirken nach außen gebogen.",
    why: "Die Schnittwinkel zwischen Strahlen und Geraden werden überschätzt. In der Nähe des Zentrums sind die Winkel spitzer, also werden die Linien dort scheinbar stärker weggedrückt.",
    params: [{ k: "rays", label: "Strahlen", min: 8, max: 60, def: 32 }, { k: "gap", label: "Abstand der Linien", min: 40, max: 300, def: 120 }, { k: "animate", label: "Zentrum wandern", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal, io) {
      const cx = p.animate ? w / 2 + Math.sin(t * 0.6) * w * 0.2 : (io.inside ? io.x : w / 2), cy = p.animate ? h / 2 + Math.cos(t * 0.45) * h * 0.2 : (io.inside ? io.y : h / 2);
      const R = Math.hypot(w, h);
      for (let i = 0; i < p.rays; i++) { const a = i / p.rays * TAU; line(ctx, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, "#777", 1); }
      [w / 2 - p.gap / 2, w / 2 + p.gap / 2].forEach((x) => line(ctx, x, 0, x, h, reveal ? "#5ec8ff" : "#ff4d4d", 3));
      if (reveal) badge(ctx, "Beide Linien sind exakt senkrecht", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "wundt", cat: "geometrie", name: "Wundt-Täuschung", short: "Nach innen gebogen",
    hint: "Das Gegenstück zu Hering: Zwei Strahlenzentren außen lassen die Geraden nach innen durchhängen.",
    desc: "Die roten Linien sind gerade, scheinen aber zur Mitte hin eingedrückt.",
    why: "Gleicher Mechanismus wie bei Hering, nur mit Strahlenzentren außerhalb der Linien – die Verzerrung kehrt sich um.",
    params: [{ k: "rays", label: "Strahlen", min: 8, max: 60, def: 28 }, { k: "gap", label: "Abstand", min: 40, max: 300, def: 140 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const R = Math.hypot(w, h);
      [[-w * 0.15, h / 2], [w * 1.15, h / 2]].forEach(([cx, cy]) => { for (let i = 0; i < p.rays; i++) { const a = i / p.rays * TAU; line(ctx, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, "#777", 1); } });
      [w / 2 - p.gap / 2, w / 2 + p.gap / 2].forEach((x) => line(ctx, x, 0, x, h, reveal ? "#5ec8ff" : "#ff4d4d", 3));
      if (reveal) badge(ctx, "Beide Linien sind exakt senkrecht", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "orbison", cat: "geometrie", name: "Orbison-Täuschung", short: "Verzogenes Quadrat",
    hint: "Ein perfektes Quadrat und ein Kreis auf konzentrischen Ringen bzw. Strahlen wirken verzogen. Umschalten zwischen Hintergründen.",
    desc: "Quadrat und Kreis sind geometrisch perfekt, erscheinen aber auf dem Muster verzerrt.",
    why: "Die Winkelüberschätzung an jedem Schnittpunkt mit dem Hintergrund addiert sich zu einer wahrgenommenen Krümmung oder Scherung.",
    params: [{ k: "bgm", label: "Hintergrund", type: "select", def: "rings", options: [["rings", "Konzentrische Kreise"], ["rays", "Strahlen"]] }, { k: "animate", label: "Hintergrund rotieren/atmen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.3;
      ctx.strokeStyle = "#777"; ctx.lineWidth = 1;
      if (p.bgm === "rings") { const off = p.animate ? (t * 20) % 22 : 0; for (let r = off; r < Math.hypot(w, h); r += 22) circle(ctx, cx + s * 0.6, cy, r, null, "#777", 1); }
      else { const n = 40, rot = p.animate ? t * 0.2 : 0; for (let i = 0; i < n; i++) { const a = i / n * TAU + rot; line(ctx, cx + s * 0.4, cy, cx + s * 0.4 + Math.cos(a) * 2000, cy + Math.sin(a) * 2000, "#777", 1); } }
      const col = reveal ? "#5ec8ff" : "#ff4d4d";
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.strokeRect(cx - s - s * 0.3, cy - s / 2, s, s); circle(ctx, cx + s * 0.7, cy, s / 2, null, col, 3);
      if (reveal) badge(ctx, "Perfektes Quadrat & perfekter Kreis", cx, h - 26);
    }
  });

  addIllusion({
    id: "cafe-wall", cat: "geometrie", name: "Café-Wall-Täuschung", short: "Schiefe Mörtellinien",
    hint: "Die grauen Fugen sind exakt waagerecht und parallel. Verschiebe die Reihen – bei Versatz 0 (oder einer ganzen Kachel) verschwindet der Keil-Effekt, bei einer halben Kachel ist er am stärksten.",
    desc: "Die Zeilen aus schwarzen und weißen Kacheln scheinen keilförmig zusammenzulaufen.",
    why: "An den Kontrastkanten zwischen versetzten Kacheln entstehen lokale „Keile“ durch Helligkeitskontrast im Fugenstreifen (Border-Locking). Die Fugenfarbe muss zwischen Schwarz und Weiß liegen, sonst verschwindet der Effekt.",
    params: [{ k: "shift", label: "Zeilenversatz (Kacheln)", min: 0, max: 1, step: 0.01, def: 0.5 }, { k: "mortar", label: "Fugenhelligkeit", min: 0, max: 255, def: 128 }, { k: "tile", label: "Kachelgröße", min: 20, max: 80, def: 44 }, { k: "animate", label: "Versatz animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const T = p.tile, m = 3, rows = Math.ceil(h / (T + m)) + 1, cols = Math.ceil(w / T) + 4;
      rect(ctx, 0, 0, w, h, gray(p.mortar));
      const sh = p.animate ? 0.5 + 0.5 * Math.sin(t * 0.7) : p.shift;
      for (let r = 0; r < rows; r++) {
        const off = (r % 2 ? sh : 0) * T - 2 * T;
        for (let c = 0; c < cols; c++) rect(ctx, c * T + off, r * (T + m), T - 0.5, T, c % 2 ? "#fff" : "#000");
        if (reveal && r > 0) line(ctx, 0, r * (T + m) - m / 2, w, r * (T + m) - m / 2, "#5ec8ff", 1.5);
      }
    }
  });
  addIllusion({
    id: "fraser", cat: "geometrie", name: "Fraser-Spirale", short: "Kreise, die eine Spirale vortäuschen",
    hint: "Das sind konzentrische Kreise, keine Spirale. Fahre mit der Maus über einen Ring: Die Auflösung hebt ihn hervor.",
    desc: "Die geflochtenen Ringe wirken wie eine Spirale, die ins Zentrum läuft – es sind aber geschlossene Kreise.",
    why: "Die Ringe bestehen aus schräg gestellten schwarz-weißen Segmenten („verdrilltes Seil“). Lokale Neigungen werden zu einer globalen Spirale integriert – ein Konflikt zwischen lokaler und globaler Verarbeitung.",
    params: [{ k: "twist", label: "Segmentneigung", min: 0, max: 1, step: 0.01, def: 0.55 }, { k: "animate", label: "Hintergrund rotieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.48;
      // checker background
      const n = 24, rot = p.animate ? t * 0.1 : 0;
      for (let i = 0; i < n; i++) for (let k = 0; k < 10; k++) {
        const a0 = i / n * TAU + rot, a1 = (i + 1) / n * TAU + rot, r0 = R * k / 10, r1 = R * (k + 1) / 10;
        ctx.beginPath(); ctx.arc(cx, cy, r1, a0, a1); ctx.arc(cx, cy, r0, a1, a0, true); ctx.closePath(); ctx.fillStyle = (i + k) % 2 ? "#5a5a5a" : "#2a2a2a"; ctx.fill();
      }
      const rings = 7;
      for (let k = 1; k <= rings; k++) {
        const r = R * k / (rings + 0.5), segs = Math.round(r / 7) * 2, lw = R / (rings + 0.5) * 0.45;
        for (let i = 0; i < segs; i++) {
          const a0 = i / segs * TAU, a1 = (i + 1) / segs * TAU, tw = p.twist * lw;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a0) * (r - lw / 2), cy + Math.sin(a0) * (r - lw / 2));
          ctx.lineTo(cx + Math.cos(a1) * (r - lw / 2 + tw), cy + Math.sin(a1) * (r - lw / 2 + tw));
          ctx.lineTo(cx + Math.cos(a1) * (r + lw / 2 + tw), cy + Math.sin(a1) * (r + lw / 2 + tw));
          ctx.lineTo(cx + Math.cos(a0) * (r + lw / 2), cy + Math.sin(a0) * (r + lw / 2)); ctx.closePath();
          ctx.fillStyle = i % 2 ? "#fff" : "#000"; ctx.fill();
        }
        if (reveal) circle(ctx, cx, cy, r, null, "#5ec8ff", 2);
      }
    }
  });

  addIllusion({
    id: "ehrenstein-quadrat", cat: "geometrie", name: "Ehrenstein-Verzerrung", short: "Quadrat in Kreisen",
    hint: "Ein Quadrat auf konzentrischen Kreisen wirkt eingedellt. Vergrößere den Kreisabstand und beobachte, wie der Effekt nachlässt.",
    desc: "Das rote Quadrat hat gerade Seiten – vor den Kreisen wirken sie zur Mitte hin eingebeult.",
    why: "Wieder die Überschätzung spitzer Schnittwinkel: Wo Kreise die Quadratseite flach schneiden, wird die Seite scheinbar weggedrückt.",
    params: [{ k: "gap", label: "Kreisabstand", min: 8, max: 60, def: 16 }, { k: "animate", label: "Kreise pulsieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.36, off = p.animate ? (t * 15) % p.gap : 0;
      for (let r = off; r < Math.hypot(w, h); r += p.gap) circle(ctx, cx, cy, r, null, "#888", 1);
      ctx.strokeStyle = reveal ? "#5ec8ff" : "#ff4d4d"; ctx.lineWidth = 3; ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
      if (reveal) badge(ctx, "Alle vier Seiten sind gerade", cx, h - 26);
    }
  });
})();
