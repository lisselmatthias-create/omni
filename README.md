# Prisma – Wahrnehmungs- und Simulationsstudio

Prisma bringt optische Täuschungen, Wellenphysik sowie Muster- und Lebenssimulationen in **einer** HTML-Datei zusammen. Es gibt keinen Build-Step und keine externen Abhängigkeiten, die Datei läuft offline. Jede Illusion, jede Wellenszene, jedes PDE-Modell und jedes Kulturmuster ist ein *Modul* derselben Registry. Deshalb hat jedes Modul dieselben Regler, Reveal-Ansichten, Messwerte, Links und Exporte.

> **Stand: Etappe 1 von 5** (`prisma.html`, Version `0.1.0-etappe1`)
> Fertig sind Core, Registry, Reveal-API, State/Undo/Hash, Parameter-Spine (Grundform), das Panel mit dem Tab „Durchblättern“ und drei portierte Illusionen (Müller-Lyer, Hermann-Gitter, Ebbinghaus).
> Die Tabs Ebenen, Matrix, Audio und Raum sind als Platzhalter angelegt und mit der Etappe beschriftet, in der sie kommen.

Öffnen: `prisma.html` einfach im Browser laden, ganz ohne Server. Über GitHub Pages ist die Datei unter `…/prisma.html` erreichbar. Die bisherige `index.html` (RD Dual Pointcloud) bleibt unverändert.

## Kurzanleitung

1. **Durchblättern**: Rechts im Katalog suchen (Name, Mechanismus, Kategorie), nach Kategorie oder ★ Favoriten filtern, mit ◀ ▶ oder den Pfeiltasten blättern.
2. **Auflösen**: Tippe **Space** (oder tippe einmal auf die Bühne). Danach zeigt die Bühne Messlinien, Lote, Profile und echte Maße, und das Info-Panel springt von *Was passiert* auf *Warum*. Hältst du Space gedrückt, siehst du die Auflösung nur, solange die Taste unten ist.
3. **Vergleichen**: Im Tab *Reveal* stehen die Ansichten *Split*, *nur Reiz* und *nur Simulation* zur Wahl. Daneben gibt es pro Modul Wahrnehmungsmodelle, z. B. ein DoG-Filter für laterale Hemmung oder einen Tiefpass. Die Teilungslinie lässt sich auf der Bühne verschieben.
4. **Regler**: Szenen-Presets, gruppierte Regler mit Didaktik-Satz. Ein Doppelklick auf einen Namen setzt den Wert zurück. Mit ∿ markierte Regler sind Modulationsziele (Matrix ab Etappe 2).
5. **Messen**: Unter *Info › Messwerte* stehen Live-Kennzahlen, etwa deine Täuschungsstärke aus dem Abgleich oder die DoG-Antwort an Kreuzung und Straße.
6. **Teilen und Sichern**: Im Tab *Export* gibt es PNG, einen Link (enthält Modul, Parameter und Reveal-Zustand), JSON-Export/-Import und eigene Presets.

### Tastatur

| Taste | Wirkung |
|---|---|
| ← / → | Modul blättern (in der aktuellen Such-/Filterauswahl) |
| Space | Reveal umschalten · halten = nur kurz zeigen |
| K | Play / Pause |
| Z · Umschalt+Z / Y | Rückgängig · Wiederholen (auch Strg/⌘+Z) |
| R | Zufällige Parameter |
| P | PNG speichern |
| F | Vollbild |
| ? | Hilfe |
| M · N · 1/2 | Modulation · neue Quelle · Fläche/Raum (Etappen 2–4, zeigen bis dahin einen Hinweis) |

### Touch

| Geste | Wirkung |
|---|---|
| Tippen | Reveal umschalten |
| Doppeltipp | Vollbild |
| Wischen ← → | Modul blättern |
| Lang drücken / Rechtsklick | Kontextmenü (Reveal, Favorit, Zufall, Standard, PNG, Link) |
| Ziehen am ⇔ | Split-Teilung verschieben |

Auf Touch-Geräten (`pointer: coarse`) werden Schaltflächen und Regler-Griffe größer. Unter 820 px Breite wird das Panel zum Bottom-Sheet: Ein Tipp auf den Griff wechselt zwischen *klein*, *halb* und *groß*.

## Aufbau von `prisma.html`

Die Abschnitte sind im Quelltext mit Bannerkommentaren markiert:

