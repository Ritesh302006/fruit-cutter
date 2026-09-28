import { BladeTheme, FloatingText, FoodHalf, FoodObject, JuiceSplat, Particle, SwipePoint } from './types';

/**
 * Calculates distance from point C to line segment P1-P2
 */
export function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { dist: number; closestX: number; closestY: number } {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) {
    const dist = Math.hypot(px - x1, py - y1);
    return { dist, closestX: x1, closestY: y1 };
  }
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * (x2 - x1);
  const closestY = y1 + t * (y2 - y1);
  const dist = Math.hypot(px - closestX, py - closestY);
  return { dist, closestX, closestY };
}

/**
 * Creates 2 split halves of a sliced food item
 */
export function createFoodHalves(
  food: FoodObject,
  sliceAngle: number,
  swipeSpeed: number
): [FoodHalf, FoodHalf] {
  const normalAngle = sliceAngle + Math.PI / 2;
  const separationSpeed = 160 + Math.min(300, swipeSpeed * 0.4);

  // Normal unit vectors
  const nx = Math.cos(normalAngle);
  const ny = Math.sin(normalAngle);

  // Forward velocity component in swipe direction
  const fx = Math.cos(sliceAngle) * Math.min(150, swipeSpeed * 0.15);
  const fy = Math.sin(sliceAngle) * Math.min(150, swipeSpeed * 0.15);

  const half1: FoodHalf = {
    id: `${food.id}-h1`,
    type: food.type,
    x: food.x - nx * 8,
    y: food.y - ny * 8,
    vx: food.vx * 0.4 - nx * separationSpeed + fx,
    vy: food.vy * 0.4 - ny * separationSpeed + fy,
    radius: food.radius,
    rotation: sliceAngle,
    rotSpeed: -(3 + Math.random() * 5),
    sliceAngle,
    halfSide: 1,
    juiceColor: food.juiceColor,
    fleshColor: food.fleshColor,
    rindColor: food.rindColor,
    life: 0,
    maxLife: 3.5, // seconds before cleaning up below screen
  };

  const half2: FoodHalf = {
    id: `${food.id}-h2`,
    type: food.type,
    x: food.x + nx * 8,
    y: food.y + ny * 8,
    vx: food.vx * 0.4 + nx * separationSpeed + fx,
    vy: food.vy * 0.4 + ny * separationSpeed + fy,
    radius: food.radius,
    rotation: sliceAngle,
    rotSpeed: 3 + Math.random() * 5,
    sliceAngle,
    halfSide: -1,
    juiceColor: food.juiceColor,
    fleshColor: food.fleshColor,
    rindColor: food.rindColor,
    life: 0,
    maxLife: 3.5,
  };

  return [half1, half2];
}

/**
 * Creates juicy burst particles when a fruit is sliced
 */
export function createSliceJuiceParticles(
  x: number,
  y: number,
  color: string,
  sliceAngle: number,
  count: number = 22
): Particle[] {
  const particles: Particle[] = [];
  const normalAngle = sliceAngle + Math.PI / 2;

  for (let i = 0; i < count; i++) {
    // Bias towards normal direction and slice direction
    const side = Math.random() > 0.5 ? 1 : -1;
    const spread = (Math.random() - 0.5) * 1.2;
    const angle = normalAngle * side + spread;
    const speed = 150 + Math.random() * 380;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 6.5,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.5,
      type: 'juice',
      gravity: 850,
    });
  }

  // Add a few bright stars / sparkles
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 200;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color: '#ffffff',
      alpha: 1,
      life: 0,
      maxLife: 0.35 + Math.random() * 0.25,
      type: 'star',
      gravity: 200,
    });
  }

  return particles;
}

/**
 * Creates violent explosion particles and smoke when a bomb detonates
 */
export function createBombExplosionParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];

  // Fire & plasma burst
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 180 + Math.random() * 600;
    const colors = ['#ffffff', '#fef08a', '#f97316', '#ef4444', '#7f1d1d'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4 + Math.random() * 12,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.5 + Math.random() * 0.6,
      type: 'spark',
      gravity: 300,
    });
  }

  // Black / dark smoke puffs
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 220;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60, // rises
      radius: 12 + Math.random() * 28,
      color: '#18181b',
      alpha: 0.8,
      life: 0,
      maxLife: 0.8 + Math.random() * 0.8,
      type: 'smoke',
      gravity: -100, // rise up
    });
  }

  return particles;
}

/**
 * Creates an attractive background juice splat that sticks to the wall
 */
export function createJuiceSplat(x: number, y: number, color: string): JuiceSplat {
  const mainR = 24 + Math.random() * 20;
  const dropsCount = 4 + Math.floor(Math.random() * 5);
  const drops: { dx: number; dy: number; r: number }[] = [];

  for (let i = 0; i < dropsCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = mainR * (0.8 + Math.random() * 1.2);
    drops.push({
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist,
      r: 3 + Math.random() * 8,
    });
  }

  return {
    x,
    y,
    radius: mainR,
    color,
    alpha: 0.55,
    rotation: Math.random() * Math.PI * 2,
    drops,
    life: 0,
    maxLife: 8.0, // fades slowly over 8s
  };
}

/**
 * Renders the glowing swipe blade trail
 */
export function renderSwipeTrail(
  ctx: CanvasRenderingContext2D,
  points: SwipePoint[],
  theme: BladeTheme,
  now: number
) {
  if (points.length < 2) return;

  // Filter recent points within 150ms
  const activePoints = points.filter((p) => now - p.time <= 160);
  if (activePoints.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Broad outer glow
  ctx.shadowColor = theme.glowColor;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = theme.glowColor;

  for (let i = 0; i < activePoints.length - 1; i++) {
    const p1 = activePoints[i];
    const p2 = activePoints[i + 1];
    const age = (now - p2.time) / 160;
    const progress = (i + 1) / activePoints.length;
    const alpha = Math.max(0, (1 - age) * progress);
    const width = (3 + 9 * progress) * (1 - age * 0.4);

    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 2. Razor-sharp white/core center
  ctx.shadowBlur = 0;
  ctx.strokeStyle = theme.coreColor;

  for (let i = 0; i < activePoints.length - 1; i++) {
    const p1 = activePoints[i];
    const p2 = activePoints[i + 1];
    const age = (now - p2.time) / 160;
    const progress = (i + 1) / activePoints.length;
    const alpha = Math.max(0, (1 - age) * progress);
    const coreWidth = (1.5 + 4 * progress) * (1 - age * 0.5);

    ctx.globalAlpha = alpha;
    ctx.lineWidth = coreWidth;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 3. Sparkle tip at current finger position
  const tip = activePoints[activePoints.length - 1];
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.coreColor;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
