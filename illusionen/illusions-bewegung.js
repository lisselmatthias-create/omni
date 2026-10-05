// Kategorie: Bewegung
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;

  addIllusion({
    id: "schlangen", cat: "bewegung", name: "Rotierende Schlangen", short: "Stillstand, der sich dreht",
    hint: "Das Bild ist völlig statisch – nichts bewegt sich. Lass den Blick locker darüber wandern. Fixierst du eine Scheibe, bleibt sie stehen. Die Animation versetzt das Bild nur minimal, was den Effekt verstärkt.",
    desc: "Die Scheiben scheinen sich zu drehen, obwohl kein Pixel seine Position ändert (Kitaoka, 2003).",
    why: "Die Abfolge Schwarz → Dunkelblau → Weiß → Gelb erzeugt in den Bewegungsdetektoren ein asymmetrisches Signal: Starke Kontrastkanten werden schneller verarbeitet als schwache. Jede Augenbewegung wird so als Drehung fehlinterpretiert.",
    params: [{ k: "n", label: "Scheiben pro Zeile", min: 2, max: 6, def: 4 }, { k: "segs", label: "Segmente", min: 12, max: 40, def: 24 }, { k: "animate", label: "Leichtes Zittern", type: "check", def: true }],
    bg: "#2d2d2d",
    draw(ctx, w, h, p, t, reveal) {
      const cols = ["#000", "#1b2a8a", "#fff", "#ffd700"], n = p.n, S = Math.min(w / n, h / Math.ceil(n * h / w));
      const rows = Math.ceil(h / S), jx = p.animate ? Math.sin(t * 3.1) * 2 : 0, jy = p.animate ? Math.cos(t * 2.3) * 2 : 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < Math.ceil(w / S); c++) {
        const cx = c * S + S / 2 + jx, cy = r * S + S / 2 + jy, dir = (r + c) % 2 ? 1 : -1;
        for (let ring = 0; ring < 4; ring++) {
          const r0 = S * 0.48 * (ring / 4), r1 = S * 0.48 * ((ring + 1) / 4);
          for (let i = 0; i < p.segs; i++) {
            const a0 = (i / p.segs) * TAU * dir, a1 = ((i + 1) / p.segs) * TAU * dir;
            ctx.beginPath(); ctx.arc(cx, cy, r1, a0, a1, dir < 0); ctx.arc(cx, cy, r0, a1, a0, dir > 0); ctx.closePath();
            ctx.fillStyle = cols[(i + ring) % 4]; ctx.fill();
          }
        }
        circle(ctx, cx, cy, S * 0.06, "#2d2d2d");
      }
      if (reveal) { fixation(ctx, w / 2, h / 2, "#ff3b3b"); badge(ctx, "Kreuz fixieren: alles steht still", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "nachwirkung", cat: "bewegung", name: "Bewegungsnachwirkung", short: "Der Wasserfall-Effekt",
    hint: "Fixiere das Kreuz, während die Spirale sich dreht. Nach ca. 20 s stoppt sie – und scheint sich rückwärts zu bewegen. Danach auf eine Hand oder Wand schauen, die scheint ebenfalls zu „atmen“.",
    desc: "Nach längerem Betrachten einer Bewegung scheint ein ruhendes Bild in die Gegenrichtung zu driften.",
    why: "Bewegungssensitive Neuronen für eine Richtung ermüden. Ruht das Bild, überwiegt das Signal der Gegenrichtung – das Gehirn „sieht“ Bewegung ohne Reiz.",
    params: [{ k: "dur", label: "Adaptionsdauer", min: 8, max: 40, def: 20, unit: " s" }, { k: "speed", label: "Geschwindigkeit", min: 0.3, max: 3, step: 0.1, def: 1.2 }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const phase = t % (p.dur + 8), moving = phase < p.dur, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.48;
      const ph = moving ? phase * p.speed : p.dur * p.speed;
      for (let r = R; r > 2; r -= 1.2) { const k = Math.log(r) * 6 + ph * 2; const v = 128 + 127 * Math.sin(k); circle(ctx, cx, cy, r, null, gray(v), 1.5); }
      fixation(ctx, cx, cy, "#ff3b3b");
      text(ctx, moving ? "Noch " + Math.ceil(p.dur - phase) + " s – Kreuz fixieren" : "Stopp! Dreht sich das Bild zurück?", cx, h - 24, "#fff", 14);
    }
  });

  addIllusion({
    id: "stepping-feet", cat: "bewegung", name: "Stepping Feet", short: "Gleichmäßig oder im Takt?",
    hint: "Beide Balken bewegen sich exakt gleich schnell und gleichmäßig. Vor den Streifen scheinen sie abwechselnd zu „trippeln“. Schalte die Streifen aus – der Effekt verschwindet.",
    desc: "Ein gelber und ein blauer Balken gleiten gleich schnell über ein Streifenmuster, scheinen aber abwechselnd zu stoppen und zu springen (Anstis, 2003).",
    why: "Die wahrgenommene Geschwindigkeit hängt vom Kontrast ab: Liegt der gelbe Balken auf weißen Streifen (wenig Kontrast), scheint er langsamer; der blaue Balken ist dann auf schwarzen Streifen und ebenfalls kontrastarm – aber phasenversetzt.",
    params: [{ k: "stripes", label: "Streifen an", type: "check", def: true }, { k: "speed", label: "Geschwindigkeit", min: 20, max: 200, def: 80 }, { k: "sw", label: "Streifenbreite", min: 10, max: 40, def: 20 }],
    draw(ctx, w, h, p, t, reveal) {
      if (p.stripes) for (let x = 0; x < w; x += p.sw * 2) rect(ctx, x, 0, p.sw, h, "#fff"); else rect(ctx, 0, 0, w, h, "#777");
      const x = (t * p.speed) % (w + 200) - 100, bw = p.sw * 4, bh = h * 0.12;
      rect(ctx, x, h * 0.35, bw, bh, "#ffe600"); rect(ctx, x, h * 0.55, bw, bh, "#1a2bd0");
      if (reveal) { line(ctx, x, h * 0.25, x, h * 0.75, "#ff3b3b", 2); line(ctx, x + bw, h * 0.25, x + bw, h * 0.75, "#ff3b3b", 2); badge(ctx, "Beide Balken: identische Position & Tempo", w / 2, h * 0.9); }
    }
  });

  addIllusion({
    id: "lilac", cat: "bewegung", name: "Lilac Chaser", short: "Der grüne Punkt, den es nicht gibt",
    hint: "Fixiere das Kreuz. Erst siehst du eine rosa Lücke kreisen, dann einen grünen Punkt – und schließlich verschwinden die rosa Punkte ganz.",
    desc: "Zwölf rosa Flecken, von denen reihum einer kurz verschwindet. Nach wenigen Sekunden kreist ein grüner Punkt, und die rosa Flecken lösen sich auf.",
    why: "Drei Effekte zugleich: scheinbare Bewegung (Phi-Phänomen), negatives Nachbild (Grün als Gegenfarbe zu Rosa) und Troxler-Verblassen der weichen Flecken bei Fixation.",
    params: [{ k: "speed", label: "Tempo", min: 4, max: 16, def: 8, unit: " /s" }, { k: "blur", label: "Weichheit", min: 10, max: 60, def: 30 }],
    noReveal: true, bg: "#9e9e9e",
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.34, idx = Math.floor(t * p.speed) % 12;
      for (let i = 0; i < 12; i++) { if (i === idx) continue; const a = i / 12 * TAU, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; const g = ctx.createRadialGradient(x, y, 0, x, y, p.blur); g.addColorStop(0, "#f0a0f0"); g.addColorStop(0.5, "#e880e8"); g.addColorStop(1, "rgba(158,158,158,0)"); ctx.fillStyle = g; ctx.fillRect(x - p.blur, y - p.blur, p.blur * 2, p.blur * 2); }
      fixation(ctx, cx, cy, "#000");
    }
  });

  addIllusion({
    id: "ouchi", cat: "bewegung", name: "Ouchi-Täuschung", short: "Die schwebende Scheibe",
    hint: "Bewege den Blick oder den Kopf leicht. Die innere Scheibe scheint sich vom Hintergrund zu lösen und zu schwimmen. Die Animation verschiebt das Bild minimal.",
    desc: "Ein Kreis aus senkrechten Rechtecken in einem Feld aus waagerechten Rechtecken scheint sich unabhängig zu bewegen.",
    why: "Bewegungsdetektoren messen nur die Komponente senkrecht zur Kante (Aperturproblem). Unterschiedlich orientierte Muster liefern unterschiedliche Bewegungsvektoren – das Gehirn erklärt das durch zwei getrennte Flächen.",
    params: [{ k: "s", label: "Kachelgröße", min: 4, max: 16, def: 8 }, { k: "animate", label: "Zittern", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.3, s = p.s, jx = p.animate ? Math.sin(t * 7) * 3 : 0, jy = p.animate ? Math.cos(t * 5) * 2 : 0;
      ctx.save(); ctx.translate(jx, jy);
      for (let y = -s * 4; y < h + s * 4; y += s) for (let x = -s * 8; x < w + s * 8; x += s * 4) rect(ctx, x + ((y / s) % 2 ? s * 2 : 0), y, s * 2, s, "#000");
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); rect(ctx, cx - R, cy - R, 2 * R, 2 * R, "#fff");
      for (let x = cx - R; x < cx + R; x += s) for (let y = cy - R - s * 8; y < cy + R + s * 8; y += s * 4) rect(ctx, x, y + ((x / s) % 2 ? s * 2 : 0), s, s * 2, "#000");
      ctx.restore(); ctx.restore();
      if (reveal) circle(ctx, cx, cy, R, null, "#ff3b3b", 3);
    }
  });

  addIllusion({
    id: "pinna", cat: "bewegung", name: "Pinna-Brelstaff-Ringe", short: "Drehen beim Näherkommen",
    hint: "Fixiere das Zentrum. Die Animation zoomt das Bild – die Ringe scheinen gegenläufig zu rotieren. Mit dem Kopf vor- und zurückgehen wirkt noch stärker.",
    desc: "Zwei Ringe aus schräg gestellten Quadraten drehen sich scheinbar in Gegenrichtungen, wenn man sich dem Bild nähert oder entfernt.",
    why: "Die schrägen Kanten jedes Quadrats liefern bei radialer Bewegung (Zoom) eine tangentiale Bewegungskomponente (Aperturproblem). Die Richtung hängt von der Neigung ab – deshalb drehen die Ringe gegenläufig.",
    params: [{ k: "zoom", label: "Zoom-Stärke", min: 0, max: 0.5, step: 0.01, def: 0.25 }, { k: "tilt", label: "Neigung", min: 10, max: 60, def: 35, unit: "°" }],
    bg: "#8a8a8a",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42, z = 1 + p.zoom * Math.sin(t * 1.5), tilt = p.tilt * Math.PI / 180;
      ctx.translate(cx, cy); ctx.scale(z, z);
      [[R * 0.55, 20, 1], [R * 0.85, 30, -1]].forEach(([r, n, dir]) => {
        const sz = r * 0.17;
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU; ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r); ctx.rotate(a + tilt * dir);
          ctx.fillStyle = i % 2 ? "#fff" : "#000"; ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          ctx.lineWidth = sz * 0.25; ctx.strokeStyle = i % 2 ? "#000" : "#fff";
          ctx.beginPath(); ctx.moveTo(-sz / 2, -sz / 2); ctx.lineTo(sz / 2, -sz / 2); ctx.moveTo(-sz / 2, sz / 2); ctx.lineTo(sz / 2, sz / 2); ctx.stroke();
          ctx.restore();
        }
        if (reveal) circle(ctx, 0, 0, r, null, "#ff3b3b", 2);
      });
      fixation(ctx, 0, 0, "#000");
    }
  });

  addIllusion({
    id: "phi", cat: "bewegung", name: "Phi-Phänomen & Beta-Bewegung", short: "Aus Blinken wird Bewegung",
    hint: "Zwei Punkte blinken abwechselnd. Verändere die Taktrate: Bei ~2–10 Hz entsteht der Eindruck eines springenden Punkts. Zu schnell: beide stehen; zu langsam: zwei getrennte Blinker.",
    desc: "Zwei abwechselnd aufleuchtende Punkte wirken wie ein einziger Punkt, der hin- und herspringt – das Grundprinzip von Film und Leuchtreklame.",
    why: "Das Bewegungssystem integriert über Raum und Zeit. Liegen zwei Reize nah genug beieinander und folgen im richtigen Abstand, wird die einfachste Erklärung gewählt: ein bewegtes Objekt.",
    params: [{ k: "hz", label: "Takt", min: 0.5, max: 30, step: 0.5, def: 4, unit: " Hz" }, { k: "gap", label: "Abstand", min: 40, max: 500, def: 200 }, { k: "n", label: "Punkte", min: 2, max: 8, def: 2 }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const idx = Math.floor(t * p.hz) % p.n, cy = h / 2, total = p.gap * (p.n - 1), x0 = w / 2 - total / 2;
      for (let i = 0; i < p.n; i++) circle(ctx, x0 + i * p.gap, cy, 22, i === idx ? "#fff" : "#1a1a1a");
    }
  });

  addIllusion({
    id: "wagenrad", cat: "bewegung", name: "Wagenrad-Effekt", short: "Rückwärts drehende Räder",
    hint: "Das Rad dreht sich vorwärts, aber bei 30 Bildern/s und passender Drehzahl scheint es stillzustehen oder rückwärts zu laufen. Erhöhe die Drehzahl langsam.",
    desc: "Ein Speichenrad, stroboskopisch abgetastet, scheint stehen zu bleiben oder rückwärts zu laufen – wie Räder im Film.",
    why: "Aliasing: Dreht sich das Rad zwischen zwei Bildern um fast genau einen Speichenabstand, sieht das Gehirn die kürzere Verbindung – also eine kleine Rückwärtsdrehung.",
    params: [{ k: "rpm", label: "Drehzahl", min: 0, max: 20, step: 0.1, def: 3.5, unit: " U/s" }, { k: "fps", label: "Bildrate", min: 5, max: 60, def: 24, unit: " fps" }, { k: "spokes", label: "Speichen", min: 3, max: 16, def: 8 }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38, tq = Math.floor(t * p.fps) / p.fps, a = tq * p.rpm * TAU;
      circle(ctx, cx, cy, R, null, "#888", 10); ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      for (let i = 0; i < p.spokes; i++) { const b = i / p.spokes * TAU; line(ctx, 0, 0, Math.cos(b) * R, Math.sin(b) * R, "#fff", 5); }
      circle(ctx, Math.cos(0) * R * 0.85, 0, 9, "#ff3b3b"); ctx.restore();
      const perFrame = p.rpm / p.fps * p.spokes; const frac = perFrame - Math.round(perFrame);
      text(ctx, `Pro Bild: ${(perFrame).toFixed(2)} Speichenabstände → wirkt ${Math.abs(frac) < 0.02 ? "stehend" : frac > 0 ? "vorwärts" : "rückwärts"}`, cx, h - 24, "#9a9aa6", 13);
      if (reveal) badge(ctx, "Der rote Punkt zeigt die echte Drehung (immer vorwärts)", cx, 24);
    }
  });

  addIllusion({
    id: "barber", cat: "bewegung", name: "Barber-Pole-Effekt", short: "Streifen in die falsche Richtung",
    hint: "Die Streifen bewegen sich rein waagerecht. In einem hohen, schmalen Fenster scheinen sie nach oben zu laufen. Ändere das Seitenverhältnis des Fensters.",
    desc: "Diagonale Streifen hinter einem länglichen Fenster scheinen sich entlang der langen Fensterachse zu bewegen – egal wie sie sich wirklich bewegen.",
    why: "Aperturproblem: Durch ein Fenster ist nur die Bewegungskomponente senkrecht zum Streifen eindeutig. Die Enden der Streifen am Fensterrand liefern die „Lösung“ – und die läuft entlang der langen Seite.",
    params: [{ k: "ratio", label: "Fenster: Höhe/Breite", min: 0.2, max: 5, step: 0.1, def: 3 }, { k: "speed", label: "Tempo", min: 20, max: 200, def: 80 }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, base = Math.min(w, h) * 0.6, fw = p.ratio >= 1 ? base / p.ratio : base, fh = p.ratio >= 1 ? base : base * p.ratio;
      ctx.save(); ctx.beginPath(); ctx.rect(cx - fw / 2, cy - fh / 2, fw, fh); ctx.clip();
      const off = (t * p.speed) % 80; ctx.translate(cx + off, cy); ctx.rotate(Math.PI / 4);
      for (let i = -40; i < 40; i++) rect(ctx, i * 56, -2000, 28, 4000, i % 2 ? "#e63946" : "#fff");
      ctx.restore(); ctx.strokeStyle = "#555"; ctx.lineWidth = 4; ctx.strokeRect(cx - fw / 2, cy - fh / 2, fw, fh);
      if (reveal) { const ax = cx - fw / 2 - 60; line(ctx, ax - 25, cy, ax + 25, cy, "#5ec8ff", 3); poly(ctx, [[ax + 25, cy], [ax + 12, cy - 8], [ax + 12, cy + 8]], "#5ec8ff"); badge(ctx, "Echte Bewegung: rein waagerecht", cx, h - 26); }
    }
  });

  addIllusion({
    id: "mib", cat: "bewegung", name: "Bewegungsinduzierte Blindheit", short: "Gelbe Punkte verschwinden",
    hint: "Fixiere den grünen Punkt in der Mitte. Nach ein paar Sekunden verschwinden einzelne gelbe Punkte vollständig – obwohl sie die ganze Zeit da sind.",
    desc: "Drei helle, statische Punkte vor einem rotierenden Gitter blinken wahrnehmungsmäßig aus.",
    why: "Das Gehirn unterdrückt statische Reize, die von der dominanten Bewegungsfläche „verdeckt“ sein könnten – eine Art Fehlentscheidung bei der Figur-Grund-Trennung.",
    params: [{ k: "speed", label: "Drehtempo", min: 0.1, max: 2, step: 0.05, def: 0.5 }, { k: "density", label: "Gitterdichte", min: 4, max: 14, def: 8 }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, S = Math.max(w, h) * 1.5, g = S / p.density / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * p.speed);
      for (let x = -S / 2; x <= S / 2; x += g) for (let y = -S / 2; y <= S / 2; y += g) circle(ctx, x, y, 3, "#4a6cff");
      ctx.restore();
      const R = Math.min(w, h) * 0.25; [[-R, -R * 0.6], [R, -R * 0.6], [0, R * 0.7]].forEach(([dx, dy]) => circle(ctx, cx + dx, cy + dy, 9, "#ffe600"));
      circle(ctx, cx, cy, 6, "#3cff5a");
    }
  });

  addIllusion({
    id: "flash-lag", cat: "bewegung", name: "Flash-Lag-Effekt", short: "Der Blitz hinkt hinterher",
    hint: "Ein Ring kreist; immer wenn er oben ist, blitzt im Ring ein Punkt auf. Der Punkt liegt exakt in der Ringmitte – scheint aber hinter dem Ring zu liegen.",
    desc: "Ein kurz aufblitzender Reiz, der exakt mit einem bewegten Objekt ausgerichtet ist, wird als dahinterliegend wahrgenommen.",
    why: "Das Gehirn extrapoliert die Position bewegter Objekte in die Zukunft, um Verarbeitungsverzögerungen auszugleichen – oder es integriert nach dem Blitz noch ~80 ms Bewegung weiter. Welche Erklärung stimmt, wird noch diskutiert.",
    params: [{ k: "speed", label: "Tempo", min: 0.3, max: 2, step: 0.1, def: 0.8 }, { k: "flash", label: "Blitzdauer", min: 10, max: 200, def: 40, unit: " ms" }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.33, a = t * p.speed * TAU, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      circle(ctx, cx, cy, R, null, "#333", 1);
      circle(ctx, x, y, 28, null, "#fff", 3);
      const phase = (t * p.speed) % 1; if (phase < p.flash / 1000 * p.speed) circle(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 10, "#ffe600");
      if (reveal) { circle(ctx, x, y, 3, "#ff3b3b"); badge(ctx, "Blitz immer exakt in Ringmitte (bei 0°)", cx, h - 26); }
    }
  });

  addIllusion({
    id: "atmendes-quadrat", cat: "bewegung", name: "Atmendes Quadrat", short: "Rotation wird zu Pulsieren",
    hint: "Ein Quadrat dreht sich hinter vier Kreislöchern. Das Quadrat ändert nie seine Größe – es scheint aber zu wachsen und zu schrumpfen.",
    desc: "Ein rotierendes Quadrat, nur durch vier runde Öffnungen sichtbar, scheint zu atmen.",
    why: "Durch die Öffnungen sind die Ecken verdeckt. Das Gehirn muss die Form aus den sichtbaren Kantenstücken rekonstruieren – und wählt die Lösung mit ruhenden Kanten statt rotierenden.",
    params: [{ k: "speed", label: "Drehtempo", min: 0.1, max: 2, step: 0.05, def: 0.5 }, { k: "hole", label: "Lochgröße", min: 0.2, max: 0.6, step: 0.01, def: 0.38 }],
    bg: "#bbb",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.5, hr = S * p.hole;
      const holes = [[-S * 0.5, -S * 0.5], [S * 0.5, -S * 0.5], [-S * 0.5, S * 0.5], [S * 0.5, S * 0.5]];
      ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); holes.forEach(([x, y]) => { ctx.moveTo(x + hr, y); ctx.arc(x, y, hr, 0, TAU); }); if (!reveal) ctx.clip();
      rect(ctx, -S, -S, 2 * S, 2 * S, "#fff"); ctx.rotate(t * p.speed);
      ctx.fillStyle = "#1565c0"; ctx.fillRect(-S / 2, -S / 2, S, S); ctx.restore();
      if (reveal) badge(ctx, "Ohne Masken: das Quadrat bleibt konstant groß", cx, h - 26);
    }
  });

  addIllusion({
    id: "enigma", cat: "bewegung", name: "Enigma (Leviant)", short: "Flimmernde Ringe",
    hint: "Fixiere das Zentrum. In den grauen Ringen entsteht ein schnelles Flimmern oder Strömen, obwohl das Bild statisch ist.",
    desc: "Grau gefärbte Ringe über einem Strahlenmuster scheinen zu strömen und zu flimmern (Isia Leviant, 1981).",
    why: "Mikrosakkaden verschieben das hochkontrastige Strahlenmuster minimal; die Bewegungsdetektoren reagieren darauf und projizieren Bewegung in die kontrastlosen Ringe.",
    params: [{ k: "rays", label: "Strahlen", min: 40, max: 200, def: 120 }, { k: "rings", label: "Ringe", min: 1, max: 4, def: 3 }],
    anim: false, noReveal: true,
    draw(ctx, w, h, p) {
      const cx = w / 2, cy = h / 2, R = Math.hypot(w, h);
      for (let i = 0; i < p.rays; i++) { const a0 = i / p.rays * TAU, a1 = (i + 1) / p.rays * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.fillStyle = i % 2 ? "#000" : "#fff"; ctx.fill(); }
      const base = Math.min(w, h) * 0.12; for (let k = 0; k < p.rings; k++) circle(ctx, cx, cy, base * (1.2 + k * 1.1), null, k % 2 ? "#6a6aa8" : "#8a8a8a", base * 0.45);
      circle(ctx, cx, cy, base * 0.5, "#8a8a8a"); fixation(ctx, cx, cy, "#000");
    }
  });
})();
