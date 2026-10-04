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

### Einführung und Bedienung (Version 2)

- **Einführung** in sechs Schritten mit Live-Beispielen hinter der Karte (Bedienung, Wellen, Interferenz, Phase, Moiré, Kombination);
  startet beim ersten Besuch automatisch, jederzeit über `?` erreichbar. Unter *Info → Experimente* liegen Aufgaben mit fertigem Aufbau.
- **Touch:** Bottom-Sheet mit Griff (drei Rastpunkte), Tabs statt langer Liste, 46-px-Zielflächen, große Reglerknöpfe mit −/+ Steppern
  (gedrückt halten wiederholt), Werte antippen zur Direkteingabe, Long-Press-Kontextmenü, Pinch-Zoom, Zwei-Finger-Drehen der Moiré-Ebene.
- **Desktop:** Seitenleiste (☰ ausblendbar), Hover-Hervorhebung der Quellen mit Greif-Cursor, Rechtsklick-Menü, Mausrad-Zoom zum Zeiger,
  Alt+Rad dreht die Ebene, Tastaturkürzel (Leertaste, 1/2/3, N, Entf, Tab, Pfeile, [ ], + − 0, P, R, H, F, ?).
