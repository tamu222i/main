import { BlockType } from './schemas';
import { Vector3D, AABB } from './valueObjects';
import { VoxelWorld } from './voxelWorld';

export interface PlayerInput {
  forward: number; // -1 to 1
  right: number; // -1 to 1
  jump: boolean;
  sneak: boolean;
  fly: boolean;
}

export interface PlayerOptions {
  initialPosition?: Vector3D;
  walkSpeed?: number;
  runSpeed?: number;
  jumpVelocity?: number;
  gravity?: number;
}

export class Player {
  position: Vector3D;
  velocity: Vector3D;
  yaw: number = 0; // rotation around Y (in radians)
  pitch: number = 0; // rotation around X (in radians)
  onGround: boolean = false;
  isFlying: boolean = false;
  selectedBlock: BlockType = 'grass';
  health: number = 20;

  // Player dimensions (Minecraft standard)
  readonly width: number = 0.6;
  readonly height: number = 1.8;
  readonly eyeHeight: number = 1.62;

  // Physics constants
  readonly walkSpeed: number;
  readonly runSpeed: number;
  readonly jumpVelocity: number;
  readonly gravity: number;

  constructor(options: PlayerOptions = {}) {
    this.position = options.initialPosition ?? new Vector3D(0, 10, 0);
    this.velocity = new Vector3D(0, 0, 0);
    this.walkSpeed = options.walkSpeed ?? 4.3;
    this.runSpeed = options.runSpeed ?? 6.5;
    this.jumpVelocity = options.jumpVelocity ?? 8.5;
    this.gravity = options.gravity ?? 26.0;
  }

  getEyePosition(): Vector3D {
    return new Vector3D(
      this.position.x,
      this.position.y + this.eyeHeight,
      this.position.z
    );
  }

  getBoundingBox(pos: Vector3D = this.position): AABB {
    const halfWidth = this.width / 2;
    return new AABB(
      new Vector3D(pos.x - halfWidth, pos.y, pos.z - halfWidth),
      new Vector3D(pos.x + halfWidth, pos.y + this.height, pos.z + halfWidth)
    );
  }

  getDirection(): Vector3D {
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    // Three.js coordinates: Y is up, -Z is forward at yaw=0
    return new Vector3D(
      -sinYaw * cosPitch,
      sinPitch,
      -cosYaw * cosPitch
    ).normalize();
  }

  update(dt: number, world: VoxelWorld, input: PlayerInput): void {
    // Clamp delta time to avoid large physics steps
    const fixedDt = Math.min(dt, 0.1);

    if (input.fly !== undefined && input.fly !== this.isFlying) {
      this.isFlying = input.fly;
      this.velocity = new Vector3D(0, 0, 0);
    }

    // Direction vector based on yaw
    // When yaw=0: forward is -Z (or +Z in our coordinate convention)
    // Let's align forward with yaw
    const forwardX = Math.sin(this.yaw);
    const forwardZ = Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);

    let moveX = 0;
    let moveZ = 0;

    if (input.forward !== 0 || input.right !== 0) {
      moveX = forwardX * input.forward + rightX * input.right;
      moveZ = forwardZ * input.forward + rightZ * input.right;

      const len = Math.hypot(moveX, moveZ);
      if (len > 0) {
        const speed = input.sneak ? this.walkSpeed * 0.4 : this.walkSpeed;
        moveX = (moveX / len) * speed;
        moveZ = (moveZ / len) * speed;
      }
    }

    if (this.isFlying) {
      let moveY = 0;
      if (input.jump) moveY += this.walkSpeed * 1.5;
      if (input.sneak) moveY -= this.walkSpeed * 1.5;

      this.position = new Vector3D(
        this.position.x + moveX * fixedDt,
        this.position.y + moveY * fixedDt,
        this.position.z + moveZ * fixedDt
      );
      this.onGround = false;
      return;
    }

    // Jumping
    if (input.jump && this.onGround) {
      this.velocity = new Vector3D(this.velocity.x, this.jumpVelocity, this.velocity.z);
      this.onGround = false;
    }

    // Apply gravity
    let newVy = this.velocity.y - this.gravity * fixedDt;
    if (newVy < -40) newVy = -40; // Terminal velocity
    this.velocity = new Vector3D(moveX, newVy, moveZ);

    // Collision resolution by axis (X, Z, then Y)
    // 1. Move X
    let targetX = this.position.x + this.velocity.x * fixedDt;
    let testBoxX = this.getBoundingBox(new Vector3D(targetX, this.position.y, this.position.z));
    if (world.checkAABBCollision(testBoxX)) {
      // Step-up attempt: try moving up 0.5 blocks to climb small steps
      const stepUpBox = this.getBoundingBox(new Vector3D(targetX, this.position.y + 0.5, this.position.z));
      if (!world.checkAABBCollision(stepUpBox) && this.onGround) {
        this.position = new Vector3D(targetX, this.position.y + 0.5, this.position.z);
      } else {
        // Wall hit on X
        targetX = this.position.x;
      }
    }
    this.position = new Vector3D(targetX, this.position.y, this.position.z);

    // 2. Move Z
    let targetZ = this.position.z + this.velocity.z * fixedDt;
    let testBoxZ = this.getBoundingBox(new Vector3D(this.position.x, this.position.y, targetZ));
    if (world.checkAABBCollision(testBoxZ)) {
      // Step-up attempt
      const stepUpBox = this.getBoundingBox(new Vector3D(this.position.x, this.position.y + 0.5, targetZ));
      if (!world.checkAABBCollision(stepUpBox) && this.onGround) {
        this.position = new Vector3D(this.position.x, this.position.y + 0.5, targetZ);
      } else {
        // Wall hit on Z
        targetZ = this.position.z;
      }
    }
    this.position = new Vector3D(this.position.x, this.position.y, targetZ);

    // 3. Move Y
    let targetY = this.position.y + this.velocity.y * fixedDt;
    let testBoxY = this.getBoundingBox(new Vector3D(this.position.x, targetY, this.position.z));
    
    if (world.checkAABBCollision(testBoxY)) {
      if (this.velocity.y < 0) {
        // Falling down and hit ground: snap to integer ground block top
        this.onGround = true;
        // Snap to top of the block beneath
        const groundBlockY = Math.floor(targetY);
        this.position = new Vector3D(this.position.x, groundBlockY + 1.0, this.position.z);
        this.velocity = new Vector3D(this.velocity.x, 0, this.velocity.z);
      } else if (this.velocity.y > 0) {
        // Hit ceiling
        this.velocity = new Vector3D(this.velocity.x, 0, this.velocity.z);
      }
    } else {
      this.position = new Vector3D(this.position.x, targetY, this.position.z);
      this.onGround = false;
    }

    // World floor safeguard
    if (this.position.y < 0) {
      this.position = new Vector3D(this.position.x, 10, this.position.z);
      this.velocity = new Vector3D(0, 0, 0);
    }
  }
}
