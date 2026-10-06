// Weitere Täuschungen: Größe & Form, Helligkeit
(function () {
  const { TAU, line, circle, rect, poly, text, measure, badge, gray, hsl, fixation, clamp } = H;

  addIllusion({
    id: "judd", cat: "geometrie", name: "Judd-Täuschung", short: "Der Mittelpunkt wandert",
    hint: "Der rote Punkt sitzt exakt in der Mitte der Linie. Durch die gleichgerichteten Pfeilspitzen scheint er verschoben. Die Animation klappt die Spitzen um – der Punkt springt hin und her.",
    desc: "Eine Variante der Müller-Lyer-Täuschung: Pfeilspitzen in gleicher Richtung verschieben den wahrgenommenen Mittelpunkt (Judd, 1899).",
    why: "Jede Hälfte der Linie bekommt einen anderen Müller-Lyer-Effekt: Die Hälfte mit der nach außen weisenden Spitze wirkt länger, die andere kürzer – die Mitte rutscht entsprechend.",
    params: [{ k: "ang", label: "Spitzenwinkel", min: 15, max: 75, def: 35, unit: "°" }, { k: "animate", label: "Spitzen umklappen", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const L = Math.min(w * 0.55, 460), cx = w / 2, cy = h / 2, a = p.ang * Math.PI / 180, f = p.animate ? Math.cos(t * 1.1) : 1, len = 45;
      line(ctx, cx - L / 2, cy, cx + L / 2, cy, "#fff", 3);
      [[cx - L / 2], [cx + L / 2]].forEach(([x]) => { const dx = Math.cos(a) * len * f; line(ctx, x, cy, x + dx, cy - Math.sin(a) * len, "#fff", 3); line(ctx, x, cy, x + dx, cy + Math.sin(a) * len, "#fff", 3); });
      circle(ctx, cx, cy, 6, "#ff3b3b");
      if (reveal) { measure(ctx, cx - L / 2, cy + 40, cx, cy + 40, Math.round(L / 2) + " px"); measure(ctx, cx, cy + 40, cx + L / 2, cy + 40, Math.round(L / 2) + " px"); }
    }
  });

  addIllusion({
    id: "baldwin", cat: "geometrie", name: "Baldwin-Täuschung", short: "Große Kästen, kurze Linie",
    hint: "Beide Linien sind gleich lang. Zwischen den großen Quadraten wirkt die Linie kürzer als zwischen den kleinen. Verändere das Größenverhältnis.",
    desc: "Eine Strecke zwischen zwei großen Quadraten erscheint kürzer als dieselbe Strecke zwischen kleinen (Baldwin, 1895).",
    why: "Größenkontrast: Die Linie wird relativ zu ihren Nachbarn beurteilt. Zusätzlich verschieben große Flankenobjekte den wahrgenommenen Linienendpunkt nach innen.",
    params: [{ k: "ratio", label: "Größenverhältnis", min: 1, max: 6, step: 0.1, def: 3.5 }, { k: "animate", label: "Verhältnis animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const L = Math.min(w * 0.38, 320), cx = w / 2, s0 = 16, r = p.animate ? 1 + (p.ratio - 1) * (0.5 + 0.5 * Math.sin(t)) : p.ratio;
      [[h * 0.35, s0 * r], [h * 0.65, s0]].forEach(([y, s]) => { line(ctx, cx - L / 2, y, cx + L / 2, y, "#fff", 3); rect(ctx, cx - L / 2 - s, y - s / 2, s, s, "#5ec8ff"); rect(ctx, cx + L / 2, y - s / 2, s, s, "#5ec8ff"); if (reveal) measure(ctx, cx - L / 2, y + s / 2 + 22, cx + L / 2, y + s / 2 + 22, Math.round(L) + " px"); });
    }
  });

  addIllusion({
    id: "bourdon", cat: "geometrie", name: "Bourdon-Täuschung", short: "Die geknickte Gerade",
    hint: "Die lange Kante der Figur ist eine exakt gerade Linie. Trotzdem scheint sie am Berührpunkt der beiden Dreiecke zu knicken. Drehe die Figur – der Knick bleibt.",
    desc: "Zwei spiegelgleiche Dreiecke, deren Längsseiten auf einer Geraden liegen, erzeugen einen scheinbaren Knick (Bourdon, 1902).",
    why: "Die Orientierung jeder Dreiecksfläche (ihre Hauptachse) „zieht“ die Wahrnehmung der angrenzenden Kante mit. Beide Dreiecke ziehen in verschiedene Richtungen – die Gerade wirkt gebrochen.",
    params: [{ k: "rot", label: "Drehung", min: 0, max: 180, def: 25, unit: "°" }, { k: "spitz", label: "Spitzenwinkel", min: 8, max: 30, def: 15, unit: "°" }, { k: "animate", label: "Langsam drehen", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, L = Math.min(w, h) * 0.38, hh = Math.tan(p.spitz * Math.PI / 180) * L;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((p.animate ? t * 20 : p.rot) * Math.PI / 180);
      poly(ctx, [[-L, 0], [0, 0], [0, -hh]], "#fff"); poly(ctx, [[L, 0], [0, 0], [0, hh]], "#fff");
      if (reveal) line(ctx, -L, 0, L, 0, "#ff3b3b", 2); ctx.restore();
      if (reveal) badge(ctx, "Rote Linie: die Kante ist exakt gerade", cx, h - 26);
    }
  });

  addIllusion({
    id: "quadrat-raute", cat: "geometrie", name: "Quadrat-Rauten-Täuschung", short: "Gedreht wirkt größer",
    hint: "Beide Quadrate sind identisch. Das um 45° gedrehte wirkt größer – und außerdem wie eine andere Form („Raute“). Drehe das rechte Quadrat langsam zurück.",
    desc: "Ein um 45° gedrehtes Quadrat erscheint größer als ein achsenparalleles gleicher Seitenlänge.",
    why: "Die Ausdehnung wird entlang der Hauptachsen (waagerecht/senkrecht) beurteilt. Bei der Raute ist das die Diagonale – 41 % länger als die Seite. Orientierung ändert sogar die Kategorie: Quadrat wird zu Raute.",
    params: [{ k: "rot", label: "Drehung rechts", min: 0, max: 90, def: 45, unit: "°" }, { k: "animate", label: "Drehen", type: "check", def: false }],
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w, h) * 0.26, cy = h / 2, rot = (p.animate ? 45 + 45 * Math.sin(t * 0.7) : p.rot) * Math.PI / 180;
      [[w * 0.3, 0], [w * 0.7, rot]].forEach(([cx, r]) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(r); rect(ctx, -S / 2, -S / 2, S, S, "#ff8c1a"); if (reveal) { ctx.strokeStyle = "#5ec8ff"; ctx.lineWidth = 2; ctx.strokeRect(-S / 2, -S / 2, S, S); } ctx.restore(); });
      if (reveal) badge(ctx, "Beide: Seitenlänge " + Math.round(S) + " px, Diagonale " + Math.round(S * Math.SQRT2) + " px", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "tolansky", cat: "geometrie", name: "Tolansky-Krümmungstäuschung", short: "Kurze Bögen wirken flacher",
    hint: "Alle drei Bögen stammen von Kreisen mit exakt gleichem Radius. Der kurze Bogen wirkt deutlich flacher. Auflösen zeigt die vollständigen Kreise.",
    desc: "Bögen gleicher Krümmung erscheinen flacher, je kürzer sie sind (Tolansky, 1964).",
    why: "Krümmung wird über die Abweichung von der Sehne geschätzt. Bei kurzen Bögen ist diese Abweichung klein – das Sehsystem unterschätzt die Krümmung, statt sie auf den Radius umzurechnen.",
    params: [{ k: "r", label: "Radius", min: 80, max: 300, def: 180 }, { k: "animate", label: "Bogenlängen animieren", type: "check", def: true }],
    draw(ctx, w, h, p, t, reveal) {
      const spans = [0.25, 0.6, 1.2].map((s, i) => p.animate ? s * (0.6 + 0.4 * Math.sin(t + i)) : s), cy = h * 0.5 + p.r * 0.5;
      spans.forEach((sp, i) => { const cx = w * (0.2 + i * 0.3); ctx.beginPath(); ctx.arc(cx, cy, p.r, -Math.PI / 2 - sp, -Math.PI / 2 + sp); ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.stroke(); if (reveal) circle(ctx, cx, cy, p.r, null, "rgba(94,200,255,.5)", 1.5); });
      if (reveal) badge(ctx, "Alle Bögen: Radius " + p.r + " px", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "morinaga", cat: "geometrie", name: "Morinaga-Paradoxon", short: "Spitzen, die nicht fluchten",
    hint: "Die Spitzen aller Winkel liegen auf einer exakt senkrechten Linie. Die mittlere Reihe scheint trotzdem nach links versetzt. Auflösen zeigt die wahre Flucht.",
    desc: "Drei Reihen von Winkeln, deren Spitzen genau übereinanderliegen, wirken gegeneinander verschoben – paradox, weil zugleich die Öffnungen falsch beurteilt werden (Morinaga, 1941).",
    why: "Der Schwerpunkt der Figur (nicht die Spitze) bestimmt die wahrgenommene Position. Bei nach links offenen Winkeln liegt er links der Spitze, bei nach rechts offenen rechts.",
    params: [{ k: "open", label: "Öffnungswinkel", min: 30, max: 120, def: 70, unit: "°" }, { k: "size", label: "Größe", min: 20, max: 80, def: 45 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const cols = [w * 0.3, w * 0.5, w * 0.7], a = p.open * Math.PI / 360, s = p.size;
      for (let r = 0; r < 3; r++) { const y = h * (0.25 + r * 0.25), dir = r % 2 ? -1 : 1; cols.forEach((x) => { ctx.beginPath(); ctx.moveTo(x + dir * Math.sin(a) * s, y - Math.cos(a) * s); ctx.lineTo(x, y); ctx.lineTo(x + dir * Math.sin(a) * s, y + Math.cos(a) * s); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); }); }
      if (reveal) { cols.forEach((x) => line(ctx, x, h * 0.12, x, h * 0.88, "#ff3b3b", 1.5)); badge(ctx, "Die Spitzen liegen exakt auf den roten Linien", w / 2, h - 26); }
    }
  });

  addIllusion({
    id: "benary", cat: "helligkeit", name: "Benary-Kreuz", short: "Zugehörigkeit bestimmt Helligkeit",
    hint: "Beide grauen Dreiecke sind identisch und grenzen gleich viel an Schwarz und Weiß. Das Dreieck „im“ Kreuz wirkt heller als das „außerhalb“.",
    desc: "Zwei gleiche graue Dreiecke mit gleicher Umgebung wirken unterschiedlich hell – je nachdem, ob sie zum schwarzen Kreuz oder zum weißen Hintergrund zu gehören scheinen (Benary, 1924).",
    why: "Nicht die lokale Umgebung allein, sondern die wahrgenommene Zugehörigkeit (Figur-Grund-Organisation) bestimmt den Kontrast. Das Dreieck im Kreuz wird mit Schwarz verglichen und wirkt heller.",
    params: [{ k: "g", label: "Grau", min: 60, max: 200, def: 128 }],
    anim: false, bg: "#fff",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.3, a = S * 0.38, g = gray(p.g);
      rect(ctx, cx - a / 2, cy - S, a, 2 * S, "#000"); rect(ctx, cx - S, cy - a / 2, 2 * S, a, "#000");
      const tr = S * 0.42;
      poly(ctx, [[cx - a / 2, cy - a / 2], [cx - a / 2, cy - a / 2 - tr], [cx - a / 2 - tr, cy - a / 2]], g); // im Kreuz-Innenwinkel (auf Schwarz-Ecke)
      poly(ctx, [[cx + a / 2, cy + S], [cx + a / 2 + tr, cy + S], [cx + a / 2, cy + S - tr]], g); // außen am Kreuzarm
      if (reveal) { rect(ctx, cx - a / 2 - tr, cy + S + 20, a + 2 * tr, 14, g); badge(ctx, "Beide Dreiecke: Grauwert " + p.g, cx, cy + S + 52); }
    }
  });

  addIllusion({
    id: "kerker", cat: "helligkeit", name: "Kerker-Täuschung (Bressan)", short: "Hinter Gittern heller",
    hint: "Die grauen Quadrate sind links und rechts identisch. Hinter weißen Gitterstäben auf Schwarz wirken sie heller als hinter schwarzen Stäben auf Weiß – entgegen dem einfachen Kontrast.",
    desc: "Die Dungeon-Täuschung (Paola Bressan, 2001) zeigt, dass Helligkeit nicht vom lokalen Umfeld, sondern vom „Anker“ der Gruppe abhängt.",
    why: "Das Sehsystem gruppiert die grauen Felder mit den Gitterstäben zu einer Ebene und skaliert ihre Helligkeit relativ zum hellsten Element dieser Gruppe (Anchoring-Theorie, Gilchrist).",
    params: [{ k: "g", label: "Grau", min: 60, max: 200, def: 120 }, { k: "n", label: "Gitter", min: 3, max: 7, def: 5 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const S = Math.min(w * 0.42, h * 0.8), cy = h / 2, cell = S / (p.n * 2 - 1);
      [[w * 0.27, "#000", "#fff"], [w * 0.73, "#fff", "#000"]].forEach(([cx, bgc, bar]) => {
        rect(ctx, cx - S / 2, cy - S / 2, S, S, bgc);
        for (let i = 0; i < p.n; i++) { rect(ctx, cx - S / 2 + i * 2 * cell, cy - S / 2, cell, S, bar); rect(ctx, cx - S / 2, cy - S / 2 + i * 2 * cell, S, cell, bar); }
        for (let i = 0; i < p.n - 1; i++) for (let j = 0; j < p.n - 1; j++) rect(ctx, cx - S / 2 + (i * 2 + 1) * cell + cell * 0.2, cy - S / 2 + (j * 2 + 1) * cell + cell * 0.2, cell * 0.6, cell * 0.6, gray(p.g));
      });
      if (reveal) { rect(ctx, w * 0.27, cy - 8, w * 0.46, 16, gray(p.g)); badge(ctx, "Alle grauen Felder: Wert " + p.g, w / 2, cy + 30); }
    }
  });

  addIllusion({
    id: "gewellte-flaeche", cat: "helligkeit", name: "Gewellte Fläche (Adelson)", short: "Falten verändern Grau",
    hint: "Die beiden markierten Felder haben denselben Grauwert. Weil die Fläche wie ein gefaltetes Blatt wirkt, scheint das eine im Schatten, das andere im Licht zu liegen. Drehe die Scherung auf 0: flach, und die Täuschung verschwindet.",
    desc: "Adelsons „Corrugated Plaid“ (1993): Dieselben Grauwerte wirken je nach vermuteter 3D-Beleuchtung unterschiedlich.",
    why: "Das Sehsystem zerlegt das Bild in Reflektanz und Beleuchtung. Eine scheinbar beschattete Fläche, die gleich viel Licht sendet wie eine beleuchtete, muss heller gestrichen sein – also sehen wir sie heller.",
    params: [{ k: "shear", label: "Scherung (Faltung)", min: 0, max: 1, step: 0.01, def: 0.7 }, { k: "animate", label: "Auf- und zufalten", type: "check", def: true }],
    bg: "#555",
    draw(ctx, w, h, p, t, reveal) {
      const n = 5, S = Math.min(w, h) * 0.6 / n, cx = w / 2, cy = h / 2, sh = (p.animate ? 0.5 + 0.5 * Math.sin(t * 0.6) : 1) * p.shear * S * 0.6;
      const rowBase = [200, 140, 80, 140, 200], colMod = [-40, 40, -40, 40, -40]; // Spalten wirken abwechselnd beleuchtet/beschattet
      const vals = []; for (let c = 0; c < n; c++) { vals[c] = []; for (let r = 0; r < n; r++) vals[c][r] = rowBase[r] + colMod[c]; }
      vals[1][2] = 110; vals[2][1] = 110; // die zwei identischen Felder
      for (let c = 0; c < n; c++) for (let r = 0; r < n; r++) { const x0 = cx + (c - n / 2) * S, y0 = cy + (r - n / 2) * S, d = (c % 2 ? -1 : 1) * sh; poly(ctx, [[x0, y0 + (c % 2 ? sh : 0)], [x0 + S, y0 + (c % 2 ? 0 : sh)], [x0 + S, y0 + S + (c % 2 ? 0 : sh)], [x0, y0 + S + (c % 2 ? sh : 0)]], gray(vals[c][r]), "#333", 1); }
      const mark = (c, r) => { const x0 = cx + (c - n / 2) * S, y0 = cy + (r - n / 2) * S + sh / 2; ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 2; ctx.strokeRect(x0 + 4, y0 + 4, S - 8, S - 8); };
      if (reveal) { mark(1, 2); mark(2, 1); rect(ctx, cx - S * 1.5, cy + S * 3, S * 3, 14, gray(110)); badge(ctx, "Markierte Felder: Grauwert 110", cx, cy + S * 3 + 34); }
    }
  });

  addIllusion({
    id: "metelli", cat: "helligkeit", name: "Scheintransparenz (Metelli)", short: "Durchsichtig ohne Glas",
    hint: "Links scheint ein durchsichtiges Quadrat über der Kante zu liegen. Rechts sind die beiden Hälften vertauscht – nun wirkt es undurchsichtig, obwohl dieselben Grautöne verwendet werden. Verändere die „Transparenz“.",
    desc: "Transparenz ist eine Wahrnehmungsleistung: Sie entsteht, wenn die Helligkeitsverhältnisse an einer Grenze den Regeln eines Filters gehorchen (Fabio Metelli, 1974).",
    why: "Ein echter Filter erhält die Helligkeitsordnung beider Seiten und schwächt die Differenz um denselben Faktor. Stimmen diese Bedingungen, spaltet das Gehirn die Fläche in „Filter“ und „Hintergrund“ – andernfalls sieht es nur eine opake Fläche.",
    params: [{ k: "alpha", label: "Transparenz", min: 0.1, max: 0.9, step: 0.01, def: 0.5 }, { k: "g", label: "Filterhelligkeit", min: 40, max: 220, def: 140 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const dark = 50, light = 220, S = Math.min(w * 0.42, h * 0.75), cy = h / 2, a = p.alpha;
      const fa = a * p.g + (1 - a) * dark, fb = a * p.g + (1 - a) * light; // über dunkel / über hell
      [[w * 0.27, fa, fb], [w * 0.73, fb, fa]].forEach(([cx, l, r]) => { rect(ctx, cx - S / 2, cy - S / 2, S / 2, S, gray(dark)); rect(ctx, cx, cy - S / 2, S / 2, S, gray(light)); const q = S * 0.5; rect(ctx, cx - q / 2, cy - q / 2, q / 2, q, gray(l)); rect(ctx, cx, cy - q / 2, q / 2, q, gray(r)); });
      text(ctx, "Reihenfolge erhalten → transparent", w * 0.27, cy + S / 2 + 24, "#ccc", 13); text(ctx, "Reihenfolge vertauscht → opak", w * 0.73, cy + S / 2 + 24, "#ccc", 13);
      if (reveal) badge(ctx, `Beide Seiten nutzen exakt die Werte ${Math.round(fa)} und ${Math.round(fb)}`, w / 2, 30);
    }
  });

  addIllusion({
    id: "krater", cat: "helligkeit", name: "Licht von oben (Krater-Täuschung)", short: "Beulen oder Dellen?",
    hint: "Oben helle Kreise wirken wie Beulen, unten helle wie Dellen. Drehe das Bild um 180° – alle kippen. Das Gehirn nimmt an, dass Licht von oben kommt.",
    desc: "Schattierung wird unter der Annahme „Licht von oben“ als Form gelesen (Ramachandran, 1988). Mondkrater auf Fotos wirken deshalb oft wie Berge.",
    why: "Die Sonne steht seit jeher oben. Das Sehsystem hat diese Statistik fest verdrahtet und löst die Mehrdeutigkeit von Schattierung damit auf – sogar leicht nach links-oben versetzt, wie Experimente zeigen.",
    params: [{ k: "rot", label: "Drehung", min: 0, max: 360, def: 0, unit: "°" }, { k: "animate", label: "Langsam drehen", type: "check", def: false }],
    bg: "#888",
    draw(ctx, w, h, p, t, reveal) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.07, rot = (p.animate ? t * 30 : p.rot) * Math.PI / 180;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
      for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) { const x = i * R * 2.6, y = j * R * 2.6, up = (i + j) % 2 === 0; const g = ctx.createLinearGradient(0, y - R, 0, y + R); g.addColorStop(0, up ? "#eee" : "#333"); g.addColorStop(1, up ? "#333" : "#eee"); circle(ctx, x, y, R, g); }
      ctx.restore();
      if (reveal) badge(ctx, "Nur Verläufe – keine der Scheiben hat eine Form", cx, h - 26);
    }
  });

  addIllusion({
    id: "glanz", cat: "helligkeit", name: "Blend-Effekt (Glare)", short: "Weiß, das leuchtet",
    hint: "Beide zentralen Scheiben sind dasselbe reine Weiß. Von einem Verlauf umgeben wirkt die linke selbstleuchtend, fast blendend. Verändere die Verlaufsbreite.",
    desc: "Ein Helligkeitsverlauf, der zu einer Fläche hin ansteigt, lässt sie leuchtend und heller als Weiß erscheinen – die Pupille zieht sich sogar messbar zusammen (Zavagno, 1999; Laeng & Endestad, 2012).",
    why: "Verläufe um Lichtquellen sind in der Natur das Signatur-Muster von Blendung. Das Gehirn interpretiert die Fläche als Lichtquelle und reagiert darauf, als wäre sie es.",
    params: [{ k: "wid", label: "Verlaufsbreite", min: 10, max: 200, def: 90 }, { k: "animate", label: "Pulsieren", type: "check", def: true }],
    bg: "#777",
    draw(ctx, w, h, p, t, reveal) {
      const R = Math.min(w, h) * 0.12, cy = h / 2, wid = p.animate ? p.wid * (0.6 + 0.4 * Math.sin(t * 1.5)) : p.wid;
      const g = ctx.createRadialGradient(w * 0.3, cy, R, w * 0.3, cy, R + wid); g.addColorStop(0, "#fff"); g.addColorStop(1, "rgba(119,119,119,1)"); circle(ctx, w * 0.3, cy, R + wid, g);
      circle(ctx, w * 0.3, cy, R, "#fff"); circle(ctx, w * 0.7, cy, R, "#fff");
      if (reveal) badge(ctx, "Beide Scheiben: RGB 255/255/255 – heller geht der Bildschirm nicht", w / 2, h - 26);
    }
  });

  addIllusion({
    id: "primelfeld", cat: "helligkeit", name: "Primelfeld (Kitaoka)", short: "Wellen im Schachbrett",
    hint: "Ein grün-violettes Schachbrett mit kleinen Rauten an den Ecken. Beim Blickwandern wogt die Fläche wie ein Feld im Wind, obwohl alles starr ist. Verändere die Rautengröße.",
    desc: "Kitaokas „Primrose's Field“ (2002): Kontrastreiche Mini-Rauten auf einem farbigen Schachbrett erzeugen illusorische Wellenbewegung.",
    why: "Die Rauten erzeugen lokale Helligkeitsasymmetrien an jeder Kante, ähnlich dem Café-Wall-Mechanismus. Zusammen mit Mikrosakkaden entsteht ein wandernder Bewegungseindruck.",
    params: [{ k: "sz", label: "Rautengröße", min: 0, max: 0.5, step: 0.01, def: 0.3 }, { k: "tile", label: "Kachelgröße", min: 20, max: 60, def: 34 }],
    anim: false,
    draw(ctx, w, h, p, t, reveal) {
      const T = p.tile, cols = Math.ceil(w / T) + 1, rows = Math.ceil(h / T) + 1, d = T * p.sz;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) rect(ctx, c * T, r * T, T + 0.5, T + 0.5, (r + c) % 2 ? "#2d8a3e" : "#7b3fa0");
      if (!reveal) for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) { const x = c * T, y = r * T; const white = ((r + Math.floor(c / 2)) % 2 === 0) !== (c % 2 === 0); poly(ctx, [[x, y - d], [x + d, y], [x, y + d], [x - d, y]], white ? "#fff" : "#000"); }
      if (reveal) badge(ctx, "Ohne Rauten: ein gewöhnliches, starres Schachbrett", w / 2, h - 26);
    }
  });
})();
