# ABYSSARIUM — Wachstums- und Evolutionsengine

Nachfolger von RIFFWERK, entstanden aus einer zweiten Untersuchung der
Vorlage `KORALLEN_BIOSPHERE v183`: Welche Bedienfunktionen fehlten noch,
welche Lebensformen lassen sich mit Streben gut bauen, und wie waren
Ewiges Wachstum, Evolution und die Phantasiewesen dort angelegt. Alles
davon ist hier auf der RIFFWERK-Architektur (Worker-Simulation,
32-Byte-Instanzen, ein instanzierter Draw-Call) neu gebaut.

Eine HTML-Datei, keine Abhängigkeiten: `abyssarium/index.html`.

## 1. Was der Vorlage gegenüber RIFFWERK noch fehlte — und jetzt da ist

| Funktion der Vorlage | In ABYSSARIUM |
|---|---|
| Darstellungsweisen (Kupferstich, Dunkelfeld, Polarisation, Tiefenkarte, Durchleuchtung) | sieben Verfahren im Post-Pass, stufenlos einmischbar, mit Papier-/Tintenfarbe |
| Tonwert ACES / roh / neutral, Sättigung, Kontrast, Tönung, Farbquerfehler | Farbgraduierung vor dem Tonemapping, alle Regler im Reiter „Bild“ |
| Tiefenschärfe (Stärke, Ebene, Zone, Zerstreuungskreis) | 16-Proben-Scheibe im goldenen Winkel, Hintergrund streut nicht in scharfe Kanten |
| Präparatschnitt (Achse, Lage) | `discard` im Strebenshader, vier Achsen, Lage relativ zur Kolonie |
| Lichtfarbe, Kantenlicht, Wasser-/Hintergrundfarbe | Lichtwärme, Lichtstärke, Rim, vier weitere Farbfelder |
| Farbspur nach Alter, Radius, Höhe, Linie | sechs Farbspur-Modi im Shader |
| Videoaufnahme (WebM/MP4 über MediaRecorder) | Knopf „Aufnahme“, Taste `A`, Qualität wird während der Aufnahme eingefroren |
| Kamerafahrten, Presets, Bildwinkel | Front/Iso/Oben/Makro mit 700-ms-Fahrt, Bildwinkel- und Drehregler |
| Preset-Export/-Import | JSON, Link, Mutation (RIFFWERK) plus **eigene Arten** im Browser |
| Ewiges Wachstum | Ringpuffer mit Sterbe-Rampe, Generationen, Neuaustrieb, Wanderung, Bauweisenwechsel, somatische Drift |
| Evolution / Adaptivwesen / Mutanten | Population, Bewertung im Worker, sieben Fitness-Ziele, Turnier, Kreuzung, Mutation, Elite live |
| ~80 Modi, 300 Arten | 19 Kerne, 76 Arten als Daten — alle Hauptgruppen der Vorlage außer Fischen, Kopffüßern und Diorama-Szenen |

Nicht übernommen (bewusst): Audio-Eingang und Musik-Bindungen, Szenario-
Akte, Diorama/Stillleben/Häckel-Tafel als eigene Szenen, Fische, Kraken,
Kalmare und Weichkörper mit Shader-Animation. Das sind Szenen- und
Tierkörper-Systeme, keine Wachstumsverfahren; sie würden die Engine
wieder zum Monolithen machen.

## 2. Lebensformen — was neu gebaut wurde

Aus den Bauplänen der Vorlage (alle aus `habSeg`/`pushInst`-Aufrufen
rekonstruiert) sind zehn weitere Kerne entstanden, jeder als vollständig
geplanter, schrittweise ausgegebener Generator:

| Kern | Bauplan | Arten |
|---|---|---|
| `coilshell` | Raup-Wendelspirale (`d=D0·e^(kd·α)`, `r=R0·e^(kr·α)`), als Rohr aus Ringen, Rippen und Kammerbäuche | Nautilus, Ammonit, Turritella, Planorbis, Nummulites, Globigerina |
| `radiolaria` | Goldberg-Polyeder (Dual des frequenz-f-unterteilten Ikosaeders), Schalen, Radialbalken, Stacheln mit Zweigen, Poren, Kelchform | Aulonia, Circogonia, Actinomma, Dalongicaepa, Eucyrtidium |
| `anemone` | Säule aus Ringen, Mundscheibe, drei Tentakelkränze (20/33/47 %), Blasenspitzen | Heteractis, Entacmaea, Calliactis |
| `urchin` | Testa aus 22 Ringen × 50 mit pentamerer Modulation, Podienbänder, Stacheln auf der Fibonacci-Kugel | Diadema, S. purpuratus, Eucidaris, Toxopneustes |
| `jellyfish` | Glocke als Rotationskörper (vier Profile), Innenhaut, 16 Radialkanäle, Manubrium, Mundarme mit Rüschen, Randtentakel | Aurelia, Pelagia, Cyanea, Deepstaria |
| `network` | Physarum-Transportnetz nach Tero: k-NN-Graph, Kirchhoff-Druck per Gauß-Seidel, `D += (Q^γ/(1+Q^γ) − μD)·dt` | Physarum flach und räumlich |
| `halimeda` | Scheibenglieder an Sprossen im Goldenen Winkel | H. opuntia, H. tuna |
| `crinoid` | Stiel, Cirrenkranz, Arme mit beidseitigen Pinnulae, Einrollung | Himerometra, Cenocrinus |
| `tubeworm` | Kalkröhre mit Wachstumsringen, Kegelhelix-Krone aus gefiederten Radiolen | Spirobranchus, Sabella |
| `asteroid` | Scheibe als Drahtkörper, Arme aus Mittel-, Rand- und Querstreben, Stacheln, Podien | Asterias, Pycnopodia, Acanthaster, Brisinga |

