(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let source = DEFAULT_SOURCE;
  let cfg = DEFAULT_CONFIG;
  let step = 0,
    format = "hex",
    selected = null,
    cells = [],
    memorySeparated = false;
  function setTheme(theme) {
    const light = theme === "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    const b = $("theme-toggle");
    if (b) {
      b.textContent = light ? "☾ Dark mode" : "☀ Light mode";
      b.setAttribute("aria-pressed", String(light));
    }
    try {
      localStorage.setItem(
        "java-memory-lab-theme",
        light ? "light" : "dark",
      );
    } catch {}
  }
  function initTheme() {
    // A same-origin toolbox frame follows the header switch; standalone use keeps its own switch.
    try {
      if (
        window.parent !== window &&
        window.parent.document.documentElement.hasAttribute("data-theme")
      ) {
        const toolboxRoot = window.parent.document.documentElement;
        const syncTheme = () => setTheme(toolboxRoot.dataset.theme);
        syncTheme();
        new MutationObserver(syncTheme).observe(toolboxRoot, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        $("theme-toggle").hidden = true;
        return;
      }
    } catch {}
    let saved = null;
    try {
      saved = localStorage.getItem("java-memory-lab-theme");
    } catch {}
    const preferred =
      saved ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    setTheme(preferred);
  }
  function err(s) {
    $("error").style.display = s ? "block" : "none";
    $("error").textContent = s || "";
  }
  function hex(n, w = 8) {
    return "0x" + (n >>> 0).toString(16).toUpperCase().padStart(w, "0");
  }
  function addrText(n) {
    return String(Number(n) >>> 0);
  }
  function u32(n) {
    return Number(n) >>> 0;
  }
  function wordText(n) {
    const v = u32(n ?? 0);
    if (format === "dec") return String(Number(n ?? 0));
    if (format === "bin") return v.toString(2).padStart(32, "0");
    return hex(v);
  }
  function validate(c) {
    if (!c || !c.memory || !Array.isArray(c.states))
      throw Error("JSON must contain memory and states.");
    for (const region of ["static", "heap", "stack"]) {
      const r = c.memory[region];
      if (
        !r ||
        !Number.isInteger(r.start) ||
        !Number.isInteger(r.size) ||
        r.size <= 0
      )
        throw Error(
          `${region} start and size must be positive integers.`,
        );
    }
    if (
      c.memory.shared !== undefined &&
      typeof c.memory.shared !== "boolean"
    )
      throw Error("memory.shared must be a boolean.");
    if (
      c.memory.shared &&
      (c.memory.heap.start + c.memory.heap.size !==
        c.memory.stack.start ||
        c.memory.static.start + c.memory.static.size >
          c.memory.heap.start)
    )
      throw Error(
        "Shared heap/stack ranges must be adjacent and outside static memory.",
      );
    for (const st of c.states) {
      if (!Number.isInteger(st.line))
        throw Error("Every state needs an integer line.");
      if (!Array.isArray(st.memory))
        throw Error(`State at line ${st.line} needs a memory array.`);
      const frameIds = new Set();
      if (st.frames !== undefined) {
        if (!Array.isArray(st.frames))
          throw Error(`frames at line ${st.line} must be an array.`);
        for (const f of st.frames) {
          if (!f || !f.id || frameIds.has(f.id))
            throw Error(
              `Each frame at line ${st.line} needs a unique id.`,
            );
          frameIds.add(f.id);
        }
      }
      const seen = new Set();
      for (const b of st.memory) {
        if (
          !b.id ||
          !["static", "heap", "stack"].includes(b.region) ||
          !Number.isInteger(b.address) ||
          !Number.isInteger(b.value)
        )
          throw Error(
            `Invalid memory cell in state at line ${st.line}. Each cell needs id, region, integer address and integer value.`,
          );
        if (b.value < -2147483648 || b.value > 4294967295)
          throw Error(`Value of ${b.id} must fit in 32 bits.`);
        if (seen.has(b.address))
          throw Error(
            `Two cells use address ${b.address} in state at line ${st.line}.`,
          );
        seen.add(b.address);
        const r =
          c.memory.shared && b.region !== "static"
            ? {
                start: c.memory.heap.start,
                size:
                  c.memory.stack.start +
                  c.memory.stack.size -
                  c.memory.heap.start,
              }
            : c.memory[b.region];
        if (b.address < r.start || b.address >= r.start + r.size)
          throw Error(`Cell ${b.id} exceeds ${b.region}.`);
        if (b.frame !== undefined) {
          if (b.region !== "stack")
            throw Error(`Only stack cells may define frame (${b.id}).`);
          if (!frameIds.has(b.frame))
            throw Error(
              `Cell ${b.id} references unknown frame ${b.frame} at line ${st.line}.`,
            );
        }
      }
      for (const fid of frameIds) {
        const addrs = st.memory
          .filter((b) => b.region === "stack" && b.frame === fid)
          .map((b) => b.address)
          .sort((a, b) => a - b);
        if (!addrs.length) continue;
        for (let i = 1; i < addrs.length; i++)
          if (addrs[i] !== addrs[i - 1] + 1)
            throw Error(
              `Frame ${fid} at line ${st.line} must use contiguous stack cells.`,
            );
      }
      if (c.memory.shared) {
        const heap = st.memory.filter((b) => b.region === "heap"),
          stack = st.memory.filter((b) => b.region === "stack");
        if (
          heap.length &&
          stack.length &&
          Math.max(...heap.map((b) => b.address)) >=
            Math.min(...stack.map((b) => b.address))
        )
          throw Error(`Heap and stack cross at line ${st.line}.`);
      }
      if (st.collision !== undefined) {
        const hit = st.collision;
        if (
          !hit ||
          !["heap", "stack"].includes(hit.region) ||
          !Number.isInteger(hit.address) ||
          typeof hit.label !== "string" ||
          !hit.label.trim()
        )
          throw Error(`Invalid collision at line ${st.line}.`);
        const other = hit.region === "stack" ? "heap" : "stack";
        const edge = allocationEdge(st, hit.region);
        const attempted = edge + (hit.region === "stack" ? -1 : 1);
        if (
          hit.address !== attempted ||
          !st.memory.some(
            (b) => b.region === other && b.address === hit.address,
          ) ||
          !st.memory.some(
            (b) => b.region === hit.region && b.address === edge,
          )
        )
          throw Error(
            `Collision at line ${st.line} must target the adjacent occupied ${other} word from an occupied ${hit.region} boundary.`,
          );
      }
    }
    return c;
  }
  function highlightJava(line) {
    const frag = document.createDocumentFragment();
    const keywords = new Set(
      "abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try void volatile while record sealed permits non-sealed var".split(
        " ",
      ),
    );
    const types = new Set(
      "boolean byte char short int long float double String Object Integer Long Double Float Short Byte Character Boolean".split(
        " ",
      ),
    );
    let i = 0;
    const add = (text, cls) => {
      const sp = document.createElement("span");
      if (cls) sp.className = cls;
      sp.textContent = text;
      frag.append(sp);
    };
    while (i < line.length) {
      const rest = line.slice(i);
      if (rest.startsWith("//")) {
        add(rest, "tok-comment");
        break;
      }
      if (line[i] === '"' || line[i] === "'") {
        const q = line[i];
        let j = i + 1,
          esc = false;
        for (; j < line.length; j++) {
          const ch = line[j];
          if (esc) {
            esc = false;
            continue;
          }
          if (ch === "\\") {
            esc = true;
            continue;
          }
          if (ch === q) {
            j++;
            break;
          }
        }
        add(line.slice(i, j), q === '"' ? "tok-string" : "tok-char");
        i = j;
        continue;
      }
      const ann = rest.match(/^@[A-Za-z_$][\w$]*/);
      if (ann) {
        add(ann[0], "tok-annotation");
        i += ann[0].length;
        continue;
      }
      const num = rest.match(
        /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)[fFdDlL]?/,
      );
      if (num) {
        add(num[0], "tok-number");
        i += num[0].length;
        continue;
      }
      const word = rest.match(/^[A-Za-z_$][\w$]*/);
      if (word) {
        const w = word[0];
        let cls = "";
        if (keywords.has(w)) cls = "tok-key";
        else if (types.has(w) || /^[A-Z]/.test(w)) cls = "tok-type";
        else if (w === "true" || w === "false" || w === "null")
          cls = "tok-bool";
        else {
          const after = line.slice(i + w.length);
          if (/^\s*\(/.test(after)) cls = "tok-method";
        }
        add(w, cls);
        i += w.length;
        continue;
      }
      add(line[i]);
      i++;
    }
    return frag;
  }
  function drawCode() {
    const lines = source.replace(/\r\n?/g, "\n").split("\n");
    $("code").innerHTML = "";
    lines.forEach((txt, i) => {
      const d = document.createElement("div");
      d.className = "line";
      d.dataset.line = i + 1;
      const n = document.createElement("span");
      n.className = "ln";
      n.textContent = i + 1;
      const s = document.createElement("span");
      s.className = "src";
      if (txt) s.append(highlightJava(txt));
      else s.textContent = " ";
      d.append(n, s);
      $("code").append(d);
    });
  }
  function allocationEdge(state, region) {
    const addresses = state.memory
      .filter((b) => b.region === region)
      .map((b) => b.address);
    return region === "stack"
      ? Math.min(...addresses)
      : Math.max(...addresses);
  }
  function visibleMemory(state) {
    if (!cfg.memory.shared) return cfg.memory;
    const heap = cfg.memory.heap,
      stack = cfg.memory.stack;
    const boundary = Math.min(
      allocationEdge(state, "stack"),
      Math.max(stack.start, allocationEdge(state, "heap") + 1),
    );
    return {
      static: cfg.memory.static,
      heap: { start: heap.start, size: boundary - heap.start },
      stack: {
        start: boundary,
        size: stack.start + stack.size - boundary,
      },
    };
  }
  function makeGrid(region) {
    const r = visibleMemory(cfg.states[step])[region],
      g = $(region + "-grid");
    g.innerHTML = "";
    g.style.gridTemplateColumns =
      "88px minmax(150px,1fr) minmax(90px,.8fr)";
    for (const htxt of ["Address", "32-bit value", "Variable / field"]) {
      const h = document.createElement("div");
      h.className = (htxt === "Address" ? "addr" : "col") + " grid-head";
      h.textContent = htxt;
      g.append(h);
    }
    for (let i = 0; i < r.size; i++) {
      const at = r.start + i;
      const a = document.createElement("div");
      a.className = "addr";
      a.dataset.addr = at;
      a.dataset.region = region;
      a.textContent = addrText(at);
      g.append(a);
      const w = document.createElement("button");
      w.type = "button";
      w.className = "word";
      w.dataset.addr = at;
      w.dataset.region = region;
      g.append(w);
      const label = document.createElement("div");
      label.className = "col";
      label.dataset.labelAddr = at;
      label.dataset.addr = at;
      label.dataset.region = region;
      label.textContent = "";
      label.style.textAlign = "left";
      label.style.alignSelf = "center";
      g.append(label);
      cells.push(w);
    }
    $(region + "-range").textContent = r.size
      ? `${addrText(r.start)}–${addrText(r.start + r.size - 1)}`
      : "No cells";
  }
  function setMemorySeparated(separated) {
    memorySeparated = !!separated;
    const groups = $("memory-groups"),
      button = $("split-memory");
    if (groups) groups.classList.toggle("separated", memorySeparated);
    if (button) {
      button.textContent = memorySeparated
        ? "Combine memory"
        : "Separate memory regions";
      button.setAttribute("aria-pressed", String(memorySeparated));
    }
  }
  function rebuild() {
    validate(cfg);
    step = Math.min(step, cfg.states.length - 1);
    cells = [];
    $("title").textContent = cfg.title || "Java Memory Lab";
    $("subtitle").textContent = cfg.subtitle || "";
    $("model-note").textContent =
      cfg.modelNote || "Undefined words are 0x00000000.";
    drawCode();
    makeGrid("static");
    makeGrid("heap");
    makeGrid("stack");
    render();
  }
  function blockAt(state, addr) {
    return state.memory.find((b) => b.address === addr);
  }
  function applyStackFrames(state) {
    const stackGrid = $("stack-grid");
    if (!stackGrid) return;
    stackGrid
      .querySelectorAll(
        ".frame-edge-left,.frame-edge-right,.frame-edge-top,.frame-edge-bottom",
      )
      .forEach((el) =>
        el.classList.remove(
          "frame-edge-left",
          "frame-edge-right",
          "frame-edge-top",
          "frame-edge-bottom",
        ),
      );
    stackGrid.querySelectorAll(".frame-tag").forEach((el) => el.remove());
    const frames = Array.isArray(state.frames) ? state.frames : [];
    const labels = new Map(frames.map((f) => [f.id, f.label || f.id]));
    for (const f of frames) {
      const blocks = state.memory
        .filter((b) => b.region === "stack" && b.frame === f.id)
        .sort((a, b) => a.address - b.address);
      if (!blocks.length) continue;
      const first = blocks[0].address,
        last = blocks[blocks.length - 1].address;
      for (let at = first; at <= last; at++) {
        const parts = stackGrid.querySelectorAll(`[data-addr="${at}"]`);
        parts.forEach((el) => {
          if (at === first) el.classList.add("frame-edge-top");
          if (at === last) el.classList.add("frame-edge-bottom");
        });
        const addr = stackGrid.querySelector(`.addr[data-addr="${at}"]`);
        const label = stackGrid.querySelector(
          `.col[data-label-addr="${at}"]`,
        );
        if (addr) addr.classList.add("frame-edge-left");
        if (label) label.classList.add("frame-edge-right");
      }
      const labelCell = stackGrid.querySelector(
        `.col[data-label-addr="${first}"]`,
      );
      if (labelCell) {
        const tag = document.createElement("span");
        tag.className = "frame-tag";
        tag.textContent = labels.get(f.id) || f.id;
        labelCell.prepend(tag);
      }
    }
  }
  function render() {
    const st = cfg.states[step];
    if (cfg.memory.shared) {
      cells = [];
      makeGrid("static");
      makeGrid("heap");
      makeGrid("stack");
    }
    $("counter").textContent = `${step + 1} / ${cfg.states.length}`;
    $("prev").disabled = step === 0;
    $("next").disabled = step === cfg.states.length - 1;
    $("note-line").textContent = `Line ${st.line}`;
    $("note").textContent = st.note || "";
    document
      .querySelectorAll(".line")
      .forEach((x) =>
        x.classList.toggle("active", Number(x.dataset.line) === st.line),
      );
    document
      .querySelector(`.line[data-line="${st.line}"]`)
      ?.scrollIntoView({ block: "nearest" });
    const activeId = selected || st.highlight || null,
      active = st.memory.find((b) => b.id === activeId),
      target = active?.pointsTo
        ? st.memory.find((b) => b.id === active.pointsTo)
        : null;
    for (const cell of cells) {
      const at = Number(cell.dataset.addr),
        b = blockAt(st, at);
      const val = b ? b.value : 0;
      cell.textContent = wordText(val);
      let cl = "word";
      if (b) cl += " " + b.region;
      if (active && b?.id === active.id) cl += " selected";
      else if (target && b?.id === target.id) cl += " target";
      cell.className = cl;
      cell.title = b
        ? `${addrText(at)}: ${wordText(val)} · ${b.label || b.id}`
        : `${addrText(at)}: ${wordText(0)} · undefined → 0x00000000`;
      const label = document.querySelector(`[data-label-addr="${at}"]`);
      if (label) label.textContent = b ? b.label || b.id : "";
    }
    const notice = $("collision-notice");
    notice.hidden = !st.collision && !(cfg.memory.shared && st.note);
    notice.classList.toggle("growth-notice", !st.collision);
    notice.textContent = cfg.memory.shared ? st.note || "" : "";
    if (st.collision) {
      const hit = st.collision,
        occupied = blockAt(st, hit.address),
        edge = allocationEdge(st, hit.region);
      notice.textContent = `Heap / stack collision — ${hit.label} needs address ${hit.address}, already occupied by ${occupied.label || occupied.id}. Allocation blocked; no value is overwritten. This is a teaching-model collision; real JVMs manage heap and stack separately.`;
      for (const cell of cells)
        if (
          Number(cell.dataset.addr) === hit.address ||
          Number(cell.dataset.addr) === edge
        )
          cell.classList.add("collision");
    }
    applyStackFrames(st);
    if (st.collision || cfg.memory.shared) {
      const address = st.collision
        ? allocationEdge(st, st.collision.region)
        : st.memory.find((b) => b.id === activeId)?.address;
      cells
        .find((cell) => Number(cell.dataset.addr) === address)
        ?.scrollIntoView({ block: "nearest" });
    }
    for (const region of ["static", "heap", "stack"]) {
      $(region + "-used").textContent =
        `${st.memory.filter((b) => b.region === region).length} words defined`;
    }
  }
  function go(n) {
    step = Math.max(0, Math.min(cfg.states.length - 1, n));
    selected = null;
    render();
  }
  function setActiveExample(id) {
    document
      .querySelectorAll(".example-item,.rail-example")
      .forEach((b) => b.classList.toggle("active", b.dataset.id === id));
  }
  function markCustomExample() {
    setActiveExample("__custom__");
  }
  function loadBuiltinExample(id) {
    const ex = BUILTIN_EXAMPLES.find((x) => x.id === id);
    if (!ex) return;
    source = ex.source;
    cfg = JSON.parse(JSON.stringify(ex.config));
    step = 0;
    selected = null;
    $("source-name").textContent = ex.id + "/Main.java";
    $("config-name").textContent = ex.id + "/memory.json";
    setActiveExample(id);
    err("");
    rebuild();
  }
  function initExamples() {
    const list = $("example-list"),
      rail = $("rail-examples");
    list.innerHTML = "";
    rail.innerHTML = "";
    BUILTIN_EXAMPLES.forEach((ex, index) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "example-item";
      b.dataset.id = ex.id;
      b.textContent = ex.label;
      b.addEventListener("click", () => loadBuiltinExample(ex.id));
      list.append(b);
      const q = document.createElement("button");
      q.type = "button";
      q.className = "rail-example";
      q.dataset.id = ex.id;
      q.textContent = String(index + 1);
      q.title = ex.label.replace(/^\d+\s*[—-]\s*/, "");
      q.setAttribute("aria-label", ex.label);
      q.addEventListener("click", () => loadBuiltinExample(ex.id));
      rail.append(q);
    });
    if (BUILTIN_EXAMPLES.length)
      loadBuiltinExample(BUILTIN_EXAMPLES[0].id);
  }
  $("load-source").onclick = () => $("source-input").click();
  $("source-input").onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    source = await f.text();
    $("source-name").textContent = f.name;
    markCustomExample();
    drawCode();
    render();
    e.target.value = "";
  };
  $("load-config").onclick = () => $("config-input").click();
  $("config-input").onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      cfg = validate(JSON.parse(await f.text()));
      step = 0;
      selected = null;
      $("config-name").textContent = f.name;
      markCustomExample();
      err("");
      rebuild();
    } catch (x) {
      err(x.message);
    }
    e.target.value = "";
  };
  $("prev").onclick = () => go(step - 1);
  $("next").onclick = () => go(step + 1);
  $("split-memory").onclick = () => setMemorySeparated(!memorySeparated);
  $("theme-toggle").onclick = () =>
    setTheme(
      document.documentElement.dataset.theme === "light"
        ? "dark"
        : "light",
    );
  $("format").onchange = (e) => {
    format = e.target.value;
    render();
  };
  $("menu-toggle").onclick = () => {
    const open = document.body.classList.toggle("sidebar-open");
    $("menu-toggle").setAttribute("aria-expanded", String(open));
    $("menu-toggle").textContent = open ? "×" : "☰";
  };
  for (const id of ["static-grid", "heap-grid", "stack-grid"])
    $(id).addEventListener("click", (e) => {
      const c = e.target.closest(".word");
      if (!c) return;
      const b = blockAt(cfg.states[step], Number(c.dataset.addr));
      if (b) {
        selected = b.id;
        render();
      }
    });
  initTheme();
  setMemorySeparated(false);
  initExamples();
})();
