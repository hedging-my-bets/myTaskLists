
import { PetStage } from '@/types';

// 30-stage progression with gradual XP thresholds
// Stage 1: 100 XP, Stage 30: 3000 XP
// Progressive increase with approximately 100 XP increments per stage
export const PET_STAGES: PetStage[] = [
  {
    index: 0,
    name: 'Egg',
    minXP: 0,
    image: '🥚',
    color: '#E8E8E8',
  },
  {
    index: 1,
    name: 'Chicken',
    minXP: 100,
    image: '🐔',
    color: '#FFD700',
  },
  {
    index: 2,
    name: 'Weasel',
    minXP: 200,
    image: '🦡',
    color: '#8B7355',
  },
  {
    index: 3,
    name: 'Badger',
    minXP: 300,
    image: '🦡',
    color: '#696969',
  },
  {
    index: 4,
    name: 'Hawk',
    minXP: 400,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 5,
    name: 'Barracuda',
    minXP: 500,
    image: '🐟',
    color: '#4682B4',
  },
  {
    index: 6,
    name: 'Coyote',
    minXP: 600,
    image: '🐺',
    color: '#D2B48C',
  },
  {
    index: 7,
    name: 'Wild Boar',
    minXP: 700,
    image: '🐗',
    color: '#8B4513',
  },
  {
    index: 8,
    name: 'Wolf',
    minXP: 800,
    image: '🐺',
    color: '#708090',
  },
  {
    index: 9,
    name: 'Crocodile',
    minXP: 900,
    image: '🐊',
    color: '#556B2F',
  },
  {
    index: 10,
    name: 'Mako Shark',
    minXP: 1000,
    image: '🦈',
    color: '#4682B4',
  },
  {
    index: 11,
    name: 'Great White Shark',
    minXP: 1100,
    image: '🦈',
    color: '#708090',
  },
  {
    index: 12,
    name: 'Orca',
    minXP: 1200,
    image: '🐋',
    color: '#2F4F4F',
  },
  {
    index: 13,
    name: 'Bison',
    minXP: 1300,
    image: '🦬',
    color: '#8B4513',
  },
  {
    index: 14,
    name: 'Bull',
    minXP: 1400,
    image: '🐂',
    color: '#A0522D',
  },
  {
    index: 15,
    name: 'Stallion',
    minXP: 1500,
    image: '🐴',
    color: '#8B4513',
  },
  {
    index: 16,
    name: 'Grizzly Bear',
    minXP: 1600,
    image: '🐻',
    color: '#8B4513',
  },
  {
    index: 17,
    name: 'Polar Bear',
    minXP: 1700,
    image: '🐻‍❄️',
    color: '#F0F8FF',
  },
  {
    index: 18,
    name: 'Rhinoceros',
    minXP: 1800,
    image: '🦏',
    color: '#696969',
  },
  {
    index: 19,
    name: 'Hippopotamus',
    minXP: 1900,
    image: '🦛',
    color: '#708090',
  },
  {
    index: 20,
    name: 'Elephant',
    minXP: 2000,
    image: '🐘',
    color: '#808080',
  },
  {
    index: 21,
    name: 'Silver Back Gorilla',
    minXP: 2100,
    image: '🦍',
    color: '#2F4F4F',
  },
  {
    index: 22,
    name: 'Cape Buffalo',
    minXP: 2200,
    image: '🐃',
    color: '#2F4F4F',
  },
  {
    index: 23,
    name: 'Lion',
    minXP: 2300,
    image: '🦁',
    color: '#DAA520',
  },
  {
    index: 24,
    name: 'Komodo Dragon',
    minXP: 2400,
    image: '🦎',
    color: '#556B2F',
  },
  {
    index: 25,
    name: 'Eagle',
    minXP: 2500,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 26,
    name: 'Phoenix',
    minXP: 2600,
    image: '🔥',
    color: '#FF4500',
  },
  {
    index: 27,
    name: 'Dragon',
    minXP: 2700,
    image: '🐉',
    color: '#8B0000',
  },
  {
    index: 28,
    name: 'Human CEO',
    minXP: 2800,
    image: '👔',
    color: '#4169E1',
  },
  {
    index: 29,
    name: 'Golden CEO',
    minXP: 2900,
    image: '👑',
    color: '#FFD700',
  },
  {
    index: 30,
    name: 'Legendary',
    minXP: 3000,
    image: '⭐',
    color: '#FFD700',
  },
];

// XP thresholds with gradual progression
// Starting from 100 XP for stage 1, incrementing by 100 XP per stage
// Stage 30 requires 3000 XP
export const XP_THRESHOLDS = [
  0,    // Stage 0: Egg
  100,  // Stage 1: Chicken
  200,  // Stage 2: Weasel
  300,  // Stage 3: Badger
  400,  // Stage 4: Hawk
  500,  // Stage 5: Barracuda
  600,  // Stage 6: Coyote
  700,  // Stage 7: Wild Boar
  800,  // Stage 8: Wolf
  900,  // Stage 9: Crocodile
  1000, // Stage 10: Mako Shark
  1100, // Stage 11: Great White Shark
  1200, // Stage 12: Orca
  1300, // Stage 13: Bison
  1400, // Stage 14: Bull
  1500, // Stage 15: Stallion
  1600, // Stage 16: Grizzly Bear
  1700, // Stage 17: Polar Bear
  1800, // Stage 18: Rhinoceros
  1900, // Stage 19: Hippopotamus
  2000, // Stage 20: Elephant
  2100, // Stage 21: Silver Back Gorilla
  2200, // Stage 22: Cape Buffalo
  2300, // Stage 23: Lion
  2400, // Stage 24: Komodo Dragon
  2500, // Stage 25: Eagle
  2600, // Stage 26: Phoenix
  2700, // Stage 27: Dragon
  2800, // Stage 28: Human CEO
  2900, // Stage 29: Golden CEO
  3000, // Stage 30: Legendary
];

export const XP_PER_TASK = 25; // XP gain per completion
export const XP_PENALTY_BASE = 1; // Base penalty multiplier
