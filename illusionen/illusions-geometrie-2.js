// Kategorie: Größe & Form – Teil 2
(function () {
  const { TAU, line, circle, rect, poly, text, measure, badge, clamp, gray } = H;

  addIllusion({
    id: "oppel-kundt", cat: "geometrie", name: "Oppel-Kundt-Täuschung", short: "Gefüllter Raum wirkt länger",
    hint: "Beide Abschnitte sind gleich lang. Der mit vielen Strichen gefüllte wirkt länger. Verändere die Strichdichte.",
    desc: "Eine unterteilte Strecke erscheint länger als eine gleich lange leere Strecke.",
    why: "Jede Unterteilung wird vom Sehsystem als zusätzliche „Information“ gezählt. Mehr Struktur wird als mehr Ausdehnung gelesen – das Gegenteil der Unterteilung bei der Vertikal-Horizontal-Täuschung, bei der eine Halbierung kürzer wirkt.",
    params: [{ k: "n", label: "Striche", min: 2, max: 40, def: 14 }, { k: "animate", label: "Dichte animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const L = Math.min(w * 0.4, 360), cy = h / 2, x0 = w / 2 - L, n = p.animate ? Math.round(2 + 38 * (0.5 + 0.5 * Math.sin(t * 0.8))) : p.n;
      line(ctx, x0, cy, x0 + 2 * L, cy, "#555", 1);
      [x0, x0 + L, x0 + 2 * L].forEach((x) => line(ctx, x, cy - 40, x, cy + 40, "#fff", 3));
      for (let i = 1; i < n; i++) { const x = x0 + L * i / n; line(ctx, x, cy - 30, x, cy + 30, "#fff", 2); }
      if (reveal) { measure(ctx, x0, cy + 70, x0 + L, cy + 70, Math.round(L) + " px"); measure(ctx, x0 + L, cy + 70, x0 + 2 * L, cy + 70, Math.round(L) + " px"); }
    }
  });

  addIllusion({
    id: "helmholtz", cat: "geometrie", name: "Helmholtz-Quadrate", short: "Streifen machen schlank – andersherum",
    hint: "Beide Quadrate sind exakt gleich groß. Das mit waagerechten Streifen wirkt höher und schmaler, das mit senkrechten breiter.",
    desc: "Ein Quadrat mit waagerechten Streifen erscheint hochkant, eines mit senkrechten Streifen breit – entgegen der Mode-Weisheit.",
    why: "Die Ausdehnung wird in Richtung der wiederholten Elemente überschätzt (Oppel-Kundt-Effekt): Viele waagerechte Streifen stapeln sich scheinbar höher.",
    params: [{ k: "n", label: "Streifen", min: 3, max: 20, def: 8 }, { k: "animate", label: "Streifen wechseln", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w, h) * 0.38, cy = h / 2, k = p.animate && Math.floor(t) % 2 ? 1 : 0;
      [[w * 0.28, k], [w * 0.72, 1 - k]].forEach(([cx, horiz]) => {
        ctx.save(); ctx.beginPath(); ctx.rect(cx - S / 2, cy - S / 2, S, S); ctx.clip();
        for (let i = 0; i < p.n; i++) { const a = (i + 0.25) * S / p.n, b = S / p.n * 0.5; if (horiz) rect(ctx, cx - S / 2, cy - S / 2 + a, S, b, "#fff"); else rect(ctx, cx - S / 2 + a, cy - S / 2, b, S, "#fff"); }
        ctx.restore();
        if (reveal) { ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 2; ctx.strokeRect(cx - S / 2, cy - S / 2, S, S); }
      });
      if (reveal) badge(ctx, "Beide Quadrate: " + Math.round(S) + " × " + Math.round(S) + " px", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "tilt", cat: "geometrie", name: "Kipp-Täuschung (Tilt Illusion)", short: "Umgebung neigt die Mitte",
    hint: "Das innere Gitter ist exakt senkrecht. Das umgebende, geneigte Gitter lässt es in die Gegenrichtung kippen. Verändere die Neigung der Umgebung.",
    desc: "Ein senkrechtes Streifenmuster erscheint gegen die Neigung eines umgebenden Musters gekippt.",
    why: "Orientierungsneuronen im Sehkortex hemmen sich gegenseitig. Die Zellen für „15° geneigt“ sind durch die Umgebung aktiv und unterdrücken ihre Nachbarn – die Verteilung der Antworten auf das senkrechte Muster verschiebt sich in die Gegenrichtung.",
    params: [{ k: "tilt", label: "Neigung Umgebung", min: -45, max: 45, def: 15, unit: "°" }, { k: "animate", label: "Neigung animieren", type: "check", def: true }],
    bg: "#888",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42, r = R * 0.4, tilt = (p.animate ? 25 * Math.sin(t * 0.7) : p.tilt) * Math.PI / 180;
      const grating = (rad, ang) => { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.clip(); ctx.translate(cx, cy); ctx.rotate(ang); for (let x = -rad - 20; x < rad + 20; x += 20) rect(ctx, x, -rad - 20, 10, 2 * rad + 40, "#fff"); ctx.restore(); };
      rect(ctx, 0, 0, w, h, "#888"); grating(R, tilt); circle(ctx, cx, cy, r + 4, "#888"); grating(r, 0);
      if (reveal) { line(ctx, cx, cy - R, cx, cy + R, "#ff3b3b", 2); badge(ctx, "Rote Linie: exakt senkrecht, parallel zum Innengitter", cx, h - 26); }
    }
  });

  addIllusion({
    id: "kruemmungsblindheit", cat: "geometrie", name: "Krümmungsblindheit", short: "Wellen, die zu Zacken werden",
    hint: "Alle Linien sind identische, sanfte Wellen. Auf dem grauen Mittelstreifen wirken die Linien mit Farbwechsel an den Flanken wie Zickzack (Takahashi, 2017).",
    desc: "Jede zweite Wellenlinie erscheint auf grauem Grund als Zickzack-Linie – obwohl alle Linien dieselbe weiche Sinusform haben.",
    why: "Wechselt der Kontrast genau an den Wendepunkten, fehlen dem Sehsystem die Hinweise auf Krümmung. Es fällt auf die „Standardannahme“ Ecke zurück. Auf schwarzem oder weißem Grund bleibt der Kontrast an den Kurven erhalten.",
    params: [{ k: "amp", label: "Wellenhöhe", min: 5, max: 30, def: 14 }, { k: "per", label: "Wellenlänge", min: 40, max: 140, def: 80 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      rect(ctx, 0, 0, w, h * 0.3, "#000"); rect(ctx, 0, h * 0.3, w, h * 0.4, "#8c8c8c"); rect(ctx, 0, h * 0.7, w, h * 0.3, "#fff");
      const rows = 10, gap = h / (rows + 1);
      for (let r = 0; r < rows; r++) {
        const y0 = gap * (r + 1), phaseType = r % 2; // 0: Farbwechsel an den Scheiteln (wirkt wellig), 1: an den Flanken (wirkt zackig)
        for (let x = 0; x < w; x += 4) {
          const ph = (x / p.per) * TAU, y = y0 + Math.sin(ph) * p.amp;
          const seg = Math.floor((ph + (phaseType ? 0 : Math.PI / 2)) / Math.PI);
          ctx.strokeStyle = reveal ? "#ff3b3b" : seg % 2 ? "#ddd" : "#333"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y0 + Math.sin(((x + 4) / p.per) * TAU) * p.amp); ctx.stroke();
        }
      }
      if (reveal) badge(ctx, "Alle Linien: identische Sinuswellen", w / 2, h / 2);
    }
  });

  addIllusion({
    id: "schiefer-turm", cat: "geometrie", name: "Schiefer-Turm-Täuschung", short: "Zwei identische Bilder, zwei Neigungen",
    hint: "Beide Türme sind pixelgleiche Kopien. Der rechte scheint stärker zu kippen. Verändere die Neigung – der Unterschied bleibt.",
    desc: "Zwei identische Bilder eines schiefen Turms nebeneinander: Der rechte wirkt deutlich schräger (Kingdom, Yoonessi & Gheorghiu, 2007).",
    why: "Das Gehirn behandelt beide Bilder als eine Szene. Zwei parallel stehende Türme müssten perspektivisch zum Fluchtpunkt zusammenlaufen. Tun sie das nicht, werden sie als divergierend – also unterschiedlich geneigt – gesehen.",
    params: [{ k: "lean", label: "Neigung", min: 0, max: 25, def: 12, unit: "°" }, { k: "animate", label: "Neigung schwanken", type: "check", def: false }],
    bg: "#9fc5e8",
    draw(ctx, w, h, p, t, reveal) {
      const lean = (p.animate ? 12 + 8 * Math.sin(t) : p.lean) * Math.PI / 180, H0 = h * 0.72, baseW = Math.min(w, h) * 0.16, topW = baseW * 0.62;
      rect(ctx, 0, h * 0.85, w, h * 0.15, "#6b8e4e");
      const tower = (bx) => {
        const by = h * 0.86, tx = bx + Math.sin(lean) * H0, ty = by - Math.cos(lean) * H0;
        const dx = Math.cos(lean), dy = Math.sin(lean);
        poly(ctx, [[bx - baseW / 2 * dx, by - baseW / 2 * dy], [bx + baseW / 2 * dx, by + baseW / 2 * dy], [tx + topW / 2 * dx, ty + topW / 2 * dy], [tx - topW / 2 * dx, ty - topW / 2 * dy]], "#e8d9b5", "#5a4a30", 2);
        for (let k = 0; k < 8; k++) { const f = (k + 0.5) / 8, cxk = bx + (tx - bx) * f, cyk = by + (ty - by) * f, ww = baseW + (topW - baseW) * f; for (let j = -1; j <= 1; j++) { const x = cxk + j * ww * 0.28 * dx, y = cyk + j * ww * 0.28 * dy; ctx.save(); ctx.translate(x, y); ctx.rotate(lean); rect(ctx, -3, -7, 6, 14, "#5a4a30"); ctx.restore(); } }
      };
      tower(w * 0.3); tower(w * 0.62);
      line(ctx, w / 2 - 6, 0, w / 2 - 6, h, "#9fc5e8", 12);
      if (reveal) { ctx.save(); ctx.setLineDash([6, 4]); [w * 0.3, w * 0.62].forEach((bx) => line(ctx, bx, h * 0.86, bx + Math.sin(lean) * H0, h * 0.86 - Math.cos(lean) * H0, "#ff3b3b", 2)); ctx.restore(); badge(ctx, "Beide Achsen: exakt " + Math.round(lean * 180 / Math.PI) + "° geneigt, parallel", w / 2, h * 0.06); }
    }
  });

  addIllusion({
    id: "beule", cat: "geometrie", name: "Beulen-Schachbrett (Kitaoka)", short: "Flaches Brett wölbt sich",
    hint: "Alle Kacheln sind exakt quadratisch, alle Linien gerade. Kleine Quadrate an den Ecken erzeugen eine scheinbare Wölbung. Verändere ihre Größe.",
    desc: "Ein gewöhnliches Schachbrett scheint sich in der Mitte vorzuwölben.",
    why: "Die kleinen Eckquadrate erzeugen lokal leicht geneigte Kanteneindrücke (verwandt mit der Café-Wall-Täuschung). Diese Neigungen werden zu einer globalen Krümmung integriert.",
    params: [{ k: "sz", label: "Eckquadrat-Größe", min: 0, max: 0.45, step: 0.01, def: 0.2 }, { k: "rad", label: "Beulen-Radius", min: 0.2, max: 0.6, step: 0.01, def: 0.42 }, { k: "animate", label: "Pulsieren", type: "check", def: true }],
    bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const n = 14, S = Math.min(w, h) / n, ox = (w - S * n) / 2, oy = (h - S * n) / 2, cx = w / 2, cy = h / 2;
      const sz = (p.animate ? 0.5 + 0.5 * Math.sin(t * 1.2) : 1) * p.sz * S, R = p.rad * Math.min(w, h);
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const x = ox + c * S, y = oy + r * S, dark = (r + c) % 2 === 0; rect(ctx, x, y, S + 0.5, S + 0.5, dark ? "#000" : "#fff");
        const dx = x + S / 2 - cx, dy = y + S / 2 - cy, d = Math.hypot(dx, dy); if (d > R || sz < 1) continue;
        const col = dark ? "#fff" : "#000"; const q = dx * dy < 0;
        // Zwei diagonal gegenüberliegende Ecken, je nach Quadrant
        if (q) { rect(ctx, x, y, sz, sz, col); rect(ctx, x + S - sz, y + S - sz, sz, sz, col); } else { rect(ctx, x + S - sz, y, sz, sz, col); rect(ctx, x, y + S - sz, sz, sz, col); }
      }
      if (reveal) { for (let i = 0; i <= n; i++) { line(ctx, ox + i * S, oy, ox + i * S, oy + n * S, "#ff3b3b", 1); line(ctx, ox, oy + i * S, ox + n * S, oy + i * S, "#ff3b3b", 1); } }
    }
  });

  addIllusion({
    id: "twisted-cord", cat: "geometrie", name: "Verdrilltes Seil (Twisted Cord)", short: "Waagerechte Linien laufen schief",
    hint: "Alle Linien sind exakt waagerecht und parallel. Die „verdrillten“ Segmente lassen sie abwechselnd auf- und absteigen.",
    desc: "Linien aus schräg gestellten Schwarz-Weiß-Segmenten erscheinen geneigt – obwohl sie waagerecht verlaufen (Fraser, 1908).",
    why: "Orientierungsneuronen reagieren auf die lokale Neigung der Segmente. Die globale Richtung der Linie wird aus diesen lokalen Signalen gemittelt – und dadurch verfälscht.",
    params: [{ k: "tilt", label: "Segmentneigung", min: 0, max: 45, def: 25, unit: "°" }, { k: "animate", label: "Neigung animieren", type: "check", def: true }],
    bg: "#7a7a7a",
    draw(ctx, w, h, p, t, reveal) {
      const rows = 7, gap = h / (rows + 1), tilt = (p.animate ? 25 * (0.5 + 0.5 * Math.sin(t * 0.8)) : p.tilt) * Math.PI / 180, seg = 22, lw = 7;
      for (let r = 0; r < rows; r++) {
        const y = gap * (r + 1), dir = r % 2 ? 1 : -1;
        for (let x = -seg; x < w + seg; x += seg) { const i = Math.round(x / seg); ctx.save(); ctx.translate(x, y); ctx.rotate(tilt * dir); rect(ctx, -seg / 2, -lw / 2, seg, lw, i % 2 ? "#fff" : "#000"); ctx.restore(); }
        if (reveal) line(ctx, 0, y, w, y, "#ff3b3b", 1.5);
      }
    }
  });

  addIllusion({
    id: "korridor", cat: "geometrie", name: "Korridor-Täuschung", short: "Gleich groß, verschieden fern",
    hint: "Die drei Figuren sind pixelgleich. Die hintere wirkt riesig, die vordere klein. Verschiebe die hintere Figur nach vorn – sie „schrumpft“.",
    desc: "Drei identische Figuren in einem perspektivischen Gang erscheinen unterschiedlich groß.",
    why: "Größenkonstanz: Das Gehirn skaliert Objekte nach ihrer geschätzten Entfernung. Gleiche Netzhautgröße bei größerer Entfernung bedeutet: Das Objekt muss größer sein.",
    params: [{ k: "pos", label: "Position hintere Figur", min: 0, max: 1, step: 0.01, def: 1 }, { k: "animate", label: "Figur wandern lassen", type: "check", def: true }],
    bg: "#222",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, vy = h * 0.3, floorY = h * 0.95;
      // Korridor: Boden, Wände, Fliesen
      for (let i = 0; i <= 12; i++) { const f = i / 12; const y = vy + (floorY - vy) * f * f; line(ctx, cx - w * 0.5 * f * f, y, cx + w * 0.5 * f * f, y, "#555", 1); }
      for (let i = -6; i <= 6; i++) line(ctx, cx, vy, cx + i * w * 0.12, floorY, "#555", 1);
      line(ctx, cx - w * 0.5, 0, cx, vy, "#777", 2); line(ctx, cx + w * 0.5, 0, cx, vy, "#777", 2);
      const fig = (x, y, S) => { circle(ctx, x, y - S * 1.2, S * 0.28, "#e9c46a"); rect(ctx, x - S * 0.3, y - S * 0.95, S * 0.6, S * 0.7, "#e76f51"); rect(ctx, x - S * 0.26, y - S * 0.3, S * 0.2, S * 0.3, "#264653"); rect(ctx, x + S * 0.06, y - S * 0.3, S * 0.2, S * 0.3, "#264653"); };
      const S = Math.min(w, h) * 0.13, pos = p.animate ? 0.5 + 0.5 * Math.sin(t * 0.6) : p.pos;
      const yFront = floorY - 10, yBack = vy + (floorY - vy) * 0.28, xBack = cx + w * 0.02;
      fig(cx - w * 0.25, yFront, S); fig(cx, yFront - (floorY - vy) * 0.3, S);
      fig(H.lerp(cx + w * 0.25, xBack, pos), H.lerp(yFront, yBack, pos), S);
      if (reveal) { [[cx - w * 0.25, yFront], [cx, yFront - (floorY - vy) * 0.3], [H.lerp(cx + w * 0.25, xBack, pos), H.lerp(yFront, yBack, pos)]].forEach(([x, y]) => { ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 1.5; ctx.strokeRect(x - S * 0.32, y - S * 1.5, S * 0.64, S * 1.5); }); badge(ctx, "Alle drei Figuren: " + Math.round(S * 1.5) + " px hoch", w / 2, h * 0.08); }
    }
  });
})();
