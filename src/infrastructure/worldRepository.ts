import { VoxelWorld } from '../domain/voxelWorld';
import {
  IslandProfile,
  IslandProfileSchema,
  DEFAULT_ISLAND_PROFILE,
  AvatarProfile,
  AvatarProfileSchema,
  DEFAULT_AVATAR_PROFILE,
} from '../domain/islandAvatarSchemas';

export class WorldRepository {
  private storage: Storage;
  private readonly STORAGE_PREFIX = 'minecraft_web_world_';
  private readonly ISLAND_PROFILE_KEY = 'minecraft_island_profile';
  private readonly AVATAR_PROFILE_KEY = 'minecraft_avatar_profile';

  constructor(storage?: Storage) {
    if (storage) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      // Memory fallback for tests or server environments
      const map = new Map<string, string>();
      this.storage = {
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => map.set(k, v),
        removeItem: (k: string) => map.delete(k),
        clear: () => map.clear(),
        key: (i: number) => Array.from(map.keys())[i] ?? null,
        length: map.size,
      };
    }
  }

  saveWorld(slotId: string, world: VoxelWorld): boolean {
    try {
      const exported = world.exportData();
      const payload = JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        ...exported,
      });
      this.storage.setItem(`${this.STORAGE_PREFIX}${slotId}`, payload);
      return true;
    } catch (err) {
      console.error('Failed to save world to storage:', err);
      return false;
    }
  }

  loadWorld(slotId: string, world: VoxelWorld): boolean {
    try {
      const raw = this.storage.getItem(`${this.STORAGE_PREFIX}${slotId}`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data) return false;
      return world.importData(parsed.data);
    } catch (err) {
      console.error('Failed to load world from storage:', err);
      return false;
    }
  }

  hasSavedWorld(slotId: string): boolean {
    return this.storage.getItem(`${this.STORAGE_PREFIX}${slotId}`) !== null;
  }

  deleteWorld(slotId: string): void {
    this.storage.removeItem(`${this.STORAGE_PREFIX}${slotId}`);
  }

  saveIslandProfile(profile: IslandProfile): boolean {
    try {
      this.storage.setItem(this.ISLAND_PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  loadIslandProfile(): IslandProfile {
    try {
      const raw = this.storage.getItem(this.ISLAND_PROFILE_KEY);
      if (!raw) return DEFAULT_ISLAND_PROFILE;
      return IslandProfileSchema.parse(JSON.parse(raw));
    } catch {
      return DEFAULT_ISLAND_PROFILE;
    }
  }

  saveAvatarProfile(profile: AvatarProfile): boolean {
    try {
      this.storage.setItem(this.AVATAR_PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  loadAvatarProfile(): AvatarProfile {
    try {
      const raw = this.storage.getItem(this.AVATAR_PROFILE_KEY);
      if (!raw) return DEFAULT_AVATAR_PROFILE;
      return AvatarProfileSchema.parse(JSON.parse(raw));
    } catch {
      return DEFAULT_AVATAR_PROFILE;
    }
  }
}

export const defaultWorldRepository = new WorldRepository();
