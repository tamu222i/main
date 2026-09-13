import * as THREE from 'three';
import { AvatarProfile, AvatarBlockType } from '../domain/islandAvatarSchemas';
import { BlockType } from '../domain/schemas';
import { defaultTextureAtlas, TextureAtlasManager } from './textureAtlas';

export class AvatarModel {
  readonly root: THREE.Group;
  private headGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private accessoryGroup: THREE.Group;
  private atlas: TextureAtlasManager;

  private animTime = 0;
  private isSwinging = false;
  private swingProgress = 0;

  constructor(profile: AvatarProfile, atlas?: TextureAtlasManager) {
    this.atlas = atlas ?? defaultTextureAtlas;
    this.root = new THREE.Group();

    this.headGroup = new THREE.Group();
    this.torsoGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.rightArmGroup = new THREE.Group();
    this.leftLegGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();
    this.accessoryGroup = new THREE.Group();

    this.root.add(this.torsoGroup);
    this.root.add(this.headGroup);
    this.root.add(this.leftArmGroup);
    this.root.add(this.rightArmGroup);
    this.root.add(this.leftLegGroup);
    this.root.add(this.rightLegGroup);
    this.headGroup.add(this.accessoryGroup);

    this.buildMeshes(profile);
  }

  private getBlockOrColorMaterial(
    blockType: AvatarBlockType | undefined,
    fallbackMat: THREE.Material
  ): { material: THREE.Material | THREE.Material[]; isShared: boolean } {
    if (blockType && blockType !== 'none') {
      try {
        const mat = this.atlas.getBlockMaterial(blockType as BlockType);
        if (mat) {
          return { material: mat, isShared: true };
        }
      } catch {
        // fallback
      }
    }
    return { material: fallbackMat, isShared: false };
  }

  buildMeshes(profile: AvatarProfile): void {
    // Clear existing children
    const clearGroup = (g: THREE.Group) => {
      while (g.children.length > 0) {
        const obj = g.children[0];
        g.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (!obj.userData?.isSharedMaterial) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        }
      }
    };

    clearGroup(this.headGroup);
    clearGroup(this.torsoGroup);
    clearGroup(this.leftArmGroup);
    clearGroup(this.rightArmGroup);
    clearGroup(this.leftLegGroup);
    clearGroup(this.rightLegGroup);
    clearGroup(this.accessoryGroup);

