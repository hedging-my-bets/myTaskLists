
import { PetStage } from '@/types';

// 30-stage progression with 75% harder thresholds
// Formula: Each stage requires 75% more XP than the previous stage
// Starting from 10 XP for stage 1, each subsequent stage = previous * 1.75
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
    minXP: 10,
    image: '🐔',
    color: '#FFD700',
  },
  {
    index: 2,
    name: 'Weasel',
    minXP: 28,
    image: '🦡',
    color: '#8B7355',
  },
  {
    index: 3,
    name: 'Badger',
    minXP: 58,
    image: '🦡',
    color: '#696969',
  },
  {
    index: 4,
    name: 'Hawk',
    minXP: 111,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 5,
    name: 'Barracuda',
    minXP: 204,
    image: '🐟',
    color: '#4682B4',
  },
  {
    index: 6,
    name: 'Coyote',
    minXP: 367,
    image: '🐺',
    color: '#D2B48C',
  },
  {
    index: 7,
    name: 'Wild Boar',
    minXP: 652,
    image: '🐗',
    color: '#8B4513',
  },
  {
    index: 8,
    name: 'Wolf',
    minXP: 1151,
    image: '🐺',
    color: '#708090',
  },
  {
    index: 9,
    name: 'Crocodile',
    minXP: 2024,
    image: '🐊',
    color: '#556B2F',
  },
  {
    index: 10,
    name: 'Mako Shark',
    minXP: 3552,
    image: '🦈',
    color: '#4682B4',
  },
  {
    index: 11,
    name: 'Great White Shark',
    minXP: 6226,
    image: '🦈',
    color: '#708090',
  },
  {
    index: 12,
    name: 'Orca',
    minXP: 10906,
    image: '🐋',
    color: '#2F4F4F',
  },
  {
    index: 13,
    name: 'Bison',
    minXP: 19096,
    image: '🦬',
    color: '#8B4513',
  },
  {
    index: 14,
    name: 'Bull',
    minXP: 33418,
    image: '🐂',
    color: '#A0522D',
  },
  {
    index: 15,
    name: 'Stallion',
    minXP: 58482,
    image: '🐴',
    color: '#8B4513',
  },
  {
    index: 16,
    name: 'Grizzly Bear',
    minXP: 102344,
    image: '🐻',
    color: '#8B4513',
  },
  {
    index: 17,
    name: 'Polar Bear',
    minXP: 179102,
    image: '🐻‍❄️',
    color: '#F0F8FF',
  },
  {
    index: 18,
    name: 'Rhinoceros',
    minXP: 313429,
    image: '🦏',
    color: '#696969',
  },
  {
    index: 19,
    name: 'Hippopotamus',
    minXP: 548501,
    image: '🦛',
    color: '#708090',
  },
  {
    index: 20,
    name: 'Elephant',
    minXP: 959877,
    image: '🐘',
    color: '#808080',
  },
  {
    index: 21,
    name: 'Silver Back Gorilla',
    minXP: 1679785,
    image: '🦍',
    color: '#2F4F4F',
  },
  {
    index: 22,
    name: 'Cape Buffalo',
    minXP: 2939624,
    image: '🐃',
    color: '#2F4F4F',
  },
  {
    index: 23,
    name: 'Lion',
    minXP: 5144342,
    image: '🦁',
    color: '#DAA520',
  },
  {
    index: 24,
    name: 'Komodo Dragon',
    minXP: 9002598,
    image: '🦎',
    color: '#556B2F',
  },
  {
    index: 25,
    name: 'Eagle',
    minXP: 15754547,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 26,
    name: 'Phoenix',
    minXP: 27570457,
    image: '🔥',
    color: '#FF4500',
  },
  {
    index: 27,
    name: 'Dragon',
    minXP: 48248300,
    image: '🐉',
    color: '#8B0000',
  },
  {
    index: 28,
    name: 'Human CEO',
    minXP: 84434525,
    image: '👔',
    color: '#4169E1',
  },
  {
    index: 29,
    name: 'Golden CEO',
    minXP: 147760419,
    image: '👑',
    color: '#FFD700',
  },
];

// XP thresholds with 75% harder progression
// Each stage requires 75% more XP than the previous stage
export const XP_THRESHOLDS = [
  0, 10, 28, 58, 111, 204, 367, 652, 1151, 2024,
  3552, 6226, 10906, 19096, 33418, 58482, 102344, 179102, 313429, 548501,
  959877, 1679785, 2939624, 5144342, 9002598, 15754547, 27570457, 48248300, 84434525, 147760419
];

export const XP_PER_TASK = 10; // Default gain per completion
export const XP_PENALTY_BASE = 1; // Base penalty multiplier
