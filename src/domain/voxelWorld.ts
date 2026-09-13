import { BlockType, WorldConfig, WorldConfigSchema, BLOCK_PROPERTIES } from './schemas';
import { Vector3D, AABBBox } from './valueObjects';

export interface RaycastHit {
  blockPos: Vector3D;
  placePos: Vector3D;
  faceNormal: Vector3D;
  distance: number;
  blockType: BlockType;
}

export class VoxelWorld {
  readonly config: WorldConfig;
  private blocks: Uint8Array;
  private static readonly BLOCK_TYPES: BlockType[] = [
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
  ];

  private static readonly TYPE_TO_ID: Map<BlockType, number> = new Map(
    VoxelWorld.BLOCK_TYPES.map((type, index) => [type, index])
  );

  private onChangeListeners: Array<(x: number, y: number, z: number) => void> = [];

  constructor(configPartial: Partial<WorldConfig> = {}) {
    this.config = WorldConfigSchema.parse(configPartial);
    const totalVoxels = this.config.worldSizeX * this.config.worldHeight * this.config.worldSizeZ;
    this.blocks = new Uint8Array(totalVoxels);
  }

  private getIndex(x: number, y: number, z: number): number {
    return (
      x +
      z * this.config.worldSizeX +
      y * this.config.worldSizeX * this.config.worldSizeZ
    );
  }

  isWithinBounds(x: number, y: number, z: number): boolean {
    return (
      x >= 0 &&
      x < this.config.worldSizeX &&
      y >= 0 &&
      y < this.config.worldHeight &&
      z >= 0 &&
      z < this.config.worldSizeZ
    );
  }

  getBlock(x: number, y: number, z: number): BlockType {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);

    if (!this.isWithinBounds(ix, iy, iz)) {
      return 'air';
    }

    const id = this.blocks[this.getIndex(ix, iy, iz)];
    return VoxelWorld.BLOCK_TYPES[id] ?? 'air';
  }

  setBlock(x: number, y: number, z: number, type: BlockType): boolean {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);

    if (!this.isWithinBounds(ix, iy, iz)) {
      return false;
    }

    const typeId = VoxelWorld.TYPE_TO_ID.get(type) ?? 0;
    const index = this.getIndex(ix, iy, iz);
    if (this.blocks[index] === typeId) {
      return true; // no change
    }

    this.blocks[index] = typeId;
    this.notifyChange(ix, iy, iz);
    return true;
  }

  breakBlock(x: number, y: number, z: number): boolean {
    const current = this.getBlock(x, y, z);
    if (current === 'air') return false;
    return this.setBlock(x, y, z, 'air');
  }

  subscribe(listener: (x: number, y: number, z: number) => void): () => void {
    this.onChangeListeners.push(listener);
    return () => {
      this.onChangeListeners = this.onChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyChange(x: number, y: number, z: number): void {
    for (const listener of this.onChangeListeners) {
      listener(x, y, z);
    }
  }

  /**
   * Check if an AABB intersects any solid voxel in the world
   */
  checkAABBCollision(box: AABBBox): boolean {
    const minX = Math.floor(box.min.x);
    const maxX = Math.floor(box.max.x);
    const minY = Math.floor(box.min.y);
    const maxY = Math.floor(box.max.y);
    const minZ = Math.floor(box.min.z);
    const maxZ = Math.floor(box.max.z);

    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        for (let x = minX; x <= maxX; x++) {
          const block = this.getBlock(x, y, z);
          if (BLOCK_PROPERTIES[block]?.isSolid) {
            // Check intersection between entity box and voxel [x, y, z] to [x+1, y+1, z+1]
            if (
              box.max.x > x &&
              box.min.x < x + 1 &&
              box.max.y > y &&
              box.min.y < y + 1 &&
              box.max.z > z &&
              box.min.z < z + 1
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Fast Voxel DDA (Digital Differential Analyzer) Raycasting
   */
  raycast(origin: Vector3D, direction: Vector3D, maxDistance: number = 8): RaycastHit | null {
    const dir = direction.normalize();

    // Current voxel
    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);

    const stepX = dir.x > 0 ? 1 : dir.x < 0 ? -1 : 0;
    const stepY = dir.y > 0 ? 1 : dir.y < 0 ? -1 : 0;
    const stepZ = dir.z > 0 ? 1 : dir.z < 0 ? -1 : 0;

    const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
    const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;

    const nextVoxelBoundaryX = x + (stepX > 0 ? 1 : 0);
    const nextVoxelBoundaryY = y + (stepY > 0 ? 1 : 0);
    const nextVoxelBoundaryZ = z + (stepZ > 0 ? 1 : 0);

    let tMaxX = stepX !== 0 ? Math.abs((nextVoxelBoundaryX - origin.x) / dir.x) : Infinity;
    let tMaxY = stepY !== 0 ? Math.abs((nextVoxelBoundaryY - origin.y) / dir.y) : Infinity;
    let tMaxZ = stepZ !== 0 ? Math.abs((nextVoxelBoundaryZ - origin.z) / dir.z) : Infinity;

    let normalX = 0;
    let normalY = 0;
    let normalZ = 0;
    let distance = 0;

    while (distance < maxDistance) {
      const block = this.getBlock(x, y, z);
      if (block !== 'air' && block !== 'water') {
        return {
          blockPos: new Vector3D(x, y, z),
          placePos: new Vector3D(x + normalX, y + normalY, z + normalZ),
          faceNormal: new Vector3D(normalX, normalY, normalZ),
          distance,
          blockType: block,
        };
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          x += stepX;
          distance = tMaxX;
          tMaxX += tDeltaX;
          normalX = -stepX;
          normalY = 0;
          normalZ = 0;
        } else {
          z += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          normalX = 0;
          normalY = 0;
          normalZ = -stepZ;
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          distance = tMaxY;
          tMaxY += tDeltaY;
          normalX = 0;
          normalY = -stepY;
          normalZ = 0;
        } else {
          z += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          normalX = 0;
          normalY = 0;
          normalZ = -stepZ;
        }
      }
    }

    return null;
  }

  /**
   * World serialization for local persistence
   */
  exportData(): { config: WorldConfig; data: string } {
    // Convert Uint8Array to base64 or run-length encoded string
    let binary = '';
    const len = this.blocks.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(this.blocks[i]);
    }
    const base64 = btoa(binary);
    return {
      config: this.config,
      data: base64,
    };
  }

  importData(data: string): boolean {
    try {
      const binary = atob(data);
      const len = Math.min(binary.length, this.blocks.length);
      for (let i = 0; i < len; i++) {
        this.blocks[i] = binary.charCodeAt(i);
      }
      this.notifyChange(0, 0, 0);
      return true;
    } catch {
      return false;
    }
  }

  getRawBlocks(): Uint8Array {
    return this.blocks;
  }
}