| Abschnitt | Inhalt | Stand |
|---|---|---|
| `CORE` | Kategorien, Mechanismen-Glossar, `Prisma.register`, `Report`, Hilfsfunktionen | ✔ |
| `SPECS` | Parameter-Spine `Specs.define`, `parameterBounds` | ✔ (Sweep ab Etappe 2) |
| `MODULATION`, `AUDIO` | LFOs, Matrix, XY-Pad, Audio-Stack, Sonifikation | Etappe 2 |
| `STATE` | `defaultState`, `sanitizeState`, `State`, `Hist` (Undo), `Hash` | ✔ |
| `RENDER-2D` | `H`-Zeichenhilfen, `Filters` (DoG, Blur), `Engine` (Cache, Komposition, Reveal, Split) | ✔ |
| `MODULE` | Illusionen | 3 von allen |
| `SIM-PDE`, `SIM-LIFE`, `SIM-SCULPT`, `ETHNO`, `RENDER-3D` | | Etappen 3–5 |
| `UI` | Tabs, HUD, Toasts, Kontextmenü, Hilfe, Tastatur, Gesten | ✔ |
| `RUNTIME-CHECK` | `validateRuntime` (Canvas, WebGL2, Float-Ziel, Speicher) | ✔ |
| `INTRO` | Einführungs-Slides | Etappe 5 |

Der gesamte Zustand lässt sich serialisieren:

```js
{ v, layers:[{ mod, blend, opacity, visible }], sel, params:{ 'modul.key': wert },
  reveal:{ on, view, filter, split }, mods, audio, camera, quality:{ scale, light } }
```

`mods`, `audio` und `camera` sind schon reserviert. So bleiben Links und JSON-Dateien aus Etappe 1 auch später gültig.

## Erweiterungs-Kochbuch

Ein neues Modul ist ein einziger `safeRegister({...})`-Aufruf im Abschnitt `MODULE`. An der Engine änderst du dafür nichts. Pflichtfelder, Reveal und Messwerte sind in [CONTRIBUTING.md](CONTRIBUTING.md) beschrieben. Alle drei Beispiele unten wurden in der laufenden App getestet.

### Neue Illusion (Zöllner, 16 Zeilen)

```js
safeRegister({
  id:'zoellner', cat:'size', name:'Zöllner-Täuschung', short:'Parallele wirken schräg.',
  hint:'Space zeigt die Parallelen.', desc:'Parallele Linien mit schrägen Querstrichen.',
  why:'Orientierungskontrast zwischen Linie und Querstrichen (Zöllner 1860).', mechanism:['orient'],
  params:[{ key:'tilt', label:'Querstrich-Winkel', min:10, max:80, step:1, def:45, unit:'°' }],
  render(ctx, S, p) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, S.w, S.h); ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    const a = p.tilt * Math.PI / 180; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const x = S.w * (i + 1) / 7; ctx.moveTo(x, 40); ctx.lineTo(x, S.h - 40);
      for (let y = 60; y < S.h - 60; y += 30) { const d = (i % 2 ? 1 : -1) * 14;
        ctx.moveTo(x - d * Math.cos(a), y - 14 * Math.sin(a)); ctx.lineTo(x + d * Math.cos(a), y + 14 * Math.sin(a)); } }
    ctx.stroke(); },
  reveal({ ctx, size:S }) { for (let i = 0; i < 6; i++) H.line(ctx, S.w * (i + 1) / 7, 30, S.w * (i + 1) / 7, S.h - 30); },
});
```

### Neues PDE-Modell (Gray-Scott auf der CPU, 22 Zeilen)

Bis Etappe 5 laufen PDEs im 2D-Pfad. Danach kommt eine GPU-Schnittstelle (Ping-Pong-Float-Texturen) dazu. Die Felder `init`, `animated` und `st` bleiben dabei gleich.

