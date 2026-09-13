import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeed: number;
  onGenerateNewWorld: (seed: number) => void;
  onSaveWorld: () => void;
  onLoadWorld: () => void;
  hasSavedWorld: boolean;
  touchSensitivity: number;
  onChangeTouchSensitivity: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSeed,
  onGenerateNewWorld,
  onSaveWorld,
  onLoadWorld,
  hasSavedWorld,
  touchSensitivity,
  onChangeTouchSensitivity,
}) => {
  const [seedInput, setSeedInput] = useState<string>(currentSeed.toString());

  if (!isOpen) return null;

  const handleRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setSeedInput(newSeed.toString());
    onGenerateNewWorld(newSeed);
  };

  const handleApplySeed = () => {
    const num = parseInt(seedInput, 10);
    if (!isNaN(num)) {
      onGenerateNewWorld(num);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto select-none">
      <div className="bg-neutral-900 border border-neutral-750 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
              <span>⚙️</span> ゲーム設定 & ワールド管理
            </h2>
            <p className="text-xs text-neutral-400">マインクラフト Web Mobile エディション</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 my-4">
          {/* World Persistence Section */}
          <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-200 mb-2 flex items-center gap-1.5">
              <span>💾</span> ワールドの保存 & ロード
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              現在の建築や地形データをブラウザのローカルストレージに永続保存します。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onSaveWorld();
                }}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all text-center"
              >
                📥 ワールドを保存
              </button>
              <button
                onClick={() => {
                  onLoadWorld();
                }}
                disabled={!hasSavedWorld}
                className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all text-center ${
                  hasSavedWorld
                    ? 'bg-neutral-700 hover:bg-neutral-600 active:scale-95 text-neutral-100'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                📤 保存データを読込
              </button>
            </div>
          </div>

          {/* World Generation Section */}
          <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-200 mb-2 flex items-center gap-1.5">
              <span>🗺️</span> 新規ワールド生成 (シード値)
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                placeholder="シード値 (数値)"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 focus:outline-hidden focus:border-amber-400"
              />
              <button
                onClick={handleApplySeed}
                className="px-4 py-2 bg-neutral-750 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
              >
                生成
              </button>
              <button
                onClick={handleRandomSeed}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
              >
                ランダム
              </button>
            </div>
          </div>

          {/* Controls Sensitivity */}
          <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-1.5">
                <span>📱</span> スマホ視点タッチ感度
              </h3>
              <span className="text-xs font-mono text-amber-400">
                {(touchSensitivity * 1000).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.010"
              step="0.0005"
              value={touchSensitivity}
              onChange={(e) => onChangeTouchSensitivity(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* How to Play instructions */}
          <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-2">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-1.5">
              <span>🎮</span> 操作ガイド
            </h3>
            <div className="space-y-1.5 leading-relaxed text-neutral-400">
              <p>
                <strong className="text-neutral-200">📱 スマホ操作:</strong>
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>左画面ドラッグ: 移動 (前後左右)</li>
                <li>右画面ドラッグ: 視点回転 (上下左右)</li>
                <li>「⛏️ 掘る」: 照準しているブロックを破壊</li>
                <li>「🧱 置く」: 手持ちブロックを設置</li>
                <li>「⬆️ 跳ぶ」: ジャンプ</li>
                <li>「🕊️ 飛行」: 自由に空中浮遊・建築</li>
                <li>画面下ホットバー: ブロック選択 (「•••」で全種類)</li>
              </ul>
              <p className="pt-1">
                <strong className="text-neutral-200">💻 PC操作:</strong>
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>画面クリック: マウス視点操作（ESCで解除）</li>
                <li>W/A/S/D: 移動、スペース: ジャンプ、Shift: しゃがむ</li>
                <li>左クリック: 掘る、右クリック: 置く</li>
                <li>1〜9キー: スロット選択、F: 飛行切替、E: パレット</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-bold rounded-xl transition-colors"
          >
            ゲームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};
