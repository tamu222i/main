import { describe, it, expect, beforeEach } from 'vitest';
import { VoxelWorld } from './voxelWorld';
import { Vector3D } from './valueObjects';

describe('VoxelWorld Aggregate (BDD & TDD)', () => {
  let world: VoxelWorld;

  beforeEach(() => {
    // 16x16x32 micro-world for tests
    world = new VoxelWorld({
      worldSizeX: 16,
      worldSizeZ: 16,
      worldHeight: 32,
    });
  });

  describe('Block Manipulation', () => {
    it('Given an empty coordinate, When setBlock is called, Then getBlock returns the assigned block type', () => {
      expect(world.getBlock(2, 5, 2)).toBe('air');
      world.setBlock(2, 5, 2, 'stone');
      expect(world.getBlock(2, 5, 2)).toBe('stone');
    });

    it('Given world bounds, When accessing outside coordinates, Then returns boundary default air', () => {
      expect(world.getBlock(-5, 10, 50)).toBe('air');
      // setting outside bounds should safely do nothing or return false
      const placed = world.setBlock(-1, 0, 0, 'dirt');
      expect(placed).toBe(false);
    });

    it('Given an existing block, When broken (set to air), Then block is removed', () => {
      world.setBlock(5, 5, 5, 'wood');
      expect(world.getBlock(5, 5, 5)).toBe('wood');
      const removed = world.breakBlock(5, 5, 5);
      expect(removed).toBe(true);
      expect(world.getBlock(5, 5, 5)).toBe('air');
    });
  });

  describe('AABB Collisions against Voxels', () => {
    it('Given a solid block at (1, 1, 1), When an entity AABB overlaps, Then detects collision', () => {
      world.setBlock(1, 1, 1, 'stone');
      // Entity bounding box [minX, minY, minZ, maxX, maxY, maxZ]
      const overlappingAABB = {
        min: new Vector3D(0.8, 0.8, 0.8),
        max: new Vector3D(1.4, 2.6, 1.4),
      };
      const collides = world.checkAABBCollision(overlappingAABB);
      expect(collides).toBe(true);
    });

    it('Given air block, When entity AABB is positioned, Then returns no collision', () => {
      world.setBlock(1, 1, 1, 'air');
      const nonOverlappingAABB = {
        min: new Vector3D(1.1, 1.1, 1.1),
        max: new Vector3D(1.5, 2.5, 1.5),
      };
      const collides = world.checkAABBCollision(nonOverlappingAABB);
      expect(collides).toBe(false);
    });
  });

  describe('Raycasting (Mining & Placing)', () => {
    it('Given a ray towards a target block, When raycast is evaluated, Then returns hit voxel and face normal position', () => {
      // Place a target stone block at (0, 5, 3)
      world.setBlock(0, 5, 3, 'stone');

      // Ray starting at (0.5, 5.5, 0.5) looking forward +Z direction
      const origin = new Vector3D(0.5, 5.5, 0.5);
      const direction = new Vector3D(0, 0, 1);

      const hit = world.raycast(origin, direction, 8);
      expect(hit).not.toBeNull();
      if (hit) {
        expect(hit.blockPos.x).toBe(0);
        expect(hit.blockPos.y).toBe(5);
        expect(hit.blockPos.z).toBe(3);
        // Place position should be adjacent along the face (z=2)
        expect(hit.placePos.z).toBe(2);
      }
    });
  });
});
