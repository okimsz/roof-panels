export const cores = {
  pu: {
    k: 0.025,
    color: 0xe4c98b,
    note: "A fine-cell foam with low thermal conductivity.",
  },
  eps: {
    k: 0.036,
    color: 0xf0f0e9,
    note: "A lightweight rigid foam made from expanded beads.",
  },
  wool: {
    k: 0.04,
    color: 0xb6ae83,
    note: "A fibrous mineral core that slows conductive heat flow.",
  },
};
export const roofArea = 2 * 8 * Math.hypot(3, 1.6);
export function createState() {
  return {
    ambient: 35,
    thickness: 100,
    material: "pu",
    solar: 600,
    speed: 60,
    paused: false,
    room: 26,
    baseline: 26,
    time: 0,
  };
}
export function readings(s) {
  const k = cores[s.material].k,
    coreR = s.thickness / 1000 / k,
    baseR = 0.04 + 0.1 + 0.001 / 50,
    u = 1 / (baseR + coreR),
    baseU = 1 / baseR,
    solair = s.ambient + (0.55 * s.solar) / 25;
  return {
    k,
    coreR,
    u,
    baseU,
    solair,
    q: u * roofArea * (solair - s.room),
    reduction: 100 * (1 - u / baseU),
    flux: u * (solair - s.room),
    baseQ: baseU * roofArea * (solair - s.baseline),
  };
}
export function step(s, dt) {
  if (s.paused) return readings(s);
  const seconds = Math.max(0, Math.min(dt, 0.1)) * s.speed,
    r = readings(s);
  function evolve(temp, u) {
    const roofUA = u * roofArea,
      totalUA = roofUA + 70,
      equilibrium = (roofUA * r.solair + 70 * s.ambient + 180) / totalUA;
    return (
      equilibrium +
      (temp - equilibrium) * Math.exp((-totalUA * seconds) / 3000000)
    );
  }
  s.room = evolve(s.room, r.u);
  s.baseline = evolve(s.baseline, r.baseU);
  s.time += seconds;
  return readings(s);
}
