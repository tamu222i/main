import { describe, it, expect, beforeEach } from 'vitest';
import { WorldRepository } from './worldRepository';
import { VoxelWorld } from '../domain/voxelWorld';

describe('WorldRepository Infrastructure (BDD & TDD)', () => {
  let repository: WorldRepository;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    repository = new WorldRepository(storageMock as unknown as Storage);
  });

  it('Given a modified world, When saved to repository, Then can be restored accurately', () => {
    const world = new VoxelWorld({ worldSizeX: 8, worldSizeZ: 8, worldHeight: 16 });
    world.setBlock(2, 4, 2, 'brick');
    world.setBlock(3, 4, 3, 'glass');

    const success = repository.saveWorld('slot_1', world);
    expect(success).toBe(true);

    const restoredWorld = new VoxelWorld({ worldSizeX: 8, worldSizeZ: 8, worldHeight: 16 });
    const loaded = repository.loadWorld('slot_1', restoredWorld);
    expect(loaded).toBe(true);
    expect(restoredWorld.getBlock(2, 4, 2)).toBe('brick');
    expect(restoredWorld.getBlock(3, 4, 3)).toBe('glass');
  });

  it('Given nonexistent slot, When loaded, Then returns false safely without error', () => {
    const world = new VoxelWorld();
    const loaded = repository.loadWorld('nonexistent_slot', world);
    expect(loaded).toBe(false);
  });
});
