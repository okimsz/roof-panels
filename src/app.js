import { createState, readings, step, cores } from "./physics.js";
import { createScene } from "./scene.js";
const $ = (id) => document.getElementById(id);
let state = createState(),
  history = [[0, 26, 26]],
  lastSample = 0;
const view = createScene($("stage"));
function controls() {
  $("ambientOut").textContent = state.ambient + " °C";
  $("thicknessOut").textContent = state.thickness + " mm";
  $("solarOut").textContent = state.solar + " W/m²";
  $("materialNote").textContent = cores[state.material].note;
}
for (const id of ["ambient", "thickness", "material", "solar", "speed"])
  $(id).addEventListener("input", () => {
    state[id] = id === "material" ? $(id).value : Number($(id).value);
    controls();
  });
function mode(v) {
  view.setMode(v);
  document
    .querySelectorAll("[data-mode]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === v));
  $("viewCaption").textContent =
    v === "house"
      ? "A complete home. Protection in every layer."
      : "Steel skin / insulating core / inner liner";
}
document
  .querySelectorAll("[data-mode]")
  .forEach((b) => (b.onclick = () => mode(b.dataset.mode)));
$("heat").onclick = () => {
  const value = $("heat").getAttribute("aria-pressed") !== "true";
  $("heat").setAttribute("aria-pressed", value);
  view.setHeat(value);
};
$("pause").onclick = () => {
  state.paused = !state.paused;
  $("pause").textContent = state.paused ? "Resume" : "Pause";
};
$("reset").onclick = () => {
  state = createState();
  history = [[0, 26, 26]];
  lastSample = 0;
  for (const id of ["ambient", "thickness", "material", "solar", "speed"])
    $(id).value = state[id];
  controls();
  $("pause").textContent = "Pause";
  mode("house");
  draw();
};
$("guideButton").onclick = () => $("guide").showModal();
$("closeGuide").onclick = () => $("guide").close();
function draw() {
  const min = Math.min(24, ...history.flatMap((p) => p.slice(1))) - 1,
    max = Math.max(30, ...history.flatMap((p) => p.slice(1))) + 1,
    end = Math.max(60, history.at(-1)[0]),
    start = history[0][0];
  for (const [id, index] of [
    ["roomLine", 1],
    ["baselineLine", 2],
  ])
    $(id).setAttribute(
      "d",
      history
        .map(
          (p, i) =>
            (i ? "L" : "M") +
            (((p[0] - start) / (end - start)) * 280).toFixed(2) +
            " " +
            (60 - ((p[index] - min) / (max - min)) * 55).toFixed(2),
        )
        .join(" "),
    );
  $("chart").setAttribute(
    "aria-label",
    `Indoor temperature chart, ${min.toFixed(0)} to ${max.toFixed(0)} degrees Celsius, ${(start / 60).toFixed(0)} to ${(end / 60).toFixed(0)} simulated minutes. Cyan insulated, orange no core.`,
  );
}
let last = performance.now();
function frame(now) {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  const r = step(state, dt);
  view.update(dt, state, r);
  $("gain").textContent = (r.q / 1000).toFixed(2) + " kW";
  $("uvalue").textContent = r.u.toFixed(3);
  $("reduction").textContent = r.reduction.toFixed(1) + "%";
  $("conductivity").textContent = r.k.toFixed(3);
  $("rvalue").textContent = r.coreR.toFixed(2);
  $("roomTemp").textContent = state.room.toFixed(1) + " °C";
  $("baselineTemp").textContent = state.baseline.toFixed(1) + " °C";
  $("elapsed").textContent =
    Math.floor(state.time / 60) + " min simulated · starts at 26 °C";
  if (state.time - lastSample >= 30) {
    history.push([state.time, state.room, state.baseline]);
    if (history.length > 240) history.shift();
    lastSample = state.time;
    draw();
  }
  requestAnimationFrame(frame);
}
draw();
requestAnimationFrame(frame);
document.addEventListener("visibilitychange", () => (last = performance.now()));
