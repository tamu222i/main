import React, { useState } from 'react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'mobile' | 'pc' | 'github' | 'craft';

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('mobile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm pointer-events-auto select-none">
      <div className="bg-neutral-900 border border-neutral-750 rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
              <span>📖</span> 操作説明 & ガイド
            </h2>
            <p className="text-xs text-neutral-400">
              スマホ/PCでの遊び方とGitHub Pages公開手順
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950/60 rounded-xl my-3 border border-neutral-800">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'mobile'
                ? 'bg-neutral-800 text-amber-300 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📱 スマホ操作
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pc'
                ? 'bg-neutral-800 text-amber-300 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            💻 PC操作
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'github'
                ? 'bg-neutral-800 text-amber-300 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🚀 GitHub公開
          </button>
          <button
            onClick={() => setActiveTab('craft')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'craft'
                ? 'bg-neutral-800 text-amber-300 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            💡 建築ヒント
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs text-neutral-300">
          {activeTab === 'mobile' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span>🕹️</span> 移動と視点の動かし方
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <strong className="text-white block mb-1">👈 左画面 (移動)</strong>
                    指を置いてスライドするとバーチャルジョイスティックが出現し、前後左右に移動できます。
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <strong className="text-white block mb-1">👉 右画面 (視点回転)</strong>
                    画面の右側をスワイプすると、上下左右に視点を回転できます。照準（＋）をブロックに合わせて操作します。
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span>🔘</span> 右下アクションボタン一覧
                </h3>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-sm font-bold text-rose-300 flex-shrink-0">
                      ⛏️
                    </span>
                    <div>
                      <strong className="text-white block">掘る (ブロック破壊)</strong>
                      照準が合っているブロックを壊します。
                    </div>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-sm font-bold text-emerald-300 flex-shrink-0">
                      🧱
                    </span>
                    <div>
                      <strong className="text-white block">置く (ブロック設置)</strong>
                      照準を合わせたブロックの面に、手持ちブロックを設置します。
                    </div>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0">
                      ⬆️
                    </span>
                    <div>
                      <strong className="text-white block">跳ぶ (ジャンプ)</strong>
                      1ブロック分の段差を飛び越えます（低い段差は自動昇降します）。
                    </div>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-sm font-bold text-amber-300 flex-shrink-0">
                      🕊️
                    </span>
                    <div>
                      <strong className="text-white block">飛行 (クリエイティブ飛行)</strong>
                      重力を無効化し、空中を自在に飛べます。跳ぶボタンで上昇、しゃがみボタンで下降します。
                    </div>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="w-8 h-8 rounded-lg bg-neutral-700/50 border border-neutral-600/50 flex items-center justify-center text-sm font-bold text-neutral-300 flex-shrink-0">
                      🐢
                    </span>
                    <div>
                      <strong className="text-white block">しゃがむ (スニーク)</strong>
                      低速で慎重に移動します。飛行中は下降します。
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'pc' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm">💻 キーボード & マウス対応表</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>移動 (前後左右)</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      W / A / S / D
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>視点操作 (マウスポインター)</span>
                    <span className="text-neutral-400">画面クリックで開始 (ESC解除)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>掘る (ブロック破壊)</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      マウス左クリック
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>置く (ブロック設置)</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      マウス右クリック
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>ジャンプ</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      Space
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>しゃがむ</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      Shift
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>飛行モード切替</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      F
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>全ブロックパレット</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      E
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span>スロット選択</span>
                    <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded font-mono text-[11px] text-amber-300">
                      1 〜 9 キー
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800 space-y-2.5">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span>🚀</span> GitHub Pages (github.io) への自動公開手順
                </h3>
                <p className="text-neutral-300 leading-relaxed">
                  本プロジェクトは <code className="px-1.5 py-0.5 rounded bg-neutral-900 text-amber-300">base: './'</code> で相対パスビルドされ、
                  <code className="px-1.5 py-0.5 rounded bg-neutral-900 text-amber-300">.github/workflows/deploy.yml</code> によるGitHub Actions自動デプロイが設定済みです。
                </p>

                <ol className="space-y-2 pl-4 list-decimal text-neutral-300">
                  <li>
                    <strong className="text-white">リポジトリをGitHubにプッシュ:</strong>
                    <div className="bg-neutral-900 p-2 rounded-xl font-mono text-[11px] text-neutral-300 mt-1 overflow-x-auto">
                      git remote add origin https://github.com/&lt;ユーザー名&gt;/&lt;リポジトリ名&gt;.git<br />
                      git push -u origin main
                    </div>
                  </li>
                  <li>
                    <strong className="text-white">GitHubのリポジトリ設定を開く:</strong>
                    <p className="mt-0.5">
                      GitHubリポジトリの [Settings] タブ → 左メニューの [Pages] を開きます。
                    </p>
                  </li>
                  <li>
                    <strong className="text-white">Build and deployment の Source を選択:</strong>
                    <p className="mt-0.5">
                      Source のプルダウンで <strong>「GitHub Actions」</strong> を選択します。
                    </p>
                  </li>
                  <li>
                    <strong className="text-white">デプロイ完了:</strong>
                    <p className="mt-0.5">
                      プッシュ時にGitHub Actionsが自動実行され、数分で <code className="text-amber-300">https://&lt;ユーザー名&gt;.github.io/&lt;リポジトリ名&gt;/</code> に公開されます！
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'craft' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm">💡 快適な建築のためのヒント</h3>
                <ul className="space-y-2 text-neutral-300 leading-relaxed">
                  <li className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <strong className="text-white block mb-0.5">✨ 飛行モードと視点感度</strong>
                    高い建物を建てる時は「🕊️ 飛行」モードを活用してください。視点移動が速すぎる/遅すぎる場合は「⚙️ 設定」の感度スライダーで調整できます。
                  </li>
                  <li className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <strong className="text-white block mb-0.5">🧱 照準ブロックの枠線表示</strong>
                    視線を合わせたブロックには黒いワイヤーフレーム枠線が表示されます。設置時はその枠線の「面」に向けて設置ボタンを押すとスムーズに積み上げられます。
                  </li>
                  <li className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <strong className="text-white block mb-0.5">💾 こまめにワールドを保存</strong>
                    右上の「⚙️」から「ワールドを保存」を押すと、あなたの作った街や建造物がブラウザ内に永続保存されます。
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
