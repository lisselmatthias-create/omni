# Mitmachen bei Prisma

Prisma ist eine einzige Datei, `prisma.html`. Ein Beitrag ist fast immer ein neues Modul: ein `safeRegister({...})`-Aufruf im Abschnitt `MODULE`. Die Engine (`CORE`, `STATE`, `RENDER-2D`, `UI`) muss dafür nicht angefasst werden. Falls doch, ist das ein Hinweis auf eine fehlende Konvention: bitte als eigenes Thema vorschlagen.

## Felder eines Moduls

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `id` | ✔ | eindeutig, `a–z0–9-`, wird in Links verwendet und darf sich nie ändern |
| `cat` | ✔ | eine der Kategorien aus `CATS` (`size`, `light`, `motion`, `ambig`, `pattern`, `color`, `brain`, `waves`, `eq`, `life`, `space`, `cult`, `exp`) |
| `name` | ✔ | Anzeigename |
| `desc` | ✔ | **Was passiert** – sachlich, was man sieht. Absätze mit `\n\n` trennen |
| `why` | ✔ | **Warum** – Mechanismus mit Quellenangabe im Text (Autor Jahr) |
| `render` | ✔ | `render(ctx, size, p, t, reveal, io)` |
| `short` | | ein Satz für Katalogkarte und Titelzeile |
| `hint` | | Bedienung in einem Satz, wird unten auf der Bühne gezeigt |
| `mechanism` | | IDs aus dem Glossar `MECH` – im Reveal hervorgehoben |
| `sources` | | vollständige Quellen, siehe unten |
| `params` | | Parameter-Spezifikationen, siehe unten |
| `presets` | | `[{ name, p:{ key:wert } }]` – Szenen im Regler-Tab |
| `compare` | | Wahrnehmungssimulationen für die Split-Ansicht, siehe unten |
| `reveal` | | `reveal(R, p, t)` – eigenes Auflösungs-Overlay |
| `measure` | | `measure(p, t, st, api)` – Zeilen für das Messpanel |
| `init` | | `init(p, st)` – einmalig beim Laden in eine Ebene (Seed, Puffer, Vorberechnung) |
| `animated` | | `true` oder `p => bool`. Ohne Animation wird das Bild gecacht und nur bei Änderungen neu gezeichnet |
| `layers` | | Standard `true`. `false` = exklusiv (einzige Ebene) |
| `spatial` | | `false`, `true` oder `'both'` – 2D, 3D oder beides (ab Etappe 4) |
| `interactive` | | `true`, wenn das Modul Zeigereingaben selbst nutzt. Dann schaltet ein Tipp nicht Reveal um |

### `render(ctx, size, p, t, reveal, io)`

- Alle Koordinaten sind **CSS-Pixel**: `size = { w, h, dpr }`. Die Engine skaliert `ctx` bereits mit der Pixeldichte.
- Zeichne den **ganzen** Hintergrund selbst, damit die Ebenen-Komposition definiert bleibt.
- `p` ist die lokale Parameteransicht, z. B. `p.len`. Werte sind schon durch `parameterBounds` geprüft.
- `reveal` ist `true`, wenn die Ansicht *Auflösung* aktiv ist. Dann darfst du Kontext dimmen (z. B. Flossen auf 28 %). In *Split* und *Simulation* ist es `false`, damit das Wahrnehmungsmodell den echten Reiz sieht.
- `io.st` ist dein privater, nicht serialisierter Zustand. Lege dort Geometrie ab (`st.geo = {...}`), damit `reveal` und `measure` dieselben Zahlen verwenden wie die Zeichnung.
- Bei Ausnahmen zeigt die Engine ein ⚠ auf der Bühne und einen Eintrag unter *Info › Meldungen*. Die übrigen Ebenen laufen weiter. Benutze nie `alert()`.

## Parameter (`params`)

Jeder Eintrag landet im globalen Parameter-Spine `Specs.all`. Von dort kommen Regler, Bounds, Presets, Hash, JSON und (ab Etappe 2) die Modulationsziele.

```js
{ key:'street', label:'Straßenbreite', min:6, max:60, step:1, def:22, unit:'% Quadrat',
  group:'Geometrie', didactic:'Ein Satz, was dieser Regler lehrt.' }
{ key:'polarity', type:'select', label:'Polarität', def:'dark', options:[{ v:'dark', label:'Dunkel' }, …] }
{ key:'scint', type:'bool', label:'Szintillierend', def:false }
```

