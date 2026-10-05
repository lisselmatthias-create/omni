# Illusionslabor

Interaktive, animierte Sammlung optischer Täuschungen – ohne Abhängigkeiten, reines HTML/CSS/Canvas.

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
| `illusions-geometrie.js` | Größe & Form (Müller-Lyer, Ponzo, Zöllner, Café Wall …) |
| `illusions-helligkeit.js` | Helligkeit & Farbe (Adelson, Hermann-Gitter, Nachbild, Benham …) |
| `illusions-bewegung.js` | Bewegung (Rotierende Schlangen, Stepping Feet, Lilac Chaser …) |
| `illusions-wahrnehmung.js` | Mehrdeutig & Konturen (Kanizsa, Necker, Penrose, Rubin …) |

## Neue Illusion hinzufügen

```js
addIllusion({
  id: "meine-illusion", cat: "geometrie", name: "Titel", short: "Einzeiler",
  hint: "Was der Nutzer tun soll", desc: "Was passiert", why: "Warum",
  params: [{ k: "x", label: "Regler", min: 0, max: 1, step: 0.01, def: 0.5 }],
  draw(ctx, w, h, p, t, reveal, io) { /* Canvas-2D zeichnen; t = Sekunden, reveal = Auflösen aktiv */ }
});
```
