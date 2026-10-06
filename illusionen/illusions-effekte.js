// Kategorie: Sehen & Gehirn – Wahrnehmungseffekte
(function () {
  const { TAU, line, circle, rect, poly, text, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "veraenderungsblindheit", cat: "effekte", name: "Veränderungsblindheit", short: "Finde den Unterschied",
    hint: "Zwei Bilder wechseln sich ab – eines davon hat ein verändertes Element. Mit kurzer Dunkelpause dazwischen ist es extrem schwer zu finden. Schalte die Pause aus: Die Änderung springt sofort ins Auge. „Neu mischen“ über Reset.",
    desc: "Eine deutliche Änderung in einer Szene bleibt unbemerkt, wenn ein kurzer Blank den Bewegungshinweis unterdrückt (Rensink, 1997).",
    why: "Wir speichern viel weniger Bilddetails als wir glauben. Ohne Bewegungs-Transienten, die die Aufmerksamkeit auf die Stelle lenken, muss man die Szene Objekt für Objekt durchsuchen.",
    params: [{ k: "blank", label: "Dunkelpause", type: "check", def: true }, { k: "n", label: "Objekte", min: 6, max: 24, def: 14 }, { k: "what", label: "Art der Änderung", type: "select", def: "color", options: [["color", "Farbe"], ["pos", "Position"], ["gone", "Verschwinden"]] }],
    init(p) { p._scene = null; p._seed = Math.floor(Math.random() * 1e6); },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._scene || p._scene.length !== p.n) { const r = rnd(p._seed); p._scene = Array.from({ length: p.n }, (_, i) => ({ x: 0.08 + 0.84 * r(), y: 0.1 + 0.8 * r(), s: 18 + r() * 22, hue: Math.floor(r() * 360), shape: Math.floor(r() * 3) })); p._target = Math.floor(r() * p.n); }
      const cyc = p.blank ? 2.4 : 2, ph = t % cyc; const blank = p.blank && ((ph > 1 && ph < 1.2) || ph > 2.2); const B = ph < 1 || (p.blank && ph > 2.2) ? 0 : 1;
      rect(ctx, 0, 0, w, h, "#111"); if (blank) return;
      p._scene.forEach((o, i) => {
        let { x, y, s, hue } = o; x *= w; y *= h; const isT = i === p._target;
        if (isT && B) { if (p.what === "color") hue = (hue + 150) % 360; if (p.what === "pos") x += 60; if (p.what === "gone") return; }
        const col = hsl(hue, 70, 55);
        if (o.shape === 0) circle(ctx, x, y, s, col); else if (o.shape === 1) rect(ctx, x - s, y - s, 2 * s, 2 * s, col); else poly(ctx, [[x, y - s], [x + s, y + s], [x - s, y + s]], col);
        if (reveal && isT) circle(ctx, x, y, s + 10, null, "#ff3b3b", 3);
      });
    }
  });

  addIllusion({
    id: "crowding", cat: "effekte", name: "Crowding (Gedränge)", short: "Buchstaben im Augenwinkel",
    hint: "Fixiere das Kreuz links. Den mittleren Buchstaben rechts kannst du allein gut lesen – mit Nachbarn ringsum nicht mehr, obwohl er genauso groß ist. Flanker ein/aus vergleichen.",
    desc: "Ein Objekt im peripheren Sehen wird unleserlich, sobald andere Objekte in der Nähe stehen – obwohl es allein problemlos erkennbar wäre.",
    why: "Im peripheren Sehen werden Merkmale über größere Bereiche „gepoolt“. Die Integrationszone wächst mit der Exzentrizität (Bouma-Gesetz: etwa halbe Exzentrizität), Nachbarn verschmelzen mit dem Ziel.",
    params: [{ k: "flank", label: "Nachbarn (Flanker)", type: "check", def: true }, { k: "ecc", label: "Abstand vom Kreuz", min: 100, max: 500, def: 300 }, { k: "sp", label: "Flanker-Abstand", min: 20, max: 120, def: 40 }, { k: "size", label: "Buchstabengröße", min: 14, max: 48, def: 26 }],
    init(p) { const L = "ABCDEFGHKMNPRSTUVXYZ"; const r = rnd(Math.floor(Math.random() * 1e6)); p._t = L[Math.floor(r() * L.length)]; p._f = Array.from({ length: 8 }, () => L[Math.floor(r() * L.length)]); },
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const cy = h / 2, fx = w / 2 - p.ecc / 2, tx = fx + p.ecc; fixation(ctx, fx, cy, "#ff3b3b");
      text(ctx, p._t, tx, cy, "#fff", p.size);
      if (p.flank) [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(([dx, dy], i) => text(ctx, p._f[i], tx + dx * p.sp, cy + dy * p.sp, "#fff", p.size));
      if (reveal) { text(ctx, "Der Zielbuchstabe ist: " + p._t, w / 2, h - 60, "#5ec8ff", 20); badge(ctx, "Reset wählt neue Buchstaben", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "flimmerfusion", cat: "effekte", name: "Flimmerverschmelzung", short: "Wann wird Flackern zu Licht?",
    hint: "Die linke Scheibe wechselt zwischen Schwarz und Weiß, die rechte ist konstant grau. Erhöhe die Frequenz, bis das Flackern verschwindet – die Scheiben sehen dann gleich aus. Hinweis: Die Bildschirmrate (meist 60 Hz) begrenzt echtes Flackern auf 30 Hz.",
    desc: "Oberhalb der Flimmerverschmelzungsfrequenz (ca. 25–60 Hz, abhängig von Helligkeit und Blickwinkel) wird ein flackerndes Licht als gleichmäßig wahrgenommen.",
    why: "Photorezeptoren und nachgeschaltete Neuronen integrieren Licht über einige Millisekunden. Schnellere Wechsel werden zeitlich verschmiert – die Grundlage von Film, Fernsehen und LED-Dimmung.",
    params: [{ k: "hz", label: "Frequenz", min: 1, max: 30, step: 0.5, def: 6, unit: " Hz" }, { k: "lum", label: "Helligkeit", min: 60, max: 255, def: 255 }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const on = Math.floor(t * p.hz * 2) % 2 === 0, R = Math.min(w, h) * 0.22, cy = h / 2;
      circle(ctx, w * 0.3, cy, R, on ? gray(p.lum) : "#000"); circle(ctx, w * 0.7, cy, R, gray(p.lum / 2));
      text(ctx, "flackert mit " + p.hz + " Hz", w * 0.3, cy + R + 30, "#9a9aa6", 13); text(ctx, "konstantes Mittelgrau", w * 0.7, cy + R + 30, "#9a9aa6", 13);
    }
  });

  addIllusion({
    id: "autostereogramm", cat: "effekte", name: "Autostereogramm (Magic Eye)", short: "3D aus Punktrauschen",
    hint: "Schau „durch“ den Bildschirm, als läge das Ziel weit dahinter (Augen entspannen, Blick parallel). Wenn sich die beiden Punkte oben zu dreien verdoppeln, bist du richtig – dann taucht eine Form räumlich aus dem Rauschen auf.",
    desc: "Ein Zufallspunktbild, dessen Wiederholungsmuster leicht variiert, zeigt bei parallelem Blick eine dreidimensionale Form (Tyler & Clarke, 1990).",
    why: "Jedes Auge bekommt eine leicht andere Spalte des sich wiederholenden Musters. Die Abweichungen der Wiederholungsabstände werden vom Gehirn als Querdisparität – also als Tiefe – gelesen.",
    params: [{ k: "shape", label: "Verborgene Form", type: "select", def: "ring", options: [["ring", "Ring"], ["kugel", "Kugel"], ["pyramide", "Pyramide"], ["welle", "Welle"]] }, { k: "depth", label: "Tiefe", min: 4, max: 24, def: 12 }, { k: "sep", label: "Wiederholabstand", min: 40, max: 120, def: 80 }],
    anim: false,
    init(p) { p._img = null; p._key = ""; },
    draw(ctx, w, h, p, t, reveal) {
      const W = Math.min(900, Math.floor(w)), Hh = Math.min(700, Math.floor(h)), key = [W, Hh, p.shape, p.depth, p.sep].join(",");
      if (p._key !== key) {
        p._key = key; const r = rnd(1234); const img = ctx.createImageData(W, Hh); const d = img.data;
        const cx = W / 2, cy = Hh / 2, R = Math.min(W, Hh) * 0.3;
        const dep = (x, y) => { const u = (x - cx) / R, v = (y - cy) / R, rr = Math.hypot(u, v); if (p.shape === "ring") return rr > 0.55 && rr < 1 ? 1 : 0; if (p.shape === "kugel") return rr < 1 ? Math.sqrt(1 - rr * rr) : 0; if (p.shape === "pyramide") return Math.max(0, 1 - Math.max(Math.abs(u), Math.abs(v))); return Math.max(0, (Math.sin(u * 4) * Math.cos(v * 4) + 1) / 2) * (rr < 1.2 ? 1 : 0); };
        const row = new Uint8Array(W);
        for (let y = 0; y < Hh; y++) {
          for (let x = 0; x < W; x++) { const s = Math.round(p.sep - dep(x, y) * p.depth); row[x] = x >= s ? row[x - s] : (r() < 0.5 ? 0 : 255); const i = (y * W + x) * 4; d[i] = d[i + 1] = d[i + 2] = row[x]; d[i + 3] = 255; }
        }
        p._img = img;
      }
      const ox = Math.floor((w - W) / 2), oy = Math.floor((h - Hh) / 2);
      ctx.putImageData(p._img, ox, oy);
      circle(ctx, w / 2 - p.sep / 2, oy + 20, 5, "#ff3b3b"); circle(ctx, w / 2 + p.sep / 2, oy + 20, 5, "#ff3b3b");
      if (reveal) { ctx.save(); ctx.globalAlpha = 0.85; rect(ctx, 0, 0, w, h, "#000"); ctx.globalAlpha = 1; const cx = w / 2, cy = h / 2, R = Math.min(W, Hh) * 0.3; if (p.shape === "ring") { circle(ctx, cx, cy, R, null, "#5ec8ff", 2); circle(ctx, cx, cy, R * 0.55, null, "#5ec8ff", 2); } else if (p.shape === "kugel") circle(ctx, cx, cy, R, null, "#5ec8ff", 2); else if (p.shape === "pyramide") { ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 2; ctx.strokeRect(cx - R, cy - R, 2 * R, 2 * R); line(ctx, cx - R, cy - R, cx + R, cy + R, "#5ec8ff", 1); line(ctx, cx + R, cy - R, cx - R, cy + R, "#5ec8ff", 1); } else text(ctx, "Wellenrelief", cx, cy, "#5ec8ff", 20); badge(ctx, "Umriss der verborgenen Form", cx, h - 26); ctx.restore(); }
    }
  });

  addIllusion({
    id: "kohaerenz", cat: "effekte", name: "Kohärente Bewegung (RDK)", short: "Richtung im Rauschen",
    hint: "Ein Teil der Punkte bewegt sich gemeinsam in eine Richtung, der Rest zufällig. Senke die Kohärenz: Ab wann erkennst du die Richtung nicht mehr? Das Gehirn schafft oft schon 5–10 %.",
    desc: "Random-Dot-Kinematogramm: Das Standardwerkzeug der Bewegungsforschung – ein Maß für die Empfindlichkeit des Areals MT/V5.",
    why: "Neuronen im Areal MT summieren Bewegungssignale über große Bereiche und über die Zeit. Schon wenige Prozent kohärente Punkte verschieben die Populationsantwort messbar.",
    params: [{ k: "coh", label: "Kohärenz", min: 0, max: 100, def: 20, unit: " %" }, { k: "dir", label: "Richtung", min: 0, max: 360, def: 0, unit: "°" }, { k: "speed", label: "Tempo", min: 20, max: 200, def: 80 }],
    init(p) { p._d = null; },
    draw(ctx, w, h, p, t, reveal) {
      const N = 400, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      if (!p._d) { const r = rnd(77); p._d = Array.from({ length: N }, (_, i) => ({ x: (r() * 2 - 1) * R, y: (r() * 2 - 1) * R, a: r() * TAU, life: r() * 60, coh: i < N * p.coh / 100 })); p._t = t; }
      const dt = Math.min(0.05, t - (p._t || t)); p._t = t; const da = p.dir * Math.PI / 180;
      p._d.forEach((d, i) => { d.coh = i < N * p.coh / 100; const a = d.coh ? da : d.a; d.x += Math.cos(a) * p.speed * dt; d.y += Math.sin(a) * p.speed * dt; d.life -= 1; if (d.life < 0 || Math.hypot(d.x, d.y) > R) { d.x = (Math.random() * 2 - 1) * R * 0.95; d.y = (Math.random() * 2 - 1) * R * 0.95; d.a = Math.random() * TAU; d.life = 60; } if (Math.hypot(d.x, d.y) <= R) circle(ctx, cx + d.x, cy + d.y, 2.5, reveal && d.coh ? "#ff8c1a" : "#fff"); });
      if (reveal) badge(ctx, "Orange = kohärente Punkte (" + p.coh + " %)", cx, h - 26);
    }
  });
})();
