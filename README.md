# omni

Browserbasierte Instrumente von lisselmatthias-create, als einzelne HTML-Dateien ohne Abhängigkeiten.

- `index.html` – RD Dual Pointcloud (iPad-optimiertes Reaction-Diffusion-Instrument mit zwei Punktwolken).
- `omni-hub.html` – OMNI Hub: Übersicht, Fähigkeiten-Matrix, Review-Befunde und Launcher für alle 13 HTML-Tools
  aus den Repos `omni`, `gmu-media-launcher`, `jellyfish-lab-v7`, `pointcloud3` und `rd-dual-pointcloud`.
  Enthält eine Vorschau (iframe, auch in iPad- und Phone-Größe) und Links zu GitHub Pages und Quellcode.

Die Daten im Hub stammen aus einer Quellcode-Analyse vom 2026-10-04 und stehen als `DATA`-Objekt am Ende
von `omni-hub.html`. Neue Tools werden dort als Eintrag in `tools` ergänzt.

GitHub Pages wird über `.github/workflows/pages.yml` bei jedem Push auf `main` deployt.
