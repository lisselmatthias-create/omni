# Illusionslabor

Interaktive, animierte Sammlung von 125 optischen Täuschungen, Wahrnehmungseffekten und interaktiven Experimenten aus der Sehforschung – ohne Abhängigkeiten, reines HTML/CSS/Canvas.

**Öffnen:** `illusionen/index.html` (lokal per Doppelklick oder über GitHub Pages unter `/illusionen/`).

## Bedienung

- Liste links: nach Kategorie filtern oder suchen. Jede Illusion hat eine eigene URL (`#id`).
- Regler rechts verändern die Parameter live; „Reset“ stellt die Standardwerte wieder her.
- **Animation** (Leertaste) startet/stoppt die zeitliche Veränderung.
- **Auflösen** (Taste R) blendet die „Wahrheit“ ein: Messlinien, Vergleichsbalken, echte Tiefenordnung.
- Pfeiltasten ← → wechseln die Illusion, ⛶ schaltet die Bühne auf Vollbild.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html`, `style.css` | Oberfläche (Desktop dreispaltig, Mobil gestapelt) |
| `core.js` | Registry (`addIllusion`) und Zeichenhelfer (`H`) |
| `app.js` | Liste, Routing, Regler, Render-Loop |
| `illusions-geometrie.js`, `-2.js` | Größe & Form (Müller-Lyer, Ponzo, Zöllner, Café Wall, Tilt, Schiefer Turm …) |
| `illusions-helligkeit.js`, `-2.js` | Helligkeit & Farbe (Adelson, Hermann-Gitter, Benham, Koffka, Konfetti, Farbgitter …) |
| `illusions-bewegung.js`, `-2.js` | Bewegung (Rotierende Schlangen, Stepping Feet, Ternus, Ames-Fenster, Punktlicht-Läufer …) |
| `illusions-wahrnehmung.js`, `-2.js` | Mehrdeutig & Konturen (Kanizsa, Necker, Penrose, Blivet, Glass-Muster …) |
| `illusions-bewegung-3.js` | Bewegungssimulationen (Kinetischer Tiefeneffekt, Optischer Fluss, Parallaxe, Bewegung 2. Ordnung, Belebtheit …) |
| `illusions-muster.js` | Muster & Interferenz (Moiré-Explorer, Moiré-Lupe, Wellen-Interferenz, Op-Art, Reaktions-Diffusion, Phyllotaxis, Campbell-Robson …) |
| `illusions-farbe.js` | Farbe & Licht (Additive Mischung, Zapfen & Spektrum, Gegenfarben, Farbfehlsichtigkeit, Purkinje, Stroop …) |
| `illusions-effekte.js` | Sehen & Gehirn (Veränderungsblindheit, Crowding, Flimmerfusion, Autostereogramm, RDK) |
| `illusions-forschung.js` | Experimente (Laterale Hemmung, Rezeptives Feld, Staircase-Schwelle, Nonius, Weber, Gestalt, Visuelle Suche, Kipp-Nachwirkung) |

## Neue Illusion hinzufügen

```js
addIllusion({
  id: "meine-illusion", cat: "geometrie", name: "Titel", short: "Einzeiler",
  hint: "Was der Nutzer tun soll", desc: "Was passiert", why: "Warum",
  params: [{ k: "x", label: "Regler", min: 0, max: 1, step: 0.01, def: 0.5 }],
  draw(ctx, w, h, p, t, reveal, io) { /* Canvas-2D zeichnen; t = Sekunden, reveal = Auflösen aktiv */ }
});
```
