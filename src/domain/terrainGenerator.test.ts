import { describe, it, expect } from 'vitest';
import { TerrainGenerator } from './terrainGenerator';
import { VoxelWorld } from './voxelWorld';

describe('TerrainGenerator Service (BDD & TDD)', () => {
  it('Given a world and seed, When generateWorld is executed, Then terrain surface is formed with bedrock and grass', () => {
    const world = new VoxelWorld({
      worldSizeX: 16,
      worldSizeZ: 16,
      worldHeight: 32,
    });

    const generator = new TerrainGenerator({ seed: 42 });
    generator.generate(world);

    // Bedrock / stone at lowest level (y=0)
    expect(world.getBlock(8, 0, 8)).toBe('stone');

    // Find surface block at center (x=8, z=8)
    let highestSolidY = -1;
    for (let y = 31; y >= 0; y--) {
      const block = world.getBlock(8, y, 8);
      if (block !== 'air' && block !== 'water') {
        highestSolidY = y;
        break;
      }
    }

    expect(highestSolidY).toBeGreaterThan(0);
    const topBlock = world.getBlock(8, highestSolidY, 8);
    // Surface should be grass, leaves (if tree), or sand
    expect(['grass', 'leaves', 'wood', 'sand']).toContain(topBlock);
  });

  it('Given same seed, When terrain is generated twice, Then produces identical voxel layout', () => {
    const worldA = new VoxelWorld({ worldSizeX: 8, worldSizeZ: 8, worldHeight: 16 });
    const worldB = new VoxelWorld({ worldSizeX: 8, worldSizeZ: 8, worldHeight: 16 });

    const genA = new TerrainGenerator({ seed: 999 });
    const genB = new TerrainGenerator({ seed: 999 });

    genA.generate(worldA);
    genB.generate(worldB);

    for (let y = 0; y < 16; y++) {
      for (let z = 0; z < 8; z++) {
        for (let x = 0; x < 8; x++) {
          expect(worldA.getBlock(x, y, z)).toBe(worldB.getBlock(x, y, z));
        }
      }
    }
  });
});
