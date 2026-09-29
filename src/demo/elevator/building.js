export const FLOORS = 20;
export const CARS = 6;
export const STEPS_PER_FLOOR = 20; // cars move one step per tick, so 20 ticks per floor
const DWELL_TICKS = 40;            // how long doors stay open
export const TICKS_PER_SECOND = 60;

// small seeded random number generator: the same seed gives the same riders every run
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Car {
  constructor(id, homeFloor) {
    this.id = id;
    this.homeFloor = homeFloor;
    this.units = homeFloor * STEPS_PER_FLOOR;
    this.direction = 0; // 1 up, -1 down, 0 stopped
    this.stops = new Set();
    this.doorTimer = 0;
    this.riders = [];
  }

  get position() { return this.units / STEPS_PER_FLOOR; }
  get atFloor() { return this.units % STEPS_PER_FLOOR === 0; }
  get floor() { return Math.round(this.position); }
  get doorsOpen() { return this.doorTimer > 0; }
  get idle() { return this.stops.size === 0 && this.riders.length === 0; }

  request(floor) {
    if (this.doorsOpen && this.floor === floor) return; // already open here
    this.stops.add(floor);
  }

  step() {
    if (this.doorTimer > 0) {
      this.doorTimer--;
      return;
    }
    if (this.atFloor && this.stops.has(this.floor)) {
      this.stops.delete(this.floor);
      this.doorTimer = DWELL_TICKS;
      return;
    }
    this.direction = this.chooseDirection();
    this.units += this.direction;
  }

  // keep going the same way while there are stops ahead, then turn around
  chooseDirection() {
    const pos = this.position;
    if (this.stops.size === 0) return Math.sign(this.homeFloor - pos); // head home when idle
    let above = false, below = false;
    for (const s of this.stops) {
      if (s > pos) above = true;
      else if (s < pos) below = true;
    }
    if (this.direction === 1 && above) return 1;
    if (this.direction === -1 && below) return -1;
    return above ? 1 : below ? -1 : 0;
  }
}

const DISPATCHERS = {
  // baseline: send whichever car is physically closest, ignoring where it's headed
  nearest: (cars, rider) =>
    cars.reduce((best, car) =>
      Math.abs(car.position - rider.origin) < Math.abs(best.position - rider.origin) ? car : best),

  // your cost-based dispatcher: distance plus queue length, preferring idle cars
  // or cars already heading the rider's way that haven't passed their floor
  cost: (cars, rider) => {
    let best = null, bestCost = Infinity;
    let fallback = null, fallbackCost = Infinity;
    for (const car of cars) {
      const cost = Math.abs(car.position - rider.origin) + car.stops.size;
      const ahead = rider.direction === 1 ? car.position <= rider.origin : car.position >= rider.origin;
      const eligible = car.idle || (car.direction === rider.direction && ahead);
      if (eligible) {
        if (cost < bestCost) { best = car; bestCost = cost; }
      } else if (cost < fallbackCost) {
        fallback = car;
        fallbackCost = cost;
      }
    }
    return best ?? fallback;
  },
};

export const ALGORITHMS = { nearest: 'Nearest car', cost: 'Cost-based' };

export class Building {
  constructor({ algorithm = 'cost', seed = 1 } = {}) {
    this.algorithm = algorithm;
    this.random = mulberry32(seed);
    this.tick = 0;
    // alternate parking at the lobby and the middle floor, like your Java version
    this.cars = Array.from({ length: CARS }, (_, i) =>
      new Car(i, i % 2 === 0 ? 0 : Math.floor(FLOORS / 2)));
    this.waiting = [];
    this.stats = { completed: 0, totalWait: 0, longestWait: 0, totalTrip: 0 };
  }

  step(spawnRate) {
    this.tick++;
    if (this.random() < spawnRate) this.spawn();
    for (const car of this.cars) {
      car.step();
      if (car.doorsOpen) this.exchange(car);
    }
  }

  spawn() {
    const origin = Math.floor(this.random() * FLOORS);
    let dest = Math.floor(this.random() * (FLOORS - 1));
    if (dest >= origin) dest++; // guarantees dest !== origin without a retry loop
    const rider = { origin, dest, direction: Math.sign(dest - origin), createdAt: this.tick, car: null };
    rider.car = DISPATCHERS[this.algorithm](this.cars, rider);
    rider.car.request(origin);
    this.waiting.push(rider);
  }

  // while doors are open: riders get off, then assigned riders on this floor get on
  exchange(car) {
    const floor = car.floor;
    car.riders = car.riders.filter((r) => {
      if (r.dest !== floor) return true;
      const wait = r.boardedAt - r.createdAt;
      this.stats.completed++;
      this.stats.totalWait += wait;
      this.stats.longestWait = Math.max(this.stats.longestWait, wait);
      this.stats.totalTrip += this.tick - r.createdAt;
      return false;
    });
    this.waiting = this.waiting.filter((r) => {
      if (r.car !== car || r.origin !== floor) return true;
      r.boardedAt = this.tick;
      car.riders.push(r);
      car.request(r.dest);
      return false;
    });
  }
}