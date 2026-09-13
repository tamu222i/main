import React from 'react';
import { BlockType, BLOCK_PROPERTIES } from '../domain/schemas';

interface HotbarProps {
  slots: BlockType[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
  onOpenPalette: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  onOpenPalette,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-neutral-950/80 backdrop-blur-md rounded-2xl border border-neutral-700/60 shadow-2xl pointer-events-auto">
      {slots.map((blockType, idx) => {
        const prop = BLOCK_PROPERTIES[blockType];
        const isSelected = selectedSlot === idx;

        return (
          <button
            key={`${blockType}-${idx}`}
            onClick={() => onSelectSlot(idx)}
            className={`relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-150 active:scale-95 ${
              isSelected
                ? 'bg-neutral-700/90 ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-900 shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 hover:bg-neutral-750 border border-neutral-700/50'
            }`}
            title={`${prop.name} (キー ${idx + 1})`}
          >
            {/* Block color preview thumbnail */}
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md shadow-inner border border-black/30 flex items-center justify-center"
              style={{
                backgroundColor: prop.color,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.4)',
              }}
            >
              {blockType === 'flower' && <span className="text-xs">🌸</span>}
              {blockType === 'water' && <span className="text-xs">💧</span>}
              {blockType === 'glass' && <span className="text-xs opacity-70">🪟</span>}
            </div>

            {/* Slot index number label */}
            <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-neutral-400 font-bold leading-none select-none">
              {idx + 1}
            </span>
          </button>
        );
      })}

      {/* Palette opener button */}
      <button
        onClick={onOpenPalette}
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/50 text-neutral-300 font-bold text-base transition-all active:scale-95"
        title="全ブロック選択"
      >
        •••
      </button>
    </div>
  );
};
