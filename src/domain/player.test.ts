import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from './player';
import { VoxelWorld } from './voxelWorld';
import { Vector3D } from './valueObjects';

describe('Player Entity (BDD & TDD)', () => {
  let player: Player;
  let world: VoxelWorld;

  beforeEach(() => {
    world = new VoxelWorld({
      worldSizeX: 16,
      worldSizeZ: 16,
      worldHeight: 32,
    });
    // Create ground plane of stone blocks at y=0
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        world.setBlock(x, 0, z, 'stone');
      }
    }

    player = new Player({
      initialPosition: new Vector3D(8, 2, 8),
    });
  });

  it('Given initial position, When spawned, Then player sits at expected coordinates and has eye height', () => {
    expect(player.position.x).toBe(8);
    expect(player.position.y).toBe(2);
    expect(player.position.z).toBe(8);
    expect(player.getEyePosition().y).toBeCloseTo(2 + 1.62, 2);
  });

  it('Given player in mid-air, When gravity updates, Then player falls until hitting ground', () => {
    // Air at y=2, ground at y=0, block top is at y=1.
    // So player bottom should settle onto y=1
    for (let i = 0; i < 20; i++) {
      player.update(0.05, world, {
        forward: 0,
        right: 0,
        jump: false,
        sneak: false,
        fly: false,
      });
    }

    expect(player.onGround).toBe(true);
    expect(player.position.y).toBeCloseTo(1, 1);
  });

  it('Given player on ground, When jump input is triggered, Then upward velocity is applied', () => {
    // Place player directly on ground
    player.position = new Vector3D(8, 1, 8);
    player.onGround = true;

    player.update(0.016, world, {
      forward: 0,
      right: 0,
      jump: true,
      sneak: false,
      fly: false,
    });

    expect(player.velocity.y).toBeGreaterThan(0);
    expect(player.onGround).toBe(false);
  });

  it('Given player walking forward, When obstacle is ahead, Then collision prevents walking through wall', () => {
    // Set player on ground at (8, 1, 8)
    player.position = new Vector3D(8, 1, 8);
    // Wall at (8, 1, 9)
    world.setBlock(8, 1, 9, 'stone');
    world.setBlock(8, 2, 9, 'stone');

    // Walk forward (+Z direction, yaw=0)
    for (let i = 0; i < 15; i++) {
      player.update(0.05, world, {
        forward: 1,
        right: 0,
        jump: false,
        sneak: false,
        fly: false,
      });
    }

    // Player z should not exceed 8.7 (since block starts at 9 and player half-width is 0.3)
    expect(player.position.z).toBeLessThan(9.0);
  });

  it('Given flying mode enabled, When moving, Then player ignores gravity', () => {
    player.isFlying = true;
    player.position = new Vector3D(8, 10, 8);
    player.update(0.1, world, {
      forward: 0,
      right: 0,
      jump: false,
      sneak: false,
      fly: true,
    });

    expect(player.position.y).toBe(10);
  });
});
