# omni

Sammlung browserbasierter WebGL-Werkzeuge (kein Build nötig, läuft direkt per GitHub Pages).

| Tool | Pfad | Beschreibung |
| --- | --- | --- |
| RD Dual Pointcloud | [`index.html`](index.html) | iPad-taugliches Audio/Video-Instrument mit Reaktions-Diffusions-Mustern und Punktwolken. |
| Wellenlabor | [`wellen/index.html`](wellen/index.html) | Interaktives Labor für Wellen, Interferenz und Moiré-Muster. |

## Wellenlabor

Drei Modi, alle in Echtzeit im Fragment-Shader berechnet:

- **Wellen** – bis zu 8 Punktquellen oder ebene Wellen mit Wellenlänge, Kreisfrequenz, Phase, Amplitude und Dämpfung.
  Darstellungen: Momentaufnahme, Intensität (zeitliches Mittel), Amplitudenhülle, Phase, Höhenlinien.
  Quellen per Ziehen bewegen, per Doppeltipp setzen; Anordnungen für Doppelspalt, Gitter, Kreis und stehende Welle.
- **Moiré** – bis zu 3 Ebenen aus Linien, Punktraster, Sechseck-Raster, Ringen, Strahlen oder Schachbrett.
  Pro Ebene Periode, Winkel, Versatz, Füllgrad, Weichheit sowie Rotation, Drift und Perioden-Atmung als Animation.
  Mischungen: Multiplizieren, Addieren, Differenz, Minimum, Maximum, Negativ-Multiplizieren, XOR.
- **Wellen × Moiré** – das Interferenzfeld wird selbst zur Moiré-Ebene und mit den Gittern verrechnet.

Dazu Presets (eigene werden lokal gespeichert), Zufallsgenerator, Messwerte (k, T, Spaltabstand in λ, berechnete Moiré-Periode),
PNG-Export und teilbarer Link mit dem kompletten Zustand im URL-Hash.
