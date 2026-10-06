// Illusionslabor – App: Liste, Routing, Regler, Werkzeuge, Darstellung, Render-Loop.
(function () {
  const $ = (s) => document.querySelector(s);
  const cv = $("#cv"), ctx = cv.getContext("2d", { willReadFrequently: true });
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const state = {
    idx: 0, params: {}, playing: true, reveal: false, t: 0, last: 0, filter: "alle", query: "", speed: 1,
    view: { zoom: 1, rot: 0, flipH: false, flipV: false, panX: 0, panY: 0 },
    filt: { invert: false, grayscale: false, contrast: 100, brightness: 100, blur: 0, saturate: 100 },
    ov: { grid: 0, fixation: false, crosslines: false, stopwatch: false, fps: false },
    tool: "none", ruler: null, pip: { a: null, b: null, hover: null }, sweep: "", sweepPeriod: 6, blink: false, slideshow: 0, slideT: 0, stopT: 0,
    favs: new Set(LS.get("il.fav", [])), theme: LS.get("il.theme", "dark")
  };
  const io = { x: -1, y: -1, sx: -1, sy: -1, down: false, inside: false };
  let W = 0, Hh = 0, dpr = 1;

  // ---------- Liste ----------
  function visible() {
    const q = state.query.trim().toLowerCase();
    return ILLUSIONS.filter((d) =>
      (state.filter === "alle" || (state.filter === "fav" ? state.favs.has(d.id) : d.cat === state.filter)) &&
      (!q || (d.name + " " + d.short + " " + CATS[d.cat] + " " + (d.desc || "") + " " + (d.tags || "")).toLowerCase().includes(q)));
  }
  function buildCats() {
    const el = $("#cats"); el.innerHTML = "";
    [["alle", "Alle"], ["fav", "★ Favoriten"], ...Object.entries(CATS)].forEach(([k, v]) => {
      const b = document.createElement("button"); b.textContent = v; b.className = k === state.filter ? "on" : "";
      b.onclick = () => { state.filter = k; buildCats(); buildList(); }; el.appendChild(b);
    });
  }
  function buildList() {
    const el = $("#list"); el.innerHTML = "";
    visible().forEach((d) => {
      const b = document.createElement("button");
      b.innerHTML = `${state.favs.has(d.id) ? '<span class="star">★</span>' : ""}${d.name}<small>${d.short}</small>`;
      b.className = ILLUSIONS[state.idx] === d ? "on" : "";
      b.onclick = () => { select(ILLUSIONS.indexOf(d)); $("#side").classList.remove("open"); }; el.appendChild(b);
    });
    const cur = el.querySelector(".on"); if (cur) cur.scrollIntoView({ block: "nearest" });
    $("#counter").textContent = `${state.idx + 1} / ${ILLUSIONS.length}`;
  }

  // ---------- Auswahl ----------
  function select(i, opts = {}) {
    state.idx = (i + ILLUSIONS.length) % ILLUSIONS.length;
    const d = ILLUSIONS[state.idx];
    state.params = {}; (d.params || []).forEach((p) => (state.params[p.k] = p.def));
    if (opts.params) Object.assign(state.params, opts.params);
    state.t = 0; state.reveal = false; state.playing = true; state.ruler = null; state.pip = { a: null, b: null, hover: null }; state.sweep = ""; state.stopT = 0;
    if (d.init) d.init(state.params);
    $("#title").textContent = d.name; $("#cat").textContent = CATS[d.cat];
    $("#hint").textContent = d.hint || ""; $("#desc").textContent = d.desc || ""; $("#why").textContent = d.why || "";
    $("#playBtn").style.display = d.anim === false ? "none" : ""; $("#revealBtn").style.display = d.noReveal ? "none" : "";
    $("#favBtn").textContent = state.favs.has(d.id) ? "★" : "☆"; $("#favBtn").classList.toggle("on", state.favs.has(d.id));
    buildControls(d); buildSweep(d); buildPresets(d); syncButtons(); buildList(); updateHash();
    document.title = d.name + " · Illusionslabor";
  }
  function buildControls(d) {
    const el = $("#controls"); el.innerHTML = "";
    (d.params || []).forEach((p) => {
      const wrap = document.createElement("div"); wrap.className = "ctrl"; wrap.dataset.k = p.k;
      if (p.type === "select") {
        wrap.innerHTML = `<label>${p.label}</label>`; const s = document.createElement("select");
        p.options.forEach(([v, l]) => { const o = document.createElement("option"); o.value = v; o.textContent = l; if (String(v) === String(state.params[p.k])) o.selected = true; s.appendChild(o); });
        s.onchange = () => { state.params[p.k] = isNaN(+s.value) || s.value === "" ? s.value : +s.value; updateHash(); }; wrap.appendChild(s);
      } else if (p.type === "check") {
        wrap.className += " toggle";
        wrap.innerHTML = `<label><span style="color:var(--txt)">${p.label}</span><input type="checkbox" ${state.params[p.k] ? "checked" : ""}></label>`;
        wrap.querySelector("input").onchange = (e) => { state.params[p.k] = e.target.checked; updateHash(); };
      } else {
        wrap.innerHTML = `<label>${p.label}<span></span></label><input type="range" min="${p.min}" max="${p.max}" step="${p.step || 1}" value="${state.params[p.k]}">`;
        const r = wrap.querySelector("input"), v = wrap.querySelector("span");
        const fmt = () => (v.textContent = (p.fmt ? p.fmt(+r.value) : (+r.value).toFixed(p.step && p.step < 1 ? 2 : 0)) + (p.unit || ""));
        r.oninput = () => { state.params[p.k] = +r.value; fmt(); updateHash(); }; fmt(); wrap._fmt = fmt;
      }
      el.appendChild(wrap);
    });
    if (!(d.params || []).length) el.innerHTML = `<p class="hint" style="border-color:var(--brd)">Keine Regler – einfach hinschauen (und ggf. auflösen).</p>`;
  }
  function refreshControls() { // Reglerwerte in die UI spiegeln (nach Zufall/Preset/Sweep)
    $("#controls").querySelectorAll(".ctrl").forEach((wrap) => { const k = wrap.dataset.k; const inp = wrap.querySelector("input, select"); if (!inp) return; if (inp.type === "checkbox") inp.checked = !!state.params[k]; else inp.value = state.params[k]; if (wrap._fmt) wrap._fmt(); });
  }
  function buildSweep(d) {
    const s = $("#sweep"); s.innerHTML = '<option value="">aus</option>';
    (d.params || []).filter((p) => !p.type || p.type === "range").forEach((p) => { const o = document.createElement("option"); o.value = p.k; o.textContent = p.label; s.appendChild(o); });
  }
  function syncButtons() {
    $("#playBtn").textContent = state.playing ? "⏸ Animation" : "▶ Animation"; $("#playBtn").classList.toggle("on", state.playing);
    $("#revealBtn").classList.toggle("on", state.reveal); $("#revealBtn").textContent = state.reveal ? "👁 Täuschung" : "👁 Auflösen";
    $("#toolRuler").classList.toggle("on", state.tool === "ruler"); $("#toolPipette").classList.toggle("on", state.tool === "pipette");
    const th = $("#toolhint"); th.hidden = state.tool === "none";
    th.textContent = state.tool === "ruler" ? "Lineal: ziehen zum Messen · Esc beendet" : state.tool === "pipette" ? "Pipette: Klick = Probe A, zweiter Klick = Probe B · Esc beendet" : "";
  }

  // ---------- Hash / URL ----------
  let hashTimer = 0;
  function updateHash() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => { const d = ILLUSIONS[state.idx]; const q = (d.params || []).filter((p) => state.params[p.k] !== p.def && !String(p.k).startsWith("_")).map((p) => p.k + "=" + encodeURIComponent(state.params[p.k])).join("&"); state.lastHash = "#" + d.id + (q ? "?" + q : ""); history.replaceState(null, "", state.lastHash); }, 150);
  }
  function fromHash() {
    const raw = location.hash.slice(1), [id, q] = raw.split("?");
    const i = ILLUSIONS.findIndex((d) => d.id === id); const params = {};
    if (q) q.split("&").forEach((kv) => { const [k, v] = kv.split("="); const val = decodeURIComponent(v || ""); params[k] = val === "true" ? true : val === "false" ? false : isNaN(+val) || val === "" ? val : +val; });
    select(i >= 0 ? i : 0, { params });
  }

  // ---------- Presets / Favoriten ----------
  function presetKey() { return "il.presets." + ILLUSIONS[state.idx].id; }
  function buildPresets() {
    const sel = $("#presetSel"); sel.innerHTML = '<option value="">– keine –</option>';
    Object.keys(LS.get(presetKey(), {})).forEach((n) => { const o = document.createElement("option"); o.value = n; o.textContent = n; sel.appendChild(o); });
  }
  $("#presetSave").onclick = () => { const name = prompt("Name für das Preset:", "Mein Preset"); if (!name) return; const all = LS.get(presetKey(), {}); all[name] = { ...state.params }; LS.set(presetKey(), all); buildPresets(); $("#presetSel").value = name; };
  $("#presetDel").onclick = () => { const n = $("#presetSel").value; if (!n) return; const all = LS.get(presetKey(), {}); delete all[n]; LS.set(presetKey(), all); buildPresets(); };
  $("#presetSel").onchange = (e) => { const n = e.target.value; if (!n) return; const all = LS.get(presetKey(), {}); if (all[n]) { Object.assign(state.params, all[n]); refreshControls(); updateHash(); } };
  $("#favBtn").onclick = () => { const id = ILLUSIONS[state.idx].id; state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id); LS.set("il.fav", [...state.favs]); $("#favBtn").textContent = state.favs.has(id) ? "★" : "☆"; $("#favBtn").classList.toggle("on", state.favs.has(id)); buildList(); };

  // ---------- Aktionen ----------
  function randomize() {
    const d = ILLUSIONS[state.idx];
    (d.params || []).forEach((p) => { if (p.type === "select") state.params[p.k] = p.options[Math.floor(Math.random() * p.options.length)][0]; else if (p.type === "check") state.params[p.k] = Math.random() < 0.5; else { const st = p.step || 1; state.params[p.k] = Math.round((p.min + Math.random() * (p.max - p.min)) / st) * st; } });
    if (d.init) d.init(state.params); refreshControls(); updateHash();
  }
  function savePng() {
    const out = document.createElement("canvas"); out.width = cv.width; out.height = cv.height; const oc = out.getContext("2d");
    oc.filter = filterString(); oc.drawImage(cv, 0, 0); const a = document.createElement("a"); a.download = "illusionslabor-" + ILLUSIONS[state.idx].id + ".png"; a.href = out.toDataURL("image/png"); a.click();
  }
  function share() { updateHash(); setTimeout(() => { const url = location.href; if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Link kopiert")); else prompt("Link:", url); }, 200); }
  function toast(msg) { const th = $("#toolhint"); th.hidden = false; th.textContent = msg; setTimeout(() => syncButtons(), 1500); }
  function filterString() { const f = state.filt; return `invert(${f.invert ? 1 : 0}) grayscale(${f.grayscale ? 1 : 0}) contrast(${f.contrast}%) brightness(${f.brightness}%) saturate(${f.saturate}%) blur(${f.blur}px)`; }
  function applyFilter() { cv.style.filter = filterString(); }
  function setTheme(t) { state.theme = t; document.body.dataset.theme = t; LS.set("il.theme", t); }
  function setTool(t) { state.tool = state.tool === t ? "none" : t; state.ruler = null; syncButtons(); cv.style.cursor = state.tool === "none" ? "crosshair" : state.tool === "ruler" ? "cell" : "copy"; }

  // ---------- Werkzeug-UI ----------
  const bindRange = (id, fn, fmt) => { const el = $("#" + id), v = $("#" + id + "Val"); const upd = () => { fn(+el.value); if (v) v.textContent = fmt(+el.value); }; el.oninput = upd; upd(); };
  bindRange("speed", (v) => (state.speed = v), (v) => v.toFixed(1) + "×");
  bindRange("sweepPeriod", (v) => (state.sweepPeriod = v), (v) => v + " s");
  bindRange("zoom", (v) => (state.view.zoom = v), (v) => v.toFixed(2) + "×");
  bindRange("rot", (v) => (state.view.rot = v), (v) => v + "°");
  bindRange("contrast", (v) => { state.filt.contrast = v; applyFilter(); }, (v) => v + " %");
  bindRange("brightness", (v) => { state.filt.brightness = v; applyFilter(); }, (v) => v + " %");
  bindRange("saturate", (v) => { state.filt.saturate = v; applyFilter(); }, (v) => v + " %");
  bindRange("blur", (v) => { state.filt.blur = v; applyFilter(); }, (v) => v + " px");
  $("#sweep").onchange = (e) => (state.sweep = e.target.value);
  $("#blink").onchange = (e) => (state.blink = e.target.checked);
  $("#slideshow").onchange = (e) => { state.slideshow = +e.target.value; state.slideT = 0; };
  $("#invert").onchange = (e) => { state.filt.invert = e.target.checked; applyFilter(); };
  $("#grayscale").onchange = (e) => { state.filt.grayscale = e.target.checked; applyFilter(); };
  $("#filterReset").onclick = () => { state.filt = { invert: false, grayscale: false, contrast: 100, brightness: 100, blur: 0, saturate: 100 }; ["contrast", "brightness", "saturate", "blur"].forEach((k) => { $("#" + k).value = state.filt[k]; $("#" + k).dispatchEvent(new Event("input")); }); $("#invert").checked = $("#grayscale").checked = false; applyFilter(); };
  $("#flipH").onclick = () => (state.view.flipH = !state.view.flipH); $("#flipV").onclick = () => (state.view.flipV = !state.view.flipV);
  $("#viewReset").onclick = () => { state.view = { zoom: 1, rot: 0, flipH: false, flipV: false, panX: 0, panY: 0 }; $("#zoom").value = 1; $("#rot").value = 0; $("#zoom").dispatchEvent(new Event("input")); $("#rot").dispatchEvent(new Event("input")); };
  $("#grid").onchange = (e) => (state.ov.grid = +e.target.value);
  ["fixation", "crosslines", "stopwatch"].forEach((k) => ($("#" + k).onchange = (e) => { state.ov[k] = e.target.checked; if (k === "stopwatch") state.stopT = 0; }));
  $("#showFps").onchange = (e) => { state.ov.fps = e.target.checked; $("#fps").hidden = !e.target.checked; };
  $("#toolRuler").onclick = () => setTool("ruler"); $("#toolPipette").onclick = () => setTool("pipette");
  $("#randomBtn").onclick = randomize; $("#shareBtn").onclick = share; $("#pngBtn").onclick = savePng; $("#themeBtn").onclick = () => setTheme(state.theme === "dark" ? "light" : "dark");
  const setKiosk = (on) => { document.body.classList.toggle("kiosk", on); $("#kioskExit").hidden = !on; };
  $("#kioskBtn").onclick = () => setKiosk(!document.body.classList.contains("kiosk")); $("#kioskExit").onclick = () => setKiosk(false);
  $("#helpBtn").onclick = () => ($("#help").hidden = !$("#help").hidden); $("#helpClose").onclick = () => ($("#help").hidden = true); $("#help").onclick = (e) => { if (e.target === $("#help")) $("#help").hidden = true; };

  // ---------- Basis-Events ----------
  $("#prevBtn").onclick = () => select(state.idx - 1); $("#nextBtn").onclick = () => select(state.idx + 1);
  $("#playBtn").onclick = () => { state.playing = !state.playing; syncButtons(); };
  $("#revealBtn").onclick = () => { state.reveal = !state.reveal; syncButtons(); };
  $("#resetBtn").onclick = () => select(state.idx);
  $("#menuBtn").onclick = () => $("#side").classList.toggle("open");
  $("#infoToggle").onclick = () => $("#info").classList.toggle("hidden");
  $("#fsBtn").onclick = () => { const s = $("#stage"); document.fullscreenElement ? document.exitFullscreen() : s.requestFullscreen && s.requestFullscreen(); };
  $("#search").oninput = (e) => { state.query = e.target.value; buildList(); };
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    const k = e.key;
    if (k === "ArrowRight") select(state.idx + 1); else if (k === "ArrowLeft") select(state.idx - 1);
    else if (k === " ") { e.preventDefault(); $("#playBtn").click(); }
    else if (k === "r" || k === "R") $("#revealBtn").click(); else if (k === "0") select(state.idx);
    else if (k === "z" || k === "Z") randomize(); else if (k === "f" || k === "F") $("#favBtn").click();
    else if (k === "i" || k === "I") { $("#invert").checked = !$("#invert").checked; $("#invert").dispatchEvent(new Event("change")); }
    else if (k === "g" || k === "G") { $("#grayscale").checked = !$("#grayscale").checked; $("#grayscale").dispatchEvent(new Event("change")); }
    else if (k === "+" || k === "=") { $("#zoom").value = Math.min(6, state.view.zoom + 0.25); $("#zoom").dispatchEvent(new Event("input")); }
    else if (k === "-") { $("#zoom").value = Math.max(0.25, state.view.zoom - 0.25); $("#zoom").dispatchEvent(new Event("input")); }
    else if (k === "v" || k === "V") $("#viewReset").click(); else if (k === "l" || k === "L") setTool("ruler"); else if (k === "p" || k === "P") setTool("pipette");
    else if (k === "s" || k === "S") savePng(); else if (k === "h" || k === "H") setKiosk(!document.body.classList.contains("kiosk")); else if (k === "t" || k === "T") $("#themeBtn").click();
    else if (k === "x" || k === "X") { $("#fixation").checked = !$("#fixation").checked; $("#fixation").dispatchEvent(new Event("change")); }
    else if (k === "?") $("#helpBtn").click();
    else if (k === "Escape") { if (!$("#help").hidden) $("#help").hidden = true; else if (state.tool !== "none") setTool(state.tool); else setKiosk(false); }
  });
  window.addEventListener("hashchange", () => { if (location.hash !== state.lastHash) fromHash(); });

  // Pointer: Bildschirmkoordinaten + in den Illusionsraum zurückgerechnet
  function toLocal(sx, sy) {
    const v = state.view, a = -v.rot * Math.PI / 180; let x = sx - W / 2 - v.panX, y = sy - Hh / 2 - v.panY;
    const xr = x * Math.cos(a) - y * Math.sin(a), yr = x * Math.sin(a) + y * Math.cos(a);
    return [W / 2 + xr / (v.zoom * (v.flipH ? -1 : 1)), Hh / 2 + yr / (v.zoom * (v.flipV ? -1 : 1))];
  }
  const pos = (e) => { const r = cv.getBoundingClientRect(); io.sx = e.clientX - r.left; io.sy = e.clientY - r.top; [io.x, io.y] = toLocal(io.sx, io.sy); };
  let panStart = null;
  cv.addEventListener("pointermove", (e) => { pos(e); io.inside = true; if (state.tool === "ruler" && state.ruler && state.ruler.drag) { state.ruler.x2 = io.sx; state.ruler.y2 = io.sy; } if (panStart) { state.view.panX = panStart.px + (io.sx - panStart.x); state.view.panY = panStart.py + (io.sy - panStart.y); } });
  cv.addEventListener("pointerdown", (e) => {
    pos(e); io.inside = true; cv.setPointerCapture(e.pointerId);
    if (state.tool === "ruler") { state.ruler = { x1: io.sx, y1: io.sy, x2: io.sx, y2: io.sy, drag: true }; return; }
    if (state.tool === "pipette") { const c = readPixel(io.sx, io.sy); if (!state.pip.a || state.pip.b) { state.pip = { a: { x: io.sx, y: io.sy, c }, b: null, hover: null }; } else state.pip.b = { x: io.sx, y: io.sy, c }; showPipette(); return; }
    if (state.view.zoom !== 1 && e.button === 1) { panStart = { x: io.sx, y: io.sy, px: state.view.panX, py: state.view.panY }; return; }
    if (state.view.zoom !== 1 && !ILLUSIONS[state.idx].onDown) { panStart = { x: io.sx, y: io.sy, px: state.view.panX, py: state.view.panY }; }
    io.down = true; const d = ILLUSIONS[state.idx]; if (d.onDown) d.onDown(io, state.params, W, Hh);
  });
  cv.addEventListener("pointerup", () => { io.down = false; panStart = null; if (state.ruler) state.ruler.drag = false; });
  cv.addEventListener("pointerleave", () => { io.inside = false; io.down = false; panStart = null; });
  cv.addEventListener("wheel", (e) => { if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return; e.preventDefault(); const z = Math.min(6, Math.max(0.25, state.view.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); $("#zoom").value = z.toFixed(2); $("#zoom").dispatchEvent(new Event("input")); }, { passive: false });
  function readPixel(sx, sy) { try { const d = ctx.getImageData(Math.round(sx * dpr), Math.round(sy * dpr), 1, 1).data; return [d[0], d[1], d[2]]; } catch (e) { return [0, 0, 0]; } }
  function showPipette() {
    const f = (c) => `<span style="display:inline-block;width:14px;height:14px;vertical-align:middle;border:1px solid #888;background:rgb(${c.join(",")})"></span> RGB ${c.join("/")} · Grau ${Math.round(0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2])}`;
    const P = state.pip; let s = ""; if (P.a) s += "A: " + f(P.a.c); if (P.b) { s += "<br>B: " + f(P.b.c); const dd = P.a.c.map((v, i) => Math.abs(v - P.b.c[i])); s += `<br>Differenz: ${dd.join("/")} ${dd.every((v) => v === 0) ? "→ identisch!" : ""}`; }
    $("#pipetteOut").innerHTML = s + (s ? "<br><span class='muted'>Werte vor Bildfiltern.</span>" : "");
  }

  // ---------- Render ----------
  function resize() { const r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = Math.max(1, Math.round(r.width)); Hh = Math.max(1, Math.round(r.height)); cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
  new ResizeObserver(resize).observe(cv); resize();
  let fpsAcc = 0, fpsN = 0, fpsLast = 0;
  function frame(now) {
    const dtRaw = Math.min(0.1, (now - state.last) / 1000 || 0); state.last = now; const dt = dtRaw * state.speed;
    if (state.playing) state.t += dt;
    if (state.ov.stopwatch) state.stopT += dtRaw;
    if (state.slideshow) { state.slideT += dtRaw; if (state.slideT > state.slideshow) { state.slideT = 0; const vis = visible(); const i = vis.indexOf(ILLUSIONS[state.idx]); const nx = vis[(i + 1) % vis.length] || ILLUSIONS[0]; select(ILLUSIONS.indexOf(nx)); } }
    const d = ILLUSIONS[state.idx];
    if (state.sweep) { const p = (d.params || []).find((q) => q.k === state.sweep); if (p) { const k = 0.5 - 0.5 * Math.cos(state.t * Math.PI * 2 / state.sweepPeriod); const st = p.step || 1; state.params[p.k] = Math.round((p.min + (p.max - p.min) * k) / st) * st; const wrap = $("#controls").querySelector(`.ctrl[data-k="${p.k}"]`); if (wrap) { wrap.querySelector("input").value = state.params[p.k]; wrap._fmt && wrap._fmt(); } } }
    const reveal = state.blink ? Math.floor(state.t * 2) % 2 === 1 : state.reveal;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = d.bg || "#000"; ctx.fillRect(0, 0, W, Hh);
    ctx.save();
    const v = state.view; ctx.translate(W / 2 + v.panX, Hh / 2 + v.panY); ctx.rotate(v.rot * Math.PI / 180); ctx.scale(v.zoom * (v.flipH ? -1 : 1), v.zoom * (v.flipV ? -1 : 1)); ctx.translate(-W / 2, -Hh / 2);
    if (v.zoom !== 1 || v.rot || v.flipH || v.flipV || v.panX || v.panY) { ctx.fillStyle = d.bg || "#000"; ctx.fillRect(-W * 3, -Hh * 3, W * 7, Hh * 7); }
    try { d.draw(ctx, W, Hh, state.params, state.t, reveal, io); } catch (err) { console.error(d.id, err); ctx.resetTransform(); H.text(ctx, "Fehler: " + err.message, W / 2, Hh / 2, "#f55"); }
    ctx.restore(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawOverlays();
    if (state.ov.fps) { fpsAcc += dtRaw; fpsN++; if (now - fpsLast > 500) { $("#fps").textContent = Math.round(fpsN / fpsAcc) + " fps"; fpsAcc = 0; fpsN = 0; fpsLast = now; } }
    requestAnimationFrame(frame);
  }
  function drawOverlays() {
    const o = state.ov;
    if (o.grid) { ctx.strokeStyle = "rgba(94,200,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x < W; x += o.grid) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, Hh); } for (let y = 0; y < Hh; y += o.grid) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); } ctx.stroke(); }
    if (o.crosslines) { H.line(ctx, W / 2, 0, W / 2, Hh, "rgba(255,59,59,.6)", 1); H.line(ctx, 0, Hh / 2, W, Hh / 2, "rgba(255,59,59,.6)", 1); }
    if (o.fixation) H.fixation(ctx, W / 2, Hh / 2, "#ff3b3b");
    if (o.stopwatch) H.badge(ctx, "⏱ " + state.stopT.toFixed(1) + " s", W - 70, Hh - 20);
    if (state.ruler) { const r = state.ruler; H.line(ctx, r.x1, r.y1, r.x2, r.y2, "#5ec8ff", 2); H.circle(ctx, r.x1, r.y1, 4, "#5ec8ff"); H.circle(ctx, r.x2, r.y2, 4, "#5ec8ff"); const dpx = Math.hypot(r.x2 - r.x1, r.y2 - r.y1), ang = Math.atan2(r.y2 - r.y1, r.x2 - r.x1) * 180 / Math.PI; H.badge(ctx, `${Math.round(dpx)} px (${Math.round(dpx / state.view.zoom)} px im Bild) · ${Math.round(ang)}°`, (r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2 - 18); }
    if (state.tool === "pipette" && io.inside) { const c = readPixel(io.sx, io.sy); H.rect(ctx, io.sx + 14, io.sy - 30, 22, 22, `rgb(${c.join(",")})`); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(io.sx + 14, io.sy - 30, 22, 22); H.badge(ctx, c.join("/"), io.sx + 70, io.sy - 19); }
    [state.pip.a, state.pip.b].forEach((s, i) => { if (!s) return; H.circle(ctx, s.x, s.y, 8, null, "#fff", 2); H.circle(ctx, s.x, s.y, 8, null, "#000", 1); H.badge(ctx, (i ? "B " : "A ") + s.c.join("/"), s.x, s.y - 20); });
  }

  setTheme(state.theme); buildCats(); fromHash(); applyFilter(); requestAnimationFrame(frame);
})();
