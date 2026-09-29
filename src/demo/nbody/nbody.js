export const G = 1;
export const DT = 0.25;       // physics time step; speeding up runs more steps, not bigger ones
const SOFTENING2 = 1;          // avoids infinite force at zero distance
const TRAIL_LENGTH = 300;
const PLANET_COLORS = ['#4fc3f7', '#81c784', '#e57373', '#ffb74d', '#ba68c8', '#4db6ac', '#f06292', '#aed581'];

let nextId = 1;

function makeBody({ x, y, vx = 0, vy = 0, mass, radius, color, name, star = false }) {
  return { id: nextId++, x, y, vx, vy, ax: 0, ay: 0, mass, radius, color, name, star, trail: [] };
}

// a body in a circular orbit around `parent`, the same √(GM/r) setup as your Java version
function orbit(parent, distance, angle, props) {
  const speed = Math.sqrt((G * parent.mass) / distance);
  return makeBody({
    x: parent.x + Math.cos(angle) * distance,
    y: parent.y + Math.sin(angle) * distance,
    vx: parent.vx - Math.sin(angle) * speed,
    vy: parent.vy + Math.cos(angle) * speed,
    ...props,
  });
}

const randomAngle = () => Math.random() * Math.PI * 2;
const color = (i) => PLANET_COLORS[i % PLANET_COLORS.length];

function solarSystem() {
  const star = makeBody({ x: 0, y: 0, mass: 1000, radius: 12, color: '#ffd54f', name: 'Star', star: true });
  const specs = [
    { d: 55, mass: 0.3, radius: 3 },
    { d: 90, mass: 0.6, radius: 4 },
    { d: 125, mass: 0.5, radius: 4 },
    { d: 210, mass: 8, radius: 5, moon: true },
    { d: 300, mass: 2, radius: 5 },
  ];
  const bodies = [star];
  specs.forEach((s, i) => {
    const planet = orbit(star, s.d, randomAngle(), { mass: s.mass, radius: s.radius, color: color(i), name: `Planet ${i + 1}` });
    bodies.push(planet);
    if (s.moon) {
      bodies.push(orbit(planet, 9, randomAngle(), { mass: 0.05, radius: 1.5, color: '#cfd8dc', name: 'Moon' }));
    }
  });
  return bodies;
}

function binaryStars() {
  const a = 40;   // each star's distance from the center
  const m = 500;
  const v = Math.sqrt((G * m) / (4 * a));
  const bodies = [
    makeBody({ x: -a, y: 0, vy: -v, mass: m, radius: 9, color: '#ffb74d', name: 'Star A', star: true }),
    makeBody({ x: a, y: 0, vy: v, mass: m, radius: 9, color: '#90caf9', name: 'Star B', star: true }),
  ];
  // planets orbit the pair's combined mass
  const center = makeBody({ x: 0, y: 0, mass: 2 * m, radius: 0 });
  [170, 230].forEach((d, i) => {
    bodies.push(orbit(center, d, randomAngle(), { mass: 3, radius: 4, color: color(i + 2), name: `Planet ${i + 1}` }));
  });
  return bodies;
}

function roguePlanet() {
  const bodies = solarSystem();
  bodies.push(makeBody({ x: -380, y: -140, vx: 1.6, vy: 0.35, mass: 150, radius: 10, color: '#ef5350', name: 'Rogue planet' }));
  return bodies;
}

function loneStar() {
  return [makeBody({ x: 0, y: 0, mass: 1000, radius: 12, color: '#ffd54f', name: 'Star', star: true })];
}

export const SCENARIOS = {
  solar: { label: 'Solar system', build: solarSystem },
  binary: { label: 'Binary stars', build: binaryStars },
  rogue: { label: 'Rogue planet', build: roguePlanet },
  empty: { label: 'Lone star (launch your own)', build: loneStar },
};

