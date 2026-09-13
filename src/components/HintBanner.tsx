import React from 'react';
import { HintItem } from '../domain/tutorialHints';

interface HintBannerProps {
  hint: HintItem;
  currentIndex: number;
  totalHints: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onOpenGuide: () => void;
}

export const HintBanner: React.FC<HintBannerProps> = ({
  hint,
  currentIndex,
  totalHints,
  onNext,
  onPrev,
  onClose,
  onOpenGuide,
}) => {
  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-md pointer-events-auto select-none animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-neutral-900/90 hover:bg-neutral-900 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-3 shadow-xl flex items-start gap-2.5">
        {/* Hint Icon badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-base shadow-xs">
          {hint.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-bold text-amber-300 truncate">
              {hint.title}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {currentIndex + 1}/{totalHints}
            </span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed line-clamp-2">
            {hint.text}
          </p>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/80">
            <button
              onClick={onOpenGuide}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
            >
              📖 全ての操作説明を見る
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onPrev}
                className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[10px] rounded-md transition-colors"
                title="前のヒント"
              >
                ◀ 前
              </button>
              <button
                onClick={onNext}
                className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[10px] rounded-md transition-colors"
                title="次のヒント"
              >
                次 ▶
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
          title="ヒントを非表示"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
