import { z } from 'zod';

export const BlockTypeSchema = z.enum([
  'air',
  'grass',
  'dirt',
  'stone',
  'cobblestone',
  'wood',
  'leaves',
  'planks',
  'sand',
  'glass',
  'brick',
  'water',
  'flower',
]);

export type BlockType = z.infer<typeof BlockTypeSchema>;

export interface BlockProperty {
  id: BlockType;
  name: string;
  isSolid: boolean;
  isTransparent: boolean;
  isLiquid?: boolean;
  hardness: number; // 0 = instant, higher = takes longer
  soundType: 'grass' | 'dirt' | 'stone' | 'wood' | 'sand' | 'glass' | 'water';
  color: string; // fallback color
}

export const BLOCK_PROPERTIES: Record<BlockType, BlockProperty> = {
  air: {
    id: 'air',
    name: 'Air',
    isSolid: false,
    isTransparent: true,
    hardness: 0,
    soundType: 'grass',
    color: 'transparent',
  },
  grass: {
    id: 'grass',
    name: '草ブロック',
    isSolid: true,
    isTransparent: false,
    hardness: 0.6,
    soundType: 'grass',
    color: '#5b8c32',
  },
  dirt: {
    id: 'dirt',
    name: '土',
    isSolid: true,
    isTransparent: false,
    hardness: 0.5,
    soundType: 'dirt',
    color: '#866043',
  },
  stone: {
    id: 'stone',
    name: '石',
    isSolid: true,
    isTransparent: false,
    hardness: 1.5,
    soundType: 'stone',
    color: '#7f7f7f',
  },
  cobblestone: {
    id: 'cobblestone',
    name: '丸石',
    isSolid: true,
    isTransparent: false,
    hardness: 1.8,
    soundType: 'stone',
    color: '#656565',
  },
  wood: {
    id: 'wood',
    name: '原木',
    isSolid: true,
    isTransparent: false,
    hardness: 1.2,
    soundType: 'wood',
    color: '#6d5333',
  },
  leaves: {
    id: 'leaves',
    name: '葉',
    isSolid: true,
    isTransparent: true,
    hardness: 0.2,
    soundType: 'grass',
    color: '#347a2a',
  },
  planks: {
    id: 'planks',
    name: '木材',
    isSolid: true,
    isTransparent: false,
    hardness: 1.0,
    soundType: 'wood',
    color: '#a07849',
  },
  sand: {
    id: 'sand',
    name: '砂',
    isSolid: true,
    isTransparent: false,
    hardness: 0.5,
    soundType: 'sand',
    color: '#d8c78c',
  },
  glass: {
    id: 'glass',
    name: 'ガラス',
    isSolid: true,
    isTransparent: true,
    hardness: 0.3,
    soundType: 'glass',
    color: '#cde8f5',
  },
  brick: {
    id: 'brick',
    name: 'レンガ',
    isSolid: true,
    isTransparent: false,
    hardness: 2.0,
    soundType: 'stone',
    color: '#9c4c3b',
  },
  water: {
    id: 'water',
    name: '水',
    isSolid: false,
    isTransparent: true,
    isLiquid: true,
    hardness: 100,
    soundType: 'water',
    color: '#3669c9',
  },
  flower: {
    id: 'flower',
    name: '花 (ポピー)',
    isSolid: false,
    isTransparent: true,
    hardness: 0.0,
    soundType: 'grass',
    color: '#e02020',
  },
};

export const Position3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Position3D = z.infer<typeof Position3DSchema>;

export const PlayerStateSchema = z.object({
  position: Position3DSchema,
  velocity: Position3DSchema,
  pitch: z.number().default(0),
  yaw: z.number().default(0),
  onGround: z.boolean().default(false),
  selectedBlock: BlockTypeSchema.default('grass'),
  isFlying: z.boolean().default(false),
  health: z.number().min(0).max(20).default(20),
});

export type PlayerState = z.infer<typeof PlayerStateSchema>;

export const WorldConfigSchema = z.object({
  worldSizeX: z.number().default(32),
  worldSizeZ: z.number().default(32),
  worldHeight: z.number().default(32),
  seed: z.number().default(12345),
  gravity: z.number().default(28.0),
  jumpForce: z.number().default(9.0),
  walkSpeed: z.number().default(4.5),
  runSpeed: z.number().default(7.0),
});

export type WorldConfig = z.infer<typeof WorldConfigSchema>;
