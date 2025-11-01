
import { PetStage } from '@/types';

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
    name: 'Hatchling',
    minXP: 10,
    image: '🐣',
    color: '#FFE066',
  },
  {
    index: 2,
    name: 'Baby',
    minXP: 30,
    image: '🐥',
    color: '#FFD700',
  },
  {
    index: 3,
    name: 'Juvenile',
    minXP: 60,
    image: '🐤',
    color: '#FFA500',
  },
  {
    index: 4,
    name: 'Teen',
    minXP: 100,
    image: '🦆',
    color: '#87CEEB',
  },
  {
    index: 5,
    name: 'Adult',
    minXP: 150,
    image: '🦢',
    color: '#FFFFFF',
  },
  {
    index: 6,
    name: 'Elder',
    minXP: 220,
    image: '🦚',
    color: '#4169E1',
  },
  {
    index: 7,
    name: 'Legendary',
    minXP: 300,
    image: '🦅',
    color: '#FFD700',
  },
];

export const XP_PER_TASK = 5;
export const XP_PENALTY_PER_MISSED = 3;