```js
safeRegister({
  id:'gray-scott-mini', cat:'eq', name:'Gray-Scott (Mini)', short:'Reaktion-Diffusion auf der CPU.',
  hint:'Ändere f und k.', desc:'Zwei Stoffe reagieren und diffundieren.', why:'Turing-Instabilität (Turing 1952).',
  params:[{ key:'f', label:'Zufuhr f', min:0.01, max:0.08, step:0.001, def:0.037 },
          { key:'k', label:'Abbau k', min:0.04, max:0.07, step:0.001, def:0.06 }],
  animated:true,
  init(p, st) { const N = st.N = 128; st.u = new Float32Array(N*N).fill(1); st.v = new Float32Array(N*N);
    for (let y = 54; y < 74; y++) for (let x = 54; x < 74; x++) st.v[y*N+x] = 0.5;
    st.img = new ImageData(N, N); st.cv = new OffscreenCanvas(N, N); },
  render(ctx, S, p, t, rev, { st }) {
    const { N, u, v } = st, L = (a, i) => a[(i+1)%(N*N)] + a[(i-1+N*N)%(N*N)] + a[(i+N)%(N*N)] + a[(i-N+N*N)%(N*N)] - 4*a[i];
    for (let s = 0; s < 8; s++) { const u2 = u.slice(), v2 = v.slice();
      for (let i = 0; i < N*N; i++) { const r = u2[i]*v2[i]*v2[i];
        u[i] += 0.2*L(u2, i) - r + p.f*(1-u2[i]); v[i] += 0.1*L(v2, i) + r - (p.f+p.k)*v2[i]; } }
    for (let i = 0; i < N*N; i++) { const c = 255*(1-v[i]*2); st.img.data.set([c, c, c, 255], 4*i); }
    st.cv.getContext('2d').putImageData(st.img, 0, 0);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(st.cv, 0, 0, S.w, S.h);
  },
  measure(p, t, st) { let m = 0; for (const x of st.v) m += x; return [{ k:'⟨v⟩', v:(m/st.v.length).toFixed(4) }]; },
});
```

### Neues Kulturmuster (Sona mit ggT-Nachweis, 23 Zeilen)

Ein Lichtstrahl wird im Rechteck aus `b × h` Feldern an den Rändern reflektiert. Die Zahl der geschlossenen Kurven ist ggT(b, h). Das Messpanel zählt die Kurven und stellt sie dem ggT gegenüber.

```js
safeRegister({
  id:'sona-mini', cat:'cult', name:'Sona (Mini)', short:'Spiegelkurve um ein Punktraster.',
  hint:'Ändere Breite und Höhe – ggT(b, h) Kurven entstehen.', desc:'Eine Linie läuft zwischen Punkten, an den Rändern gespiegelt.',
  why:'Die Linie ist ein Lichtstrahl im Rechteck: Bei b × h Feldern entstehen ggT(b, h) geschlossene Kurven (Gerdes 1999).',
  params:[{ key:'b', label:'Breite', min:1, max:12, step:1, def:5 }, { key:'h', label:'Höhe', min:1, max:12, step:1, def:3 }],
  render(ctx, S, p, t, rev, { st }) {
    const g = (a, b) => b ? g(b, a % b) : a, W = 2*p.b, Hh = 2*p.h, c = Math.min(S.w/(W+2), S.h/(Hh+2));
    const ox = (S.w - W*c)/2, oy = (S.h - Hh*c)/2, seen = new Set(), hue = ['#e8590c','#1c7ed6','#2f9e44','#ae3ec9','#f08c00','#0c8599'];
    ctx.fillStyle = '#f4ede1'; ctx.fillRect(0, 0, S.w, S.h); ctx.lineWidth = 3; let n = 0;
    for (let x0 = 1; x0 < W; x0 += 2) {             // Startpunkte am oberen Rand
      if (seen.has(x0+',0')) continue; let x = x0, y = 0, dx = 1, dy = 1;
      ctx.strokeStyle = hue[n++ % 6]; ctx.beginPath(); ctx.moveTo(ox + x*c, oy + y*c);
      do { if (y === 0) seen.add(x+',0'); x += dx; y += dy; ctx.lineTo(ox + x*c, oy + y*c);
        if (x === 0 || x === W) dx = -dx; if (y === 0 || y === Hh) dy = -dy; } while (!(x === x0 && y === 0));
      ctx.stroke(); }
    ctx.fillStyle = '#222'; for (let i = 0; i < p.b; i++) for (let j = 0; j < p.h; j++) { ctx.beginPath(); ctx.arc(ox + (2*i+1)*c, oy + (2*j+1)*c, 3, 0, 7); ctx.fill(); }
    st.n = n; st.g = g(p.b, p.h);
  },
  measure(p, t, st) { return [{ k:'Kurven gezählt', v:st.n }, { k:'ggT(b, h)', v:st.g }]; },
});
```

## Entscheidungen (Etappe 1)

Wo die Spezifikation offen ist, habe ich so entschieden:

