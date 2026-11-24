import { cores } from "./physics.js";
export function createScene(host, onSelectLayer) {
  const T = window.THREE;
  if (!T) throw Error("Three.js is unavailable.");
  const scene = new T.Scene();
  scene.background = new T.Color("#9dafba");
  scene.fog = new T.Fog("#9dafba", 35, 70);
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.prepend(renderer.domElement);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    window.roofFail("Graphics context lost. Reload the page.");
  });
  const camera = new T.PerspectiveCamera(39, 1, 0.1, 120);
  const daylight = new T.HemisphereLight(0xe7f5ff, 0x41534e, 2.4);
  scene.add(daylight);
  const weatherColors = {
    coolSky: new T.Color("#87acc6"),
    warmSky: new T.Color("#d7af83"),
    coolSun: new T.Color("#e0f1ff"),
    warmSun: new T.Color("#ffd09a"),
    coolAmbient: new T.Color("#c5e3ff"),
    warmAmbient: new T.Color("#ffe5c3"),
  };
  const skyTarget = new T.Color();
  const sunTarget = new T.Color();
  const ambientTarget = new T.Color();
  const sun = new T.DirectionalLight(0xffe6c2, 3.2);
  sun.position.set(-8, 14, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -12,
    right: 12,
    top: 12,
    bottom: -12,
    near: 1,
    far: 40,
  });
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  const m = (color, metalness = 0, roughness = 0.65) =>
    new T.MeshStandardMaterial({ color, metalness, roughness });
  const plaster = m("#e8e5d9"),
    concrete = m("#c1c4b9"),
    wood = m("#a88159"),
    trim = m("#263d4c", 0.3),
    roofMat = m("#28516a", 0.6, 0.4),
    linerMat = m("#dae0df", 0.4),
    coreMat = m(cores.pu.color),
    glass = m("#8bafbf", 0.45, 0.17),
    grass = m("#718b7b"),
    leaf = m("#405f4f");
  function mesh(g, material, parent, x = 0, y = 0, z = 0) {
    const o = new T.Mesh(g, material);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  function box(p, x, y, z, w, h, d, material) {
    return mesh(new T.BoxGeometry(w, h, d), material, p, x, y, z);
  }
  function cylinder(p, x, y, z, r, h, material) {
    return mesh(new T.CylinderGeometry(r, r, h, 24), material, p, x, y, z);
  }
  const lot = new T.Group();
  scene.add(lot);
  box(lot, 0, -0.3, 0, 14, 0.5, 13, concrete);
  box(lot, 0, -0.02, 0, 13.8, 0.08, 12.8, grass);
  box(lot, 0, 0.08, 0, 6.35, 0.18, 8.35, concrete);
  // A garden, stepped entrance, footpath, terrace and boundary fencing.
  for (let i = 0; i < 4; i++)
    box(lot, -0.6, 0.03, 4.5 + i * 0.58, 1.3, 0.06, 0.46, plaster);
  box(lot, 0.2, 0.12, 4.2, 3.4, 0.14, 0.7, concrete);
  box(lot, 4.3, 0.035, 0.2, 2.1, 0.1, 6.7, wood);
  for (let i = 0; i < 17; i++)
    box(lot, 4.3, 0.091, -3 + i * 0.39, 2.1, 0.006, 0.012, trim);
  for (let i = 0; i < 12; i++) {
    box(lot, -6.5, 0.5, -5.8 + i, 0.09, 1, 0.08, wood);
    box(lot, 6.5, 0.5, -5.8 + i, 0.09, 1, 0.08, wood);
  }
  for (const x of [-6.5, 6.5])
    for (const y of [0.3, 0.75]) box(lot, x, y, -0.3, 0.06, 0.07, 12, wood);
  function tree(x, z, size) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(size);
    lot.add(g);
    cylinder(g, 0, 0.8, 0, 0.12, 1.6, wood);
    for (let i = 0; i < 4; i++) {
      const crown = mesh(
        new T.IcosahedronGeometry(0.85, 1),
        leaf,
        g,
        Math.sin(i * 2.4) * 0.35,
        1.8 + i * 0.23,
        Math.cos(i * 2.4) * 0.3,
      );
      crown.scale.y = 1.2;
    }
  }
  tree(-5, -3.5, 1.2);
  tree(5, -4.6, 1.1);
  tree(-5.2, 3.7, 0.7);
  for (let i = 0; i < 6; i++) {
    const shrub = mesh(
      new T.IcosahedronGeometry(0.35, 1),
      leaf,
      lot,
      2.3 - i * 0.38,
      0.3,
      5.4,
    );
    shrub.scale.set(1, 0.8, 1);
  }
  // Patio table, chairs and pots remain visible during the roof inspection.
  cylinder(lot, 4.35, 0.72, 1, 0.5, 0.08, wood);
  cylinder(lot, 4.35, 0.37, 1, 0.05, 0.7, trim);
  for (const z of [0.15, 1.85]) {
    box(lot, 4.35, 0.42, z, 0.55, 0.09, 0.5, plaster);
    box(lot, 4.35, 0.7, z + (z < 1 ? -0.23 : 0.23), 0.55, 0.55, 0.07, wood);
    for (const x of [4.13, 4.57])
      for (const dz of [-0.18, 0.18])
        box(lot, x, 0.22, z + dz, 0.04, 0.4, 0.04, trim);
  }
  cylinder(lot, 3.8, 0.25, 3, 0.23, 0.5, concrete);
  mesh(new T.IcosahedronGeometry(0.4, 1), leaf, lot, 3.8, 0.7, 3);
  const home = new T.Group();
  scene.add(home);
  const floor = box(home, 0, 0.22, 0, 5.9, 0.1, 7.9, wood);
  for (let i = 0; i < 20; i++)
    box(home, 0, 0.276, -3.8 + i * 0.39, 5.9, 0.004, 0.01, concrete);
  box(home, -3, 1.65, 0, 0.16, 3, 8, plaster);
  box(home, 3, 1.65, 0, 0.16, 3, 8, plaster);
  box(home, 0, 1.65, -4, 6, 0.0 + 3, 0.16, plaster);
  const front = new T.Group();
  home.add(front);
  box(front, 0, 2.95, 4, 6, 0.4, 0.16, plaster);
  box(front, -2.6, 1.6, 4, 0.8, 2.6, 0.16, plaster);
  box(front, 2.6, 1.6, 4, 0.8, 2.6, 0.16, plaster);
  box(front, 0.35, 1.6, 4, 0.5, 2.6, 0.16, plaster);
  // Front door and framed glazing.
  box(front, -0.65, 1.37, 4.04, 1.15, 2.25, 0.11, wood);
  box(front, -0.26, 1.38, 4.13, 0.035, 0.35, 0.045, trim);
  box(front, -1.78, 1.7, 4, 0.75, 1.8, 0.06, glass);
  box(front, 1.45, 1.65, 4, 1.55, 2.1, 0.06, glass);
  for (const x of [-2.18, -1.37, 0.65, 2.25])
    box(front, x, 1.65, 4.08, 0.045, 2.2, 0.07, trim);
  for (const y of [0.55, 2.75]) {
    box(front, 1.45, y, 4.08, 1.65, 0.045, 0.07, trim);
    box(front, -1.78, y, 4.08, 0.84, 0.045, 0.07, trim);
  }
  box(front, 1.45, 1.65, 4.08, 0.04, 2.2, 0.07, trim);
  // Gable triangles at each end close the house beneath the pitched roof.
  for (const z of [-4, 4]) {
    const shape = new T.Shape();
    shape.moveTo(-3, 3.15);
    shape.lineTo(3, 3.15);
    shape.lineTo(0, 4.75);
    shape.closePath();
    const gable = mesh(
      new T.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false }),
      plaster,
      z > 0 ? front : home,
      0,
      0,
      z - 0.06,
    );
  }
  for (const z of [-2, 1.3]) {
    box(home, 3.09, 1.7, z, 0.05, 1.55, 1.65, glass);
    for (const dz of [-0.85, 0.85])
      box(home, 3.13, 1.7, z + dz, 0.07, 1.67, 0.045, trim);
    for (const y of [0.87, 2.53])
      box(home, 3.13, y, z, 0.07, 0.045, 1.74, trim);
    box(home, 3.14, 1.7, z, 0.07, 1.65, 0.04, trim);
  }
  // Furnished living room and kitchen are revealed through the section.
  const sofa = m("#597a83"),
    cushion = m("#c9d6cc");
  box(home, -1.7, 0.65, 1.5, 1.4, 0.7, 2.5, sofa);
  box(home, -2.3, 1, 1.5, 0.22, 1.1, 2.6, sofa);
  for (const z of [0.3, 2.7]) box(home, -1.7, 0.9, z, 1.4, 0.9, 0.18, sofa);
  for (const z of [0.8, 1.5, 2.2])
    box(home, -1.55, 1.05, z, 0.8, 0.15, 0.65, cushion);
  box(home, 0.05, 0.3, 1.2, 2.3, 0.04, 3.1, m("#bbb9a3"));
  box(home, 0.1, 0.65, 1.2, 0.9, 0.08, 1.5, wood);
  for (const x of [-0.25, 0.45])
    for (const z of [0.65, 1.75])
      box(home, x, 0.46, z, 0.055, 0.36, 0.055, trim);
  box(home, 1.9, 0.63, -2.4, 1.5, 0.75, 1.35, wood);
  for (const x of [1.3, 2.5])
    for (const z of [-2.9, -1.9]) box(home, x, 0.46, z, 0.06, 0.4, 0.06, trim);
  cylinder(home, 1.9, 1.1, -2.4, 0.15, 0.2, plaster);
  mesh(new T.IcosahedronGeometry(0.22, 1), leaf, home, 1.9, 1.4, -2.4);
  box(home, -1.6, 0.8, -3.35, 2.3, 1.05, 0.9, m("#aabcb3"));
  box(home, -1.6, 1.36, -3.35, 2.4, 0.08, 1, plaster);
  for (const x of [-2.35, -1.6, -0.85])
    box(home, x, 0.8, -2.88, 0.68, 0.88, 0.03, wood);
  box(home, -2.5, 2.2, -3.7, 0.8, 0.7, 0.5, wood);
  // Four roof quadrants; front-right quadrant has independently inspectable layers.
  const slope = Math.atan2(1.6, 3),
    panels = [];
  let selected;
  for (const side of [-1, 1])
    for (const z of [-2.15, 2.15]) {
      const group = new T.Group();
      group.position.set(side * 1.5, 3.95, z);
      group.rotation.z = -side * slope;
      home.add(group);
      const inner = box(group, 0, 0, 0, 3.9, 0.018, 4.3, linerMat);
      const core = box(group, 0, 0.065, 0, 3.9, 1, 4.3, coreMat);
      const skin = new T.Group();
      group.add(skin);
      box(skin, 0, 0, 0, 3.9, 0.018, 4.3, roofMat);
      for (let i = 0; i < 11; i++)
        box(skin, -1.85 + i * 0.37, 0.025, 0, 0.025, 0.04, 4.3, roofMat);
      const panel = { group, inner, core, skin, inspect: side === 1 && z > 0 };
      panels.push(panel);
      if (panel.inspect) selected = panel;
    }
  const ridge = box(home, 0, 4.9, 0, 0.18, 0.14, 8.65, roofMat);
  // Animation markers represent heat transfer, not physical particles.
  const heatMarkers = [];
  for (let i = 0; i < 18; i++) {
    const arrow = mesh(
      new T.ConeGeometry(0.11, 0.25, 8),
      new T.MeshBasicMaterial({ color: "#ff2020", toneMapped: false }),
      scene,
    );
    heatMarkers.push({
      arrow,
      x: 0.25 + (i % 3) * 0.8,
      z: -2.7 + Math.floor(i / 3) * 1.05,
      offset: i / 18,
    });
  }
  const rays = [];
  const rayMaterial = new T.MeshBasicMaterial({
    color: "#ffd29a",
    transparent: true,
    opacity: 0.5,
  });
  for (let i = 0; i < 10; i++) {
    const line = box(
      scene,
      -1 + (i % 5) * 0.75,
      6.3,
      Math.floor(i / 5) * 3 - 1.5,
      0.015,
      1.2,
      0.015,
      rayMaterial,
    );
    line.rotation.z = -0.4;
    rays.push(line);
  }
  const tags = [];
  for (const [text, part] of [
    ["Outer steel skin", "skin"],
    ["Insulation core", "core"],
    ["Inner liner", "inner"],
  ]) {
    const el = document.createElement("button");
    el.className = "tag";
    el.textContent = text;
    el.dataset.layer = part;
    el.setAttribute("aria-pressed", part === "core");
    el.onclick = () => onSelectLayer(part);
    document.getElementById("tags").append(el);
    tags.push({ el, part });
  }
  let mode = "house",
    showHeat = true,
    angle = 0.65,
    elevation = 0.5,
    distance = 24,
    spread = 0,
    phase = 0,
    drag = null;
  const target = new T.Vector3(0, 1.7, 0),
    pointers = new Map();
  let pinch = 0;
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    drag = [e.clientX, e.clientY];
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) {
      const p = [...pointers.values()],
        gap = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
      if (pinch)
        distance = Math.max(13, Math.min(35, (distance * pinch) / gap));
      pinch = gap;
    } else if (drag) {
      angle -= (e.clientX - drag[0]) * 0.005;
      elevation = Math.max(
        0.15,
        Math.min(1.15, elevation + (e.clientY - drag[1]) * 0.004),
      );
    }
    drag = [e.clientX, e.clientY];
  });
  for (const type of ["pointerup", "pointercancel"])
    canvas.addEventListener(type, (e) => {
      pointers.delete(e.pointerId);
      drag = null;
      pinch = 0;
    });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      distance = Math.max(
        13,
        Math.min(35, distance * Math.exp(e.deltaY * 0.001)),
      );
    },
    { passive: false },
  );
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight - (window.innerWidth <= 900 ? 240 : 0);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    if (window.innerWidth > 900) camera.setViewOffset(w, h, 125, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  });
  resize.observe(host);
  function update(dt, state, r) {
    const ease = 1 - Math.exp(-dt * 5);
    // Temperature tint is an educational cue; irradiance controls illumination.
    // Keep diffuse light at zero irradiance so the house remains inspectable.
    const warmth = T.MathUtils.clamp((state.ambient - 25) / 20, 0, 1);
    const sunlight = T.MathUtils.clamp(state.solar / 1000, 0, 1);
    skyTarget
      .lerpColors(weatherColors.coolSky, weatherColors.warmSky, warmth)
      .multiplyScalar(0.65 + 0.35 * sunlight);
    sunTarget.lerpColors(weatherColors.coolSun, weatherColors.warmSun, warmth);
    ambientTarget.lerpColors(
      weatherColors.coolAmbient,
      weatherColors.warmAmbient,
      warmth,
    );
    scene.background.lerp(skyTarget, ease);
    scene.fog.color.copy(scene.background);
    sun.color.lerp(sunTarget, ease);
    daylight.color.lerp(ambientTarget, ease);
    sun.intensity += (4.2 * sunlight - sun.intensity) * ease;
    daylight.intensity += (1.5 + 1.2 * sunlight - daylight.intensity) * ease;
    spread += ((mode === "inside" ? 1 : 0) - spread) * ease;
    front.visible = spread < 0.5;
    coreMat.color.setHex(cores[state.material].color);
    const d = state.thickness / 1000;
    for (const p of panels) {
      p.core.scale.y = d;
      p.core.position.y = 0.009 + d / 2 + (p.inspect ? spread * 0.6 : 0);
      p.skin.position.y = 0.018 + d + (p.inspect ? spread * 1.3 : 0);
    }
    ridge.position.y = 4.8 + d;
    ridge.visible = mode === "house";
    if (!state.paused) phase += dt * 0.35;
    // Width encodes heat-flux magnitude; keep length constant for comparison.
    const arrowWidth = 0.35 + Math.abs(r.flux) * 0.27;
    for (const h of heatMarkers) {
      const t = (phase + h.offset) % 1;
      const travel = r.q >= 0 ? t : 1 - t;
      h.arrow.position.set(h.x, 5.3 - travel * 3.2, h.z);
      h.arrow.rotation.z = r.q >= 0 ? Math.PI : 0;
      h.arrow.visible = showHeat && Math.abs(r.q) > 1;
      h.arrow.scale.set(arrowWidth, 1.6, arrowWidth);
    }
    for (const [i, ray] of rays.entries()) {
      ray.visible = showHeat && state.solar > 0;
      ray.position.y = 6.7 - ((phase * 0.8 + i * 0.1) % 1);
      rayMaterial.opacity = 0.15 + state.solar / 1600;
    }
    const dist = distance * Math.max(1, 1.18 / camera.aspect);
    camera.position.set(
      Math.sin(angle) * Math.cos(elevation) * dist,
      target.y + Math.sin(elevation) * dist,
      Math.cos(angle) * Math.cos(elevation) * dist,
    );
    camera.lookAt(target);
    scene.updateMatrixWorld();
    for (const tag of tags) {
      const point = selected[tag.part]
        .localToWorld(new T.Vector3(1.45, 0, 1.5))
        .project(camera);
      tag.el.hidden = spread < 0.9 || point.z > 1;
      tag.el.style.left = (point.x * 0.5 + 0.5) * host.clientWidth + "px";
      tag.el.style.top =
        (-point.y * 0.5 + 0.5) *
          (host.clientHeight - (window.innerWidth <= 900 ? 240 : 0)) +
        "px";
    }
    renderer.render(scene, camera);
    window.roofReady = true;
    document.getElementById("startup").hidden = true;
  }
  return {
    update,
    setMode(v) {
      mode = v;
    },
    setHeat(v) {
      showHeat = v;
    },
  };
}
