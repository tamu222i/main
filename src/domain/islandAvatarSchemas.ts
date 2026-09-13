import { z } from 'zod';

export const BiomeTypeSchema = z.enum([
  'plains',
  'forest',
  'desert',
  'island_paradise',
  'floating_mountain',
]);
export type BiomeType = z.infer<typeof BiomeTypeSchema>;

export const IslandProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(30)
    .transform((val) => (val.length === 0 ? 'ひらめき島' : val))
    .default('ひらめき島'),
  creatorName: z
    .string()
    .trim()
    .max(20)
    .transform((val) => (val.length === 0 ? 'マイクラ冒険者' : val))
    .default('マイクラ冒険者'),
  biome: BiomeTypeSchema.default('plains'),
  createdAt: z.number().default(() => Date.now()),
});
export type IslandProfile = z.infer<typeof IslandProfileSchema>;

export const DEFAULT_ISLAND_PROFILE: IslandProfile = {
  name: 'ひらめき島',
  creatorName: 'マイクラ冒険者',
  biome: 'plains',
  createdAt: Date.now(),
};

export const HairStyleSchema = z.enum([
  'short',
  'long',
  'spiky',
  'afro',
  'ponytail',
  'cap',
]);
export type HairStyle = z.infer<typeof HairStyleSchema>;

export const AccessorySchema = z.enum([
  'none',
  'crown',
  'glasses',
  'miner_helmet',
  'cat_ears',
  'headphones',
]);
export type Accessory = z.infer<typeof AccessorySchema>;

export const AvatarBlockTypeSchema = z.enum([
  'none',
  'grass',
  'dirt',
  'stone',
  'cobblestone',
  'wood',
  'leaves',
  'sand',
  'glass',
  'brick',
  'planks',
  'glowstone',
  'obsidian',
  'gold',
  'iron',
  'diamond',
  'tnt',
  'snow',
  'cactus',
  'bookshelf',
]);
export type AvatarBlockType = z.infer<typeof AvatarBlockTypeSchema>;

export const AvatarProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(16)
    .transform((val) => (val.length === 0 ? 'スティーブ' : val))
    .default('スティーブ'),
  skinColor: z.string().default('#e0aa8b'),
  hairColor: z.string().default('#3b2415'),
  hairStyle: HairStyleSchema.default('short'),
  eyeColor: z.string().default('#2b4470'),
  shirtColor: z.string().default('#00aaaa'),
  pantsColor: z.string().default('#2f3b82'),
  accessory: AccessorySchema.default('none'),
  accessoryColor: z.string().default('#f59e0b'),
  // Block avatar customization
  headBlock: AvatarBlockTypeSchema.default('none'),
  bodyBlock: AvatarBlockTypeSchema.default('none'),
  armsBlock: AvatarBlockTypeSchema.default('none'),
  legsBlock: AvatarBlockTypeSchema.default('none'),
});
export type AvatarProfile = z.infer<typeof AvatarProfileSchema>;

export const DEFAULT_AVATAR_PROFILE: AvatarProfile = {
  name: 'スティーブ',
  skinColor: '#e0aa8b',
  hairColor: '#3b2415',
  hairStyle: 'short',
  eyeColor: '#2b4470',
  shirtColor: '#00aaaa',
  pantsColor: '#2f3b82',
  accessory: 'none',
  accessoryColor: '#f59e0b',
  headBlock: 'none',
  bodyBlock: 'none',
  armsBlock: 'none',
  legsBlock: 'none',
};