- `type`: `range` (Standard), `select` oder `bool`.
- `didactic`: Erscheint unter dem Regler und als Tooltip. Formuliere es als überprüfbare Aussage („Ohne Flossen verschwindet die Täuschung“), nicht als Werbung.
- `shared:true` + `linked:[ids]`: Der Parameter wirkt modulübergreifend (z. B. `paletteMix`).
- `mod:false` schließt einen Regler als Modulationsziel aus, `sweep:false` von der automatischen Mini-Psychophysik.
- Wenn ein Parameter die **Täuschungsstärke misst** (Herstellungsmethode), lege ihn in die Gruppe `Messung` und werte ihn in `measure` aus.

## Reveal

Reveal ist eine Konvention, kein Sonderfall: Wer `reveal(R, p, t)` implementiert, bekommt Overlay, Textwechsel und Split-Ansicht automatisch.

`R = { ctx, size, st, H, view, stim(x,y), sim(x,y), filterName }`

Ein gutes Reveal macht vier Dinge:

1. **Messung**: gestrichelte Cyan-Linien mit Zahlen. Nutze `H.measure(ctx, x1, y1, x2, y2, 'A: 312 px')`, `H.badge`, `H.circle`, `H.line`.
2. **Wahrheit**: was physikalisch da ist, z. B. Lote in Bernstein (`{ color:H.AMBER }`), Originalkurven, Tiefenreihenfolge, Helligkeitsprofile (`H.plot`). `stim(x, y)` liefert die echte Leuchtdichte 0..1 des Komposits.
3. **Text**: Das macht die Engine. Achte darauf, dass `why` mit einem klaren ersten Satz beginnt, denn er erscheint im Reveal unten auf der Bühne.
4. **Vergleich**: optional `compare`:

```js
compare:[{ id:'dog', name:'Laterale Hemmung (DoG)', filter:'dog',
           opts:(p, size, st) => ({ sigmaC:st.geo.sw * 0.22, sigmaS:st.geo.sw * 0.9, w:0.92 }) }]
```

Verfügbare Filter: `dog` (`sigmaC`, `sigmaS`, `w`) und `blur` (`sigma`), alle Längen in CSS-Pixeln. `sim(x, y)` liefert die Modellantwort 0..1 an einer Stelle. Neue Filter gehören nach `Filters` und brauchen eine Quelle für das Modell.

Farbcodes: **Cyan** `#22d3ee` steht für Messung und Modell, **Bernstein** `#f59e0b` für physikalische Wahrheit und Vergleichslote.

## Messwerte (`measure`)

```js
measure(p, t, st, api) {
  return [
    { k:'Schaft A', v:'312,0 px' },          // Kennzahl
    { note:'Erklärender Satz zur Zahl.' },   // Fußnote unter der Tabelle
  ];
}
```

- Wird im Info-Tab viermal pro Sekunde aufgerufen, also billig halten.
- `api.sim(x, y)`, `api.stim(x, y)` und `api.filterName` stehen wie im Reveal zur Verfügung.
- Zahlen mit `fmt(wert, nachkommastellen)` formatieren (deutsches Komma). Einheiten immer angeben.
- Nur messen, was das Modul wirklich weiß. Keine Literaturwerte als Messwert ausgeben, sie gehören in `note` mit Quelle.

## Quellen zitieren

In `why` stehen Kurzbelege im Text: *Autor (Jahr)* bzw. *Autor & Autor (Jahr)*, bei mehr als zwei Autoren beim ersten Nennen alle oder *et al.*. In `sources` steht der Vollbeleg im APA-nahen Format:

- Zeitschrift: `Nachname, I. I. & Nachname, I. (Jahr). Titel. Zeitschrift, Band, Seiten.`
- Buch: `Nachname, I. (Jahr). Titel. Ort: Verlag.`
- Kapitel: `Nachname, I. (Jahr). Titel. In I. Hrsg. (Hrsg.), Buchtitel (S. x–y). Ort: Verlag.`

Zitiere nur, was du geprüft hast. Ist ein Befund umstritten, sag das im Text (siehe Müller-Lyer/Kultur, Ebbinghaus/Greifen).

## Checkliste vor dem Commit

- [ ] Modul taucht im Katalog auf, Suche nach Name und Mechanismus findet es.
- [ ] Space zeigt Overlay und „Warum“, die Split-Ansicht funktioniert (falls `compare`).
- [ ] Standardwerte, Zufall (R), Undo (Z) und Link teilen (Export) liefern denselben Zustand zurück.
- [ ] Keine Fehler in der Konsole oder unter *Info › Meldungen*, auch bei extremen Reglerwerten.
- [ ] Mobil (390 px breit) sind Reiz und Overlay lesbar.
- [ ] Keine Netzwerkzugriffe, keine externen Bibliotheken (die CSP würde sie ohnehin blockieren).
