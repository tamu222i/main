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

export const AvatarProfileSchema = z.object({
  name: z.string().trim().max(16).default('スティーブ'),
  skinColor: z.string().default('#e0aa8b'),
  hairColor: z.string().default('#3b2415'),
  hairStyle: HairStyleSchema.default('short'),
  eyeColor: z.string().default('#2b4470'),
  shirtColor: z.string().default('#00aaaa'),
  pantsColor: z.string().default('#2f3b82'),
  accessory: AccessorySchema.default('none'),
  accessoryColor: z.string().default('#f59e0b'),
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
  },
};