export const AVATAR_PRESETS: Record<string, AvatarProfile> = {
  steve: {
    name: 'スティーブ風',
    skinColor: '#d69e78',
    hairColor: '#3f2518',
    hairStyle: 'short',
    eyeColor: '#25477d',
    shirtColor: '#00aaaa',
    pantsColor: '#2b3979',
    accessory: 'none',
    accessoryColor: '#f59e0b',
    headBlock: 'none',
    bodyBlock: 'none',
    armsBlock: 'none',
    legsBlock: 'none',
  },
  alex: {
    name: 'アレックス風',
    skinColor: '#f3c7a5',
    hairColor: '#b54f15',
    hairStyle: 'ponytail',
    eyeColor: '#2e7d32',
    shirtColor: '#58733a',
    pantsColor: '#6f5235',
    accessory: 'none',
    accessoryColor: '#f59e0b',
    headBlock: 'none',
    bodyBlock: 'none',
    armsBlock: 'none',
    legsBlock: 'none',
  },
  diamond_knight: {
    name: 'ダイヤ騎士',
    skinColor: '#e0aa8b',
    hairColor: '#0284c7',
    hairStyle: 'short',
    eyeColor: '#38bdf8',
    shirtColor: '#0284c7',
    pantsColor: '#0369a1',
    accessory: 'crown',
    accessoryColor: '#38bdf8',
    headBlock: 'diamond',
    bodyBlock: 'diamond',
    armsBlock: 'diamond',
    legsBlock: 'diamond',
  },
  gold_golem: {
    name: '黄金ゴーレム',
    skinColor: '#fef08a',
    hairColor: '#ca8a04',
    hairStyle: 'spiky',
    eyeColor: '#b45309',
    shirtColor: '#eab308',
    pantsColor: '#ca8a04',
    accessory: 'crown',
    accessoryColor: '#eab308',
    headBlock: 'gold',
    bodyBlock: 'gold',
    armsBlock: 'gold',
    legsBlock: 'gold',
  },
  tnt_bomber: {
    name: 'TNTボマー',
    skinColor: '#f87171',
    hairColor: '#18181b',
    hairStyle: 'short',
    eyeColor: '#ef4444',
    shirtColor: '#b91c1c',
    pantsColor: '#18181b',
    accessory: 'none',
    accessoryColor: '#ef4444',
    headBlock: 'tnt',
    bodyBlock: 'brick',
    armsBlock: 'tnt',
    legsBlock: 'obsidian',
  },
  forest_spirit: {
    name: '森の精霊',
    skinColor: '#bbf7d0',
    hairColor: '#15803d',
    hairStyle: 'long',
    eyeColor: '#22c55e',
    shirtColor: '#166534',
    pantsColor: '#365314',
    accessory: 'cat_ears',
    accessoryColor: '#22c55e',
    headBlock: 'leaves',
    bodyBlock: 'wood',
    armsBlock: 'leaves',
    legsBlock: 'wood',
  },
  obsidian_shadow: {
    name: '黒曜石の影',
    skinColor: '#334155',
    hairColor: '#0f172a',
    hairStyle: 'spiky',
    eyeColor: '#c084fc',
    shirtColor: '#1e1b4b',
    pantsColor: '#0f172a',
    accessory: 'glasses',
    accessoryColor: '#9333ea',
    headBlock: 'obsidian',
    bodyBlock: 'obsidian',
    armsBlock: 'obsidian',
    legsBlock: 'obsidian',
  },
  ancient_scholar: {
    name: '本棚の賢者',
    skinColor: '#fed7aa',
    hairColor: '#78350f',
    hairStyle: 'short',
    eyeColor: '#854d0e',
    shirtColor: '#92400e',
    pantsColor: '#451a03',
    accessory: 'glasses',
    accessoryColor: '#d97706',
    headBlock: 'bookshelf',
    bodyBlock: 'planks',
    armsBlock: 'bookshelf',
    legsBlock: 'planks',
  },
  cactus_warrior: {
    name: 'サボテン戦士',
    skinColor: '#86efac',
    hairColor: '#14532d',
    hairStyle: 'spiky',
    eyeColor: '#166534',
    shirtColor: '#15803d',
    pantsColor: '#166534',
    accessory: 'none',
    accessoryColor: '#22c55e',
    headBlock: 'cactus',
    bodyBlock: 'cactus',
    armsBlock: 'cactus',
    legsBlock: 'cactus',
  },
  miner: {
    name: '鉱山探検家',
    skinColor: '#e8b898',
    hairColor: '#1c1917',
    hairStyle: 'cap',
    eyeColor: '#1e3a8a',
    shirtColor: '#ea580c',
    pantsColor: '#334155',
    accessory: 'miner_helmet',
    accessoryColor: '#eab308',
    headBlock: 'none',
    bodyBlock: 'iron',
    armsBlock: 'none',
    legsBlock: 'stone',
  },
  king: {
    name: '島の王様',
    skinColor: '#fed7aa',
    hairColor: '#ca8a04',
    hairStyle: 'spiky',
    eyeColor: '#7c3aed',
    shirtColor: '#7c2d12',
    pantsColor: '#1e1b4b',
    accessory: 'crown',
    accessoryColor: '#eab308',
    headBlock: 'none',
    bodyBlock: 'gold',
    armsBlock: 'none',
    legsBlock: 'none',
  },
  cyber: {
    name: 'ネコ耳サイバー',
    skinColor: '#e2e8f0',
    hairColor: '#06b6d4',
    hairStyle: 'long',
    eyeColor: '#f43f5e',
    shirtColor: '#0f172a',
    pantsColor: '#3b82f6',
    accessory: 'cat_ears',
    accessoryColor: '#ec4899',
    headBlock: 'none',
    bodyBlock: 'none',
    armsBlock: 'none',
    legsBlock: 'none',
  },
};