    // Colors
    const skinMat = new THREE.MeshLambertMaterial({ color: profile.skinColor });
    const hairMat = new THREE.MeshLambertMaterial({ color: profile.hairColor });
    const eyeMat = new THREE.MeshLambertMaterial({ color: profile.eyeColor });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const shirtMat = new THREE.MeshLambertMaterial({ color: profile.shirtColor });
    const pantsMat = new THREE.MeshLambertMaterial({ color: profile.pantsColor });
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x1c1917 });
    const accMat = new THREE.MeshLambertMaterial({ color: profile.accessoryColor });

    // Block materials
    const headBlockMat = this.getBlockOrColorMaterial(profile.headBlock, skinMat);
    const bodyBlockMat = this.getBlockOrColorMaterial(profile.bodyBlock, shirtMat);
    const armsBlockMat = this.getBlockOrColorMaterial(profile.armsBlock, shirtMat);
    const legsBlockMat = this.getBlockOrColorMaterial(profile.legsBlock, pantsMat);

    const isBlockHead = profile.headBlock && profile.headBlock !== 'none';
    const isBlockArms = profile.armsBlock && profile.armsBlock !== 'none';
    const isBlockLegs = profile.legsBlock && profile.legsBlock !== 'none';

    // 1. Head (0.5 x 0.5 x 0.5) at y = 1.45
    this.headGroup.position.set(0, 1.45, 0);
    const headGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const headMesh = new THREE.Mesh(headGeo, headBlockMat.material);
    headMesh.userData = { isSharedMaterial: headBlockMat.isShared };
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // If head is not a block, render custom hair style
    if (!isBlockHead) {
      const hairTopGeo = new THREE.BoxGeometry(0.50, 0.12, 0.50);
      const hairTopMesh = new THREE.Mesh(hairTopGeo, hairMat);
      hairTopMesh.position.set(0, 0.2, 0);
      this.headGroup.add(hairTopMesh);

      const hairBackGeo = new THREE.BoxGeometry(0.50, 0.32, 0.12);
      const hairBackMesh = new THREE.Mesh(hairBackGeo, hairMat);
      hairBackMesh.position.set(0, 0.08, 0.2);
      this.headGroup.add(hairBackMesh);

      if (profile.hairStyle === 'spiky') {
        const spikeGeo = new THREE.BoxGeometry(0.3, 0.14, 0.3);
        const spikeMesh = new THREE.Mesh(spikeGeo, hairMat);
        spikeMesh.position.set(0, 0.28, -0.05);
        this.headGroup.add(spikeMesh);
      } else if (profile.hairStyle === 'ponytail') {
        const ponyGeo = new THREE.BoxGeometry(0.16, 0.35, 0.16);
        const ponyMesh = new THREE.Mesh(ponyGeo, hairMat);
        ponyMesh.position.set(0, 0.0, 0.32);
        this.headGroup.add(ponyMesh);
      } else if (profile.hairStyle === 'afro') {
        const afroGeo = new THREE.BoxGeometry(0.58, 0.25, 0.58);
        const afroMesh = new THREE.Mesh(afroGeo, hairMat);
        afroMesh.position.set(0, 0.22, 0);
        this.headGroup.add(afroMesh);
      }
    }

    // Eyes: front is -Z
    const eyeWhiteGeo = new THREE.BoxGeometry(0.08, 0.06, 0.02);
    const eyePupilGeo = new THREE.BoxGeometry(0.05, 0.06, 0.025);

    // Left eye (viewer's left = character's right)
    const leftWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
    leftWhite.position.set(-0.11, 0.02, -0.245);
    this.headGroup.add(leftWhite);

    const leftPupil = new THREE.Mesh(eyePupilGeo, eyeMat);
    leftPupil.position.set(-0.09, 0.02, -0.248);
    this.headGroup.add(leftPupil);

    // Right eye
    const rightWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
    rightWhite.position.set(0.11, 0.02, -0.245);
    this.headGroup.add(rightWhite);

    const rightPupil = new THREE.Mesh(eyePupilGeo, eyeMat);
    rightPupil.position.set(0.09, 0.02, -0.248);
    this.headGroup.add(rightPupil);

    // Accessories
    this.headGroup.add(this.accessoryGroup);
    if (profile.accessory === 'crown') {
      const crownBase = new THREE.BoxGeometry(0.52, 0.08, 0.52);
      const crownBaseMesh = new THREE.Mesh(crownBase, accMat);
      crownBaseMesh.position.set(0, 0.26, 0);
      this.accessoryGroup.add(crownBaseMesh);

      const crownPointGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const crownPoint1 = new THREE.Mesh(crownPointGeo, accMat);
      crownPoint1.position.set(0, 0.32, -0.22);
      this.accessoryGroup.add(crownPoint1);
      const crownPoint2 = new THREE.Mesh(crownPointGeo, accMat);
      crownPoint2.position.set(-0.2, 0.32, 0);
      this.accessoryGroup.add(crownPoint2);
      const crownPoint3 = new THREE.Mesh(crownPointGeo, accMat);
      crownPoint3.position.set(0.2, 0.32, 0);
      this.accessoryGroup.add(crownPoint3);
    } else if (profile.accessory === 'miner_helmet') {
      const helmetGeo = new THREE.BoxGeometry(0.54, 0.16, 0.54);
      const helmetMesh = new THREE.Mesh(helmetGeo, accMat);
      helmetMesh.position.set(0, 0.24, 0);
      this.accessoryGroup.add(helmetMesh);

      const lampGeo = new THREE.BoxGeometry(0.12, 0.1, 0.08);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lampMesh = new THREE.Mesh(lampGeo, lampMat);
      lampMesh.position.set(0, 0.24, -0.28);
      this.accessoryGroup.add(lampMesh);
    } else if (profile.accessory === 'glasses') {
      const glassGeo = new THREE.BoxGeometry(0.36, 0.08, 0.04);
      const glassMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, 0.02, -0.26);
      this.accessoryGroup.add(glassMesh);
    } else if (profile.accessory === 'cat_ears') {
      const earGeo = new THREE.BoxGeometry(0.12, 0.16, 0.1);
      const leftEar = new THREE.Mesh(earGeo, accMat);
      leftEar.position.set(-0.2, 0.32, 0);
      this.accessoryGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeo, accMat);
      rightEar.position.set(0.2, 0.32, 0);
      this.accessoryGroup.add(rightEar);
    } else if (profile.accessory === 'headphones') {
      const bandGeo = new THREE.BoxGeometry(0.54, 0.06, 0.1);
      const bandMesh = new THREE.Mesh(bandGeo, accMat);
      bandMesh.position.set(0, 0.28, 0);
      this.accessoryGroup.add(bandMesh);

      const cupGeo = new THREE.BoxGeometry(0.08, 0.16, 0.16);
      const leftCup = new THREE.Mesh(cupGeo, accMat);
      leftCup.position.set(-0.27, 0.1, 0);
      this.accessoryGroup.add(leftCup);

      const rightCup = new THREE.Mesh(cupGeo, accMat);
      rightCup.position.set(0.27, 0.1, 0);
      this.accessoryGroup.add(rightCup);
    }

    // 2. Torso (0.46 x 0.65 x 0.24) at y = 0.88
    this.torsoGroup.position.set(0, 0.88, 0);
    const torsoGeo = new THREE.BoxGeometry(0.46, 0.65, 0.24);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyBlockMat.material);
    torsoMesh.userData = { isSharedMaterial: bodyBlockMat.isShared };
    torsoMesh.castShadow = true;
    this.torsoGroup.add(torsoMesh);

    // 3. Left Arm (pivot at shoulder: y = 1.15)
    this.leftArmGroup.position.set(-0.35, 1.15, 0);
    const armGeoUpper = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const leftArmUpper = new THREE.Mesh(armGeoUpper, armsBlockMat.material);
    leftArmUpper.userData = { isSharedMaterial: armsBlockMat.isShared };
    leftArmUpper.position.set(0, -0.2, 0);
    leftArmUpper.castShadow = true;
    this.leftArmGroup.add(leftArmUpper);

    const armGeoLower = new THREE.BoxGeometry(0.19, 0.25, 0.19);
    const leftArmLower = new THREE.Mesh(
      armGeoLower,
      isBlockArms ? armsBlockMat.material : skinMat
    );
    leftArmLower.userData = { isSharedMaterial: isBlockArms ? armsBlockMat.isShared : false };
    leftArmLower.position.set(0, -0.5, 0);
    leftArmLower.castShadow = true;
    this.leftArmGroup.add(leftArmLower);

    // 4. Right Arm (pivot at shoulder: y = 1.15)
    this.rightArmGroup.position.set(0.35, 1.15, 0);
    const rightArmUpper = new THREE.Mesh(armGeoUpper, armsBlockMat.material);
    rightArmUpper.userData = { isSharedMaterial: armsBlockMat.isShared };
    rightArmUpper.position.set(0, -0.2, 0);
    rightArmUpper.castShadow = true;
    this.rightArmGroup.add(rightArmUpper);

    const rightArmLower = new THREE.Mesh(
      armGeoLower,
      isBlockArms ? armsBlockMat.material : skinMat
    );
    rightArmLower.userData = { isSharedMaterial: isBlockArms ? armsBlockMat.isShared : false };
    rightArmLower.position.set(0, -0.5, 0);
    rightArmLower.castShadow = true;
    this.rightArmGroup.add(rightArmLower);

    // 5. Left Leg (pivot at hip: y = 0.58)
    this.leftLegGroup.position.set(-0.12, 0.58, 0);
    const legGeo = new THREE.BoxGeometry(0.21, 0.45, 0.22);
    const leftLegMesh = new THREE.Mesh(legGeo, legsBlockMat.material);
    leftLegMesh.userData = { isSharedMaterial: legsBlockMat.isShared };
    leftLegMesh.position.set(0, -0.22, 0);
    leftLegMesh.castShadow = true;
    this.leftLegGroup.add(leftLegMesh);

    const shoeGeo = new THREE.BoxGeometry(0.22, 0.13, 0.23);
    const leftShoe = new THREE.Mesh(
      shoeGeo,
      isBlockLegs ? legsBlockMat.material : shoesMat
    );
    leftShoe.userData = { isSharedMaterial: isBlockLegs ? legsBlockMat.isShared : false };
    leftShoe.position.set(0, -0.51, 0);
    this.leftLegGroup.add(leftShoe);

    // 6. Right Leg (pivot at hip: y = 0.58)
    this.rightLegGroup.position.set(0.12, 0.58, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legsBlockMat.material);
    rightLegMesh.userData = { isSharedMaterial: legsBlockMat.isShared };
    rightLegMesh.position.set(0, -0.22, 0);
    rightLegMesh.castShadow = true;
    this.rightLegGroup.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(
      shoeGeo,
      isBlockLegs ? legsBlockMat.material : shoesMat
    );
    rightShoe.userData = { isSharedMaterial: isBlockLegs ? legsBlockMat.isShared : false };
    rightShoe.position.set(0, -0.51, 0);
    this.rightLegGroup.add(rightShoe);
  }

  triggerMineSwing(): void {
    this.isSwinging = true;
    this.swingProgress = 0;
  }

  update(dt: number, isMoving: boolean, isFlying: boolean): void {
    if (isMoving && !isFlying) {
      this.animTime += dt * 10;
      const legAngle = Math.sin(this.animTime) * 0.6;
      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;

      if (!this.isSwinging) {
        this.leftArmGroup.rotation.x = -legAngle * 0.8;
        this.rightArmGroup.rotation.x = legAngle * 0.8;
      }
    } else if (isFlying) {
      // Gentle flying hover
      this.animTime += dt * 3;
      this.leftLegGroup.rotation.x = 0.25 + Math.sin(this.animTime) * 0.05;
      this.rightLegGroup.rotation.x = 0.25 - Math.sin(this.animTime) * 0.05;
      if (!this.isSwinging) {
        this.leftArmGroup.rotation.x = -0.3;
        this.rightArmGroup.rotation.x = -0.3;
      }
    } else {
      // Idle return to neutral
      this.leftLegGroup.rotation.x *= 0.8;
      this.rightLegGroup.rotation.x *= 0.8;
      if (!this.isSwinging) {
        this.leftArmGroup.rotation.x *= 0.8;
        this.rightArmGroup.rotation.x *= 0.8;
      }
    }

    // Mining swing animation on right arm
    if (this.isSwinging) {
      this.swingProgress += dt * 12;
      this.rightArmGroup.rotation.x = -Math.sin(this.swingProgress * Math.PI) * 1.2;
      if (this.swingProgress >= 1) {
        this.isSwinging = false;
        this.swingProgress = 0;
      }
    }
  }

  dispose(): void {
    const disposeObj = (obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
      obj.children.forEach(disposeObj);
    };
    disposeObj(this.root);
  }
}
