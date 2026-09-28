import React, { useCallback, useEffect, useRef } from 'react';
import { BLADE_THEMES, BladeStyle, FRUIT_CONFIGS, FloatingText, FoodHalf, FoodObject, FruitType, GameMode, GameStats, JuiceSplat, Particle, SwipePoint } from './types';
import { renderFoodHalf, renderFruit } from './fruitRenderer';
import { createBombExplosionParticles, createFoodHalves, createJuiceSplat, createSliceJuiceParticles, distToSegment, renderSwipeTrail } from './physics';
import { sounds } from './sound';

interface GameCanvasProps {
  mode: GameMode;
  bladeStyle: BladeStyle;
  isPaused: boolean;
  reviveSignal?: number;
  onStatsUpdate: (stats: Partial<GameStats>) => void;
  onGameOver: (finalStats: GameStats) => void;
  onComboAnnounce: (combo: number, points: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  bladeStyle,
  isPaused,
  reviveSignal,
  onStatsUpdate,
  onGameOver,
  onComboAnnounce,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game internal state kept in refs for smooth 60 FPS requestAnimationFrame loop
  const stateRef = useRef<{
    width: number;
    height: number;
    score: number;
    bestScore: number;
    lives: number;
    maxLives: number;
    combo: number;
    maxCombo: number;
    slicedCount: number;
    missedFoods: number;
    timeLeft: number;
    isGameOver: boolean;
    foods: FoodObject[];
    halves: FoodHalf[];
    particles: Particle[];
    splats: JuiceSplat[];
    floatingTexts: FloatingText[];
    swipePoints: SwipePoint[];
    isSwiping: boolean;
    lastSwipeTime: number;
    comboTimer: number;
    comboSliceCount: number;
    lastSpawnTime: number;
    spawnInterval: number;
    difficultyTimer: number;
    difficultyLevel: number;
    screenShake: number;
    flashAlpha: number;
    missMarkers: { x: number; life: number }[];
  }>({
    width: 390,
    height: 844,
    score: 0,
    bestScore: 0,
    lives: mode === 'timeAttack' ? 1 : 3,
    maxLives: 3,
    combo: 0,
    maxCombo: 0,
    slicedCount: 0,
    missedFoods: 0,
    timeLeft: 60,
    isGameOver: false,
    foods: [],
    halves: [],
    particles: [],
    splats: [],
    floatingTexts: [],
    swipePoints: [],
    isSwiping: false,
    lastSwipeTime: 0,
    comboTimer: 0,
    comboSliceCount: 0,
    lastSpawnTime: 0,
    spawnInterval: 2.2, // seconds
    difficultyTimer: 0,
    difficultyLevel: 1,
    screenShake: 0,
    flashAlpha: 0,
    missMarkers: [],
  });

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`food_slice_best_${mode}`);
    const best = saved ? parseInt(saved, 10) : 0;
    stateRef.current.bestScore = best;
    stateRef.current.lives = mode === 'timeAttack' ? 1 : 3;
    stateRef.current.timeLeft = mode === 'timeAttack' ? 60 : 0;
    onStatsUpdate({
      bestScore: best,
      lives: stateRef.current.lives,
      score: 0,
      combo: 0,
      timeLeft: stateRef.current.timeLeft,
    });
  }, [mode, onStatsUpdate]);

  // Handle Rewarded Ad Revival
  useEffect(() => {
    if (reviveSignal && reviveSignal > 0) {
      const state = stateRef.current;
      state.isGameOver = false;
      state.lives = 1;
      state.foods = []; // clear current screen threats
      state.missMarkers = [];
      state.lastSpawnTime = -0.5; // slight grace period before new wave launches
      state.flashAlpha = 0.6;
      state.floatingTexts.push({
        id: `revive-${Date.now()}`,
        x: state.width / 2,
        y: state.height * 0.45,
        text: 'REVIVED! +1 ❤️',
        color: '#10b981',
        fontSize: 30,
        scale: 1.4,
        alpha: 1,
        vy: -75,
        life: 0,
      });
      onStatsUpdate({
        lives: 1,
        isGameOver: false,
      });
    }
  }, [reviveSignal, onStatsUpdate]);

  // Handle Resize and Canvas DPI setup
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2 for mobile efficiency

    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    stateRef.current.width = w;
    stateRef.current.height = h;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Food Wave Spawner
  const spawnWave = useCallback(() => {
    const state = stateRef.current;
    const { width, height, difficultyLevel } = state;

    // Determine wave count (1 to 4 depending on difficulty)
    let waveCount = 1;
    const r = Math.random();
    if (difficultyLevel > 3 && r > 0.6) waveCount = 3;
    else if (difficultyLevel > 1 && r > 0.4) waveCount = 2;
    else if (difficultyLevel > 5 && r > 0.85) waveCount = 4;

    // Bomb chance
    let bombChance = 0.14 + Math.min(0.2, difficultyLevel * 0.03);
    if (mode === 'timeAttack') bombChance = 0.22;

    const types: FruitType[] = [
      'watermelon',
      'apple',
      'orange',
      'strawberry',
      'banana',
      'kiwi',
      'pineapple',
      'peach',
    ];

    const gravity = 850; // px / s^2

    for (let i = 0; i < waveCount; i++) {
      const isBomb = Math.random() < bombChance && i === 0; // limit to 1 bomb per wave
      const type = isBomb ? 'bomb' : types[Math.floor(Math.random() * types.length)];
      const config = FRUIT_CONFIGS[type];

      // Spawn position along bottom with spacing
      const minX = width * 0.15;
      const maxX = width * 0.85;
      const x = minX + Math.random() * (maxX - minX);
      const y = height + 35 + i * 20;

      // Target apex height (between 25% and 55% from the top)
      const apexY = height * (0.22 + Math.random() * 0.32);
      const launchHeight = y - apexY;
      const vy = -Math.sqrt(2 * gravity * launchHeight);

      // Horizontal velocity towards screen center
      const targetX = width * (0.3 + Math.random() * 0.4);
      const flightTimeToApex = -vy / gravity;
      const totalFlightTime = flightTimeToApex * 1.8;
      const vx = (targetX - x) / flightTimeToApex + (Math.random() - 0.5) * 60;

      const isFast = !isBomb && (type === 'strawberry' || type === 'kiwi' || Math.random() < 0.15);

      state.foods.push({
        id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        x,
        y,
        vx: isFast ? vx * 1.25 : vx,
        vy: isFast ? vy * 1.15 : vy,
        radius: config.radius,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 5,
        isSliced: false,
        isFast,
        points: isFast ? config.points * 2 : config.points,
        juiceColor: config.juiceColor,
        fleshColor: config.fleshColor,
        rindColor: config.rindColor,
        hasMissed: false,
      });
    }
  }, [mode]);

  // Slicing Collision Check on segment P1 -> P2
  const checkSliceCollision = useCallback(
    (p1: SwipePoint, p2: SwipePoint) => {
      const state = stateRef.current;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const swipeDist = Math.hypot(dx, dy);

      // Minimum swipe speed threshold to prevent accidental static finger taps
      if (swipeDist < 8) return;

      const swipeSpeed = swipeDist / Math.max(0.008, (p2.time - p1.time) / 1000);
      const sliceAngle = Math.atan2(dy, dx);

      let slicedThisSegment = 0;

      for (let i = state.foods.length - 1; i >= 0; i--) {
        const food = state.foods[i];
        if (food.isSliced) continue;

        const { dist, closestX, closestY } = distToSegment(
          food.x,
          food.y,
          p1.x,
          p1.y,
          p2.x,
          p2.y
        );

        if (dist <= food.radius) {
          // BOMB DETONATION!
          if (food.type === 'bomb') {
            food.isSliced = true;
            state.screenShake = 35;
            state.flashAlpha = 0.9;
            sounds.playBombExplosion();

            // Spawn violent explosion
            const bombParticles = createBombExplosionParticles(food.x, food.y);
            state.particles.push(...bombParticles);

            // Blast away surrounding foods
            state.foods.forEach((f) => {
              if (!f.isSliced) {
                f.vx += (f.x - food.x) * 4;
                f.vy -= 400;
              }
            });

            // Mode consequences
            if (mode === 'classic') {
              state.lives -= 1;
              sounds.playLifeLost();
              onStatsUpdate({ lives: Math.max(0, state.lives) });
              if (state.lives <= 0) {
                triggerGameOver();
                return;
              }
            } else if (mode === 'timeAttack') {
              // Deduct 10s and 40 points
              state.timeLeft = Math.max(0, state.timeLeft - 10);
              state.score = Math.max(0, state.score - 40);
              state.floatingTexts.push({
                id: `bomb-penalty-${Date.now()}`,
                x: food.x,
                y: food.y,
                text: '-10s  -40',
                color: '#ef4444',
                fontSize: 26,
                scale: 1.3,
                alpha: 1,
                vy: -60,
                life: 0,
              });
              onStatsUpdate({ timeLeft: state.timeLeft, score: state.score });
            } else if (mode === 'endless') {
              state.lives -= 1;
              sounds.playLifeLost();
              onStatsUpdate({ lives: Math.max(0, state.lives) });
              if (state.lives <= 0) {
                triggerGameOver();
                return;
              }
            }

            // Remove bomb
            state.foods.splice(i, 1);
            continue;
          }

          // FRUIT SLICE!
          food.isSliced = true;
          slicedThisSegment++;
          state.slicedCount++;

          // Halves physics
          const [half1, half2] = createFoodHalves(food, sliceAngle, swipeSpeed);
          state.halves.push(half1, half2);

          // Juice Particles & Wall Splat
          const juiceParticles = createSliceJuiceParticles(
            food.x,
            food.y,
            food.juiceColor,
            sliceAngle,
            food.isFast ? 30 : 20
          );
          state.particles.push(...juiceParticles);

          // Background Splat
          if (Math.random() < 0.75) {
            state.splats.push(createJuiceSplat(closestX, closestY, food.juiceColor));
            if (state.splats.length > 20) {
              state.splats.shift(); // maintain performance
            }
          }

          // Audio
          sounds.playSlice(FRUIT_CONFIGS[food.type].pitchMod);

          // Combo tracking
          state.comboSliceCount++;
          state.comboTimer = 0.38; // 380ms window to build combos

          // Base points
          let pts = food.points;
          state.score += pts;

          // Floating score text
          state.floatingTexts.push({
            id: `txt-${Date.now()}-${Math.random()}`,
            x: food.x,
            y: food.y - 10,
            text: `+${pts}`,
            color: food.isFast ? '#fef08a' : '#ffffff',
            fontSize: food.isFast ? 28 : 22,
            scale: 1.2,
            alpha: 1,
            vy: -80,
            life: 0,
          });

          // Screen micro-shake
          state.screenShake = Math.max(state.screenShake, food.isFast ? 10 : 5);

          // Remove food
          state.foods.splice(i, 1);
        }
      }

      // Check if we reached a combo in this stroke
      if (state.comboSliceCount >= 2) {
        state.combo = state.comboSliceCount;
        state.maxCombo = Math.max(state.maxCombo, state.combo);
        const comboBonus = state.combo * 10;
        state.score += comboBonus;

        sounds.playCombo(state.combo);
        onComboAnnounce(state.combo, comboBonus);

        state.floatingTexts.push({
          id: `combo-${Date.now()}`,
          x: p2.x,
          y: p2.y - 45,
          text: `COMBO x${state.combo} +${comboBonus}`,
          color: '#38bdf8',
          fontSize: 28,
          scale: 1.4,
          alpha: 1,
          vy: -110,
          life: 0,
        });

        state.screenShake = Math.max(state.screenShake, 12 + state.combo * 3);
      }

      onStatsUpdate({
        score: state.score,
        combo: state.combo,
        maxCombo: state.maxCombo,
        slicedCount: state.slicedCount,
      });
    },
    [mode, onStatsUpdate, onComboAnnounce]
  );

  // Trigger Game Over Flow
  const triggerGameOver = useCallback(() => {
    const state = stateRef.current;
    if (state.isGameOver) return;
    state.isGameOver = true;

    // Check high score
    const isNewHigh = state.score > state.bestScore;
    if (isNewHigh) {
      state.bestScore = state.score;
      localStorage.setItem(`food_slice_best_${mode}`, state.score.toString());
      sounds.playNewHighScore();
    } else {
      sounds.playGameOver();
    }

    const finalStats: GameStats = {
      score: state.score,
      bestScore: state.bestScore,
      lives: state.lives,
      maxLives: state.maxLives,
      combo: state.combo,
      maxCombo: state.maxCombo,
      slicedCount: state.slicedCount,
      mode,
      timeLeft: state.timeLeft,
      isGameOver: true,
      isPaused: false,
      isNewHighScore: isNewHigh,
      missedFoods: state.missedFoods,
    };

    onGameOver(finalStats);
  }, [mode, onGameOver]);

  // Pointer event handlers (Touch & Mouse unified)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    const pt: SwipePoint = { x, y, time: now };
    stateRef.current.swipePoints = [pt];
    stateRef.current.isSwiping = true;
    stateRef.current.lastSwipeTime = now;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isSwiping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    const points = stateRef.current.swipePoints;
    const lastPt = points[points.length - 1];

    const currentPt: SwipePoint = { x, y, time: now };
    points.push(currentPt);

    // Limit array size to prevent memory waste
    if (points.length > 25) {
      points.splice(0, points.length - 25);
    }

    if (lastPt) {
      checkSliceCollision(lastPt, currentPt);
    }

    stateRef.current.lastSwipeTime = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    stateRef.current.isSwiping = false;
  };

  // Main Game Loop using requestAnimationFrame
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = stateRef.current;
      const { width, height } = state;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // If paused or game over, keep rendering but freeze simulation
      if (!isPaused && !state.isGameOver) {
        // Difficulty progression
        state.difficultyTimer += dt;
        if (state.difficultyTimer >= 10) {
          state.difficultyTimer = 0;
          state.difficultyLevel = Math.min(10, state.difficultyLevel + 1);
          state.spawnInterval = Math.max(1.1, 2.2 - state.difficultyLevel * 0.12);
        }

        // Time Attack countdown
        if (mode === 'timeAttack') {
          state.timeLeft -= dt;
          if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            triggerGameOver();
          }
          onStatsUpdate({ timeLeft: Math.ceil(state.timeLeft) });
        }

        // Spawning timer
        state.lastSpawnTime += dt;
        if (state.lastSpawnTime >= state.spawnInterval) {
          state.lastSpawnTime = 0;
          spawnWave();
        }

        // Combo decay timer
        if (state.comboTimer > 0) {
          state.comboTimer -= dt;
          if (state.comboTimer <= 0) {
            state.comboSliceCount = 0;
            state.combo = 0;
            onStatsUpdate({ combo: 0 });
          }
        }

        // Screen Shake decay
        if (state.screenShake > 0) {
          state.screenShake = Math.max(0, state.screenShake - dt * 45);
        }

        // White Flash decay
        if (state.flashAlpha > 0) {
          state.flashAlpha = Math.max(0, state.flashAlpha - dt * 2.5);
        }

        // Physics Updates
        const gravity = 850;

        // 1. Food Objects
        for (let i = state.foods.length - 1; i >= 0; i--) {
          const f = state.foods[i];
          f.vy += gravity * dt;
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.rotation += f.rotSpeed * dt;

          // Check if food falls below bottom without being sliced
          if (f.y > height + 50 && f.vy > 0) {
            if (mode === 'classic' && f.type !== 'bomb' && !f.hasMissed) {
              f.hasMissed = true;
              state.lives -= 1;
              state.missedFoods += 1;
              sounds.playLifeLost();

              // Add visual miss marker at bottom
              state.missMarkers.push({ x: Math.max(20, Math.min(width - 20, f.x)), life: 1.2 });

              onStatsUpdate({ lives: Math.max(0, state.lives) });
              if (state.lives <= 0) {
                triggerGameOver();
              }
            }
            state.foods.splice(i, 1);
          }
        }

        // 2. Food Halves
        for (let i = state.halves.length - 1; i >= 0; i--) {
          const h = state.halves[i];
          h.vy += (gravity + 150) * dt;
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          h.rotation += h.rotSpeed * dt;
          h.life += dt;

          if (h.y > height + 80 || h.life > h.maxLife) {
            state.halves.splice(i, 1);
          }
        }

        // 3. Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.life += dt;
          p.vy += (p.gravity ?? 700) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life >= p.maxLife) {
            state.particles.splice(i, 1);
          }
        }

        // 4. Background Splats fade
        for (let i = state.splats.length - 1; i >= 0; i--) {
          const s = state.splats[i];
          s.life += dt;
          if (s.life > 4) {
            s.alpha = Math.max(0, 0.55 * (1 - (s.life - 4) / (s.maxLife - 4)));
          }
          if (s.life >= s.maxLife) {
            state.splats.splice(i, 1);
          }
        }

        // 5. Floating texts
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const t = state.floatingTexts[i];
          t.life += dt;
          t.y += t.vy * dt;
          t.alpha = Math.max(0, 1 - t.life / 0.85);
          t.scale = 1.0 + Math.sin((t.life / 0.85) * Math.PI) * 0.3;

          if (t.life >= 0.85) {
            state.floatingTexts.splice(i, 1);
          }
        }

        // 6. Miss Markers
        for (let i = state.missMarkers.length - 1; i >= 0; i--) {
          state.missMarkers[i].life -= dt;
          if (state.missMarkers[i].life <= 0) {
            state.missMarkers.splice(i, 1);
          }
        }
      }

      // RENDER PASS
      ctx.save();
      ctx.scale(dpr, dpr);

      // Apply Screen Shake
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Draw Dojo Wood Background
      drawDojoBackground(ctx, width, height);

      // Draw Wall Splats
      drawSplats(ctx, state.splats);

      // Draw Halves
      state.halves.forEach((half) => renderFoodHalf(ctx, half));

      // Draw Whole Foods & Bombs
      state.foods.forEach((food) => renderFruit(ctx, food, currentTime));

      // Draw Particles
      drawParticles(ctx, state.particles);

      // Draw Swipe Blade Trail
      const theme = BLADE_THEMES[bladeStyle] || BLADE_THEMES.katana;
      renderSwipeTrail(ctx, state.swipePoints, theme, currentTime);

      // Draw Floating Scores & Combo Banners
      drawFloatingTexts(ctx, state.floatingTexts);

      // Draw Miss "X" Markers at the bottom
      drawMissMarkers(ctx, state.missMarkers, height);

      // Draw Explosion Flash overlay
      if (state.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, mode, bladeStyle, spawnWave, triggerGameOver, onStatsUpdate]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 w-full h-full touch-none select-none cursor-crosshair z-0"
    />
  );
};

