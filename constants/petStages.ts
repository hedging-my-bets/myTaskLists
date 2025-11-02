
import { PetStage } from '@/types';

// 30-stage progression with doubling XP thresholds
// First level: 100 XP, then 200 XP, 400 XP, 800 XP, etc.
// Formula: Each stage requires double the XP of the previous stage
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
    minXP: 400,
    image: '🦡',
    color: '#696969',
  },
  {
    index: 4,
    name: 'Hawk',
    minXP: 800,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 5,
    name: 'Barracuda',
    minXP: 1600,
    image: '🐟',
    color: '#4682B4',
  },
  {
    index: 6,
    name: 'Coyote',
    minXP: 3200,
    image: '🐺',
    color: '#D2B48C',
  },
  {
    index: 7,
    name: 'Wild Boar',
    minXP: 6400,
    image: '🐗',
    color: '#8B4513',
  },
  {
    index: 8,
    name: 'Wolf',
    minXP: 12800,
    image: '🐺',
    color: '#708090',
  },
  {
    index: 9,
    name: 'Crocodile',
    minXP: 25600,
    image: '🐊',
    color: '#556B2F',
  },
  {
    index: 10,
    name: 'Mako Shark',
    minXP: 51200,
    image: '🦈',
    color: '#4682B4',
  },
  {
    index: 11,
    name: 'Great White Shark',
    minXP: 102400,
    image: '🦈',
    color: '#708090',
  },
  {
    index: 12,
    name: 'Orca',
    minXP: 204800,
    image: '🐋',
    color: '#2F4F4F',
  },
  {
    index: 13,
    name: 'Bison',
    minXP: 409600,
    image: '🦬',
    color: '#8B4513',
  },
  {
    index: 14,
    name: 'Bull',
    minXP: 819200,
    image: '🐂',
    color: '#A0522D',
  },
  {
    index: 15,
    name: 'Stallion',
    minXP: 1638400,
    image: '🐴',
    color: '#8B4513',
  },
  {
    index: 16,
    name: 'Grizzly Bear',
    minXP: 3276800,
    image: '🐻',
    color: '#8B4513',
  },
  {
    index: 17,
    name: 'Polar Bear',
    minXP: 6553600,
    image: '🐻‍❄️',
    color: '#F0F8FF',
  },
  {
    index: 18,
    name: 'Rhinoceros',
    minXP: 13107200,
    image: '🦏',
    color: '#696969',
  },
  {
    index: 19,
    name: 'Hippopotamus',
    minXP: 26214400,
    image: '🦛',
    color: '#708090',
  },
  {
    index: 20,
    name: 'Elephant',
    minXP: 52428800,
    image: '🐘',
    color: '#808080',
  },
  {
    index: 21,
    name: 'Silver Back Gorilla',
    minXP: 104857600,
    image: '🦍',
    color: '#2F4F4F',
  },
  {
    index: 22,
    name: 'Cape Buffalo',
    minXP: 209715200,
    image: '🐃',
    color: '#2F4F4F',
  },
  {
    index: 23,
    name: 'Lion',
    minXP: 419430400,
    image: '🦁',
    color: '#DAA520',
  },
  {
    index: 24,
    name: 'Komodo Dragon',
    minXP: 838860800,
    image: '🦎',
    color: '#556B2F',
  },
  {
    index: 25,
    name: 'Eagle',
    minXP: 1677721600,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 26,
    name: 'Phoenix',
    minXP: 3355443200,
    image: '🔥',
    color: '#FF4500',
  },
  {
    index: 27,
    name: 'Dragon',
    minXP: 6710886400,
    image: '🐉',
    color: '#8B0000',
  },
  {
    index: 28,
    name: 'Human CEO',
    minXP: 13421772800,
    image: '👔',
    color: '#4169E1',
  },
  {
    index: 29,
    name: 'Golden CEO',
    minXP: 26843545600,
    image: '👑',
    color: '#FFD700',
  },
];

// XP thresholds with doubling progression
// Starting from 100 XP for level 1, each subsequent level doubles
export const XP_THRESHOLDS = [
  0, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600,
  51200, 102400, 204800, 409600, 819200, 1638400, 3276800, 6553600, 13107200, 26214400,
  52428800, 104857600, 209715200, 419430400, 838860800, 1677721600, 3355443200, 6710886400, 13421772800, 26843545600
];

export const XP_PER_TASK = 25; // XP gain per completion
export const XP_PENALTY_BASE = 1; // Base penalty multiplier
