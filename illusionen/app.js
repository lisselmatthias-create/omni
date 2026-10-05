// Illusionslabor – app shell: list, routing, controls, render loop.
(function () {
  const $ = (s) => document.querySelector(s);
  const cv = $("#cv"), ctx = cv.getContext("2d");
  const state = { idx: 0, params: {}, playing: true, reveal: false, t: 0, last: 0, filter: "alle", query: "" };
  const io = { x: -1, y: -1, down: false, inside: false };

  // ---------- list ----------
  function visible() {
    const q = state.query.trim().toLowerCase();
    return ILLUSIONS.filter((d) =>
      (state.filter === "alle" || d.cat === state.filter) &&
      (!q || (d.name + " " + d.short + " " + CATS[d.cat] + " " + (d.tags || "")).toLowerCase().includes(q)));
  }
  function buildCats() {
    const el = $("#cats"); el.innerHTML = "";
    [["alle", "Alle"], ...Object.entries(CATS)].forEach(([k, v]) => {
      const b = document.createElement("button"); b.textContent = v;
      b.className = k === state.filter ? "on" : "";
      b.onclick = () => { state.filter = k; buildCats(); buildList(); };
      el.appendChild(b);
    });
  }
  function buildList() {
    const el = $("#list"); el.innerHTML = "";
    visible().forEach((d) => {
      const b = document.createElement("button");
      b.innerHTML = `${d.name}<small>${d.short}</small>`;
      b.className = ILLUSIONS[state.idx] === d ? "on" : "";
      b.onclick = () => { select(ILLUSIONS.indexOf(d)); $("#side").classList.remove("open"); };
      el.appendChild(b);
    });
    const cur = el.querySelector(".on"); if (cur) cur.scrollIntoView({ block: "nearest" });
  }

  // ---------- selection ----------
  function select(i, pushHash = true) {
    state.idx = (i + ILLUSIONS.length) % ILLUSIONS.length;
    const d = ILLUSIONS[state.idx];
    state.params = {}; (d.params || []).forEach((p) => (state.params[p.k] = p.def));
    state.t = 0; state.reveal = false; state.playing = true;
    if (d.init) d.init(state.params);
    $("#title").textContent = d.name; $("#cat").textContent = CATS[d.cat];
    $("#hint").textContent = d.hint || ""; $("#desc").textContent = d.desc || ""; $("#why").textContent = d.why || "";
    $("#counter").textContent = `${state.idx + 1} / ${ILLUSIONS.length}`;
    $("#playBtn").style.display = d.anim === false ? "none" : "";
    $("#revealBtn").style.display = d.noReveal ? "none" : "";
    buildControls(d); syncButtons(); buildList();
    if (pushHash) history.replaceState(null, "", "#" + d.id);
    document.title = d.name + " · Illusionslabor";
  }
  function buildControls(d) {
    const el = $("#controls"); el.innerHTML = "";
    (d.params || []).forEach((p) => {
      const wrap = document.createElement("div"); wrap.className = "ctrl";
      if (p.type === "select") {
        wrap.innerHTML = `<label>${p.label}</label>`;
        const s = document.createElement("select");
        p.options.forEach(([v, l]) => { const o = document.createElement("option"); o.value = v; o.textContent = l; if (v == p.def) o.selected = true; s.appendChild(o); });
        s.onchange = () => { state.params[p.k] = isNaN(+s.value) ? s.value : +s.value; };
        wrap.appendChild(s);
      } else if (p.type === "check") {
        wrap.className += " toggle";
        wrap.innerHTML = `<label><span style="color:var(--txt)">${p.label}</span><input type="checkbox" ${p.def ? "checked" : ""}></label>`;
        wrap.querySelector("input").onchange = (e) => { state.params[p.k] = e.target.checked; };
      } else {
        wrap.innerHTML = `<label>${p.label}<span></span></label><input type="range" min="${p.min}" max="${p.max}" step="${p.step || 1}" value="${p.def}">`;
        const r = wrap.querySelector("input"), v = wrap.querySelector("span");
        const fmt = () => (v.textContent = (p.fmt ? p.fmt(+r.value) : (+r.value).toFixed(p.step && p.step < 1 ? 2 : 0)) + (p.unit || ""));
        r.oninput = () => { state.params[p.k] = +r.value; fmt(); }; fmt();
      }
      el.appendChild(wrap);
    });
    if (!(d.params || []).length) el.innerHTML = `<p class="hint" style="border-color:var(--brd)">Keine Regler – einfach hinschauen (und ggf. auflösen).</p>`;
  }
  function syncButtons() {
    $("#playBtn").textContent = state.playing ? "⏸ Animation" : "▶ Animation";
    $("#playBtn").classList.toggle("on", state.playing);
    $("#revealBtn").classList.toggle("on", state.reveal);
    $("#revealBtn").textContent = state.reveal ? "👁 Täuschung" : "👁 Auflösen";
  }

  // ---------- events ----------
  $("#prevBtn").onclick = () => select(state.idx - 1);
  $("#nextBtn").onclick = () => select(state.idx + 1);
  $("#playBtn").onclick = () => { state.playing = !state.playing; syncButtons(); };
  $("#revealBtn").onclick = () => { state.reveal = !state.reveal; syncButtons(); };
  $("#resetBtn").onclick = () => select(state.idx);
  $("#menuBtn").onclick = () => $("#side").classList.toggle("open");
  $("#infoToggle").onclick = () => $("#info").classList.toggle("hidden");
  $("#fsBtn").onclick = () => { const s = $("#stage"); document.fullscreenElement ? document.exitFullscreen() : s.requestFullscreen && s.requestFullscreen(); };
  $("#search").oninput = (e) => { state.query = e.target.value; buildList(); };
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.key === "ArrowRight") select(state.idx + 1);
    else if (e.key === "ArrowLeft") select(state.idx - 1);
    else if (e.key === " ") { e.preventDefault(); $("#playBtn").click(); }
    else if (e.key.toLowerCase() === "r") $("#revealBtn").click();
  });
  window.addEventListener("hashchange", () => fromHash(false));
  const pos = (e) => { const r = cv.getBoundingClientRect(); io.x = e.clientX - r.left; io.y = e.clientY - r.top; };
  cv.addEventListener("pointermove", (e) => { pos(e); io.inside = true; });
  cv.addEventListener("pointerdown", (e) => { pos(e); io.down = true; io.inside = true; cv.setPointerCapture(e.pointerId); const d = ILLUSIONS[state.idx]; if (d.onDown) d.onDown(io, state.params, W, Hh); });
  cv.addEventListener("pointerup", () => { io.down = false; });
  cv.addEventListener("pointerleave", () => { io.inside = false; io.down = false; });

  function fromHash(push) {
    const id = location.hash.slice(1);
    const i = ILLUSIONS.findIndex((d) => d.id === id);
    select(i >= 0 ? i : 0, push);
  }

  // ---------- render ----------
  let W = 0, Hh = 0, dpr = 1;
  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width)); Hh = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
  }
  new ResizeObserver(resize).observe(cv); resize();

  function frame(now) {
    const dt = Math.min(0.1, (now - state.last) / 1000 || 0); state.last = now;
    if (state.playing) state.t += dt;
    const d = ILLUSIONS[state.idx];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = d.bg || "#000"; ctx.fillRect(0, 0, W, Hh);
    ctx.save();
    try { d.draw(ctx, W, Hh, state.params, state.t, state.reveal, io); } catch (err) { console.error(d.id, err); H.text(ctx, "Fehler: " + err.message, W / 2, Hh / 2, "#f55"); }
    ctx.restore();
    requestAnimationFrame(frame);
  }

  buildCats(); fromHash(true); requestAnimationFrame(frame);
})();
