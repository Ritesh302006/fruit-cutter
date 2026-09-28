export type FruitType =
  | 'watermelon'
  | 'apple'
  | 'orange'
  | 'strawberry'
  | 'banana'
  | 'kiwi'
  | 'pineapple'
  | 'peach'
  | 'bomb';

export type GameMode = 'classic' | 'timeAttack' | 'endless';

export type BladeStyle = 'katana' | 'flame' | 'neon' | 'rainbow';

export interface BladeTheme {
  id: BladeStyle;
  name: string;
  glowColor: string;
  coreColor: string;
  sparkColor: string;
  description: string;
}

export interface FoodObject {
  id: string;
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  isSliced: boolean;
  isFast: boolean;
  points: number;
  juiceColor: string;
  fleshColor: string;
  rindColor: string;
  hasMissed: boolean;
}

export interface FoodHalf {
  id: string;
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  sliceAngle: number;
  halfSide: 1 | -1;
  juiceColor: string;
  fleshColor: string;
  rindColor: string;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'juice' | 'spark' | 'smoke' | 'star';
  gravity?: number;
}

export interface JuiceSplat {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  rotation: number;
  drops: { dx: number; dy: number; r: number }[];
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  scale: number;
  alpha: number;
  vy: number;
  life: number;
}

export interface SwipePoint {
  x: number;
  y: number;
  time: number;
}

export interface GameStats {
  score: number;
  bestScore: number;
  lives: number;
  maxLives: number;
  combo: number;
  maxCombo: number;
  slicedCount: number;
  mode: GameMode;
  timeLeft: number; // For time attack in seconds
  isGameOver: boolean;
  isPaused: boolean;
  isNewHighScore: boolean;
  missedFoods: number;
}

export interface FruitConfig {
  type: FruitType;
  name: string;
  radius: number;
  points: number;
  juiceColor: string;
  fleshColor: string;
  rindColor: string;
  pitchMod: number;
}

export const FRUIT_CONFIGS: Record<FruitType, FruitConfig> = {
  watermelon: {
    type: 'watermelon',
    name: 'Watermelon',
    radius: 46,
    points: 10,
    juiceColor: '#ff2a5f',
    fleshColor: '#e11d48',
    rindColor: '#16a34a',
    pitchMod: 0.85,
  },
  apple: {
    type: 'apple',
    name: 'Apple',
    radius: 36,
    points: 10,
    juiceColor: '#ef4444',
    fleshColor: '#fef08a',
    rindColor: '#dc2626',
    pitchMod: 1.05,
  },
  orange: {
    type: 'orange',
    name: 'Orange',
    radius: 38,
    points: 10,
    juiceColor: '#f97316',
    fleshColor: '#fb923c',
    rindColor: '#ea580c',
    pitchMod: 1.0,
  },
  strawberry: {
    type: 'strawberry',
    name: 'Strawberry',
    radius: 30,
    points: 20, // fast fruit
    juiceColor: '#f43f5e',
    fleshColor: '#fb7185',
    rindColor: '#e11d48',
    pitchMod: 1.25,
  },
  banana: {
    type: 'banana',
    name: 'Banana',
    radius: 38,
    points: 10,
    juiceColor: '#fef08a',
    fleshColor: '#fef9c3',
    rindColor: '#eab308',
    pitchMod: 0.95,
  },
  kiwi: {
    type: 'kiwi',
    name: 'Kiwi',
    radius: 32,
    points: 20, // fast fruit
    juiceColor: '#84cc16',
    fleshColor: '#a3e635',
    rindColor: '#78350f',
    pitchMod: 1.15,
  },
  pineapple: {
    type: 'pineapple',
    name: 'Pineapple',
    radius: 44,
    points: 15,
    juiceColor: '#facc15',
    fleshColor: '#fde047',
    rindColor: '#ca8a04',
    pitchMod: 0.9,
  },
  peach: {
    type: 'peach',
    name: 'Peach',
    radius: 35,
    points: 10,
    juiceColor: '#fb7185',
    fleshColor: '#fde047',
    rindColor: '#f43f5e',
    pitchMod: 1.1,
  },
  bomb: {
    type: 'bomb',
    name: 'Bomb',
    radius: 38,
    points: 0,
    juiceColor: '#f97316',
    fleshColor: '#18181b',
    rindColor: '#27272a',
    pitchMod: 0.5,
  },
};

export const BLADE_THEMES: Record<BladeStyle, BladeTheme> = {
  katana: {
    id: 'katana',
    name: 'Steel Katana',
    glowColor: '#38bdf8',
    coreColor: '#ffffff',
    sparkColor: '#7dd3fc',
    description: 'Crisp azure luminescence with razor sharpness.',
  },
  flame: {
    id: 'flame',
    name: 'Dragon Flame',
    glowColor: '#ea580c',
    coreColor: '#fef08a',
    sparkColor: '#f97316',
    description: 'Searing fire trail that ignites sliced fruits.',
  },
  neon: {
    id: 'neon',
    name: 'Cyber Violet',
    glowColor: '#c026d3',
    coreColor: '#fdf4ff',
    sparkColor: '#e879f9',
    description: 'Electrifying cyberpunk plasma with vivid violet flash.',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Prism Nova',
    glowColor: '#10b981',
    coreColor: '#ffffff',
    sparkColor: '#facc15',
    description: 'Shifting multi-color rainbow starlight trail.',
  },
};
