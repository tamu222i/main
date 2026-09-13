import React from 'react';
import { BlockType, BLOCK_PROPERTIES } from '../domain/schemas';
import { Vector3D } from '../domain/valueObjects';

interface GameHUDProps {
  playerPos: Vector3D;
  targetBlock: { pos: Vector3D; type: BlockType; distance: number } | null;
  fps: number;
  isDay: boolean;
  isMuted: boolean;
  isFlying: boolean;
  onToggleDayNight: () => void;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleHints: () => void;
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
  onToggleDayNight,
  onToggleMute,
  onOpenSettings,
  onOpenGuide,
  onToggleHints,
  isHintsVisible,
  toastMessage,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-20 select-none overflow-hidden">
      {/* Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-4 h-0.5 bg-white/75 shadow-xs" />
        <div className="absolute w-0.5 h-4 bg-white/75 shadow-xs" />
      </div>

      {/* Top Left Stats Panel */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 text-xs font-mono bg-neutral-950/70 backdrop-blur-md px-3 py-2 rounded-xl border border-neutral-800 text-neutral-300 pointer-events-auto">
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
        {/* Guide / How to Play button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1 px-2.5 sm:px-3 h-9 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 border border-amber-300 active:scale-95 transition-transform"
          title="操作ガイド・遊び方"
        >
          <span>📖</span>
          <span className="hidden sm:inline">操作説明</span>
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
