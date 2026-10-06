# RIFFWERK — Wachstumsengine für marine Skelettformen

Ein völlig neu gebautes Werkzeug, entstanden aus der Analyse von
`KORALLEN_BIOSPHERE v183 (Reglerwerte)`. Es übernimmt die Idee —
prozedurale Skelette aus instanzierten Streben, Arten als Reglersätze —
und setzt sie auf eine Architektur, die eine Größenordnung mehr
Geometrie bei stabiler Bildrate trägt. Eine einzelne HTML-Datei, keine
Abhängigkeiten, läuft von GitHub Pages, auf dem iPad und auf dem Desktop.

Live: `riffwerk/index.html` dieser Seite.

## Was die Vorlage ausbremste

Die Analyse der 1,8 MB großen Vorlage (30 237 Zeilen, ein einziges
Skript) ergab fünf strukturelle Engpässe:

| Engpass in v183 | Folge |
|---|---|
| Wachstum, Bildaufbau und Bedienung im selben Faden | jeder Wachstumsschritt verzögert das Bild; bei großen Kolonien ruckelt alles |
| Räumlicher Hash über Zeichenketten (`cellKey` baut `"x\|y\|z"`-Strings) | Zeichenkettenbau und Garbage Collection je Strebe, Hauptkostenpunkt des L-Systems |
| `uploadInstances()` lädt den **gesamten** Instanzpuffer bei jeder Änderung (bis 4 MB je Schritt) | Busbandbreite statt Rechenzeit begrenzt die Zuwachsrate |
| Feste Obergrenze 90 000 Streben, 44 Byte je Strebe | Kolonien bleiben klein, obwohl die Grafikkarte mehr könnte |
| ~80 Modi als `if/else`-Ketten, 670 Regler, 300 Arten als Code | jeder neue Modus ist ein Eingriff in Bildaufbau, Menü und Zustand |

Gleichzeitig enthält die Vorlage viel, was richtig war und übernommen
wurde: Instanzindex als Alter (Knospung ohne Zusatzattribut),
Modalzerlegung des Balkens für das Strömungsschwingen, fester
Simulationstakt, adaptive Auflösung, Zuchtnummer als deterministischer
Startwert, Verjüngung über Tiefe, Fächerebene senkrecht zur Strömung.

## Architektur von RIFFWERK

```
┌─────────────────────────┐   32-Byte-Records, übertragbare Puffer   ┌──────────────────────────┐
│ Web Worker: Simulation  │ ───────────────────────────────────────▶ │ Hauptfaden: WebGL2        │
│ 6 Wachstumskerne        │ ◀─────────────────────────────────────── │ bufferSubData nur am Kopf │
│ Integer-Hash, SoA,      │        ack (Gegendruck, max. 2 offen)    │ 1 instanzierter Draw-Call │
│ mulberry32, f16-Encoder │                                          │ Schatten·MSAA·SSAO·Bloom  │
└─────────────────────────┘                                          └──────────────────────────┘
```

**Simulation (Worker).** Sechs Kerne, alle auf typisierten Arrays ohne
Objekte je Strebe:

- `branch` — stochastisches L-System mit apikaler Dominanz, Tropismen,
  Raumkonkurrenz, Anastomose, Fächerebene, Polypenbüschel. Verjüngung
  asymptotisch gegen den Mindestradius; Spitzen sterben über eine
  Lebensdauer, nicht am Radius.
- `colonize` — Raumkolonisation (Runions 2007). Attraktoren in einer
  Hüllform (Kuppel, Säule, Fächer, Tafel, Kugel), inkrementelle
  Zuordnung Attraktor → nächster Knoten beim Einfügen (nicht je
  Iteration), blockierte Knoten geben ihre Attraktoren ab.
- `dla` — gitterfreie diffusionsbegrenzte Anlagerung mit dilatiertem
  Grobgitter: ein Zugriff entscheidet, ob ein Wanderer fein oder in
  weiten Schritten läuft.
- `lattice` — Silikatgitter auf Rotationsfläche mit Helixrippen.
- `accrete` — Eden-Oberflächenwuchs; die freie Richtung kommt aus den
  sechs Nachbarzellen, nicht aus einem Schwerpunkt.
- `feather` — Fiederachse mit Blättern und Fiedern.

Der räumliche Hash ist offen adressiert über 30-Bit-Ganzzahlschlüssel
(`CountGrid` für Belegung, `NodeGrid` mit verketteten Eimern für
Nächste-Nachbarn-Suche). Es werden keine Closures und keine Strings je
Abfrage gebaut.

