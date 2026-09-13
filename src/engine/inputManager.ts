import type React from 'react';

export interface InputState {
  forward: number; // -1 to 1
  right: number; // -1 to 1
  jump: boolean;
  sneak: boolean;
  fly: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
  isMining: boolean;
  isPlacing: boolean;
}

export class InputManager {
  private keys: Record<string, boolean> = {};
  private pointerLocked: boolean = false;
  private canvas: HTMLCanvasElement | null = null;

  // Joystick touch tracking
  private joystickTouchId: number | null = null;
  private joystickOrigin: { x: number; y: number } | null = null;
  private joystickCurrent: { x: number; y: number } | null = null;
  private joystickVector: { x: number; y: number } = { x: 0, y: 0 };

  // Look touch tracking (right half of screen)
  private lookTouchId: number | null = null;
  private lastLookPos: { x: number; y: number } | null = null;
  private touchLookDelta: { x: number; y: number } = { x: 0, y: 0 };

  // Button triggers
  private buttonJump: boolean = false;
  private buttonSneak: boolean = false;
  private buttonFlyToggle: boolean = false;
  private isFlyingState: boolean = false;
  private buttonMine: boolean = false;
  private buttonPlace: boolean = false;

  // Sensitivity settings
  public touchSensitivity: number = 0.004;
  public mouseSensitivity: number = 0.002;

  // Change listeners
  public onActionMine?: () => void;
  public onActionPlace?: () => void;
  public onActionJump?: () => void;

  constructor() {
    this.setupKeyboard();
  }

  attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.setupPointerLock(canvas);
  }

  private setupKeyboard(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyF') {
        this.isFlyingState = !this.isFlyingState;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  private setupPointerLock(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('click', () => {
      // If on desktop (no touch), enter pointer lock
      if (!('ontouchstart' in window) && !this.pointerLocked) {
        try {
          canvas.requestPointerLock();
        } catch {
          // ignore
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.touchLookDelta.x += e.movementX * this.mouseSensitivity;
        this.touchLookDelta.y += e.movementY * this.mouseSensitivity;
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (this.pointerLocked) {
        if (e.button === 0 && this.onActionMine) {
          this.onActionMine();
        } else if (e.button === 2 && this.onActionPlace) {
          this.onActionPlace();
        }
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // --- Mobile Touch Handlers ---

  handleTouchStart(e: React.TouchEvent<HTMLElement>): void {
    const rect = e.currentTarget.getBoundingClientRect();
    const halfWidth = rect.width / 2;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const relX = touch.clientX - rect.left;
      const relY = touch.clientY - rect.top;

      // Left half: joystick
      if (relX < halfWidth && this.joystickTouchId === null) {
        this.joystickTouchId = touch.identifier;
        this.joystickOrigin = { x: touch.clientX, y: touch.clientY };
        this.joystickCurrent = { x: touch.clientX, y: touch.clientY };
        this.joystickVector = { x: 0, y: 0 };
      }
      // Right half: camera look
      else if (relX >= halfWidth && this.lookTouchId === null) {
        this.lookTouchId = touch.identifier;
        this.lastLookPos = { x: touch.clientX, y: touch.clientY };
      }
    }
  }

  handleTouchMove(e: React.TouchEvent<HTMLElement>): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Joystick move
      if (touch.identifier === this.joystickTouchId && this.joystickOrigin) {
        const dx = touch.clientX - this.joystickOrigin.x;
        const dy = touch.clientY - this.joystickOrigin.y;
        const maxDist = 45; // max radius in pixels
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
          const clampedDist = Math.min(dist, maxDist);
          this.joystickVector = {
            x: (dx / dist) * (clampedDist / maxDist),
            y: (dy / dist) * (clampedDist / maxDist),
          };
        } else {
          this.joystickVector = { x: 0, y: 0 };
        }
        this.joystickCurrent = { x: touch.clientX, y: touch.clientY };
      }

      // Camera look move
      if (touch.identifier === this.lookTouchId && this.lastLookPos) {
        const dx = touch.clientX - this.lastLookPos.x;
        const dy = touch.clientY - this.lastLookPos.y;

        this.touchLookDelta.x += dx * this.touchSensitivity;
        this.touchLookDelta.y += dy * this.touchSensitivity;

        this.lastLookPos = { x: touch.clientX, y: touch.clientY };
      }
    }
  }

  handleTouchEnd(e: React.TouchEvent<HTMLElement>): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.joystickTouchId) {
        this.joystickTouchId = null;
        this.joystickOrigin = null;
        this.joystickCurrent = null;
        this.joystickVector = { x: 0, y: 0 };
      }

      if (touch.identifier === this.lookTouchId) {
        this.lookTouchId = null;
        this.lastLookPos = null;
      }
    }
  }

  // --- Mobile Action Button Bindings ---

  setButtonJump(pressed: boolean): void {
    this.buttonJump = pressed;
    if (pressed && this.onActionJump) {
      this.onActionJump();
    }
  }

  setButtonSneak(pressed: boolean): void {
    this.buttonSneak = pressed;
  }

  toggleFly(): boolean {
    this.isFlyingState = !this.isFlyingState;
    return this.isFlyingState;
  }

  getIsFlying(): boolean {
    return this.isFlyingState;
  }

  triggerMine(): void {
    if (this.onActionMine) {
      this.onActionMine();
    }
  }

  triggerPlace(): void {
    if (this.onActionPlace) {
      this.onActionPlace();
    }
  }

  getJoystickVisual(): { origin: { x: number; y: number } | null; current: { x: number; y: number } | null } {
    return {
      origin: this.joystickOrigin,
      current: this.joystickCurrent,
    };
  }

  pollInput(): InputState {
    let forward = 0;
    let right = 0;

    // Keyboard controls
    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) right -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) right += 1;

    // Mobile Joystick controls (y is inverted screen-wise: dragging down is backward)
    if (this.joystickVector.y !== 0 || this.joystickVector.x !== 0) {
      forward += -this.joystickVector.y;
      right += this.joystickVector.x;
    }

    forward = Math.max(-1, Math.min(1, forward));
    right = Math.max(-1, Math.min(1, right));

    const jump = !!(this.keys['Space'] || this.buttonJump);
    const sneak = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.buttonSneak);

    const deltaX = this.touchLookDelta.x;
    const deltaY = this.touchLookDelta.y;

    // Reset accumulated look delta
    this.touchLookDelta = { x: 0, y: 0 };

    return {
      forward,
      right,
      jump,
      sneak,
      fly: this.isFlyingState,
      lookDeltaX: deltaX,
      lookDeltaY: deltaY,
      isMining: this.buttonMine,
      isPlacing: this.buttonPlace,
    };
  }
}
