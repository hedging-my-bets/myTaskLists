
import { PetStage } from '@/types';

export const PET_STAGES: PetStage[] = [
  // Stage 0-4: Egg to Hatchling
  {
    index: 0,
    name: 'Egg',
    minXP: 0,
    image: '🥚',
    color: '#E8E8E8',
  },
  {
    index: 1,
    name: 'Cracked Egg',
    minXP: 5,
    image: '🐣',
    color: '#F5F5DC',
  },
  {
    index: 2,
    name: 'Hatchling',
    minXP: 15,
    image: '🐥',
    color: '#FFE066',
  },
  {
    index: 3,
    name: 'Baby Chick',
    minXP: 30,
    image: '🐤',
    color: '#FFD700',
  },
  {
    index: 4,
    name: 'Young Bird',
    minXP: 50,
    image: '🐦',
    color: '#87CEEB',
  },
  // Stage 5-9: Growing Birds
  {
    index: 5,
    name: 'Sparrow',
    minXP: 75,
    image: '🐦',
    color: '#8B7355',
  },
  {
    index: 6,
    name: 'Robin',
    minXP: 105,
    image: '🐦‍⬛',
    color: '#CD5C5C',
  },
  {
    index: 7,
    name: 'Blue Jay',
    minXP: 140,
    image: '🐦',
    color: '#4169E1',
  },
  {
    index: 8,
    name: 'Cardinal',
    minXP: 180,
    image: '🐦',
    color: '#DC143C',
  },
  {
    index: 9,
    name: 'Woodpecker',
    minXP: 225,
    image: '🐦',
    color: '#8B4513',
  },
  // Stage 10-14: Water Birds
  {
    index: 10,
    name: 'Duckling',
    minXP: 275,
    image: '🦆',
    color: '#FFD700',
  },
  {
    index: 11,
    name: 'Duck',
    minXP: 330,
    image: '🦆',
    color: '#228B22',
  },
  {
    index: 12,
    name: 'Swan',
    minXP: 390,
    image: '🦢',
    color: '#FFFFFF',
  },
  {
    index: 13,
    name: 'Black Swan',
    minXP: 455,
    image: '🦢',
    color: '#2F4F4F',
  },
  {
    index: 14,
    name: 'Flamingo',
    minXP: 525,
    image: '🦩',
    color: '#FF69B4',
  },
  // Stage 15-19: Exotic Birds
  {
    index: 15,
    name: 'Parrot',
    minXP: 600,
    image: '🦜',
    color: '#00FF00',
  },
  {
    index: 16,
    name: 'Toucan',
    minXP: 680,
    image: '🦜',
    color: '#FF8C00',
  },
  {
    index: 17,
    name: 'Peacock',
    minXP: 765,
    image: '🦚',
    color: '#4169E1',
  },
  {
    index: 18,
    name: 'Phoenix',
    minXP: 855,
    image: '🔥',
    color: '#FF4500',
  },
  {
    index: 19,
    name: 'Owl',
    minXP: 950,
    image: '🦉',
    color: '#8B4513',
  },
  // Stage 20-24: Raptors
  {
    index: 20,
    name: 'Hawk',
    minXP: 1050,
    image: '🦅',
    color: '#A0522D',
  },
  {
    index: 21,
    name: 'Falcon',
    minXP: 1155,
    image: '🦅',
    color: '#696969',
  },
  {
    index: 22,
    name: 'Eagle',
    minXP: 1265,
    image: '🦅',
    color: '#8B4513',
  },
  {
    index: 23,
    name: 'Golden Eagle',
    minXP: 1380,
    image: '🦅',
    color: '#FFD700',
  },
  {
    index: 24,
    name: 'Bald Eagle',
    minXP: 1500,
    image: '🦅',
    color: '#FFFFFF',
  },
  // Stage 25-29: Legendary
  {
    index: 25,
    name: 'Thunder Bird',
    minXP: 1625,
    image: '⚡',
    color: '#FFD700',
  },
  {
    index: 26,
    name: 'Ice Phoenix',
    minXP: 1755,
    image: '❄️',
    color: '#00CED1',
  },
  {
    index: 27,
    name: 'Dragon Hatchling',
    minXP: 1890,
    image: '🐉',
    color: '#FF6347',
  },
  {
    index: 28,
    name: 'Dragon',
    minXP: 2030,
    image: '🐉',
    color: '#8B0000',
  },
  {
    index: 29,
    name: 'Ancient Dragon',
    minXP: 2175,
    image: '🐲',
    color: '#9400D3',
  },
];

export const XP_PER_TASK = 5;
export const XP_PENALTY_PER_MISSED = 3;
