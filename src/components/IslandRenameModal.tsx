import React, { useState, useEffect } from 'react';
import { X, Check, Compass } from 'lucide-react';

interface IslandRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => void;
}

const ISLAND_NAME_PRESETS = [
  'ひらめき島',
  'エメラルド島',
  'ワンダーアイランド',
  'ドリームクラフト島',
  '冒険者の楽園',
  '天空のオアシス',
];

export const IslandRenameModal: React.FC<IslandRenameModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onSave,
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto select-none">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">島の名前を設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-stone-400 block mb-1.5 font-medium">
              あなたの島の名前（30文字以内）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: エメラルド島"
                autoFocus
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <span className="text-xs text-stone-400 block mb-2 font-medium">おすすめの名前：</span>
            <div className="flex flex-wrap gap-1.5">
              {ISLAND_NAME_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setName(preset)}
                  className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-300 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs rounded-xl text-stone-300 font-medium transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs rounded-xl font-bold text-white flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/40"
            >
              <Check className="w-4 h-4" />
              <span>決定する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
