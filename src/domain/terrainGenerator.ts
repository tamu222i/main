import { VoxelWorld } from './voxelWorld';

export interface TerrainOptions {
  seed?: number;
  waterLevel?: number;
  baseHeight?: number;
}

export class TerrainGenerator {
  readonly seed: number;
  readonly waterLevel: number;
  readonly baseHeight: number;

  constructor(options: TerrainOptions = {}) {
    this.seed = options.seed ?? 12345;
    this.waterLevel = options.waterLevel ?? 5;
    this.baseHeight = options.baseHeight ?? 10;
  }

  // Fast deterministic pseudo-random generator
  private pseudoRandom(seed: number): () => number {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Smooth 2D noise approximation using multi-octave harmonic sine waves
  private getTerrainHeight(x: number, z: number, worldHeight: number): number {
    const s = this.seed;
    const wave1 = Math.sin((x + s * 0.1) * 0.15) * Math.cos((z + s * 0.15) * 0.15);
    const wave2 = Math.sin((x * 0.08) + 1.7) * Math.sin((z * 0.08) + 2.3) * 2.0;
    const wave3 = Math.cos((x * 0.3) + s * 0.05) * Math.sin((z * 0.3) + s * 0.07) * 0.6;
    
    const rawHeight = this.baseHeight + wave1 * 3.5 + wave2 + wave3;
    return Math.max(2, Math.min(worldHeight - 8, Math.floor(rawHeight)));
  }

  generate(world: VoxelWorld): void {
    const { worldSizeX, worldSizeZ, worldHeight } = world.config;
    const rng = this.pseudoRandom(this.seed);

    // Heightmap cache
    const heights: number[][] = [];
    for (let x = 0; x < worldSizeX; x++) {
      heights[x] = [];
      for (let z = 0; z < worldSizeZ; z++) {
        heights[x][z] = this.getTerrainHeight(x, z, worldHeight);
      }
    }

    // 1. Fill ground columns
    for (let x = 0; x < worldSizeX; x++) {
      for (let z = 0; z < worldSizeZ; z++) {
        const groundHeight = heights[x][z];

        for (let y = 0; y < worldHeight; y++) {
          if (y === 0) {
            // Bedrock / solid base
            world.setBlock(x, y, z, 'stone');
          } else if (y < groundHeight - 3) {
            // Deep underground stone
            world.setBlock(x, y, z, 'stone');
          } else if (y < groundHeight) {
            // Sub-surface dirt
            world.setBlock(x, y, z, 'dirt');
          } else if (y === groundHeight) {
            // Top layer: sand if at or below waterLevel, else grass
            if (groundHeight <= this.waterLevel) {
              world.setBlock(x, y, z, 'sand');
            } else {
              world.setBlock(x, y, z, 'grass');
            }
          } else if (y <= this.waterLevel) {
            // Water filling depressions
            world.setBlock(x, y, z, 'water');
          } else {
            // Air
            world.setBlock(x, y, z, 'air');
          }
        }
      }
    }

    // 2. Generate trees and flowers
    for (let x = 3; x < worldSizeX - 3; x++) {
      for (let z = 3; z < worldSizeZ - 3; z++) {
        const surfaceY = heights[x][z];
        const surfaceBlock = world.getBlock(x, surfaceY, z);

        if (surfaceBlock !== 'grass') continue;

        const val = rng();
        // Tree generation probability
        if (val < 0.035 && surfaceY + 6 < worldHeight) {
          this.plantTree(world, x, surfaceY + 1, z);
        } else if (val < 0.08) {
          // Flowers
          world.setBlock(x, surfaceY + 1, z, 'flower');
        }
      }
    }
  }

  private plantTree(world: VoxelWorld, rootX: number, rootY: number, rootZ: number): void {
    const trunkHeight = 4;

    // Wood trunk
    for (let dy = 0; dy < trunkHeight; dy++) {
      world.setBlock(rootX, rootY + dy, rootZ, 'wood');
    }

    // Leaves canopy
    const leafStartY = rootY + trunkHeight - 2;
    for (let ly = leafStartY; ly <= rootY + trunkHeight + 1; ly++) {
      const radius = ly >= rootY + trunkHeight ? 1 : 2;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (dx === 0 && dz === 0 && ly < rootY + trunkHeight) {
            continue; // Trunk position
          }
          // Avoid corner blocks on outer radius for rounded Minecraft tree crown look
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && rngShouldSkipCorner(dx, dz)) {
            continue;
          }
          const current = world.getBlock(rootX + dx, ly, rootZ + dz);
          if (current === 'air') {
            world.setBlock(rootX + dx, ly, rootZ + dz, 'leaves');
          }
        }
      }
    }
  }
}

function rngShouldSkipCorner(dx: number, dz: number): boolean {
  return Math.abs(dx) === 2 && Math.abs(dz) === 2;
}
