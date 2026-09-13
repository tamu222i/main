import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VoxelWorld } from './domain/voxelWorld';
import { TerrainGenerator } from './domain/terrainGenerator';
import { Player } from './domain/player';
import { Vector3D } from './domain/valueObjects';
import { BlockType, BLOCK_PROPERTIES } from './domain/schemas';
import { TextureAtlasManager } from './engine/textureAtlas';
import { VoxelMeshBuilder } from './engine/voxelMeshBuilder';
import { SceneManager } from './engine/sceneManager';
import { InputManager } from './engine/inputManager';
import { soundSynthesizer } from './services/soundSynthesizer';
import { defaultWorldRepository } from './infrastructure/worldRepository';
import { defaultHintManager, HintItem } from './domain/tutorialHints';
import { Hotbar } from './components/Hotbar';
import { TouchControls } from './components/TouchControls';
import { GameHUD } from './components/GameHUD';
import { BlockPaletteModal } from './components/BlockPaletteModal';
import { SettingsModal } from './components/SettingsModal';
import { HintBanner } from './components/HintBanner';
import { GuideModal } from './components/GuideModal';

const DEFAULT_HOTBAR: BlockType[] = [
  'grass',
  'dirt',
  'stone',
  'cobblestone',
  'wood',
  'planks',
  'leaves',
  'glass',
  'brick',
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core game instances stored in refs
  const worldRef = useRef<VoxelWorld | null>(null);
  const playerRef = useRef<Player | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const meshBuilderRef = useRef<VoxelMeshBuilder | null>(null);
  const inputManagerRef = useRef<InputManager>(new InputManager());
  const worldMeshGroupRef = useRef<THREE.Group | null>(null);

  // UI state
  const [currentSeed, setCurrentSeed] = useState<number>(45678);
  const [hotbarSlots, setHotbarSlots] = useState<BlockType[]>(DEFAULT_HOTBAR);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDay, setIsDay] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [playerPos, setPlayerPos] = useState<Vector3D>(new Vector3D(16, 12, 16));
  const [targetBlock, setTargetBlock] = useState<{
    pos: Vector3D;
    type: BlockType;
    distance: number;
  } | null>(null);
  const [joystickVisual, setJoystickVisual] = useState<{
    origin: { x: number; y: number } | null;
    current: { x: number; y: number } | null;
  }>({ origin: null, current: null });
  const [hasSavedWorld, setHasSavedWorld] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [touchSensitivity, setTouchSensitivity] = useState<number>(0.004);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHintsVisible, setIsHintsVisible] = useState<boolean>(true);
  const [currentHint, setCurrentHint] = useState<HintItem>(defaultHintManager.getCurrentHint());
  const [hintIndex, setHintIndex] = useState<number>(defaultHintManager.getCurrentIndex());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleNextHint = () => {
    const next = defaultHintManager.nextHint();
    setCurrentHint(next);
    setHintIndex(defaultHintManager.getCurrentIndex());
  };

  const handlePrevHint = () => {
    const prev = defaultHintManager.prevHint();
    setCurrentHint(prev);
    setHintIndex(defaultHintManager.getCurrentIndex());
  };

  // Auto-cycle hints every 10 seconds if visible
  useEffect(() => {
    if (!isHintsVisible) return;
    const timer = setInterval(() => {
      handleNextHint();
    }, 10000);
    return () => clearInterval(timer);
  }, [isHintsVisible]);

  // Re-mesh world geometry
  const refreshWorldMesh = useCallback(() => {
    if (!worldRef.current || !sceneManagerRef.current || !meshBuilderRef.current) return;

    if (worldMeshGroupRef.current) {
      sceneManagerRef.current.scene.remove(worldMeshGroupRef.current);
      worldMeshGroupRef.current.traverse((child) => {
        if ('geometry' in child && child.geometry) {
          (child.geometry as { dispose: () => void }).dispose();
        }
      });
    }

    const newGroup = meshBuilderRef.current.buildWorldMeshes(worldRef.current);
    worldMeshGroupRef.current = newGroup;
    sceneManagerRef.current.scene.add(newGroup);
  }, []);

  // Action: Mine targeted block
  const handleMineBlock = useCallback(() => {
    const world = worldRef.current;
    const player = playerRef.current;
    if (!world || !player) return;

    const eye = player.getEyePosition();
    const dir = player.getDirection();
    const hit = world.raycast(eye, dir, 7);

    if (hit) {
      const prop = BLOCK_PROPERTIES[hit.blockType];
      world.breakBlock(hit.blockPos.x, hit.blockPos.y, hit.blockPos.z);
      soundSynthesizer.playBreak(prop?.soundType ?? 'stone');
      refreshWorldMesh();
    }
  }, [refreshWorldMesh]);

  // Action: Place current selected block
  const handlePlaceBlock = useCallback(() => {
    const world = worldRef.current;
    const player = playerRef.current;
    if (!world || !player) return;

    const eye = player.getEyePosition();
    const dir = player.getDirection();
    const hit = world.raycast(eye, dir, 7);

    if (hit) {
      const placePos = hit.placePos;
      // Prevent placing inside the player body
      const playerBox = player.getBoundingBox();
      const blockBox = {
        min: new Vector3D(placePos.x, placePos.y, placePos.z),
        max: new Vector3D(placePos.x + 1, placePos.y + 1, placePos.z + 1),
      };

      const blockToPlace = hotbarSlots[selectedSlot] ?? 'stone';
      const prop = BLOCK_PROPERTIES[blockToPlace];

      if (prop.isSolid && playerBox.intersects(blockBox)) {
        // Obstructed by player body
        return;
      }

      const placed = world.setBlock(placePos.x, placePos.y, placePos.z, blockToPlace);
      if (placed) {
        soundSynthesizer.playPlace(prop.soundType);
        refreshWorldMesh();
      }
    }
  }, [hotbarSlots, selectedSlot, refreshWorldMesh]);

  // Generate or regenerate world
  const initWorld = useCallback(
    (seed: number) => {
      const world = new VoxelWorld({
        worldSizeX: 32,
        worldSizeZ: 32,
        worldHeight: 32,
        seed,
      });
      worldRef.current = world;

      const gen = new TerrainGenerator({ seed, waterLevel: 5, baseHeight: 9 });
      gen.generate(world);

      // Find suitable spawn position (on top of highest solid block at center)
      const spawnX = 16;
      const spawnZ = 16;
      let spawnY = 12;
      for (let y = 30; y >= 0; y--) {
        if (world.getBlock(spawnX, y, spawnZ) !== 'air') {
          spawnY = y + 1;
          break;
        }
      }

      const player = new Player({
        initialPosition: new Vector3D(spawnX + 0.5, spawnY + 1, spawnZ + 0.5),
      });
      playerRef.current = player;
      setPlayerPos(player.position);

      refreshWorldMesh();
      setCurrentSeed(seed);
      showToast(`シード [${seed}] のワールドを生成しました`);
    },
    [refreshWorldMesh]
  );

  // Initialize game on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Check saved state in storage
    setHasSavedWorld(defaultWorldRepository.hasSavedWorld('autosave'));

    // Scene & Engine
    const sceneManager = new SceneManager({ canvas: canvasRef.current });
    sceneManagerRef.current = sceneManager;

    const atlas = new TextureAtlasManager();
    const meshBuilder = new VoxelMeshBuilder(atlas);
    meshBuilderRef.current = meshBuilder;

    // Input bindings
    const inputManager = inputManagerRef.current;
    inputManager.attachCanvas(canvasRef.current);
    inputManager.onActionMine = () => handleMineBlock();
    inputManager.onActionPlace = () => handlePlaceBlock();
    inputManager.onActionJump = () => soundSynthesizer.playJump();

    // Check if saved world exists, else generate fresh
    initWorld(45678);

    // Resize observer for responsive canvas
    const handleResize = () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Keyboard Hotbar slot shortcuts & palette
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        setSelectedSlot(num - 1);
      }
      if (e.code === 'KeyE') {
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Main Game Loop
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsTimer = performance.now();
    let animId: number;

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // FPS Calculation
      frameCounter++;
      if (time - fpsTimer >= 500) {
        setFps(Math.round((frameCounter * 1000) / (time - fpsTimer)));
        frameCounter = 0;
        fpsTimer = time;
      }

      const input = inputManager.pollInput();
      const player = playerRef.current;
      const world = worldRef.current;

      if (player && world && sceneManager) {
        // Update player view rotation from touch/mouse delta
        player.yaw -= input.lookDeltaX;
        player.pitch = Math.max(
          -Math.PI / 2.1,
          Math.min(Math.PI / 2.1, player.pitch - input.lookDeltaY)
        );

        // Update physics
        const prevPos = player.position.clone();
        player.update(dt, world, input);

        // Update camera
        const eye = player.getEyePosition();
        sceneManager.camera.position.set(eye.x, eye.y, eye.z);
        sceneManager.camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');

        // Sound on footstep when moving on ground
        if (
          player.onGround &&
          (input.forward !== 0 || input.right !== 0) &&
          prevPos.sub(player.position).length() > 0.05
        ) {
          if (Math.random() < 0.08) {
            soundSynthesizer.playStep();
          }
        }

        // Raycast for target block
        const dir = player.getDirection();
        const hit = world.raycast(eye, dir, 7);

        sceneManager.setTargetHighlight(hit ? hit.blockPos : null);

        if (hit) {
          setTargetBlock({
            pos: hit.blockPos,
            type: hit.blockType,
            distance: hit.distance,
          });
        } else {
          setTargetBlock(null);
        }

        setPlayerPos(player.position);
        setIsFlying(player.isFlying);
      }

      // Update Joystick visual in state for React overlay
      const joy = inputManager.getJoystickVisual();
      if (joy.origin !== joystickVisual.origin || joy.current !== joystickVisual.current) {
        setJoystickVisual(joy);
      }

      sceneManager.render();
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      sceneManager.dispose();
    };
  }, [handleMineBlock, handlePlaceBlock, initWorld]);

  // World Save Handler
  const handleSaveWorld = () => {
    if (!worldRef.current) return;
    const ok = defaultWorldRepository.saveWorld('autosave', worldRef.current);
    if (ok) {
      setHasSavedWorld(true);
      showToast('💾 ワールドを保存しました！');
    }
  };

  // World Load Handler
  const handleLoadWorld = () => {
    if (!worldRef.current) return;
    const ok = defaultWorldRepository.loadWorld('autosave', worldRef.current);
    if (ok) {
      refreshWorldMesh();
      showToast('📤 保存ワールドを読み込みました！');
      setIsSettingsOpen(false);
    }
  };

  // Sensitivity change
  const handleChangeSensitivity = (val: number) => {
    setTouchSensitivity(val);
    inputManagerRef.current.touchSensitivity = val;
  };

  // Toggle Day/Night
  const handleToggleDayNight = () => {
    if (sceneManagerRef.current) {
      const nextDay = sceneManagerRef.current.toggleDayNight();
      setIsDay(nextDay);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = soundSynthesizer.toggleMute();
    setIsMuted(muted);
    showToast(muted ? '🔇 サウンドOFF' : '🔊 サウンドON');
  };

  return (
    <div
      id="minecraft-web-app"
      className="relative w-screen h-screen overflow-hidden select-none touch-none bg-neutral-950 font-sans"
      onTouchStart={(e) => inputManagerRef.current.handleTouchStart(e)}
      onTouchMove={(e) => inputManagerRef.current.handleTouchMove(e)}
      onTouchEnd={(e) => inputManagerRef.current.handleTouchEnd(e)}
      onTouchCancel={(e) => inputManagerRef.current.handleTouchEnd(e)}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        id="voxel-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block touch-none outline-hidden"
      />

      {/* HUD: Stats, Crosshair, Day/Night, Mute, Settings, Guide */}
      <GameHUD
        playerPos={playerPos}
        targetBlock={targetBlock}
        fps={fps}
        isDay={isDay}
        isMuted={isMuted}
        isFlying={isFlying}
        onToggleDayNight={handleToggleDayNight}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleHints={() => setIsHintsVisible((prev) => !prev)}
        isHintsVisible={isHintsVisible}
        toastMessage={toastMessage}
      />

      {/* Interactive In-Game Rotating Hints */}
      {isHintsVisible && (
        <HintBanner
          hint={currentHint}
          currentIndex={hintIndex}
          totalHints={defaultHintManager.getAllHints().length}
          onNext={handleNextHint}
          onPrev={handlePrevHint}
          onClose={() => setIsHintsVisible(false)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {/* Mobile Touch Controls: Joystick + Action Buttons */}
      <TouchControls
        isFlying={isFlying}
        onJumpStart={() => inputManagerRef.current.setButtonJump(true)}
        onJumpEnd={() => inputManagerRef.current.setButtonJump(false)}
        onSneakStart={() => inputManagerRef.current.setButtonSneak(true)}
        onSneakEnd={() => inputManagerRef.current.setButtonSneak(false)}
        onToggleFly={() => {
          const flying = inputManagerRef.current.toggleFly();
          setIsFlying(flying);
          showToast(flying ? '🕊️ 飛行モードON' : '🚶 歩行モードON');
        }}
        onMine={handleMineBlock}
        onPlace={handlePlaceBlock}
        joystickState={joystickVisual}
      />

      {/* Bottom Hotbar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <Hotbar
          slots={hotbarSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={(idx) => setSelectedSlot(idx)}
          onOpenPalette={() => setIsPaletteOpen(true)}
        />
      </div>

      {/* Block Palette Modal */}
      <BlockPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        currentSelected={hotbarSlots[selectedSlot] ?? 'grass'}
        onSelectBlock={(blockType) => {
          const next = [...hotbarSlots];
          next[selectedSlot] = blockType;
          setHotbarSlots(next);
          showToast(`${BLOCK_PROPERTIES[blockType].name} をスロット ${selectedSlot + 1} に装備しました`);
        }}
      />

      {/* Settings & World Management Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSeed={currentSeed}
        onGenerateNewWorld={(seed) => {
          initWorld(seed);
          setIsSettingsOpen(false);
        }}
        onSaveWorld={handleSaveWorld}
        onLoadWorld={handleLoadWorld}
        hasSavedWorld={hasSavedWorld}
        touchSensitivity={touchSensitivity}
        onChangeTouchSensitivity={handleChangeSensitivity}
      />

      {/* Operation & GitHub Deployment Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
