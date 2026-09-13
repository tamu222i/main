import { describe, it, expect } from 'vitest';
import {
  BlockTypeSchema,
  Position3DSchema,
  PlayerStateSchema,
  WorldConfigSchema,
  BLOCK_PROPERTIES,
} from './schemas';

describe('Schema-Driven Domain Definitions (BDD)', () => {
  describe('BlockTypeSchema', () => {
    it('Given valid block types, When parsed, Then should succeed', () => {
      const validBlocks = ['air', 'grass', 'dirt', 'stone', 'wood', 'leaves', 'planks', 'glass', 'cobblestone', 'sand', 'brick', 'water', 'flower'];
      validBlocks.forEach((block) => {
        const result = BlockTypeSchema.safeParse(block);
        expect(result.success).toBe(true);
      });
    });

    it('Given invalid block type, When parsed, Then should fail validation', () => {
      const result = BlockTypeSchema.safeParse('unobtanium');
      expect(result.success).toBe(false);
    });

    it('Given block properties registry, When checked, Then solid and transparency flags must be defined', () => {
      expect(BLOCK_PROPERTIES.grass.isSolid).toBe(true);
      expect(BLOCK_PROPERTIES.air.isSolid).toBe(false);
      expect(BLOCK_PROPERTIES.glass.isTransparent).toBe(true);
      expect(BLOCK_PROPERTIES.stone.isSolid).toBe(true);
    });
  });

  describe('Position3DSchema', () => {
    it('Given floating point coordinates, When parsed, Then accepts valid numbers', () => {
      const parsed = Position3DSchema.parse({ x: 10.5, y: 64.2, z: -15.8 });
      expect(parsed.x).toBe(10.5);
      expect(parsed.y).toBe(64.2);
      expect(parsed.z).toBe(-15.8);
    });
  });

  describe('PlayerStateSchema', () => {
    it('Given initial player parameters, When validated, Then produces compliant state', () => {
      const state = {
        position: { x: 0, y: 10, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        pitch: 0,
        yaw: 0,
        onGround: false,
        selectedBlock: 'stone' as const,
        isFlying: false,
        health: 20,
      };
      const parsed = PlayerStateSchema.parse(state);
      expect(parsed.health).toBe(20);
      expect(parsed.selectedBlock).toBe('stone');
    });
  });

  describe('WorldConfigSchema', () => {
    it('Given world configuration parameters, When parsed, Then default values exist', () => {
      const config = WorldConfigSchema.parse({});
      expect(config.worldSizeX).toBeGreaterThan(0);
      expect(config.worldSizeZ).toBeGreaterThan(0);
      expect(config.worldHeight).toBeGreaterThan(0);
    });
  });
});
