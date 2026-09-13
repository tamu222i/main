import React from 'react';
import { BlockType, BLOCK_PROPERTIES } from '../domain/schemas';
import { Vector3D } from '../domain/valueObjects';

export type CameraViewMode = 'first_person' | 'third_person_back' | 'third_person_front';

interface GameHUDProps {
  playerPos: Vector3D;
  targetBlock: { pos: Vector3D; type: BlockType; distance: number } | null;
  fps: number;
  isDay: boolean;
  isMuted: boolean;
  isFlying: boolean;
  islandName: string;
  avatarName: string;
  cameraMode: CameraViewMode;
  onToggleDayNight: () => void;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleHints: () => void;
  onCycleCameraMode: () => void;
  onOpenAvatarModal: () => void;
  onRenameIsland: () => void;
  isHintsVisible: boolean;
  toastMessage: string | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerPos,
  targetBlock,
  fps,
  isDay,
  isMuted,
  isFlying,
  islandName,
  avatarName,
  cameraMode,
  onToggleDayNight,
  onToggleMute,
  onOpenSettings,
  onOpenGuide,
  onToggleHints,
  onCycleCameraMode,
  onOpenAvatarModal,
  onRenameIsland,
  isHintsVisible,
  toastMessage,
}) => {
  const getCameraLabel = () => {
    switch (cameraMode) {
      case 'first_person':
        return '1人称';
      case 'third_person_back':
        return '3人称背面';
      case 'third_person_front':
        return '自撮り';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 select-none overflow-hidden">
      {/* Center Crosshair (only in 1st person or helpful targeting) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-4 h-0.5 bg-white/75 shadow-xs" />
        <div className="absolute w-0.5 h-4 bg-white/75 shadow-xs" />
      </div>

      {/* Top Left Stats & Island Badge */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-auto">
        {/* Island Name Badge */}
        <div className="flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold text-neutral-100">
          <span className="text-base">🏝️</span>
          <span className="text-emerald-400 font-extrabold tracking-wide">{islandName}</span>
          <button
            onClick={onRenameIsland}
            className="text-stone-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
            title="島の名前を変更する"
          >
            ✏️
          </button>
        </div>

        {/* Coordinates & FPS Panel */}
        <div className="flex flex-col gap-0.5 text-xs font-mono bg-neutral-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">XYZ:</span>
            <span>
              {playerPos.x.toFixed(1)} / {playerPos.y.toFixed(1)} / {playerPos.z.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>FPS: <strong className="text-emerald-400 font-bold">{fps}</strong></span>
            <span>•</span>
            <span>{isFlying ? '🕊️ 飛行中' : '🚶 歩行'}</span>
          </div>
        </div>
      </div>

      {/* Top Center Target Block Info */}
      {targetBlock && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-900/85 backdrop-blur-md border border-neutral-750 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in duration-100">
          <div
            className="w-3.5 h-3.5 rounded-sm border border-black/40 shadow-xs"
            style={{ backgroundColor: BLOCK_PROPERTIES[targetBlock.type].color }}
          />
          <span className="text-xs font-semibold text-neutral-200">
            {BLOCK_PROPERTIES[targetBlock.type].name}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {targetBlock.distance.toFixed(1)}m
          </span>
        </div>
      )}

      {/* Top Right Quick Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Avatar Customization Button */}
        <button
          onClick={onOpenAvatarModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 border border-purple-400/50 active:scale-95 transition-transform"
          title="アバター作成・着せ替え"
        >
          <span>👤</span>
          <span className="hidden sm:inline">{avatarName || 'アバター'}</span>
        </button>

        {/* Camera View Switcher */}
        <button
          onClick={onCycleCameraMode}
          className="flex items-center gap-1 px-2.5 sm:px-3 h-9 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 border border-cyan-400/50 active:scale-95 transition-transform"
          title="カメラ視点切替 (F5)"
        >
          <span>📷</span>
          <span className="text-[11px]">{getCameraLabel()}</span>
        </button>

        {/* Guide / How to Play button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1 px-2.5 sm:px-3 h-9 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 border border-amber-300 active:scale-95 transition-transform"
          title="操作ガイド・遊び方"
        >
          <span>📖</span>
          <span className="hidden md:inline">操作説明</span>
        </button>

        {/* Hints Toggle Button */}
        <button
          onClick={onToggleHints}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border backdrop-blur-md transition-transform active:scale-95 shadow-md ${
            isHintsVisible
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
              : 'bg-neutral-900/80 border-neutral-750 text-neutral-400 hover:text-neutral-200'
          }`}
          title="ヒント表示切替"
        >
          💡
        </button>

        {/* Day/Night Button */}
        <button
          onClick={onToggleDayNight}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-neutral-750 backdrop-blur-md transition-transform active:scale-95 shadow-md"
          title="昼・夜の切り替え"
        >
          {isDay ? '☀️' : '🌙'}
        </button>

        {/* Audio Mute Button */}
        <button
          onClick={onToggleMute}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 backdrop-blur-md transition-transform active:scale-95 shadow-md"
          title="サウンド切替"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Settings Menu Button */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 backdrop-blur-md transition-transform active:scale-95 shadow-md font-bold"
          title="設定・メニュー"
        >
          ⚙️
        </button>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 font-bold text-xs px-4 py-1.5 rounded-full shadow-lg animate-in slide-in-from-top duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

