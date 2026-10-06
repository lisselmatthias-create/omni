// Weitere Täuschungen: Bewegung, Farbe
(function () {
  const { TAU, line, circle, rect, poly, text, measure, badge, gray, hsl, fixation, clamp } = H;
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  addIllusion({
    id: "ball-schatten", cat: "bewegung", name: "Ball & Schatten (Kersten)", short: "Der Schatten bestimmt die Flugbahn",
    hint: "Der Ball bewegt sich in beiden Fällen exakt gleich über den Bildschirm. Nur der Schatten unterscheidet sich: Folgt er dem Ball diagonal, rollt der Ball nach hinten über den Boden. Bleibt er unten, steigt der Ball in die Luft.",
    desc: "Ein Schatten genügt, um dieselbe 2D-Bewegung als Rollen in die Tiefe oder als Aufsteigen zu sehen (Kersten, Mamassian & Knill, 1997).",
    why: "Der Abstand zwischen Objekt und Schatten verrät die Höhe über dem Boden. Das Gehirn nutzt diesen Hinweis so stark, dass er die Mehrdeutigkeit der Bildbewegung komplett entscheidet.",
    params: [{ k: "mode", label: "Schatten", type: "select", def: "floor", options: [["floor", "Schatten folgt diagonal (Ball rollt)"], ["rise", "Schatten bleibt unten (Ball steigt)"]] }, { k: "speed", label: "Tempo", min: 0.2, max: 1.5, step: 0.05, def: 0.5 }],
    bg: "#d9d2c0",
    draw(ctx, w, h, p, t, reveal) {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#b9b2a0"); g.addColorStop(1, "#e8e2d0"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) line(ctx, 0, h * i / 8, w, h * i / 8, "rgba(0,0,0,.08)", 1);
      const k = 0.5 - 0.5 * Math.cos(t * p.speed * TAU), x = w * 0.2 + k * w * 0.6, y = h * 0.8 - k * h * 0.5, R = Math.min(w, h) * 0.06;
      const sx = x, sy = p.mode === "floor" ? y + R * 0.9 : h * 0.8 + R * 0.9;
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.ellipse(sx, sy, R * 1.1, R * 0.4, 0, 0, TAU); ctx.fill();
      const bg = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R); bg.addColorStop(0, "#ff9a3c"); bg.addColorStop(1, "#b84a00"); circle(ctx, x, y, R, bg);
      if (reveal) { ctx.save(); ctx.setLineDash([6, 6]); line(ctx, w * 0.2, h * 0.8, w * 0.8, h * 0.3, "#ff3b3b", 2); ctx.restore(); badge(ctx, "Der Ball folgt in beiden Modi exakt dieser Linie", w / 2, 30); }
    }
  });

  addIllusion({
    id: "silencing", cat: "bewegung", name: "Silencing (Suchow & Alvarez)", short: "Bewegung versteckt Veränderung",
    hint: "Alle Punkte wechseln ständig ihre Farbe. Sobald der Ring rotiert, scheint der Farbwechsel zu stoppen – obwohl er genauso weitergeht. Halte die Rotation an (Regler auf 0) und der Wechsel ist wieder da.",
    desc: "Schnelle Bewegung „verstummt“ die Wahrnehmung von Farb-, Helligkeits- oder Größenänderungen (Suchow & Alvarez, 2011).",
    why: "Veränderungsdetektoren arbeiten ortsgebunden: Sie vergleichen, was nacheinander an derselben Stelle der Netzhaut ankommt. Bewegt sich das Objekt weg, trifft an jeder Stelle ständig ein anderer Punkt ein – die Änderung geht im Rauschen unter.",
    params: [{ k: "rot", label: "Rotation", min: 0, max: 3, step: 0.05, def: 1.2 }, { k: "change", label: "Farbwechsel-Tempo", min: 0.2, max: 3, step: 0.1, def: 1 }, { k: "n", label: "Punkte", min: 40, max: 200, def: 100 }],
    init(p) { p._ph = null; },
    draw(ctx, w, h, p, t, reveal) {
      if (!p._ph || p._ph.length !== p.n) { const r = rnd(5); p._ph = Array.from({ length: p.n }, () => r() * 360); }
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36, rr = Math.min(w, h) * 0.07, a0 = reveal ? 0 : t * p.rot;
      for (let i = 0; i < p.n; i++) { const a = i / p.n * TAU + a0, rad = R + (i % 2 ? rr * 0.9 : -rr * 0.9) * 0.5; circle(ctx, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, rr * 0.35, hsl((p._ph[i] + t * 60 * p.change) % 360, 85, 55)); }
      fixation(ctx, cx, cy, "#fff");
      if (reveal) badge(ctx, "Rotation gestoppt: der Farbwechsel läuft unverändert weiter", cx, h - 26);
    }
  });

  addIllusion({
    id: "froehlich", cat: "bewegung", name: "Fröhlich-Effekt", short: "Wo ist der Balken aufgetaucht?",
    hint: "Ein Balken erscheint hinter der Blende und rast nach rechts. Klicke danach auf die Stelle, an der er für dich zum ersten Mal sichtbar war. Die meisten tippen zu weit rechts (Fröhlich, 1923).",
    desc: "Die erste wahrgenommene Position eines bewegten Objekts ist in Bewegungsrichtung verschoben.",
    why: "Es dauert, bis ein neu aufgetauchtes Objekt die Aufmerksamkeit erreicht; währenddessen ist es schon weitergewandert. Alternativ: Das Bewegungssystem extrapoliert die Position bereits voraus.",
    params: [{ k: "speed", label: "Tempo", min: 200, max: 1200, def: 600, unit: " px/s" }],
    anim: true, noReveal: true,
    init(p) { p._phase = "wait"; p._t0 = 0; p._res = []; p._x0 = 0; },
    onDown(io, p, w, h) { if (p._phase === "ask") { p._res.push(io.x - p._x0); p._phase = "wait"; p._t0 = 0; } },
    draw(ctx, w, h, p, t) {
      const occX = w * 0.25; p._x0 = occX;
      if (p._phase === "wait") { if (!p._t0) p._t0 = t; if (t - p._t0 > 1.2) { p._phase = "run"; p._t0 = t; } }
      if (p._phase === "run") { const x = occX + (t - p._t0) * p.speed; if (x > w + 40) p._phase = "ask"; else rect(ctx, x, h / 2 - 25, 18, 50, "#fff"); }
      rect(ctx, 0, 0, occX, h, "#333"); line(ctx, occX, 0, occX, h, "#888", 2);
      if (p._phase === "ask") { text(ctx, "Klicke auf die Stelle, an der der Balken zuerst sichtbar war", w / 2 + occX / 2, h * 0.2, "#fff", 15); line(ctx, occX, h / 2, w, h / 2, "#555", 1); }
      if (p._res.length) { const m = p._res.reduce((a, b) => a + b, 0) / p._res.length; text(ctx, `Durchgänge: ${p._res.length} · mittlerer Versatz: ${Math.round(m)} px in Bewegungsrichtung`, w / 2 + occX / 2, h * 0.85, "#5ec8ff", 14); line(ctx, occX + m, h / 2 - 40, occX + m, h / 2 + 40, "#ff8c1a", 2); text(ctx, "Echter Startpunkt: Blendenkante", occX + 8, h / 2 + 60, "#9a9aa6", 12, "left"); }
    }
  });

  addIllusion({
    id: "linienbewegung", cat: "bewegung", name: "Linien-Bewegungstäuschung", short: "Aufmerksamkeit schießt Linien",
    hint: "Ein Punkt blitzt kurz auf, dann erscheint eine komplette Linie auf einmal. Sie scheint vom Punkt wegzuschießen – obwohl sie in einem Stück auftaucht (Hikosaka, Miyauchi & Shimojo, 1993). Verändere die Seite und die Vorlaufzeit.",
    desc: "Ein vorausgehender Hinweisreiz lässt eine gleichzeitig erscheinende Linie als wachsend erscheinen.",
    why: "Aufmerksamkeit beschleunigt die Verarbeitung: Der Teil der Linie nahe am Hinweis wird früher bewusst als der ferne Teil. Diese Zeitdifferenz wird als Bewegung interpretiert (Prior-Entry-Effekt).",
    params: [{ k: "side", label: "Hinweis", type: "select", def: "l", options: [["l", "links"], ["r", "rechts"], ["none", "kein Hinweis (Vergleich)"]] }, { k: "lead", label: "Vorlaufzeit", min: 50, max: 500, def: 200, unit: " ms" }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const cyc = 2.4, ph = (t % cyc) * 1000, cx = w / 2, cy = h / 2, L = w * 0.6, cueX = p.side === "l" ? cx - L / 2 - 30 : cx + L / 2 + 30;
      fixation(ctx, cx, cy - 80, "#888");
      if (p.side !== "none" && ph > 600 && ph < 600 + 80) circle(ctx, cueX, cy, 10, "#ffe600");
      if (ph > 600 + p.lead && ph < 600 + p.lead + 700) rect(ctx, cx - L / 2, cy - 5, L, 10, "#fff");
    }
  });

  addIllusion({
    id: "newton-scheibe", cat: "farbe", name: "Newton-Scheibe (Farbkreisel)", short: "Aus Regenbogen wird Grau",
    hint: "Die Scheibe trägt die Spektralfarben. Dreh die Drehzahl hoch: Die Farben verschmelzen zu Grau-Weiß, weil das Auge über etwa 50 ms mittelt. Hier wird die Bewegungsunschärfe mitberechnet, damit es auch bei 60 Bildern/s stimmt.",
    desc: "Newtons Farbkreisel (1704): Alle Spektralfarben zusammen ergeben wieder Weiß – der Beweis, dass weißes Licht aus Farben besteht.",
    why: "Die zeitliche Integration der Photorezeptoren mischt schnell aufeinanderfolgende Farben additiv – dasselbe Prinzip wie bei Benham, nur umgekehrt: Hier verschwinden die Farben.",
    params: [{ k: "rpm", label: "Drehzahl", min: 0, max: 30, step: 0.5, def: 4, unit: " U/s" }, { k: "n", label: "Sektoren", min: 3, max: 12, def: 7 }],
    noReveal: true,
    draw(ctx, w, h, p, t) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.4, sub = Math.min(24, Math.max(1, Math.round(p.rpm * 3))), dtF = 1 / 60;
      ctx.globalAlpha = 1 / sub;
      for (let s = 0; s < sub; s++) { const a0 = (t - dtF * s / sub) * p.rpm * TAU; for (let i = 0; i < p.n; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0 + i / p.n * TAU, a0 + (i + 1) / p.n * TAU); ctx.closePath(); ctx.fillStyle = hsl(i / p.n * 360, 90, 55); ctx.fill(); } }
      ctx.globalAlpha = 1; circle(ctx, cx, cy, 6, "#222");
      text(ctx, p.rpm + " Umdrehungen/s", cx, h - 24, "#9a9aa6", 13);
    }
  });

  addIllusion({
    id: "farbige-schatten", cat: "farbe", name: "Farbige Schatten (Goethe)", short: "Ein grauer Schatten wird bunt",
    hint: "Eine weiße und eine farbige Lampe beleuchten die Wand. Der Stab wirft zwei Schatten: Der von der weißen Lampe abgeschattete ist farbig (klar). Der andere ist physikalisch neutral grau – erscheint aber in der Gegenfarbe! Verändere die Lampenfarbe.",
    desc: "Goethe beschrieb 1810 farbige Schatten bei Kerzenlicht und Mondschein. Der Komplementärschatten existiert nur im Kopf.",
    why: "Das Sehsystem nimmt die Gesamtbeleuchtung (Weiß + Farbe) als „weiß“ an und zieht sie ab. Der neutral beleuchtete Schatten liegt dann relativ in der Gegenfarbe – Farbkonstanz in Aktion.",
    params: [{ k: "hue", label: "Lampenfarbe", min: 0, max: 360, def: 30 }, { k: "animate", label: "Lampe bewegen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const Wl = [120, 120, 120], c = (() => { const tmp = hsl(p.hue, 100, 50); const m = tmp.match(/\d+/g); const hh = +m[0], ss = +m[1] / 100, ll = +m[2] / 100, C = (1 - Math.abs(2 * ll - 1)) * ss, X = C * (1 - Math.abs((hh / 60) % 2 - 1)); let r = 0, g = 0, b = 0; const hp = hh / 60; if (hp < 1) [r, g, b] = [C, X, 0]; else if (hp < 2) [r, g, b] = [X, C, 0]; else if (hp < 3) [r, g, b] = [0, C, X]; else if (hp < 4) [r, g, b] = [0, X, C]; else if (hp < 5) [r, g, b] = [X, 0, C]; else [r, g, b] = [C, 0, X]; return [r, g, b].map((v) => Math.round((v + ll - C / 2) * 150)); })();
      const add = (a, b) => `rgb(${Math.min(255, a[0] + b[0])},${Math.min(255, a[1] + b[1])},${Math.min(255, a[2] + b[2])})`;
      rect(ctx, 0, 0, w, h, add(Wl, c)); // Wand: beide Lampen
      const sx = w / 2, off = (p.animate ? Math.sin(t * 0.7) : 0.5) * w * 0.12 + w * 0.13;
      rect(ctx, sx - off - 22, h * 0.15, 44, h * 0.7, `rgb(${c[0]},${c[1]},${c[2]})`); // nur farbige Lampe (weiße blockiert)
      rect(ctx, sx + off - 22, h * 0.15, 44, h * 0.7, `rgb(${Wl[0]},${Wl[1]},${Wl[2]})`); // nur weiße Lampe (farbige blockiert)
      rect(ctx, sx - 12, h * 0.1, 24, h * 0.8, "#222"); circle(ctx, sx - 12, h * 0.1, 14, "#222");
      circle(ctx, sx + off * 2.2, 40, 14, "#fff"); text(ctx, "weiße Lampe", sx + off * 2.2, 68, "#fff", 11); circle(ctx, sx - off * 2.2, 40, 14, hsl(p.hue, 100, 50)); text(ctx, "farbige Lampe", sx - off * 2.2, 68, "#fff", 11);
      if (reveal) badge(ctx, `Rechter Schatten: exakt RGB ${Wl.join("/")} – neutrales Grau`, sx, h - 26);
    }
  });

  addIllusion({
    id: "das-kleid", cat: "farbe", name: "Das Kleid (Farbkonstanz)", short: "Blau-schwarz oder weiß-gold?",
    hint: "Das Streifenmuster hat in beiden Szenen exakt dieselben Pixelfarben – die echten Werte aus dem berühmten Foto von 2015. Links deutet die Szene auf bläuliches Schattenlicht (→ weiß-gold), rechts auf warmes Licht (→ blau-schwarz). Auflösen zeigt die Farben neutral.",
    desc: "„The Dress“ spaltete 2015 das Internet. Die Pixel sind bläulich und bräunlich – welche Farbe man sieht, hängt davon ab, welche Beleuchtung das Gehirn herausrechnet.",
    why: "Farbkonstanz: Das Sehsystem schätzt die Lichtquelle und „subtrahiert“ sie. Wer bläuliches Schattenlicht annimmt, sieht Weiß-Gold; wer warmes Kunstlicht annimmt, Blau-Schwarz. Beides ist eine korrekte Lösung für ein mehrdeutiges Bild.",
    params: [{ k: "ctxstr", label: "Stärke des Beleuchtungs-Hinweises", min: 0, max: 1, step: 0.01, def: 0.8 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const A = "rgb(123,127,158)", B = "rgb(78,74,47)", k = p.ctxstr;
      const dress = (cx, cy, s) => { for (let i = 0; i < 6; i++) rect(ctx, cx - s * 0.5, cy - s + i * s / 3, s, s / 6, i % 2 ? B : A), rect(ctx, cx - s * 0.5, cy - s + i * s / 3 + s / 6, s, s / 6, i % 2 ? A : B); };
      const S = Math.min(w, h) * 0.3;
      if (!reveal) {
        const g1 = ctx.createLinearGradient(0, 0, 0, h); g1.addColorStop(0, `rgba(80,110,170,${0.9 * k})`); g1.addColorStop(1, `rgba(40,60,110,${0.9 * k})`); ctx.fillStyle = "#333"; ctx.fillRect(0, 0, w / 2, h); ctx.fillStyle = g1; ctx.fillRect(0, 0, w / 2, h);
        const g2 = ctx.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, `rgba(255,220,140,${0.9 * k})`); g2.addColorStop(1, `rgba(200,150,60,${0.9 * k})`); ctx.fillStyle = "#333"; ctx.fillRect(w / 2, 0, w / 2, h); ctx.fillStyle = g2; ctx.fillRect(w / 2, 0, w / 2, h);
        circle(ctx, w * 0.9, 60, 30, `rgba(255,240,180,${k})`); text(ctx, "warmes Licht", w * 0.75, 40, "#fff", 12); text(ctx, "kühles Schattenlicht", w * 0.25, 40, "#fff", 12);
      } else rect(ctx, 0, 0, w, h, "#808080");
      dress(w * 0.25, h / 2, S); dress(w * 0.75, h / 2, S);
      if (reveal) badge(ctx, "Pixelwerte: " + A + " und " + B + " – in beiden Szenen identisch", w / 2, h - 26);
    }
  });
})();