export class Simulation {
  constructor(scenario = 'solar') {
    this.bodies = SCENARIOS[scenario].build();
    this.time = 0;
    this.zeroMomentum();
    this.computeAccelerations();
    this.resetEnergyBaseline();
  }

  // shift velocities so the system as a whole doesn't drift off screen
  zeroMomentum() {
    let px = 0, py = 0, m = 0;
    for (const b of this.bodies) { px += b.mass * b.vx; py += b.mass * b.vy; m += b.mass; }
    for (const b of this.bodies) { b.vx -= px / m; b.vy -= py / m; }
  }

  // every body pulls on every other body, visiting each pair once
  computeAccelerations() {
    const bodies = this.bodies;
    for (const b of bodies) { b.ax = 0; b.ay = 0; }
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const r2 = dx * dx + dy * dy + SOFTENING2;
        const invR3 = 1 / (r2 * Math.sqrt(r2));
        a.ax += G * b.mass * dx * invR3;
        a.ay += G * b.mass * dy * invR3;
        b.ax -= G * a.mass * dx * invR3;
        b.ay -= G * a.mass * dy * invR3;
      }
    }
  }

  // leapfrog (kick-drift-kick): much more stable over long runs than basic Euler
  step() {
    for (const b of this.bodies) {
      b.vx += 0.5 * DT * b.ax;
      b.vy += 0.5 * DT * b.ay;
      b.x += DT * b.vx;
      b.y += DT * b.vy;
    }
    this.handleCollisions();
    this.computeAccelerations();
    for (const b of this.bodies) {
      b.vx += 0.5 * DT * b.ax;
      b.vy += 0.5 * DT * b.ay;
    }
    this.time += DT;
  }

  recordTrails() {
    for (const b of this.bodies) {
      b.trail.push(b.x, b.y);
      if (b.trail.length > TRAIL_LENGTH * 2) b.trail.splice(0, 2);
    }
  }

  // overlapping bodies merge, conserving mass and momentum
  handleCollisions() {
    let merged = false;
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const a = this.bodies[i], b = this.bodies[j];
        if (Math.hypot(b.x - a.x, b.y - a.y) > a.radius + b.radius) continue;
        const [big, small] = a.mass >= b.mass ? [a, b] : [b, a];
        const m = big.mass + small.mass;
        big.x = (big.x * big.mass + small.x * small.mass) / m;
        big.y = (big.y * big.mass + small.y * small.mass) / m;
        big.vx = (big.vx * big.mass + small.vx * small.mass) / m;
        big.vy = (big.vy * big.mass + small.vy * small.mass) / m;
        big.radius = Math.cbrt(big.radius ** 3 + small.radius ** 3);
        big.mass = m;
        this.bodies.splice(this.bodies.indexOf(small), 1);
        merged = true;
        i = -1; // indices shifted, so restart the scan
        break;
      }
    }
    // merging is an inelastic collision: some energy is legitimately lost
    if (merged) this.resetEnergyBaseline();
  }

  launch(x, y, vx, vy) {
    this.bodies.push(makeBody({ x, y, vx, vy, mass: 3, radius: 4, color: color(this.bodies.length), name: 'Your planet' }));
    this.computeAccelerations();
    this.resetEnergyBaseline();
  }

  energy() {
    let kinetic = 0, potential = 0;
    const bodies = this.bodies;
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      kinetic += 0.5 * a.mass * (a.vx * a.vx + a.vy * a.vy);
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        const r = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + SOFTENING2);
        potential -= (G * a.mass * b.mass) / r;
      }
    }
    return kinetic + potential;
  }

  resetEnergyBaseline() {
    this.baselineEnergy = this.energy();
  }

  energyDrift() {
    if (this.baselineEnergy === 0) return 0;
    return Math.abs((this.energy() - this.baselineEnergy) / this.baselineEnergy);
  }

  heaviest() {
    return this.bodies.reduce((a, b) => (b.mass > a.mass ? b : a));
  }
}