import { FoodHalf, FoodObject, FruitType } from './types';

/**
 * Procedural Vector Canvas Renderer for Food Slice
 * Renders high-fidelity commercial arcade fruits, bombs, and sliced halves with juicy interiors.
 */

export function renderFruit(ctx: CanvasRenderingContext2D, food: FoodObject, now: number) {
  ctx.save();
  ctx.translate(food.x, food.y);
  ctx.rotate(food.rotation);

  switch (food.type) {
    case 'watermelon':
      drawWatermelon(ctx, food.radius);
      break;
    case 'apple':
      drawApple(ctx, food.radius);
      break;
    case 'orange':
      drawOrange(ctx, food.radius);
      break;
    case 'strawberry':
      drawStrawberry(ctx, food.radius);
      break;
    case 'banana':
      drawBanana(ctx, food.radius);
      break;
    case 'kiwi':
      drawKiwi(ctx, food.radius);
      break;
    case 'pineapple':
      drawPineapple(ctx, food.radius);
      break;
    case 'peach':
      drawPeach(ctx, food.radius);
      break;
    case 'bomb':
      drawBomb(ctx, food.radius, now);
      break;
  }

  // Fast fruit golden shimmer indicator
  if (food.isFast && food.type !== 'bomb') {
    ctx.save();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = (now / 30) % 12;
    ctx.beginPath();
    ctx.arc(0, 0, food.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Render a sliced food half flying apart
 */
export function renderFoodHalf(ctx: CanvasRenderingContext2D, half: FoodHalf) {
  ctx.save();
  ctx.translate(half.x, half.y);
  ctx.rotate(half.rotation);

  const r = half.radius;

  // Clip to half-plane along cut line
  ctx.save();
  ctx.beginPath();
  // Cut line goes along X axis (from -r*1.5 to +r*1.5)
  // Half side: 1 means y <= 0 (top half), -1 means y >= 0 (bottom half)
  if (half.halfSide === 1) {
    ctx.rect(-r * 1.6, -r * 1.6, r * 3.2, r * 1.6);
  } else {
    ctx.rect(-r * 1.6, 0, r * 3.2, r * 1.6);
  }
  ctx.clip();

  // Draw outer fruit body
  switch (half.type) {
    case 'watermelon':
      drawWatermelon(ctx, r);
      break;
    case 'apple':
      drawApple(ctx, r);
      break;
    case 'orange':
      drawOrange(ctx, r);
      break;
    case 'strawberry':
      drawStrawberry(ctx, r);
      break;
    case 'banana':
      drawBanana(ctx, r);
      break;
    case 'kiwi':
      drawKiwi(ctx, r);
      break;
    case 'pineapple':
      drawPineapple(ctx, r);
      break;
    case 'peach':
      drawPeach(ctx, r);
      break;
  }
  ctx.restore();

  // Now draw the exposed juicy cut face along y = 0
  drawCutFace(ctx, half.type, r, half.halfSide);

  ctx.restore();
}

/**
 * Draw exposed interior face of the sliced fruit
 */
function drawCutFace(ctx: CanvasRenderingContext2D, type: FruitType, r: number, side: 1 | -1) {
  ctx.save();
  const faceHeight = Math.min(10, r * 0.22);
  const yOffset = side === 1 ? -faceHeight * 0.5 : faceHeight * 0.5;

  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.95, faceHeight, 0, 0, Math.PI * 2);

  switch (type) {
    case 'watermelon': {
      // Rind border
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      // White pith
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.88, faceHeight * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      // Red juicy flesh
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.80, faceHeight * 0.75, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e11d48';
      ctx.fill();
      // Cut seeds
      ctx.fillStyle = '#18181b';
      [-r * 0.5, -r * 0.2, r * 0.2, r * 0.5].forEach((sx) => {
        ctx.beginPath();
        ctx.ellipse(sx, yOffset * 0.3, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'apple': {
      // Skin rim
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      // Creamy flesh
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, faceHeight * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fef9c3';
      ctx.fill();
      // Core pip
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'orange': {
      // Orange peel
      ctx.fillStyle = '#ea580c';
      ctx.fill();
      // Pith
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, faceHeight * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffedd5';
      ctx.fill();
      // Segments
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.82, faceHeight * 0.75, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      break;
    }
    case 'strawberry': {
      ctx.fillStyle = '#e11d48';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.65, faceHeight * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fecdd3';
      ctx.fill();
      break;
    }
    case 'banana': {
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.86, faceHeight * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fef9c3';
      ctx.fill();
      // Banana 3-point center
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'kiwi': {
      // Fuzzy brown peel
      ctx.fillStyle = '#78350f';
      ctx.fill();
      // Electric green flesh
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, faceHeight * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#84cc16';
      ctx.fill();
      // Pale center
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.35, faceHeight * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ecfccb';
      ctx.fill();
      // Black seeds
      ctx.fillStyle = '#18181b';
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const sx = Math.cos(ang) * (r * 0.5);
        const sy = Math.sin(ang) * (faceHeight * 0.6);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'pineapple': {
      ctx.fillStyle = '#ca8a04';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, faceHeight * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.3, faceHeight * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      break;
    }
    case 'peach': {
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.88, faceHeight * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
      // Pit hollow
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.32, faceHeight * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  // Juicy sheen reflection line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.6, yOffset * 0.2);
  ctx.lineTo(r * 0.6, yOffset * 0.2);
  ctx.stroke();

  ctx.restore();
}

/**
 * 🍉 WATERMELON
 */
function drawWatermelon(ctx: CanvasRenderingContext2D, r: number) {
  // Base green rind
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#22c55e');
  grad.addColorStop(0.8, '#15803d');
  grad.addColorStop(1, '#14532d');

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Dark green wavy stripes
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  for (let a = -r * 0.8; a <= r * 0.8; a += r * 0.45) {
    ctx.beginPath();
    ctx.moveTo(a, -r * 1.1);
    ctx.bezierCurveTo(a + 12, -r * 0.3, a - 12, r * 0.3, a + 6, r * 1.1);
    ctx.stroke();
  }
  ctx.restore();

  // Glossy highlight arc
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.5, Math.PI * 1.1, Math.PI * 1.6);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = r * 0.12;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Tiny stem
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(-2.5, -r - 5, 5, 8, [2, 2, 0, 0]);
  ctx.fill();
}

/**
 * 🍎 APPLE
 */
function drawApple(ctx: CanvasRenderingContext2D, r: number) {
  // Stem & leaf first (behind body)
  ctx.save();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.85);
  ctx.quadraticCurveTo(4, -r * 1.3, 8, -r * 1.35);
  ctx.stroke();

  // Green leaf
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(8, -r * 1.25, 8, 4, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Apple silhouette with dimpled top and bottom
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#f87171');
  grad.addColorStop(0.65, '#dc2626');
  grad.addColorStop(1, '#991b1b');

  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.bezierCurveTo(r * 0.55, -r * 1.05, r * 1.15, -r * 0.2, r * 0.95, r * 0.5);
  ctx.bezierCurveTo(r * 0.8, r * 1.05, r * 0.3, r * 1.02, 0, r * 0.85);
  ctx.bezierCurveTo(-r * 0.3, r * 1.02, -r * 0.8, r * 1.05, -r * 0.95, r * 0.5);
  ctx.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.55, -r * 1.05, 0, -r * 0.7);
  ctx.fillStyle = grad;
  ctx.fill();

  // Apple shine
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, -r * 0.35, r * 0.28, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
}

/**
 * 🍊 ORANGE
 */
function drawOrange(ctx: CanvasRenderingContext2D, r: number) {
  // Orange sphere
  const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fed7aa');
  grad.addColorStop(0.5, '#fb923c');
  grad.addColorStop(0.9, '#ea580c');
  grad.addColorStop(1, '#c2410c');

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Dimple texture
  ctx.fillStyle = 'rgba(194, 65, 12, 0.18)';
  for (let i = 0; i < 14; i++) {
    const ang = i * 1.45;
    const dist = (i % 3 + 1) * (r * 0.26);
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Green calyx button
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(0, -r * 0.85, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Gloss
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.45, Math.PI * 1.1, Math.PI * 1.6);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = r * 0.1;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/**
 * 🍓 STRAWBERRY
 */
function drawStrawberry(ctx: CanvasRenderingContext2D, r: number) {
  // Berry silhouette
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fb7185');
  grad.addColorStop(0.7, '#e11d48');
  grad.addColorStop(1, '#9f1239');

  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.bezierCurveTo(r * 0.9, -r * 0.75, r * 1.05, r * 0.1, 0, r * 1.1);
  ctx.bezierCurveTo(-r * 1.05, r * 0.1, -r * 0.9, -r * 0.75, 0, -r * 0.7);
  ctx.fillStyle = grad;
  ctx.fill();

  // Little yellow seeds (achenes)
  ctx.fillStyle = '#fef08a';
  const seedOffsets = [
    [-0.4, -0.4], [0, -0.45], [0.4, -0.4],
    [-0.55, -0.1], [-0.2, -0.15], [0.2, -0.15], [0.55, -0.1],
    [-0.35, 0.2], [0, 0.15], [0.35, 0.2],
    [-0.15, 0.5], [0.15, 0.5],
    [0, 0.8]
  ];
  seedOffsets.forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.ellipse(ox * r, oy * r, 2, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Green crown leaves
  ctx.fillStyle = '#16a34a';
  for (let i = -2; i <= 2; i++) {
    const ang = (i * Math.PI) / 8;
    ctx.beginPath();
    ctx.ellipse(Math.sin(ang) * (r * 0.4), -r * 0.75 + Math.cos(ang) * -4, 6, 12, ang, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 🍌 BANANA
 */
function drawBanana(ctx: CanvasRenderingContext2D, r: number) {
  // Curved crescent banana
  ctx.save();
  ctx.rotate(-Math.PI / 10);

  const grad = ctx.createLinearGradient(-r * 0.8, -r * 0.6, r * 0.8, r * 0.6);
  grad.addColorStop(0, '#a3e635');
  grad.addColorStop(0.2, '#fde047');
  grad.addColorStop(0.8, '#eab308');
  grad.addColorStop(1, '#ca8a04');

  ctx.beginPath();
  ctx.moveTo(-r * 0.9, -r * 0.7);
  ctx.bezierCurveTo(-r * 0.2, -r * 0.9, r * 0.6, -r * 0.4, r * 0.95, r * 0.65);
  ctx.bezierCurveTo(r * 0.75, r * 0.75, r * 0.1, r * 0.1, -r * 0.85, -r * 0.5);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Ridge highlight
  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, -r * 0.6);
  ctx.bezierCurveTo(-r * 0.1, -r * 0.7, r * 0.45, -r * 0.3, r * 0.85, r * 0.5);
  ctx.stroke();

  // Dark tips
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(-r * 0.9, -r * 0.7, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.95, r * 0.65, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 🥝 KIWI
 */
function drawKiwi(ctx: CanvasRenderingContext2D, r: number) {
  // Fuzzy brown kiwi egg
  const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#92400e');
  grad.addColorStop(0.7, '#78350f');
  grad.addColorStop(1, '#451a03');

  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.9, r * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Fuzzy fuzzies along border
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const x = Math.cos(ang) * (r * 0.9);
    const y = Math.sin(ang) * (r * 1.05);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * 4, y + Math.sin(ang) * 4);
    ctx.stroke();
  }

  // Specular sheen
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.3, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
}

/**
 * 🍍 PINEAPPLE
 */
function drawPineapple(ctx: CanvasRenderingContext2D, r: number) {
  // Spiky green crown foliage at top
  ctx.fillStyle = '#15803d';
  const leafAngles = [-0.6, -0.3, 0, 0.3, 0.6];
  leafAngles.forEach((ang) => {
    ctx.save();
    ctx.translate(0, -r * 0.7);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, 6, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Body barrel
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fde047');
  grad.addColorStop(0.5, '#eab308');
  grad.addColorStop(0.85, '#ca8a04');
  grad.addColorStop(1, '#854d0e');

  ctx.beginPath();
  ctx.ellipse(0, r * 0.1, r * 0.85, r * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Diamond criss-cross pattern
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 2.5;

  for (let k = -r * 1.5; k <= r * 1.5; k += r * 0.4) {
    ctx.beginPath();
    ctx.moveTo(k - r, -r + k);
    ctx.lineTo(k + r, r + k);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(k + r, -r + k);
    ctx.lineTo(k - r, r + k);
    ctx.stroke();
  }

  // Small diamond center pips
  ctx.fillStyle = '#ca8a04';
  for (let dy = -r * 0.7; dy <= r * 0.8; dy += r * 0.38) {
    for (let dx = -r * 0.6; dx <= r * 0.6; dx += r * 0.38) {
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * 🍑 PEACH
 */
function drawPeach(ctx: CanvasRenderingContext2D, r: number) {
  // Peach gradient
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.45, '#fba5a5');
  grad.addColorStop(0.85, '#f43f5e');
  grad.addColorStop(1, '#be123c');

  // Heart-like rounded peach
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.75);
  ctx.bezierCurveTo(r * 0.7, -r * 0.95, r * 1.15, 0, r * 0.75, r * 0.85);
  ctx.bezierCurveTo(r * 0.4, r * 1.08, 0, r * 0.9, 0, r * 0.88);
  ctx.bezierCurveTo(0, r * 0.9, -r * 0.4, r * 1.08, -r * 0.75, r * 0.85);
  ctx.bezierCurveTo(-r * 1.15, 0, -r * 0.7, -r * 0.95, 0, -r * 0.75);
  ctx.fillStyle = grad;
  ctx.fill();

  // Cleft line
  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.quadraticCurveTo(r * 0.12, 0, 0, r * 0.85);
  ctx.stroke();

  // Stem & tiny green leaf
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2, -r * 0.95, 4, 8);
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(6, -r * 0.9, 7, 3.5, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 💣 BOMB
 */
function drawBomb(ctx: CanvasRenderingContext2D, r: number, now: number) {
  // Fuse cap
  ctx.fillStyle = '#71717a';
  ctx.fillRect(-6, -r - 5, 12, 7);

  // Twisted burning fuse cord
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, -r - 5);
  ctx.bezierCurveTo(10, -r - 14, 18, -r - 8, 22, -r - 20);
  ctx.stroke();

  // Sparking animated flame at fuse tip
  const sparkX = 22;
  const sparkY = -r - 20;

  // Outer orange glow
  const flicker = 0.8 + 0.3 * Math.sin(now / 50);
  const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, 14 * flicker);
  sparkGrad.addColorStop(0, '#ffffff');
  sparkGrad.addColorStop(0.3, '#fef08a');
  sparkGrad.addColorStop(0.6, '#f97316');
  sparkGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

  ctx.fillStyle = sparkGrad;
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, 14 * flicker, 0, Math.PI * 2);
  ctx.fill();

  // Little star sparks
  for (let s = 0; s < 4; s++) {
    const sAng = (now / 70) + (s * Math.PI) / 2;
    const sDist = 8 + 6 * Math.sin(now / 40 + s);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sparkX + Math.cos(sAng) * sDist, sparkY + Math.sin(sAng) * sDist, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cast iron sphere
  const sphereGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.05, 0, 0, r);
  sphereGrad.addColorStop(0, '#52525b');
  sphereGrad.addColorStop(0.4, '#27272a');
  sphereGrad.addColorStop(0.85, '#18181b');
  sphereGrad.addColorStop(1, '#09090b');

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = sphereGrad;
  ctx.fill();

  // Metallic rim outline
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Skull or Hazard mark on the bomb
  ctx.save();
  ctx.fillStyle = '#ef4444';
  // Red skull shape
  ctx.beginPath();
  ctx.arc(0, -2, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-r * 0.18, r * 0.1, r * 0.36, r * 0.18);
  // Skull eye holes
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(-r * 0.12, -2, 3, 0, Math.PI * 2);
  ctx.arc(r * 0.12, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Specular glossy highlight
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.32, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
}