Dazu drei Kerne für die Phantasiewesen der Vorlage:

- `wanderer` — eine nie zurückgesetzte Achse mit zwölf Organ-Emittern
  (Feder, Kranz, Krone, Ästchen, Gitter, Spirale, Kruste, Octopolyp,
  Köpfchen, Geodäte, Kraussaum, Dendrit). Drei Organwahlen: **Chimäre**
  (Organ A → B in Phasen mit Smootherstep), **Autopolypis** (jedes Organ
  bewertet Licht, Strömung, Sediment am Ort, plus Gedächtnis),
  **Tiefendrift** (sinkende Spirale, oszillierende Gewichte, Spiellust).
- `synthet` — Mix9-Formlabor: jede Spitze trägt neun Grammatiken als
  Gewichte (Phyllotaxis, Rhizom, Turing, Vectis, Helix, Eidos, DLA, Feld,
  Ring). Richtung = gewichtete Summe, Radius vom 1D-Gray-Scott-Ring
  moduliert, Murray-Gabeln, Kreuzung mit dem besten nahen Partner in den
  Regimes wild/ziel/evolutionär. Omnicoral ist derselbe Kern mit
  somatischer Drift.
- `city` — Neo-City-Baupläne: Tempelring mit Pfeilerkern, Habitaten und
  Dock; Forschungsposten mit Anker, Schaft und Modulen; schwebende
  Inseln an Tauen.

## 3. Ewiges Wachstum

Die Vorlage markierte alte Instanzen und schob den Puffer mit
`copyWithin` zusammen (O(n) je Bild). Hier ist der Instanzpuffer ein
**Ringpuffer**: der Schreibzeiger wickelt, der Shader rechnet das Alter
aus `uHead − (id + k·Kapazität)` und lässt die ältesten acht Prozent
schrumpfen, bevor sie überschrieben werden. Nichts wird kopiert.

Generationen: ist ein Kern fertig oder sein Budget (45 % der Kapazität)
verbraucht, mutiert das Genom innerhalb der Schema-Bereiche
(`mutAmp`), die Verzweigung treibt aus gespeicherten Spitzen neu aus,
alle anderen Kerne setzen am gewanderten Ursprung neu an (`drift`).
Mit `poolProb` wechselt die Bauweise zu einer zufälligen Art aus dem
Katalog (Endlosmutationswesen), mit `somatic` mutiert das Genom schon
während des Wachstums (somatische Mutation: der Körper als Protokoll).
Die Kamera folgt der Box der jüngsten 70 % der Streben.

## 4. Evolution

Die Vorlage hatte zwölf Kolonien in Teilpuffern mit Lebensdauer und
Verdrängung. Hier bewertet der Worker Genome **ohne Bilddaten**: ein
Individuum wächst bis zu 30 000 Streben in ≤ 2,5 s, zurück kommen
Strebenzahl, Höhe, Breite, belegte Zellen (6-cm-Raster), mittlere Höhe,
Ausrichtung nach oben, mittlerer Radius. Sieben Ziele (Licht, Sturm,
Filter, Abdeckung, Raum, Schlankheit, Masse) machen daraus eine Fitness.
Je Generation: Elite bleibt, Turnierauswahl (`Selektionsdruck`),
Kreuzung (uniform über die Schlüssel des Kerns), Gauß-Mutation
(`Mutationsstärke`). Die beste Form wächst live im Bild; „Beste als
eigene Art sichern“ legt sie im Browser ab.

## 5. Bedienung

Reiter **Arten** (76 Arten in 24 Gruppen, eigene Arten), **Gestalt**
(Regler des Kerns, Ewigkeits-Gruppe), **Bild** (Farben,
Darstellungsweisen, Kamera-Presets, Licht, Material, Wasser, Strömung,
Optik, Qualität), **Evolution**, **Werte** (JSON, Link, Mutation,
Diagnose). Tasten: Leertaste, R, N, S, M, B, W (ewig), A (Aufnahme), F,
H, Pfeile.
