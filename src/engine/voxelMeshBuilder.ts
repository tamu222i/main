import * as THREE from 'three';
import { VoxelWorld } from '../domain/voxelWorld';
import { BlockType, BLOCK_PROPERTIES } from '../domain/schemas';
import { TextureAtlasManager } from './textureAtlas';

interface FaceData {
  dir: [number, number, number];
  corners: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ];
}

const FACES: Record<string, FaceData> = {
  right: {
    dir: [1, 0, 0],
    corners: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 0],
      [1, 1, 0],
    ],
  },
  left: {
    dir: [-1, 0, 0],
    corners: [
      [0, 1, 0],
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
    ],
  },
  top: {
    dir: [0, 1, 0],
    corners: [
      [0, 1, 0],
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ],
  },
  bottom: {
    dir: [0, -1, 0],
    corners: [
      [0, 0, 1],
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
    ],
  },
  front: {
    dir: [0, 0, 1],
    corners: [
      [0, 1, 1],
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
  },
  back: {
    dir: [0, 0, -1],
    corners: [
      [1, 1, 0],
      [1, 0, 0],
      [0, 0, 0],
      [0, 1, 0],
    ],
  },
};

export class VoxelMeshBuilder {
  private atlas: TextureAtlasManager;

  constructor(atlas: TextureAtlasManager) {
    this.atlas = atlas;
  }

  buildWorldMeshes(world: VoxelWorld): THREE.Group {
    const group = new THREE.Group();
    const { worldSizeX, worldSizeZ, worldHeight } = world.config;

    // Separate geometry buffers per block type for material efficiency
    const blockPositions: Map<BlockType, number[]> = new Map();
    const blockNormals: Map<BlockType, number[]> = new Map();
    const blockUVs: Map<BlockType, number[]> = new Map();
    const blockIndices: Map<BlockType, number[]> = new Map();

    const getArrays = (type: BlockType) => {
      if (!blockPositions.has(type)) {
        blockPositions.set(type, []);
        blockNormals.set(type, []);
        blockUVs.set(type, []);
        blockIndices.set(type, []);
      }
      return {
        positions: blockPositions.get(type)!,
        normals: blockNormals.get(type)!,
        uvs: blockUVs.get(type)!,
        indices: blockIndices.get(type)!,
      };
    };

    for (let y = 0; y < worldHeight; y++) {
      for (let z = 0; z < worldSizeZ; z++) {
        for (let x = 0; x < worldSizeX; x++) {
          const block = world.getBlock(x, y, z);
          if (block === 'air') continue;

          // Special rendering for flower (cross-quad)
          if (block === 'flower') {
            this.buildFlowerGeometry(x, y, z, getArrays('flower'));
            continue;
          }

          const { positions, normals, uvs, indices } = getArrays(block);
          const isTransparentBlock = BLOCK_PROPERTIES[block]?.isTransparent;

          // Check all 6 faces for culling
          for (const faceKey of Object.keys(FACES)) {
            const face = FACES[faceKey];
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            const neighbor = world.getBlock(nx, ny, nz);

            let shouldRenderFace = false;
            if (neighbor === 'air') {
              shouldRenderFace = true;
            } else if (BLOCK_PROPERTIES[neighbor]?.isTransparent) {
              if (neighbor !== block) {
                shouldRenderFace = true;
              }
            }

            if (!shouldRenderFace) continue;

            const baseIndex = positions.length / 3;

            // 4 corners of face
            for (const corner of face.corners) {
              positions.push(x + corner[0], y + corner[1], z + corner[2]);
              normals.push(face.dir[0], face.dir[1], face.dir[2]);
            }

            // Standard UV coordinates for a 1x1 quad
            uvs.push(0, 1);
            uvs.push(0, 0);
            uvs.push(1, 0);
            uvs.push(1, 1);

            // 2 Triangles: (0, 1, 2) and (0, 2, 3)
            indices.push(
              baseIndex,
              baseIndex + 1,
              baseIndex + 2,
              baseIndex,
              baseIndex + 2,
              baseIndex + 3
            );
          }
        }
      }
    }

    // Convert vertex arrays to Three.js BufferGeometries
    for (const [blockType, positions] of blockPositions.entries()) {
      if (positions.length === 0) continue;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(blockNormals.get(blockType)!, 3)
      );
      geometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(blockUVs.get(blockType)!, 2)
      );
      geometry.setIndex(blockIndices.get(blockType)!);

      const material = this.atlas.getBlockMaterial(blockType);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = !BLOCK_PROPERTIES[blockType]?.isTransparent;
      mesh.receiveShadow = true;
      mesh.name = `voxel_${blockType}`;

      group.add(mesh);
    }

    return group;
  }

  private buildFlowerGeometry(
    x: number,
    y: number,
    z: number,
    arrays: { positions: number[]; normals: number[]; uvs: number[]; indices: number[] }
  ): void {
    const { positions, normals, uvs, indices } = arrays;

    // Cross quad 1: diagonal from (0,0) to (1,1)
    let base = positions.length / 3;
    positions.push(
      x, y, z,
      x + 1, y, z + 1,
      x + 1, y + 1, z + 1,
      x, y + 1, z
    );
    for (let i = 0; i < 4; i++) normals.push(0, 1, 0);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);

    // Cross quad 2: diagonal from (1,0) to (0,1)
    base = positions.length / 3;
    positions.push(
      x + 1, y, z,
      x, y, z + 1,
      x, y + 1, z + 1,
      x + 1, y + 1, z
    );
    for (let i = 0; i < 4; i++) normals.push(0, 1, 0);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}
