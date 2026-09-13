import { describe, it, expect } from 'vitest';
import {
  IslandProfileSchema,
  AvatarProfileSchema,
  DEFAULT_ISLAND_PROFILE,
  DEFAULT_AVATAR_PROFILE,
  AVATAR_PRESETS,
} from './islandAvatarSchemas';
import { VoxelWorld } from './voxelWorld';
import { Player } from './player';
import { Vector3D } from './valueObjects';

describe('Island Profile Domain (BDD & TDD)', () => {
  it('Given valid island data, When parsed, Then succeeds with trimmed name', () => {
    const data = {
      name: '  エメラルド島  ',
      creatorName: '冒険者',
      biome: 'plains',
    };
    const parsed = IslandProfileSchema.parse(data);
    expect(parsed.name).toBe('エメラルド島');
    expect(parsed.creatorName).toBe('冒険者');
    expect(parsed.biome).toBe('plains');
  });

  it('Given empty name, When parsed, Then falls back to default island name', () => {
    const data = {
      name: '',
      creatorName: '',
    };
    const parsed = IslandProfileSchema.parse(data);
    expect(parsed.name).toBe(DEFAULT_ISLAND_PROFILE.name);
  });
});

describe('Avatar Profile Domain (BDD & TDD)', () => {
  it('Given default avatar profile, When inspected, Then has complete visual definitions', () => {
    expect(DEFAULT_AVATAR_PROFILE.skinColor).toBeDefined();
    expect(DEFAULT_AVATAR_PROFILE.shirtColor).toBeDefined();
    expect(DEFAULT_AVATAR_PROFILE.pantsColor).toBeDefined();
    expect(DEFAULT_AVATAR_PROFILE.hairStyle).toBe('short');
    expect(DEFAULT_AVATAR_PROFILE.accessory).toBe('none');
  });

  it('Given avatar preset, When selected, Then parses correctly through AvatarProfileSchema', () => {
    const stevePreset = AVATAR_PRESETS.steve;
    const parsed = AvatarProfileSchema.parse(stevePreset);
    expect(parsed.shirtColor).toBe('#00aaaa');

    const alexPreset = AVATAR_PRESETS.alex;
    expect(alexPreset.hairColor).toBe('#b54f15');
  });

  it('Given custom character name, When parsed, Then saves trimmed name or defaults on empty', () => {
    const custom = AvatarProfileSchema.parse({
      ...DEFAULT_AVATAR_PROFILE,
      name: '  マインマスター  ',
    });
    expect(custom.name).toBe('マインマスター');

    const emptyName = AvatarProfileSchema.parse({
      ...DEFAULT_AVATAR_PROFILE,
      name: '   ',
    });
    expect(emptyName.name).toBe(DEFAULT_AVATAR_PROFILE.name);
  });

  it('Given block customization, When parts are set to voxel blocks, Then parses correctly', () => {
    const blockAvatar = AvatarProfileSchema.parse({
      ...DEFAULT_AVATAR_PROFILE,
      name: 'ダイヤゴーレム',
      headBlock: 'diamond',
      bodyBlock: 'gold',
      armsBlock: 'tnt',
      legsBlock: 'obsidian',
    });

    expect(blockAvatar.headBlock).toBe('diamond');
    expect(blockAvatar.bodyBlock).toBe('gold');
    expect(blockAvatar.armsBlock).toBe('tnt');
    expect(blockAvatar.legsBlock).toBe('obsidian');
  });

  it('Given block avatar presets, When loaded, Then all presets have valid block definitions', () => {
    expect(AVATAR_PRESETS.diamond_knight).toBeDefined();
    expect(AVATAR_PRESETS.diamond_knight.headBlock).toBe('diamond');
    expect(AVATAR_PRESETS.tnt_bomber).toBeDefined();
    expect(AVATAR_PRESETS.tnt_bomber.headBlock).toBe('tnt');
    expect(AVATAR_PRESETS.gold_golem).toBeDefined();
    expect(AVATAR_PRESETS.gold_golem.bodyBlock).toBe('gold');
    expect(AVATAR_PRESETS.forest_spirit).toBeDefined();
    expect(AVATAR_PRESETS.forest_spirit.headBlock).toBe('leaves');
  });
});

describe('Continuous Ground & Fall Safeguard (BDD & TDD)', () => {
  it('Given voxel world, When checking floor at y <= 0, Then returns solid block so player cannot drop to void', () => {
    const world = new VoxelWorld({ worldSizeX: 40, worldSizeZ: 40, worldHeight: 32 });
    // Bottom bedrock layer should always be solid
    expect(world.getBlock(20, 0, 20)).not.toBe('air');
    // Even beyond island border at ground level, there is solid bedrock base
    expect(world.getSafeguardBlock(50, 0, 50)).toBe('stone');
  });

  it('Given player falling off edge into void, When updated, Then triggers safe respawn to island surface', () => {
    const world = new VoxelWorld({ worldSizeX: 40, worldSizeZ: 40, worldHeight: 32 });
    // place a ground block at center
    world.setBlock(20, 5, 20, 'grass');

    const player = new Player({
      initialPosition: new Vector3D(100, -10, 100), // way off bounds in the void
    });

    player.setSafeSpawn(new Vector3D(20, 7, 20));
    player.update(0.1, world, { forward: 0, right: 0, jump: false, sneak: false, fly: false });

    // Should have respawned safely at or near safeSpawn
    expect(player.position.y).toBeGreaterThanOrEqual(5);
    expect(player.position.x).toBe(20);
    expect(player.position.z).toBe(20);
  });
});
