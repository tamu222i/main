import * as THREE from 'three';
import { Vector3D } from '../domain/valueObjects';

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
}

export class SceneManager {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;

  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private hemisphereLight: THREE.HemisphereLight;
  private targetBoxMesh: THREE.LineSegments;

  private isDay: boolean = true;
  private timeOfDay: number = 0.25; // 0 to 1, 0.25 is noon

  constructor(options: SceneManagerOptions) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x78a7ff); // Minecraft sky blue
    this.scene.fog = new THREE.FogExp2(0x78a7ff, 0.02);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0x78a7ff, 0x5c4228, 0.35);
    this.scene.add(this.hemisphereLight);

    this.dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    this.dirLight.position.set(40, 60, 30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 150;
    const d = 30;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // Target Block Outline (1.002 cube wireframe)
    const boxGeo = new THREE.BoxGeometry(1.004, 1.004, 1.004);
    const wireGeo = new THREE.EdgesGeometry(boxGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
    });
    this.targetBoxMesh = new THREE.LineSegments(wireGeo, wireMat);
    this.targetBoxMesh.visible = false;
    this.scene.add(this.targetBoxMesh);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setTargetHighlight(targetPos: Vector3D | null): void {
    if (!targetPos) {
      this.targetBoxMesh.visible = false;
    } else {
      this.targetBoxMesh.visible = true;
      // Center of 1x1x1 voxel [x, x+1] is x + 0.5
      this.targetBoxMesh.position.set(
        targetPos.x + 0.5,
        targetPos.y + 0.5,
        targetPos.z + 0.5
      );
    }
  }

  setDayNight(isDay: boolean): void {
    this.isDay = isDay;
    if (isDay) {
      this.scene.background = new THREE.Color(0x78a7ff);
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(0x78a7ff);
      }
      this.dirLight.intensity = 1.2;
      this.dirLight.color.setHex(0xfff5e6);
      this.ambientLight.intensity = 0.45;
    } else {
      this.scene.background = new THREE.Color(0x0a0e1a); // Night sky
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(0x0a0e1a);
      }
      this.dirLight.intensity = 0.25;
      this.dirLight.color.setHex(0x6080cc);
      this.ambientLight.intensity = 0.18;
    }
  }

  toggleDayNight(): boolean {
    this.setDayNight(!this.isDay);
    return this.isDay;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
