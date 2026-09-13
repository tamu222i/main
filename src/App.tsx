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
import { AvatarModel } from './engine/avatarMesh';
import {
  IslandProfile,
  AvatarProfile,
  DEFAULT_ISLAND_PROFILE,
  DEFAULT_AVATAR_PROFILE,
} from './domain/islandAvatarSchemas';
import { Hotbar } from './components/Hotbar';
import { TouchControls } from './components/TouchControls';
import { GameHUD, CameraViewMode } from './components/GameHUD';
import { BlockPaletteModal } from './components/BlockPaletteModal';
import { SettingsModal } from './components/SettingsModal';
import { HintBanner } from './components/HintBanner';
import { GuideModal } from './components/GuideModal';
import { AvatarCreatorModal } from './components/AvatarCreatorModal';
import { IslandRenameModal } from './components/IslandRenameModal';

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
  const avatarModelRef = useRef<AvatarModel | null>(null);

  // UI state
  const [currentSeed, setCurrentSeed] = useState<number>(45678);
  const [islandProfile, setIslandProfile] = useState<IslandProfile>(() =>
    defaultWorldRepository.loadIslandProfile()
  );
  const [avatarProfile, setAvatarProfile] = useState<AvatarProfile>(() =>
    defaultWorldRepository.loadAvatarProfile()
  );
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('first_person');
  const cameraModeRef = useRef<CameraViewMode>('first_person');
  cameraModeRef.current = cameraMode;
  const [isRenameIslandOpen, setIsRenameIslandOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [hotbarSlots, setHotbarSlots] = useState<BlockType[]>(DEFAULT_HOTBAR);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDay, setIsDay] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [playerPos, setPlayerPos] = useState<Vector3D>(new Vector3D(22, 14, 22));
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

  const handleCycleCameraMode = useCallback(() => {
    setCameraMode((prev) => {
      const next: CameraViewMode =
        prev === 'first_person'
          ? 'third_person_back'
          : prev === 'third_person_back'
          ? 'third_person_front'
          : 'first_person';
      cameraModeRef.current = next;
      const label =
        next === 'first_person'
          ? '📷 1人称視点'
          : next === 'third_person_back'
          ? '📷 3人称背面視点'
          : '📷 3人称自撮り視点';
      showToast(label);
      return next;
    });
  }, []);

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

    avatarModelRef.current?.triggerMineSwing();

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

    avatarModelRef.current?.triggerMineSwing();

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
        worldSizeX: 44,
        worldSizeZ: 44,
        worldHeight: 32,
        seed,
      });
      worldRef.current = world;

      const gen = new TerrainGenerator({ seed, waterLevel: 5, baseHeight: 9 });
      gen.generate(world);

      // Find suitable spawn position (on top of highest solid block at center)
      const spawnX = Math.floor(world.config.worldSizeX / 2);
      const spawnZ = Math.floor(world.config.worldSizeZ / 2);
      let spawnY = 12;
      for (let y = world.config.worldHeight - 2; y >= 0; y--) {
        if (world.getBlock(spawnX, y, spawnZ) !== 'air') {
          spawnY = y + 1;
          break;
        }
      }

      const safeSpawnPos = new Vector3D(spawnX + 0.5, spawnY + 0.5, spawnZ + 0.5);
      const player = new Player({
        initialPosition: safeSpawnPos,
        safeSpawn: safeSpawnPos,
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

    // 3D Player Avatar Model
    const initialAvatarProfile = defaultWorldRepository.loadAvatarProfile();
    const avatarModel = new AvatarModel(initialAvatarProfile);
    avatarModelRef.current = avatarModel;
    sceneManager.scene.add(avatarModel.root);

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

    // Keyboard Hotbar slot shortcuts & palette & camera view
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        setSelectedSlot(num - 1);
      }
      if (e.code === 'KeyE') {
        setIsPaletteOpen((prev) => !prev);
      }
      if (e.code === 'F5') {
        e.preventDefault();
        handleCycleCameraMode();
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

        // Notify if respawned safely to island ground
        if (
          prevPos.y < 2.0 &&
          player.position.y === player.safeSpawn.y &&
          Math.abs(player.position.x - player.safeSpawn.x) < 0.1 &&
          player.velocity.y === 0
        ) {
          showToast('🏝️ 島の安全な地面にリスポーンしました');
        }

        const eye = player.getEyePosition();
        const dir = player.getDirection();
        const isMoving =
          player.onGround &&
          (input.forward !== 0 || input.right !== 0) &&
          prevPos.sub(player.position).length() > 0.01;

        // Avatar positioning & camera view angle
        if (avatarModelRef.current) {
          const avatar = avatarModelRef.current;
          avatar.root.position.set(player.position.x, player.position.y, player.position.z);
          avatar.root.rotation.y = player.yaw;
          avatar.update(dt, isMoving, player.isFlying);

          const mode = cameraModeRef.current;
          if (mode === 'first_person') {
            avatar.root.visible = false;
            sceneManager.camera.position.set(eye.x, eye.y, eye.z);
            sceneManager.camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
          } else if (mode === 'third_person_back') {
            avatar.root.visible = true;
            const camDist = 3.4;
            const cx = eye.x - dir.x * camDist;
            const cy = eye.y - dir.y * camDist + 0.5;
            const cz = eye.z - dir.z * camDist;
            sceneManager.camera.position.set(cx, cy, cz);
            sceneManager.camera.lookAt(eye.x, eye.y + 0.1, eye.z);
          } else {
            // third_person_front (selfie view)
            avatar.root.visible = true;
            const camDist = 3.2;
            const cx = eye.x + dir.x * camDist;
            const cy = eye.y + dir.y * camDist + 0.3;
            const cz = eye.z + dir.z * camDist;
            sceneManager.camera.position.set(cx, cy, cz);
            sceneManager.camera.lookAt(eye.x, eye.y - 0.1, eye.z);
          }
        } else {
          sceneManager.camera.position.set(eye.x, eye.y, eye.z);
          sceneManager.camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
        }

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
      if (avatarModelRef.current) {
        avatarModelRef.current.dispose();
      }
      sceneManager.dispose();
    };
  }, [handleMineBlock, handlePlaceBlock, initWorld]);

  // World Save Handler
  const handleSaveWorld = () => {
    if (!worldRef.current) return;
    const ok = defaultWorldRepository.saveWorld('autosave', worldRef.current);
    defaultWorldRepository.saveIslandProfile(islandProfile);
    defaultWorldRepository.saveAvatarProfile(avatarProfile);
    if (ok) {
      setHasSavedWorld(true);
      showToast('💾 ワールドと島データを保存しました！');
    }
  };

  // World Load Handler
  const handleLoadWorld = () => {
    if (!worldRef.current) return;
    const ok = defaultWorldRepository.loadWorld('autosave', worldRef.current);
    if (ok) {
      const loadedIsland = defaultWorldRepository.loadIslandProfile();
      const loadedAvatar = defaultWorldRepository.loadAvatarProfile();
      setIslandProfile(loadedIsland);
      setAvatarProfile(loadedAvatar);
      if (avatarModelRef.current) {
        avatarModelRef.current.buildMeshes(loadedAvatar);
      }
      refreshWorldMesh();
      showToast('📤 保存ワールドと島データを読み込みました！');
      setIsSettingsOpen(false);
    }
  };

  // Island Name Change
  const handleSaveIslandName = (newName: string) => {
    const updated: IslandProfile = {
      ...islandProfile,
      name: newName,
      updatedAt: Date.now(),
    };
    setIslandProfile(updated);
    defaultWorldRepository.saveIslandProfile(updated);
    showToast(`🏝️ 島の名前を「${newName}」に設定しました`);
  };

  // Avatar Profile Change
  const handleSaveAvatar = (newAvatar: AvatarProfile) => {
    setAvatarProfile(newAvatar);
    defaultWorldRepository.saveAvatarProfile(newAvatar);
    if (avatarModelRef.current) {
      avatarModelRef.current.buildMeshes(newAvatar);
    }
    showToast(`👤 アバター「${newAvatar.name}」を保存しました`);
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

      {/* HUD: Stats, Crosshair, Day/Night, Mute, Settings, Guide, Island, Avatar, Camera */}
      <GameHUD
        playerPos={playerPos}
        targetBlock={targetBlock}
        fps={fps}
        isDay={isDay}
        isMuted={isMuted}
        isFlying={isFlying}
        islandName={islandProfile.name}
        avatarName={avatarProfile.name}
        cameraMode={cameraMode}
        onToggleDayNight={handleToggleDayNight}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleHints={() => setIsHintsVisible((prev) => !prev)}
        onCycleCameraMode={handleCycleCameraMode}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onRenameIsland={() => setIsRenameIslandOpen(true)}
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
        islandName={islandProfile.name}
        onOpenRenameIsland={() => {
          setIsSettingsOpen(false);
          setIsRenameIslandOpen(true);
        }}
        onOpenAvatarModal={() => {
          setIsSettingsOpen(false);
          setIsAvatarModalOpen(true);
        }}
      />

      {/* Operation & GitHub Deployment Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Island Name Modal */}
      <IslandRenameModal
        isOpen={isRenameIslandOpen}
        onClose={() => setIsRenameIslandOpen(false)}
        currentName={islandProfile.name}
        onSave={handleSaveIslandName}
      />

      {/* Avatar Creator & Customization Modal */}
      <AvatarCreatorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentProfile={avatarProfile}
        onSave={handleSaveAvatar}
        onSaveProfile={handleSaveAvatar}
      />
    </div>
  );
}
