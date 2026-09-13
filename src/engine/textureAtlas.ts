import * as THREE from 'three';
import { BlockType } from '../domain/schemas';

/**
 * Procedural 16x16 pixel-art Minecraft textures generator using HTML5 Canvas.
 * Generates razor-sharp textures using NearestFilter.
 */

export interface BlockTextures {
  top: THREE.CanvasTexture;
  bottom: THREE.CanvasTexture;
  side: THREE.CanvasTexture;
  isTransparent?: boolean;
}

export class TextureAtlasManager {
  private textures: Map<string, THREE.CanvasTexture> = new Map();
  private blockMaterialCache: Map<BlockType, THREE.Material | THREE.Material[]> = new Map();

  constructor() {
    this.generateAllTextures();
  }

  private createCanvas(size: number = 16): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    return [canvas, ctx];
  }

  private makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private generateAllTextures(): void {
    if (typeof document === 'undefined') return;

    // 1. Dirt Texture
    const [dirtCanvas, dirtCtx] = this.createCanvas(16);
    dirtCtx.fillStyle = '#866043';
    dirtCtx.fillRect(0, 0, 16, 16);
    // Add dirt grain noise
    const dirtSpecks = ['#6e4c34', '#997050', '#5c3e29', '#78543a'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x * 7 + y * 13 + (x ^ y)) % 3 === 0) {
          dirtCtx.fillStyle = dirtSpecks[(x * 3 + y * 5) % dirtSpecks.length];
          dirtCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('dirt', this.makeTexture(dirtCanvas));

    // 2. Grass Top Texture
    const [grassTopCanvas, grassTopCtx] = this.createCanvas(16);
    grassTopCtx.fillStyle = '#5c8e32';
    grassTopCtx.fillRect(0, 0, 16, 16);
    const grassGreens = ['#4f7a2b', '#6ba13a', '#436824', '#72ac3f'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x * 5 + y * 11) % 2 === 0) {
          grassTopCtx.fillStyle = grassGreens[(x + y * 3) % grassGreens.length];
          grassTopCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('grass_top', this.makeTexture(grassTopCanvas));

    // 3. Grass Side Texture
    const [grassSideCanvas, grassSideCtx] = this.createCanvas(16);
    // base dirt
    grassSideCtx.drawImage(dirtCanvas, 0, 0);
    // Green fringe on top
    grassSideCtx.fillStyle = '#5c8e32';
    grassSideCtx.fillRect(0, 0, 16, 3);
    // Drooping grass blades
    const droopPattern = [1, 2, 0, 2, 3, 1, 0, 2, 3, 1, 2, 0, 3, 1, 2, 1];
    for (let x = 0; x < 16; x++) {
      const drop = droopPattern[x];
      grassSideCtx.fillStyle = grassGreens[x % grassGreens.length];
      for (let dy = 0; dy <= drop; dy++) {
        grassSideCtx.fillRect(x, 2 + dy, 1, 1);
      }
    }
    this.textures.set('grass_side', this.makeTexture(grassSideCanvas));

    // 4. Stone Texture
    const [stoneCanvas, stoneCtx] = this.createCanvas(16);
    stoneCtx.fillStyle = '#828282';
    stoneCtx.fillRect(0, 0, 16, 16);
    const stoneSpecks = ['#6e6e6e', '#969696', '#595959', '#757575'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x * 11 + y * 17) % 3 === 0) {
          stoneCtx.fillStyle = stoneSpecks[(x * 2 + y * 7) % stoneSpecks.length];
          stoneCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('stone', this.makeTexture(stoneCanvas));

    // 5. Cobblestone Texture
    const [cobbleCanvas, cobbleCtx] = this.createCanvas(16);
    cobbleCtx.fillStyle = '#7a7a7a';
    cobbleCtx.fillRect(0, 0, 16, 16);
    // Dark mortar cracks
    cobbleCtx.fillStyle = '#404040';
    for (let i = 0; i < 16; i += 4) {
      cobbleCtx.fillRect(0, i, 16, 1);
      cobbleCtx.fillRect((i * 3) % 16, i, 1, 4);
    }
    const cobbleHighlights = ['#909090', '#606060', '#858585'];
    for (let x = 1; x < 15; x += 2) {
      for (let y = 1; y < 15; y += 2) {
        cobbleCtx.fillStyle = cobbleHighlights[(x + y) % cobbleHighlights.length];
        cobbleCtx.fillRect(x, y, 1, 1);
      }
    }
    this.textures.set('cobblestone', this.makeTexture(cobbleCanvas));

    // 6. Wood Bark (Side)
    const [woodSideCanvas, woodSideCtx] = this.createCanvas(16);
    woodSideCtx.fillStyle = '#6b4f2c';
    woodSideCtx.fillRect(0, 0, 16, 16);
    // Vertical dark bark fissures
    const barkDarks = ['#4a341b', '#3b2814', '#594022', '#7a5a34'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (x % 4 === 0 || (x % 4 === 1 && (y % 5 === 0 || y % 7 === 0))) {
          woodSideCtx.fillStyle = barkDarks[(x + y * 2) % barkDarks.length];
          woodSideCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('wood_side', this.makeTexture(woodSideCanvas));

    // 7. Wood Rings (Top/Bottom)
    const [woodTopCanvas, woodTopCtx] = this.createCanvas(16);
    woodTopCtx.fillStyle = '#a88656';
    woodTopCtx.fillRect(0, 0, 16, 16);
    // Outer bark border
    woodTopCtx.fillStyle = '#4a341b';
    woodTopCtx.fillRect(0, 0, 16, 2);
    woodTopCtx.fillRect(0, 14, 16, 2);
    woodTopCtx.fillRect(0, 0, 2, 16);
    woodTopCtx.fillRect(14, 0, 2, 16);
    // Tree ring circles
    woodTopCtx.fillStyle = '#8f6f41';
    woodTopCtx.strokeRect(3.5, 3.5, 9, 9);
    woodTopCtx.strokeRect(5.5, 5.5, 5, 5);
    woodTopCtx.fillRect(7, 7, 2, 2);
    this.textures.set('wood_top', this.makeTexture(woodTopCanvas));

    // 8. Leaves Texture (semi-transparent cutouts)
    const [leavesCanvas, leavesCtx] = this.createCanvas(16);
    leavesCtx.clearRect(0, 0, 16, 16);
    leavesCtx.fillStyle = '#387826';
    leavesCtx.fillRect(0, 0, 16, 16);
    const leafColors = ['#2f681f', '#448c2e', '#235216', '#4fa635'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x * 3 + y * 7) % 5 === 0) {
          // Transparent notch
          leavesCtx.clearRect(x, y, 1, 1);
        } else {
          leavesCtx.fillStyle = leafColors[(x * 2 + y) % leafColors.length];
          leavesCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('leaves', this.makeTexture(leavesCanvas));

    // 9. Planks Texture
    const [planksCanvas, planksCtx] = this.createCanvas(16);
    planksCtx.fillStyle = '#b8945f';
    planksCtx.fillRect(0, 0, 16, 16);
    // Horizontal slat lines
    planksCtx.fillStyle = '#7a5a32';
    planksCtx.fillRect(0, 3, 16, 1);
    planksCtx.fillRect(0, 7, 16, 1);
    planksCtx.fillRect(0, 11, 16, 1);
    planksCtx.fillRect(0, 15, 16, 1);
    // Vertical seams
    planksCtx.fillRect(7, 0, 1, 3);
    planksCtx.fillRect(12, 4, 1, 3);
    planksCtx.fillRect(4, 8, 1, 3);
    planksCtx.fillRect(10, 12, 1, 3);
    this.textures.set('planks', this.makeTexture(planksCanvas));

    // 10. Sand Texture
    const [sandCanvas, sandCtx] = this.createCanvas(16);
    sandCtx.fillStyle = '#ded195';
    sandCtx.fillRect(0, 0, 16, 16);
    const sandSpecks = ['#cfbf7e', '#ebdca0', '#c2b06e'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x * 9 + y * 13) % 2 === 0) {
          sandCtx.fillStyle = sandSpecks[(x + y * 4) % sandSpecks.length];
          sandCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('sand', this.makeTexture(sandCanvas));

    // 11. Glass Texture (Clear with pixel highlights)
    const [glassCanvas, glassCtx] = this.createCanvas(16);
    glassCtx.clearRect(0, 0, 16, 16);
    // Subtle translucent tint
    glassCtx.fillStyle = 'rgba(215, 240, 255, 0.25)';
    glassCtx.fillRect(0, 0, 16, 16);
    // Thin outer frame
    glassCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    glassCtx.strokeRect(0.5, 0.5, 15, 15);
    // Corner reflection glints
    glassCtx.fillRect(2, 2, 2, 1);
    glassCtx.fillRect(2, 3, 1, 2);
    glassCtx.fillRect(12, 11, 1, 2);
    glassCtx.fillRect(11, 12, 2, 1);
    this.textures.set('glass', this.makeTexture(glassCanvas));

    // 12. Brick Texture
    const [brickCanvas, brickCtx] = this.createCanvas(16);
    brickCtx.fillStyle = '#9c4c3b';
    brickCtx.fillRect(0, 0, 16, 16);
    // Mortar lines
    brickCtx.fillStyle = '#d6cbbe';
    brickCtx.fillRect(0, 3, 16, 1);
    brickCtx.fillRect(0, 7, 16, 1);
    brickCtx.fillRect(0, 11, 16, 1);
    brickCtx.fillRect(0, 15, 16, 1);
    brickCtx.fillRect(7, 0, 1, 3);
    brickCtx.fillRect(15, 0, 1, 3);
    brickCtx.fillRect(3, 4, 1, 3);
    brickCtx.fillRect(11, 4, 1, 3);
    brickCtx.fillRect(7, 8, 1, 3);
    brickCtx.fillRect(15, 8, 1, 3);
    brickCtx.fillRect(3, 12, 1, 3);
    brickCtx.fillRect(11, 12, 1, 3);
    this.textures.set('brick', this.makeTexture(brickCanvas));

    // 13. Water Texture
    const [waterCanvas, waterCtx] = this.createCanvas(16);
    waterCtx.fillStyle = 'rgba(40, 95, 210, 0.7)';
    waterCtx.fillRect(0, 0, 16, 16);
    waterCtx.fillStyle = 'rgba(80, 140, 245, 0.8)';
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x + y * 2) % 4 === 0) {
          waterCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.set('water', this.makeTexture(waterCanvas));

    // 14. Flower Texture
    const [flowerCanvas, flowerCtx] = this.createCanvas(16);
    flowerCtx.clearRect(0, 0, 16, 16);
    // Green stem
    flowerCtx.fillStyle = '#448c2e';
    flowerCtx.fillRect(7, 6, 2, 10);
    flowerCtx.fillRect(5, 9, 2, 2);
    flowerCtx.fillRect(9, 11, 2, 2);
    // Red poppy petals
    flowerCtx.fillStyle = '#d92727';
    flowerCtx.fillRect(5, 2, 6, 5);
    flowerCtx.fillStyle = '#f55151';
    flowerCtx.fillRect(6, 1, 4, 2);
    // Dark flower center
    flowerCtx.fillStyle = '#261b1b';
    flowerCtx.fillRect(7, 3, 2, 2);
    this.textures.set('flower', this.makeTexture(flowerCanvas));
  }

  getTexture(name: string): THREE.CanvasTexture | undefined {
    return this.textures.get(name);
  }

  /**
   * Returns Three.js Material (or 6 materials for [+X, -X, +Y, -Y, +Z, -Z])
   */
  getBlockMaterial(type: BlockType): THREE.Material | THREE.Material[] {
    if (this.blockMaterialCache.has(type)) {
      return this.blockMaterialCache.get(type)!;
    }

    let mat: THREE.Material | THREE.Material[];

    if (type === 'grass') {
      const top = this.textures.get('grass_top')!;
      const bottom = this.textures.get('dirt')!;
      const side = this.textures.get('grass_side')!;

      // BoxGeometry face order: +X, -X, +Y (top), -Y (bottom), +Z, -Z
      mat = [
        new THREE.MeshLambertMaterial({ map: side }),
        new THREE.MeshLambertMaterial({ map: side }),
        new THREE.MeshLambertMaterial({ map: top }),
        new THREE.MeshLambertMaterial({ map: bottom }),
        new THREE.MeshLambertMaterial({ map: side }),
        new THREE.MeshLambertMaterial({ map: side }),
      ];
    } else if (type === 'wood') {
      const side = this.textures.get('wood_side')!;
      const top = this.textures.get('wood_top')!;
      mat = [
        new THREE.MeshLambertMaterial({ map: side }),
        new THREE.MeshLambertMaterial({ map: side }),
        new THREE.MeshLambertMaterial({ map: top }),
        new THREE.MeshLambertMaterial({ map: top }),
        new THREE.MeshLambertMaterial({ map: side }),
        new THREE.MeshLambertMaterial({ map: side }),
      ];
    } else if (type === 'leaves') {
      const tex = this.textures.get('leaves')!;
      mat = new THREE.MeshLambertMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.1,
      });
    } else if (type === 'glass') {
      const tex = this.textures.get('glass')!;
      mat = new THREE.MeshLambertMaterial({
        map: tex,
        transparent: true,
        opacity: 0.85,
        depthWrite: true,
      });
    } else if (type === 'water') {
      const tex = this.textures.get('water')!;
      mat = new THREE.MeshLambertMaterial({
        map: tex,
        transparent: true,
        opacity: 0.65,
      });
    } else if (type === 'flower') {
      const tex = this.textures.get('flower')!;
      mat = new THREE.MeshLambertMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.2,
        side: THREE.DoubleSide,
      });
    } else {
      const tex = this.textures.get(type) ?? this.textures.get('stone')!;
      mat = new THREE.MeshLambertMaterial({ map: tex });
    }

    this.blockMaterialCache.set(type, mat);
    return mat;
  }
}