**Instanzformat.** 32 Byte je Strebe statt 44: Position als drei
`float32`, Richtung/Länge und Radien/Spitze/Farbspur als acht `float16`
(eigener Encoder, keine `Float16Array`-Abhängigkeit), ein `float32`
Hilfswert. Eine Million Streben belegen 32 MB.

**Renderer.** Ein `drawElementsInstanced` für die ganze Kolonie. Das
Prisma-Netz wird nach Strebenzahl gestuft (14 Seiten mit runden Kappen
bis 12 k, 10 Seiten bis 60 k, 8 bis 250 k, darüber 6). Schattenpass
mit eigenem Tiefenprogramm, das **denselben** Verformungstext wie der
Hauptpass einbindet (Strömungsschwingen, Knospung, Altersverdickung),
damit Schatten und Körper nicht auseinanderlaufen. Szene in RGBA16F mit
MSAA, SSAO in halber Auflösung mit bilateralem Blur, Bloom-Kette über
fünf Stufen mit getrennten Auf-/Abwärtstexturen, ACES-Tonemapping,
Wasserraum mit Absorption und Lichtschächten.

**Qualitätsregelung.** Fünf Stufen (Auflösung 100–55 %, MSAA 4/2/0,
SSAO an/aus), gestuft nach der mittleren Bildzeit gegen ein Budget von
16,9 ms, mit Sperrzeit gegen Pendeln.

**Arten sind Daten.** `SCHEMA` beschreibt jeden Regler einmal
(Bereich, Schritt, Kerne, Gruppe); die Bedienung wird daraus erzeugt und
zeigt nur, was der aktive Kern liest. Eine Art ist ein Teilsatz von
Genomwerten plus Darstellungswerten. Genome lassen sich als JSON
kopieren, einfügen, als Link teilen (`#g=…`, nur Abweichungen vom
Standard) und mutieren.

## Gemessene Simulationsleistung (Node 22, ein Kern, Streben je Sekunde Rechenzeit)

| Kern | Art | Streben | Durchsatz |
|---|---|---|---|
| branch | Antipathes dichotoma | 80 000 | ~850 k/s |
| branch | Dendronephthya | 70 000 | ~800 k/s |
| branch | Gorgonia ventalina | 120 000 | ~700 k/s |
| lattice | Euplectella | 5 840 | ~500 k/s |
| feather | Pennatula | 3 600 | ~2 M/s |
| accrete | Porites lobata | 160 000 | ~85 k/s |
| dla (planar) | Mangandendrit | 100 000 | ~200 k/s |
| dla (3D) | Platygyra | 50 000 | ~16 k/s |
| colonize | Acropora hyacinthus (Tafel) | 120 000 | ~14 k/s |
| colonize | Riffplatte, 12 Wurzeln | 400 000 | ~19 k/s |

Zum Vergleich: der Verzweigungspfad der Vorlage lief auf dem Hauptfaden,
baute je Strebe mehrere Arrays und einen Zeichenkettenschlüssel und lud
den vollen Puffer hoch — und stand bei 30 000 Streben still, weil die
Verjüngung jede Linie nach ~55 Schritten tötete.

## Bedienung

- **Arten** — Katalog nach Gruppen; Pfeiltasten blättern.
- **Gestalt** — Regler des aktiven Kerns; mit `·` markierte bauen neu
  auf (380 ms Verzögerung), die übrigen wirken sofort. Doppelklick auf
  die Beschriftung setzt den Standard. Zucht-Nr. ändert das Individuum.
- **Bild** — Farbe, Licht (relativ zur Kamera), Material, Wasser,
  Strömung, Qualitätsstufe.
- **Werte** — JSON kopieren/einfügen, Link teilen, Mutation, Diagnose
  (Grafiktreiber, HDR, MSAA, Shaderstatus, Durchsatz).
- Tasten: `Leertaste` Pause, `R` neu, `N` nächste Zucht-Nr., `S`
  Drehung, `M` Menü, `B` Bild sichern (2×), `F` Vollbild, `H` Hilfe.
- Touch: ein Finger dreht, zwei Finger zoomen, Doppeltipp setzt die
  Ansicht zurück.

## Dateien

- `index.html` — das Werkzeug (Markup, Stile, Worker-Quelltext im
  `<script type="text/plain">`, Genomschema, Renderer, Anwendung).
- `README.md` — diese Beschreibung.
