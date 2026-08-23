import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js";
import { CATS, WIRE_DEFS } from "./config.js";

export function createWorkshop(canvas, onPick, onHover) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1612);
  scene.fog = new THREE.Fog(0x1a1612, 8, 18);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  if (window.innerWidth >= 900) {
    renderer.shadowMap.enabled = true;
  }
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 40);
  camera.position.set(1.6, 1.85, 2.4);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.82, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.4;
  controls.maxDistance = 4.2;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.25;
  controls.minAzimuthAngle = -1.1;
  controls.maxAzimuthAngle = 1.1;
  controls.enablePan = false;

  scene.add(new THREE.AmbientLight(0xfff4e0, 0.45));
  const key = new THREE.DirectionalLight(0xffe6c2, 1.15);
  key.position.set(2.2, 4.2, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88aacc, 0.35);
  fill.position.set(-3, 2, -1);
  scene.add(fill);
  const lamp = new THREE.PointLight(0xffcc77, 1.4, 6, 1.6);
  lamp.position.set(0, 2.15, 0.2);
  scene.add(lamp);

  const interactives = [];
  const pickables = new Map();

  function mark(obj, id, extra = {}) {
    obj.userData.pickId = id;
    Object.assign(obj.userData, extra);
    interactives.push(obj);
    pickables.set(id, obj);
    obj.traverse((c) => {
      if (c.isMesh) {
        c.userData.pickId = id;
        interactives.push(c);
      }
    });
    return obj;
  }

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.85 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xc4b49a, roughness: 0.9 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
  back.position.set(0, 2.5, -3.2);
  scene.add(back);
  const leftW = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
  leftW.position.set(-4.2, 2.5, 0);
  leftW.rotation.y = Math.PI / 2;
  scene.add(leftW);

  const bench = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.62, metalness: 0.05 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.15), wood);
  top.position.y = 0.78;
  top.castShadow = true;
  top.receiveShadow = true;
  bench.add(top);
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(2.42, 0.04, 1.17),
    new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.5 })
  );
  edge.position.y = 0.83;
  bench.add(edge);
  const gridMat = new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 0.8 });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.95), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.825;
  bench.add(grid);
  for (const [x, z] of [
    [-1.05, -0.45],
    [1.05, -0.45],
    [-1.05, 0.45],
    [1.05, 0.45],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 0.1), wood);
    leg.position.set(x, 0.39, z);
    leg.castShadow = true;
    bench.add(leg);
  }
  scene.add(bench);

  const rack = new THREE.Group();
  rack.position.set(-1.55, 1.15, -0.15);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.15, 1.35),
    new THREE.MeshStandardMaterial({ color: 0x8b3a2a, roughness: 0.7 })
  );
  rack.add(board);
  const titlePlate = makeLabel("공구대", 0.28);
  titlePlate.position.set(0.08, 0.62, 0);
  titlePlate.rotation.y = Math.PI / 2;
  rack.add(titlePlate);
  scene.add(rack);

  const toolMeshes = {};
  const hooks = {};

  function makeHook(z, y = 0.28) {
    const g = new THREE.Group();
    const peg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.3 })
    );
    peg.rotation.z = Math.PI / 2;
    peg.position.x = 0.08;
    g.add(peg);
    g.position.set(-1.48, 1.15 + y, z);
    scene.add(g);
    return g;
  }

  hooks.stripper = makeHook(0.42);
  hooks.cutter = makeHook(0.12);
  hooks.crimper = makeHook(-0.18);
  hooks.tester = makeHook(-0.48, 0.12);

  function toolMat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.25 });
  }

  {
    const g = new THREE.Group();
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.035), toolMat(0x222222));
    h1.position.set(0, -0.08, 0.02);
    h1.rotation.z = 0.15;
    const h2 = h1.clone();
    h2.position.z = -0.02;
    h2.rotation.z = -0.15;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), toolMat(0x444444));
    head.position.y = 0.06;
    g.add(h1, h2, head);
    g.position.set(-1.38, 1.38, 0.42);
    g.castShadow = true;
    mark(g, "tool:stripper", { kind: "tool", tool: "stripper" });
    scene.add(g);
    toolMeshes.stripper = g;
  }
  {
    const g = new THREE.Group();
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.03), toolMat(0xc0392b));
    h.position.y = -0.06;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.05, 0.01),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 })
    );
    blade.position.set(0.02, 0.06, 0);
    g.add(h, blade);
    g.position.set(-1.38, 1.38, 0.12);
    mark(g, "tool:cutter", { kind: "tool", tool: "cutter" });
    scene.add(g);
    toolMeshes.cutter = g;
  }
  {
    const g = new THREE.Group();
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.26, 0.04), toolMat(0x1a5276));
    h1.rotation.z = 0.2;
    h1.position.set(0.02, -0.08, 0);
    const h2 = h1.clone();
    h2.rotation.z = -0.2;
    h2.position.x = -0.02;
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.07), toolMat(0x2c3e50));
    jaw.position.y = 0.08;
    g.add(h1, h2, jaw);
    g.position.set(-1.38, 1.36, -0.18);
    mark(g, "tool:crimper", { kind: "tool", tool: "crimper" });
    scene.add(g);
    toolMeshes.crimper = g;
  }
  {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.28, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x1b2631, roughness: 0.45 })
    );
    g.add(body);
    const leds = [];
    for (let i = 0; i < 8; i++) {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x145a32, emissive: 0x000000, emissiveIntensity: 0 })
      );
      led.position.set(-0.05 + (i % 4) * 0.032, 0.08 - Math.floor(i / 4) * 0.04, 0.034);
      g.add(led);
      leds.push(led);
    }
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12), toolMat(0xe74c3c));
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.04, -0.08, 0.03);
    g.add(btn);
    mark(btn, "tester:button", { kind: "tester-btn" });
    g.position.set(-1.36, 1.22, -0.48);
    mark(g, "tool:tester", { kind: "tool", tool: "tester" });
    scene.add(g);
    toolMeshes.tester = g;
    g.userData.leds = leds;
  }

  const shelf = new THREE.Group();
  shelf.position.set(1.55, 1.2, 0);
  const side = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.7 })
  );
  side.position.x = 0.12;
  shelf.add(side);
  for (let i = 0; i < 4; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 1.36), wood);
    plank.position.set(0.0, -0.55 + i * 0.36, 0);
    shelf.add(plank);
  }
  scene.add(shelf);

  const reelMeshes = {};
  const catIds = ["cat5e", "cat6", "cat6a", "cat7"];
  catIds.forEach((id, i) => {
    const cat = CATS[id];
    const g = new THREE.Group();
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.14, 20),
      new THREE.MeshStandardMaterial({ color: cat.color, roughness: 0.55 })
    );
    drum.rotation.z = Math.PI / 2;
    const flange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 })
    );
    flange.rotation.z = Math.PI / 2;
    flange.position.x = 0.08;
    const flange2 = flange.clone();
    flange2.position.x = -0.08;
    g.add(drum, flange, flange2);
    g.position.set(1.38, 1.55, 0.48 - i * 0.32);
    mark(g, `reel:${id}`, { kind: "reel", cat: id });
    scene.add(g);
    reelMeshes[id] = g;
  });

  const plugBag = new THREE.Group();
  const bag = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.08, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xf5d76e, roughness: 0.4, transparent: true, opacity: 0.85 })
  );
  plugBag.add(bag);
  const plugPrev = makeRj45();
  plugPrev.scale.setScalar(1.4);
  plugPrev.position.set(0, 0.06, 0);
  plugBag.add(plugPrev);
  plugBag.position.set(1.4, 0.92, 0.35);
  mark(plugBag, "item:plug", { kind: "plug" });
  scene.add(plugBag);

  const bootBag = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.07, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.5 })
  );
  bootBag.position.set(1.4, 0.92, 0.05);
  mark(bootBag, "item:boot", { kind: "boot" });
  scene.add(bootBag);

  const cableGroup = new THREE.Group();
  cableGroup.position.set(0, 0.86, 0.05);
  cableGroup.visible = false;
  scene.add(cableGroup);

  const wireMeshes = [];
  let jacketMesh = null;
  let plugMesh = null;
  let separatorMesh = null;

  function rebuildCable(state) {
    while (cableGroup.children.length) cableGroup.remove(cableGroup.children[0]);
    wireMeshes.length = 0;
    plugMesh = null;
    separatorMesh = null;
    jacketMesh = null;
    if (!state.cableOnBench) {
      cableGroup.visible = false;
      return;
    }
    cableGroup.visible = true;
    const cat = CATS[state.cat];
    const end = state.ends[state.currentEnd];
    const len = state.length === "2m" ? 1.6 : 1.15;
    jacketMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(cat.thickness, cat.thickness, len, 16),
      new THREE.MeshStandardMaterial({ color: cat.color, roughness: 0.45 })
    );
    jacketMesh.rotation.z = Math.PI / 2;
    jacketMesh.position.x = -0.05;
    mark(jacketMesh, "cable:jacket", { kind: "cable" });
    cableGroup.add(jacketMesh);

    if (cat.hasSeparator && end.stripped) {
      separatorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.035, 0.008),
        new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.6 })
      );
      separatorMesh.position.set(0.55, 0.02, 0);
      cableGroup.add(separatorMesh);
      const sep2 = separatorMesh.clone();
      sep2.rotation.x = Math.PI / 2;
      cableGroup.add(sep2);
    }

    if (end.stripped) {
      const order = end.order;
      order.forEach((wid, i) => {
        const def = WIRE_DEFS[wid];
        const y = (i - 3.5) * 0.018;
        const w = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.007, 0.28, 8),
          new THREE.MeshStandardMaterial({ color: def.hex, roughness: 0.35 })
        );
        w.rotation.z = Math.PI / 2;
        w.position.set(0.62, 0.01 + (end.untwisted ? y : (i % 2) * 0.01), end.untwisted ? 0 : (i - 3.5) * 0.008);
        if (end.trimmed) w.scale.y = 0.72;
        mark(w, `wire:${i}`, { kind: "wire", index: i });
        cableGroup.add(w);
        wireMeshes.push(w);
        if (def.stripe) {
          const s = new THREE.Mesh(
            new THREE.BoxGeometry(0.26, 0.003, 0.003),
            new THREE.MeshStandardMaterial({ color: def.stripe })
          );
          s.position.copy(w.position);
          cableGroup.add(s);
        }
      });
    }

    if (end.inserted || end.crimped) {
      plugMesh = makeRj45();
      plugMesh.position.set(end.trimmed ? 0.78 : 0.86, 0.02, 0);
      plugMesh.rotation.y = end.tabDown ? 0 : Math.PI;
      cableGroup.add(plugMesh);
      mark(plugMesh, "cable:plug", { kind: "plugged" });
    }
  }

  function makeRj45() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0xe8f6f3,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.72,
      })
    );
    g.add(body);
    const tab = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.02, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xd5dbdb, roughness: 0.3 })
    );
    tab.position.set(-0.02, -0.05, 0);
    g.add(tab);
    for (let i = 0; i < 8; i++) {
      const pin = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.006, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 })
      );
      pin.position.set(0.055, 0.03, -0.035 + i * 0.01);
      g.add(pin);
    }
    return g;
  }

  function makeLabel(text, scale) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#2b1d12";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#f4e6c8";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale * 0.25), mat);
    return m;
  }

  const lampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.32, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0xf5e6c8, emissive: 0x886633, emissiveIntensity: 0.4 })
  );
  lampShade.position.set(0, 2.35, 0.15);
  scene.add(lampShade);

  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.6 })
  );
  poster.position.set(-0.2, 2.05, -3.18);
  scene.add(poster);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  const hoverEmissive = [];

  function setPointer(ev) {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  }

  function pickList() {
    return interactives.filter((o) => o.visible && o.parent);
  }

  function clearHover() {
    hoverEmissive.forEach(({ mesh, e, ei }) => {
      if (mesh.material && mesh.material.emissive) {
        mesh.material.emissive.setHex(e);
        mesh.material.emissiveIntensity = ei;
      }
    });
    hoverEmissive.length = 0;
    hovered = null;
  }

  function applyHover(obj) {
    clearHover();
    hovered = obj.userData.pickId;
    obj.traverse((c) => {
      if (c.isMesh && c.material && c.material.emissive) {
        hoverEmissive.push({
          mesh: c,
          e: c.material.emissive.getHex(),
          ei: c.material.emissiveIntensity || 0,
        });
        c.material.emissive.setHex(0x4466aa);
        c.material.emissiveIntensity = 0.35;
      }
    });
    onHover(hovered, obj.userData);
  }

  canvas.addEventListener("pointermove", (ev) => {
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickList(), true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData.pickId) o = o.parent;
      if (o && o.userData.pickId) applyHover(o);
      canvas.style.cursor = "pointer";
    } else {
      clearHover();
      onHover(null, null);
      canvas.style.cursor = "grab";
    }
  });

  canvas.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickList(), true);
    if (!hits.length) return;
    let o = hits[0].object;
    while (o && !o.userData.pickId) o = o.parent;
    if (o && o.userData.pickId) onPick(o.userData.pickId, o.userData);
  });

  function resize() {
    const parent = canvas.parentElement;
    const w = Math.max((parent && parent.clientWidth) || canvas.clientWidth || 320, 2);
    const h = Math.max((parent && parent.clientHeight) || canvas.clientHeight || 320, 2);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentElement || canvas);
  requestAnimationFrame(resize);
  resize();

  const homePos = toolHome();
  function toolHome() {
    return {
      stripper: new THREE.Vector3(-1.38, 1.38, 0.42),
      cutter: new THREE.Vector3(-1.38, 1.38, 0.12),
      crimper: new THREE.Vector3(-1.38, 1.36, -0.18),
      tester: new THREE.Vector3(-1.36, 1.22, -0.48),
    };
  }

  const benchSlots = {
    stripper: new THREE.Vector3(-0.75, 0.9, 0.35),
    cutter: new THREE.Vector3(-0.5, 0.9, 0.35),
    crimper: new THREE.Vector3(-0.25, 0.92, 0.38),
    tester: new THREE.Vector3(0.55, 0.98, 0.38),
  };

  function setToolOut(name, out) {
    const m = toolMeshes[name];
    if (!m) return;
    const t = out ? benchSlots[name] : homePos[name];
    m.position.copy(t);
    if (out) m.rotation.z = -0.4;
    else m.rotation.z = 0;
  }

  function setTesterLeds(states) {
    const leds = toolMeshes.tester.userData.leds;
    if (!leds) return;
    states.forEach((st, i) => {
      const mat = leds[i].material;
      if (st === "ok") {
        mat.emissive.setHex(0x2ecc71);
        mat.emissiveIntensity = 2;
        mat.color.setHex(0x2ecc71);
      } else if (st === "cross") {
        mat.emissive.setHex(0xf1c40f);
        mat.emissiveIntensity = 2;
        mat.color.setHex(0xf1c40f);
      } else if (st === "fail") {
        mat.emissive.setHex(0xe74c3c);
        mat.emissiveIntensity = 2;
        mat.color.setHex(0xe74c3c);
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.color.setHex(0x145a32);
      }
    });
  }

  function highlightReels(selected) {
    Object.entries(reelMeshes).forEach(([id, m]) => {
      m.scale.setScalar(id === selected ? 1.12 : 1);
    });
  }

  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  }
  tick();

  return {
    scene,
    camera,
    controls,
    rebuildCable,
    setToolOut,
    setTesterLeds,
    highlightReels,
    cableGroup,
    toolMeshes,
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      renderer.dispose();
    },
  };
}
