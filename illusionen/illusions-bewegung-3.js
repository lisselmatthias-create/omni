// Kategorie: Bewegung – Teil 3: Bewegungssimulationen
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "kinetischer-tiefeneffekt", cat: "bewegung", name: "Kinetischer Tiefeneffekt", short: "Aus Bewegung wird Raum",
    hint: "Ein verbogener Draht wird flach auf die Fläche projiziert. Still ist er ein wirres Gekrakel – sobald er sich dreht, siehst du seine 3D-Form sofort. Stoppe die Animation und die Tiefe bricht zusammen (Wallach & O'Connell, 1953).",
    desc: "Das Sehsystem rekonstruiert dreidimensionale Struktur allein aus der Art, wie sich 2D-Projektionen über die Zeit verändern.",
    why: "Die Punkte eines starren Objekts bewegen sich bei Rotation mit charakteristischen Geschwindigkeitsprofilen (nahe Punkte schneller, Richtungsumkehr an den Rändern). Das Gehirn nimmt Starrheit an und löst die Tiefe daraus auf – Structure from Motion.",
    params: [{ k: "speed", label: "Drehtempo", min: 0.1, max: 1.5, step: 0.05, def: 0.5 }, { k: "shape", label: "Objekt", type: "select", def: "wire", options: [["wire", "Gebogener Draht"], ["cube", "Würfel-Gitter"], ["helix", "Spirale"]] }],
    init(p) { p._pts = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._pts || p._shape !== p.shape) { p._shape = p.shape; const r = rnd(13); p._pts = []; if (p.shape === "wire") { let x = 0, y = 0, z = 0, dx = 0.1, dy = 0.05, dz = 0.08; for (let i = 0; i < 60; i++) { p._pts.push([x, y, z]); dx += (r() - 0.5) * 0.08; dy += (r() - 0.5) * 0.08; dz += (r() - 0.5) * 0.08; const n = Math.hypot(dx, dy, dz); dx /= n * 8; dy /= n * 8; dz /= n * 8; x += dx; y += dy; z += dz; if (Math.hypot(x, y, z) > 1) { dx = -x / 8; dy = -y / 8; dz = -z / 8; } } }
        else if (p.shape === "helix") for (let i = 0; i < 80; i++) { const a = i / 80 * TAU * 3; p._pts.push([Math.cos(a) * 0.6, i / 80 * 2 - 1, Math.sin(a) * 0.6]); }
        else for (let i = 0; i < 8; i++) { const c = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]][i].map((v) => v * 0.6); p._pts.push(c); } }
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.32, a = t * p.speed;
      const P = p._pts.map(([x, y, z]) => { const xr = x * Math.cos(a) + z * Math.sin(a), zr = -x * Math.sin(a) + z * Math.cos(a); return [cx + xr * R, cy + y * R, zr]; });
      ctx.lineWidth = 3; ctx.lineJoin = "round";
      if (p.shape === "cube") { [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => line(ctx, P[i][0], P[i][1], P[j][0], P[j][1], reveal ? gray(150 + (P[i][2] + P[j][2]) * 50) : "#fff", 3)); }
      else for (let i = 1; i < P.length; i++) line(ctx, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], reveal ? gray(150 + P[i][2] * 100) : "#fff", 3);
      if (reveal) badge(ctx, "Hell = vorn, dunkel = hinten", cx, h - 26);
    }
  });

  addIllusion({
    id: "optischer-fluss", cat: "bewegung", name: "Optischer Fluss & Kurs", short: "Wohin fliegst du?",
    hint: "Du bewegst dich durch ein Sternenfeld. Alle Punkte strömen von einem Punkt weg – dem Expansionsfokus. Das ist deine Flugrichtung. Verschiebe den Kurs und füge eine Augen-Drehung hinzu: Das Gehirn muss beides trennen (Gibson, 1950).",
    desc: "Der optische Fluss verrät Eigenbewegung, Kurs und Zeit bis zum Aufprall – Grundlage für Fliegen, Fahren und die Navigation von Insekten.",
    why: "Neuronen im Areal MST reagieren auf Expansions-, Rotations- und Spiralmuster des gesamten Sehfelds. Aus dem Expansionsfokus wird der Kurs berechnet, selbst wenn die Augen gleichzeitig eine Drehung überlagern.",
    params: [{ k: "hx", label: "Kurs (seitlich)", min: -0.4, max: 0.4, step: 0.01, def: 0.15 }, { k: "speed", label: "Geschwindigkeit", min: 0.2, max: 3, step: 0.1, def: 1 }, { k: "rot", label: "Augen-Drehung", min: -1, max: 1, step: 0.05, def: 0 }],
    init(p) { p._s = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._s) { const r = rnd(8); p._s = Array.from({ length: 500 }, () => [r() * 2 - 1, r() * 2 - 1, r() * 2 + 0.2]); p._t = t; }
      const dt = Math.min(0.05, t - p._t); p._t = t; const cx = w / 2 + p.hx * w, cy = h / 2, f = Math.min(w, h) * 0.5;
      ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(p.rot * t * 0.3); ctx.translate(-w / 2, -h / 2);
      p._s.forEach((s) => { s[2] -= p.speed * dt; if (s[2] < 0.1) { s[0] = Math.random() * 2 - 1; s[1] = Math.random() * 2 - 1; s[2] = 2.2; } const x = cx + s[0] / s[2] * f, y = cy + s[1] / s[2] * f; if (x < -10 || x > w + 10 || y < -10 || y > h + 10) { s[2] = 2.2; return; } circle(ctx, x, y, clamp(3 / s[2], 1, 6), gray(clamp(255 - s[2] * 80, 60, 255))); });
      ctx.restore();
      if (reveal) { fixation(ctx, cx, cy, "#ff3b3b"); badge(ctx, "Expansionsfokus = dein Kurs", cx, cy - 30); }
    }
  });

  addIllusion({
    id: "parallaxe", cat: "bewegung", name: "Bewegungsparallaxe", short: "Tiefe durch Kopfbewegung",
    hint: "Bewege die Maus seitlich (oder lass den Beobachter pendeln): Nahe Punkte huschen schnell, ferne kriechen. Ohne Bewegung ist das Bild flach – mit Bewegung entsteht ein Raum aus Ebenen.",
    desc: "Bewegungsparallaxe ist der wichtigste Tiefenhinweis für einäugige Tiere – und für uns bei Entfernungen, in denen das Stereosehen versagt.",
    why: "Bei Eigenbewegung verschieben sich nahe Objekte auf der Netzhaut schneller als ferne. Das Verhältnis der Geschwindigkeiten entspricht dem Verhältnis der Entfernungen – eine Art zeitliche Stereoskopie.",
    params: [{ k: "layers", label: "Tiefenebenen", min: 2, max: 8, def: 5 }, { k: "animate", label: "Beobachter pendelt", type: "check", def: true }],
    init(p) { p._d = null; },
    draw(ctx, w, h, p, t, reveal, io) {
      if (!p._d) { const r = rnd(4); p._d = Array.from({ length: 400 }, () => [r(), r(), r()]); }
      const obs = p.animate ? Math.sin(t * 0.8) * 0.5 + 0.5 : (io.inside ? io.x / w : 0.5);
      p._d.forEach(([fx, fy, fz]) => { const layer = Math.floor(fz * p.layers), depth = (layer + 1) / p.layers; const shift = (obs - 0.5) * w * 0.4 / depth; const x = ((fx * w + shift) % w + w) % w; circle(ctx, x, fy * h, 1.5 + 4 * (1 - depth), reveal ? hsl(depth * 240, 80, 60) : gray(120 + 135 * (1 - depth))); });
      if (reveal) badge(ctx, "Farbe = Tiefenebene (rot nah, blau fern)", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "zweite-ordnung", cat: "bewegung", name: "Bewegung zweiter Ordnung", short: "Bewegung ohne bewegte Helligkeit",
    hint: "Das Rauschen steht still. Nur sein Kontrast wird streifenweise verstärkt und abgeschwächt – und diese Kontrast-Welle wandert. Du siehst klar eine Bewegung, obwohl kein einziges Pixel wandert.",
    desc: "Bewegung zweiter Ordnung: Das Sehsystem erkennt Bewegung von Kontrast- oder Texturgrenzen, nicht nur von Helligkeitskanten (Cavanagh & Mather, 1989).",
    why: "Reichardt-Detektoren erster Ordnung würden hier versagen, weil die mittlere Helligkeit überall gleich bleibt. Ein zweiter Verarbeitungsweg gleichrichtet das Signal (Kontrast-Energie) und erkennt darauf Bewegung – vermutlich in den Arealen V2/V3 und MT.",
    params: [{ k: "speed", label: "Tempo", min: 10, max: 150, def: 60 }, { k: "per", label: "Streifenbreite", min: 30, max: 160, def: 80 }, { k: "depth", label: "Modulationstiefe", min: 0, max: 1, step: 0.01, def: 0.9 }],
    init(p) { p._n = null; },
    draw(ctx, w, h, p, t, reveal) {
      const sc = 3, W = Math.ceil(w / sc), Hh = Math.ceil(h / sc); const off = H.offscreen(p, "so", W, Hh), octx = off.getContext("2d");
      if (!p._n || p._n.length !== W * Hh) { const r = rnd(77); p._n = Float32Array.from({ length: W * Hh }, () => (r() < 0.5 ? -1 : 1)); p._img = octx.createImageData(W, Hh); }
      const d = p._img.data, k = TAU / (p.per / sc), ph = t * p.speed / sc;
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const c = 0.5 + 0.5 * p.depth * Math.sin(k * (x - ph)); const v = 128 + p._n[y * W + x] * c * 120; const i = (y * W + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      octx.putImageData(p._img, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, w, h);
      if (reveal) badge(ctx, "Mittlere Helligkeit überall 128 – nur der Kontrast wandert", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "animacy", cat: "bewegung", name: "Belebtheit (Verfolgungsjagd)", short: "Punkte mit Absichten",
    hint: "Zwei Punkte. Einer „jagt“ den anderen – und sofort sieht man Absicht, Angst und Flucht. Dreh die Verfolgungsstärke auf null: Nur noch zufälliges Treiben. Ab welchem Wert wird es lebendig? (Heider & Simmel, 1944)",
    desc: "Das Sehsystem schreibt bewegten Formen Belebtheit und Absichten zu, sobald ihre Bewegung auf einander bezogen ist.",
    why: "Spezialisierte Mechanismen (u. a. im Sulcus temporalis superior) erkennen „Verfolgung“ an Korrelationen wie Richtungsanpassung und Beschleunigung – evolutionär entscheidend, um Räuber und Beute auseinanderzuhalten.",
    params: [{ k: "chase", label: "Verfolgungsstärke", min: 0, max: 1, step: 0.01, def: 0.8 }, { k: "speed", label: "Tempo", min: 50, max: 300, def: 150 }],
    init(p) { p._a = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._a) { p._a = { x: w * 0.3, y: h * 0.5, vx: 1, vy: 0 }; p._b = { x: w * 0.7, y: h * 0.5, vx: -1, vy: 0.3 }; p._t = t; }
      const dt = Math.min(0.05, t - p._t); p._t = t; const A = p._a, B = p._b;
      // B flieht vor A, A jagt B – jeweils gemischt mit Zufall
      const steer = (o, tx, ty, sign) => { const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy) || 1; o.vx += (sign * dx / d * p.chase + (Math.random() - 0.5) * (1 - p.chase * 0.7)) * dt * 6; o.vy += (sign * dy / d * p.chase + (Math.random() - 0.5) * (1 - p.chase * 0.7)) * dt * 6; const n = Math.hypot(o.vx, o.vy) || 1; o.vx /= n; o.vy /= n; };
      steer(A, B.x, B.y, 1); steer(B, A.x, A.y, -1);
      [A, B].forEach((o, i) => { const sp = p.speed * (i ? 1.05 : 1); o.x += o.vx * sp * dt; o.y += o.vy * sp * dt; if (o.x < 30) { o.x = 30; o.vx = Math.abs(o.vx); } if (o.x > w - 30) { o.x = w - 30; o.vx = -Math.abs(o.vx); } if (o.y < 30) { o.y = 30; o.vy = Math.abs(o.vy); } if (o.y > h - 30) { o.y = h - 30; o.vy = -Math.abs(o.vy); } });
      circle(ctx, A.x, A.y, 14, "#e63946"); circle(ctx, B.x, B.y, 11, "#5ec8ff");
      if (reveal) { ctx.save(); ctx.setLineDash([4, 4]); line(ctx, A.x, A.y, B.x, B.y, "#888", 1); ctx.restore(); badge(ctx, "Rot steuert auf Blau zu, Blau steuert weg – mehr ist es nicht", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "bewegungsquartett", cat: "bewegung", name: "Bewegungsquartett", short: "Waagerecht oder senkrecht?",
    hint: "Zwei Punkte springen zwischen den Ecken eines Rechtecks. Du siehst sie entweder waagerecht oder senkrecht pendeln – nie beides. Verändere das Seitenverhältnis: Die kürzere Strecke gewinnt. Bei 1:1 kippt die Wahrnehmung spontan.",
    desc: "Das Bewegungsquartett ist ein bistabiler Reiz der Bewegungs-Korrespondenz: Das Gehirn muss entscheiden, welcher Punkt zu welchem gehört (Ramachandran & Anstis, 1983).",
    why: "Korrespondenz wird nach dem Prinzip der kürzesten Distanz gelöst – und global konsistent: Beide Punkte müssen dieselbe Lösung wählen. Sind beide Wege gleich lang, wechseln die Deutungen alle paar Sekunden, ähnlich wie beim Necker-Würfel.",
    params: [{ k: "ratio", label: "Seitenverhältnis (Höhe/Breite)", min: 0.4, max: 2.5, step: 0.05, def: 1 }, { k: "hz", label: "Takt", min: 1, max: 8, step: 0.5, def: 3, unit: " Hz" }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.25, hw = S, hh = S * p.ratio, f = Math.floor(t * p.hz) % 2;
      const pts = f ? [[cx - hw, cy - hh], [cx + hw, cy + hh]] : [[cx + hw, cy - hh], [cx - hw, cy + hh]];
      pts.forEach(([x, y]) => circle(ctx, x, y, 18, "#fff"));
      if (reveal) { ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 1.5; ctx.strokeRect(cx - hw, cy - hh, 2 * hw, 2 * hh); ctx.restore(); badge(ctx, "Waagerechte Strecke " + Math.round(2 * hw) + " px · senkrechte " + Math.round(2 * hh) + " px", cx, h - 26); }
    }
  });

  addIllusion({
    id: "positionsverschiebung", cat: "bewegung", name: "Bewegungsbedingte Positionsverschiebung", short: "Bewegung verschiebt den Ort",
    hint: "Zwei Fenster mit Streifen, die nach außen bzw. innen driften. Die Fenster selbst stehen exakt übereinander – doch sie scheinen gegeneinander versetzt. Kehre die Richtung um: Der Versatz springt zur anderen Seite (De Valois & De Valois, 1991).",
    desc: "Bewegung innerhalb eines Objekts verschiebt seine wahrgenommene Position in Bewegungsrichtung.",
    why: "Bewegungssignale aus MT fließen zurück in die Ortsrepräsentation früher Areale. Das Sehsystem extrapoliert, wo ein bewegtes Objekt „gleich“ sein wird – nützlich beim Fangen eines Balls, irreführend bei ortsfesten Fenstern.",
    params: [{ k: "speed", label: "Drifttempo", min: 20, max: 200, def: 90 }, { k: "flip", label: "Richtung umkehren", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, R = Math.min(w, h) * 0.14, per = 24, dir = p.flip ? -1 : 1;
      [[h * 0.35, 1], [h * 0.65, -1]].forEach(([cy, s]) => {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); const off = (t * p.speed * s * dir) % per;
        for (let x = cx - R - per * 2 + off; x < cx + R + per; x += per) rect(ctx, x, cy - R, per / 2, 2 * R, "#fff");
        const g = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,1)"); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
      });
      if (reveal) { line(ctx, cx, h * 0.2, cx, h * 0.8, "#ff3b3b", 1.5); badge(ctx, "Beide Fenster sind exakt mittig übereinander", cx, h - 26); }
    }
  });
})();
