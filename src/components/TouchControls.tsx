import React from 'react';

interface TouchControlsProps {
  isFlying: boolean;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onSneakStart: () => void;
  onSneakEnd: () => void;
  onToggleFly: () => void;
  onMine: () => void;
  onPlace: () => void;
  joystickState: {
    origin: { x: number; y: number } | null;
    current: { x: number; y: number } | null;
  };
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  isFlying,
  onJumpStart,
  onJumpEnd,
  onSneakStart,
  onSneakEnd,
  onToggleFly,
  onMine,
  onPlace,
  joystickState,
}) => {
  return (
    <>
      {/* Floating Joystick Visual Indicator */}
      {joystickState.origin && joystickState.current && (
        <div
          className="fixed pointer-events-none z-30"
          style={{
            left: joystickState.origin.x - 45,
            top: joystickState.origin.y - 45,
            width: 90,
            height: 90,
          }}
        >
          {/* Base outer ring */}
          <div className="w-full h-full rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-xs flex items-center justify-center">
            {/* Center dot */}
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>

          {/* Draggable knob */}
          <div
            className="absolute rounded-full w-10 h-10 bg-white/70 shadow-lg border border-white/90 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: 45 + (joystickState.current.x - joystickState.origin.x),
              top: 45 + (joystickState.current.y - joystickState.origin.y),
            }}
          />
        </div>
      )}

      {/* Static Joystick prompt area if not touching */}
      {!joystickState.origin && (
        <div className="fixed bottom-24 left-6 z-20 pointer-events-none opacity-40 hidden sm:flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold tracking-wider">移動</span>
          </div>
        </div>
      )}

      {/* Right-side Action Buttons Cluster */}
      <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-3 pointer-events-auto select-none">
        {/* Upper row: Mine & Place */}
        <div className="flex items-center gap-2.5">
          {/* Mine / Break button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onMine();
            }}
            onClick={onMine}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-rose-600/85 active:bg-rose-500 text-white font-bold shadow-lg shadow-rose-900/30 border border-rose-400/40 backdrop-blur-md active:scale-90 transition-transform"
            title="ブロックを掘る"
          >
            <span className="text-xl leading-none">⛏️</span>
            <span className="text-[10px] font-medium leading-tight mt-0.5">掘る</span>
          </button>

          {/* Place button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onPlace();
            }}
            onClick={onPlace}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/85 active:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/40 backdrop-blur-md active:scale-90 transition-transform"
            title="ブロックを置く"
          >
            <span className="text-xl leading-none">🧱</span>
            <span className="text-[10px] font-medium leading-tight mt-0.5">置く</span>
          </button>
        </div>

        {/* Lower row: Fly, Sneak, Jump */}
        <div className="flex items-center gap-2.5">
          {/* Fly toggle */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onToggleFly();
            }}
            onClick={onToggleFly}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl font-bold shadow-md border backdrop-blur-md active:scale-90 transition-all ${
              isFlying
                ? 'bg-amber-500/90 text-neutral-950 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-neutral-800/80 text-neutral-200 border-neutral-700/60'
            }`}
            title="飛行モード切替"
          >
            <span className="text-base leading-none">🕊️</span>
            <span className="text-[9px] font-medium mt-0.5">{isFlying ? '飛行中' : '飛行'}</span>
          </button>

          {/* Sneak button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onSneakStart();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onSneakEnd();
            }}
            onMouseDown={onSneakStart}
            onMouseUp={onSneakEnd}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-neutral-800/80 active:bg-neutral-700 text-neutral-200 font-bold shadow-md border border-neutral-700/60 backdrop-blur-md active:scale-90 transition-transform"
            title="しゃがむ"
          >
            <span className="text-base leading-none">🐢</span>
            <span className="text-[9px] font-medium mt-0.5">しゃがみ</span>
          </button>

          {/* Jump Button (large prominent circle) */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onJumpStart();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onJumpEnd();
            }}
            onMouseDown={onJumpStart}
            onMouseUp={onJumpEnd}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-blue-600/85 active:bg-blue-500 text-white font-bold shadow-xl shadow-blue-900/40 border-2 border-blue-400/50 backdrop-blur-md active:scale-90 transition-transform"
            title="ジャンプ"
          >
            <span className="text-2xl leading-none">⬆️</span>
            <span className="text-[10px] font-semibold">跳ぶ</span>
          </button>
        </div>
      </div>
    </>
  );
};
