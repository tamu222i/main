import { Position3D } from './schemas';

export class Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static fromPosition(pos: Position3D): Vector3D {
    return new Vector3D(pos.x, pos.y, pos.z);
  }

  toPosition(): Position3D {
    return { x: this.x, y: this.y, z: this.z };
  }

  add(other: Vector3D | { x: number; y: number; z: number }): Vector3D {
    return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vector3D | { x: number; y: number; z: number }): Vector3D {
    return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(scalar: number): Vector3D {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  normalize(): Vector3D {
    const len = this.length();
    if (len === 0) return new Vector3D(0, 0, 0);
    return new Vector3D(this.x / len, this.y / len, this.z / len);
  }

  dot(other: Vector3D): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  floor(): Vector3D {
    return new Vector3D(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  equals(other: Vector3D): boolean {
    return (
      Math.abs(this.x - other.x) < 1e-6 &&
      Math.abs(this.y - other.y) < 1e-6 &&
      Math.abs(this.z - other.z) < 1e-6
    );
  }

  clone(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }
}

export interface AABBBox {
  min: Vector3D;
  max: Vector3D;
}

export class AABB {
  min: Vector3D;
  max: Vector3D;

  constructor(min: Vector3D, max: Vector3D) {
    this.min = min;
    this.max = max;
  }

  intersects(other: AABBBox): boolean {
    return (
      this.max.x > other.min.x &&
      this.min.x < other.max.x &&
      this.max.y > other.min.y &&
      this.min.y < other.max.y &&
      this.max.z > other.min.z &&
      this.min.z < other.max.z
    );
  }

  offset(dx: number, dy: number, dz: number): AABB {
    return new AABB(
      new Vector3D(this.min.x + dx, this.min.y + dy, this.min.z + dz),
      new Vector3D(this.max.x + dx, this.max.y + dy, this.max.z + dz)
    );
  }
}
