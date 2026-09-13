import React from 'react';
import { BlockType, BLOCK_PROPERTIES } from '../domain/schemas';

interface BlockPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
  currentSelected: BlockType;
}

const ALL_BLOCKS: BlockType[] = [
  'grass',
  'dirt',
  'stone',
  'cobblestone',
  'wood',
  'planks',
  'leaves',
  'sand',
  'glass',
  'brick',
  'water',
  'flower',
];

export const BlockPaletteModal: React.FC<BlockPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
  currentSelected,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-5 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-100">ブロックパレット</h2>
            <p className="text-xs text-neutral-400">設置したいブロックを選択してください</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 my-4 max-h-72 overflow-y-auto pr-1">
          {ALL_BLOCKS.map((type) => {
            const prop = BLOCK_PROPERTIES[type];
            const isSelected = currentSelected === type;

            return (
              <button
                key={type}
                onClick={() => {
                  onSelectBlock(type);
                  onClose();
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 text-center ${
                  isSelected
                    ? 'bg-neutral-800 border-amber-400 ring-2 ring-amber-400/40'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl shadow-md border border-black/30 flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: prop.color,
                    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.4)',
                  }}
                >
                  {type === 'flower' && '🌸'}
                  {type === 'water' && '💧'}
                  {type === 'glass' && '🪟'}
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-semibold text-neutral-200 block truncate max-w-[80px]">
                    {prop.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {prop.isTransparent ? '透過' : '固体'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