/**
 * Draws high-contrast Japanese Dojo wood plank wall with subtle vignette
 */
function drawDojoBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Rich dark mahogany wood gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#1c1917'); // stone-900
  bgGrad.addColorStop(0.5, '#292524'); // stone-800
  bgGrad.addColorStop(1, '#0c0a09'); // stone-950
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Vertical wood grain planks
  const plankW = w / 6;
  ctx.strokeStyle = 'rgba(12, 10, 9, 0.6)';
  ctx.lineWidth = 2.5;

  for (let x = plankW; x < w; x += plankW) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();

    // Wood seam highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, 0);
    ctx.lineTo(x + 1, h);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(12, 10, 9, 0.6)';
    ctx.lineWidth = 2.5;
  }

  // Radial lighting vignette
  const vignette = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.2, w / 2, h * 0.45, w * 0.85);
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
  vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw background juice splats
 */
function drawSplats(ctx: CanvasRenderingContext2D, splats: JuiceSplat[]) {
  splats.forEach((s) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = s.color;

    // Central irregular blob
    ctx.beginPath();
    ctx.ellipse(0, 0, s.radius, s.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Satellites
    s.drops.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.dx, d.dy, d.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  });
}

/**
 * Draw flying particles (juice, sparks, smoke, stars)
 */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;

    if (p.type === 'juice') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'spark') {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'smoke') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'star') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

/**
 * Draw floating score and combo animations
 */
function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  texts.forEach((t) => {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.scale, t.scale);
    ctx.globalAlpha = t.alpha;

    ctx.font = `bold ${t.fontSize}px 'Fredoka', 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black stroke outline for punchy comic readability
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(t.text, 0, 0);

    ctx.fillStyle = t.color;
    ctx.fillText(t.text, 0, 0);

    ctx.restore();
  });
}

/**
 * Draw animated red "X" miss strikes where unsliced food was lost
 */
function drawMissMarkers(
  ctx: CanvasRenderingContext2D,
  markers: { x: number; life: number }[],
  h: number
) {
  markers.forEach((m) => {
    ctx.save();
    const alpha = Math.min(1, m.life);
    ctx.globalAlpha = alpha;
    ctx.translate(m.x, h - 35);

    const size = 18;
    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-size, -size);
    ctx.lineTo(size, size);
    ctx.moveTo(size, -size);
    ctx.lineTo(-size, size);
    ctx.stroke();

    ctx.restore();
  });
}