1. **Quelldateien fehlen.** Das Illusionslabor („erste Datei“) und das Wellenstudio liegen nicht im Repository. Die drei Illusionen sind deshalb **nach Spezifikation und Literatur neu gebaut**, nicht 1:1 portiert. Ebenso sind `specs`, `H.measure`/`H.badge`, `encodeArray` usw. eigene Implementierungen mit den Namen aus dem Prompt. Siehe *Offene Fragen*.
2. **Reveal-Signatur.** Statt `reveal(state, p, t)` heißt die Signatur `reveal(R, p, t)`. `R` bündelt `ctx`, `size`, `st` (Modulzustand), `H`, `stim(x,y)`, `sim(x,y)`, `view` und `filterName`. So kann ein Overlay echte Pixelwerte des Reizes und des Wahrnehmungsmodells lesen, z. B. das Profil im Hermann-Gitter.
3. **Parameter-Schlüssel.** Parameter heißen global `modul.key` (z. B. `hermann-gitter.street`). Mit `shared:true` wird ein Parameter global unter seinem Namen geführt, und `linked` sammelt dann alle Module, die ihn nutzen. Das ist die Grundlage für `paletteMix` & Co.
4. **Hash-Format** kurz und lesbar statt Base64: `#m=hermann-gitter&r=1&v=split&p=curve:0.55`. Gespeichert werden nur Werte, die vom Standard abweichen. Mehrere Ebenen kommen in Etappe 3 als `l=`-Liste dazu, Feldspeicher großer Simulationen nur im JSON-Export.
5. **Simulationsansicht** sieht immer den unveränderten Reiz. Gedimmte Flossen o. Ä. gibt es nur in der Ansicht *Auflösung*.
6. **XOR-Mischung** wird im 2D-Pfad durch `exclusion` angenähert. Echtes bitweises XOR kommt mit dem WebGL-Kompositor in Etappe 3.
7. **Netzwerksperre per CSP** (`connect-src 'none'`). Das Prinzip „keine Daten verlassen das Gerät“ wird so technisch erzwungen und in der Fußzeile angezeigt.
8. **Adaptive Auflösung.** Bleibt eine Animation bei unter 28 fps, sinkt die Renderauflösung in 10-%-Schritten bis auf 50 %. Das *leichte Profil* (Info-Tab) rendert mit einfacher Pixeldichte. Statische Bilder werden pro Ebene offscreen gecacht und nur neu gezeichnet, wenn sich ihre Signatur ändert.
9. **Undo** speichert ganze Zustands-Snapshots. Identische Snapshots werden übersprungen (Signatur-Diff), die Historie ist auf 80 Einträge bzw. 1,5 MB gekappt. Reveal-Umschalten landet bewusst nicht in der Historie.
10. **Tap = Reveal.** Ein einfacher Tipp auf die Bühne schaltet Reveal um, außer bei Modulen mit `interactive:true`, die Zeigereingaben selbst brauchen.

## Offene Fragen (gebündelt)

1. **Quelldateien:** Kannst du das Illusionslabor und das Wellenstudio (HTML) ins Repo legen? Ohne sie kann ich „funktional identisch“ für die übrigen Illusionen und Simulationen (Etappen 3–5) nicht prüfen und baue nur nach Beschreibung nach.
2. **Liste der Illusionen:** Falls die Dateien nicht verfügbar sind: Welche Illusionen gehörten zur „vollständigen Sammlung“? Eine Namensliste reicht.
3. **Ziel-URL:** Soll `prisma.html` später `index.html` (RD Dual Pointcloud) als Startseite ersetzen, oder sollen beide nebeneinander bestehen bleiben?
4. **Sprache:** Bleibt die Oberfläche nur auf Deutsch, oder ist eine englische Fassung geplant? Davon hängt ab, ob Texte in eine i18n-Tabelle wandern.

## Fahrplan

| Etappe | Inhalt |
|---|---|
| 1 ✔ | Core, Registry, Reveal-API, State, Panel mit Durchblättern, 3 Illusionen |
| 2 | Parameter-Spine vollständig (Sweep), Modulationsmatrix, Audio |
| 3 | Ebenen-Komposition (WebGL-Kompositor), 2D-Render-Pfad, alle Illusionen |
| 4 | 3D-Render-Pfad, Körper, Kürpig, Ethnomathematik |
| 5 | PDE, Leben, Experimente (Staircase, Nonius, Stroop …), CSV-Export, Einführung |
