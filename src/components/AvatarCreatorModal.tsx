import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AvatarProfile,
  DEFAULT_AVATAR_PROFILE,
  AVATAR_PRESETS,
  HairStyle,
  Accessory,
} from '../domain/islandAvatarSchemas';
import { AvatarModel } from '../engine/avatarMesh';
import { X, Sparkles, Shuffle, Check, Palette, Smile } from 'lucide-react';

interface AvatarCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: AvatarProfile;
  onSave: (profile: AvatarProfile) => void;
}

const SKIN_COLORS = [
  { label: 'フェア', color: '#ffdfbf' },
  { label: 'ナチュラル', color: '#e0aa8b' },
  { label: 'オークル', color: '#d69e78' },
  { label: 'タン', color: '#ba7a54' },
  { label: 'ダーク', color: '#684535' },
  { label: 'サイバー', color: '#e2e8f0' },
];

const HAIR_COLORS = [
  { label: 'ブラック', color: '#1c1917' },
  { label: 'ブラウン', color: '#452c1e' },
  { label: 'チェスナット', color: '#b54f15' },
  { label: 'ゴールド', color: '#eab308' },
  { label: 'アクア', color: '#06b6d4' },
  { label: 'シルバー', color: '#cbd5e1' },
];

const SHIRT_COLORS = [
  { label: 'シアン', color: '#00aaaa' },
  { label: 'オリーブ', color: '#58733a' },
  { label: 'クリムゾン', color: '#e11d48' },
  { label: 'パープル', color: '#7c3aed' },
  { label: 'オレンジ', color: '#ea580c' },
  { label: 'ミッドナイト', color: '#0f172a' },
];

const PANTS_COLORS = [
  { label: 'デニム', color: '#2b3979' },
  { label: 'レザー', color: '#6f5235' },
  { label: 'ブラック', color: '#1e293b' },
  { label: 'エメラルド', color: '#047857' },
  { label: 'ホワイト', color: '#e2e8f0' },
  { label: 'ルビー', color: '#9f1239' },
];

const EYE_COLORS = [
  { label: 'ブルー', color: '#25477d' },
  { label: 'エメラルド', color: '#2e7d32' },
  { label: 'パープル', color: '#7c3aed' },
  { label: 'アンバー', color: '#d97706' },
  { label: 'レッド', color: '#e11d48' },
  { label: 'ダーク', color: '#18181b' },
];

const ACCESSORIES: { id: Accessory; label: string }[] = [
  { id: 'none', label: 'なし' },
  { id: 'crown', label: '👑 王冠' },
  { id: 'miner_helmet', label: '⛑️ ヘルメット' },
  { id: 'glasses', label: '👓 メガネ' },
  { id: 'cat_ears', label: '🐱 ネコ耳' },
  { id: 'headphones', label: '🎧 ヘッドホン' },
];

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'short', label: 'ショート' },
  { id: 'spiky', label: 'ツーブロック' },
  { id: 'ponytail', label: 'ポニーテール' },
  { id: 'afro', label: 'ボリューム' },
  { id: 'cap', label: 'キャップ風' },
];

export const AvatarCreatorModal: React.FC<AvatarCreatorModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}) => {
  const [profile, setProfile] = useState<AvatarProfile>(currentProfile);
  const [activeTab, setActiveTab] = useState<'preset' | 'face' | 'clothes' | 'acc'>('preset');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarModelRef = useRef<AvatarModel | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    setProfile(currentProfile);
  }, [currentProfile, isOpen]);

  // Setup 3D preview scene
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const width = canvas.clientWidth || 240;
    const height = canvas.clientHeight || 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const avatarModel = new AvatarModel(profile);
    avatarModelRef.current = avatarModel;
    scene.add(avatarModel.root);

    let animationFrameId: number;
    let rotationAngle = 0;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      rotationAngle += dt * 0.8;
      if (avatarModelRef.current) {
        avatarModelRef.current.root.rotation.y = rotationAngle;
        avatarModelRef.current.update(dt, true, false);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (avatarModelRef.current) {
        avatarModelRef.current.dispose();
      }
      renderer.dispose();
    };
  }, [isOpen]);

  // Update model when profile changes
  useEffect(() => {
    if (avatarModelRef.current) {
      avatarModelRef.current.buildMeshes(profile);
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomSkin = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].color;
    const randomHair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].color;
    const randomShirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)].color;
    const randomPants = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)].color;
    const randomEye = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].color;
    const randomAcc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id;
    const randomStyle = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;

    setProfile((prev) => ({
      ...prev,
      skinColor: randomSkin,
      hairColor: randomHair,
      shirtColor: randomShirt,
      pantsColor: randomPants,
      eyeColor: randomEye,
      accessory: randomAcc,
      hairStyle: randomStyle,
    }));
  };

  const handleApply = () => {
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <Smile className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">アバター作成・着せ替え</h2>
              <p className="text-xs text-stone-400">自分だけのオリジナルキャラクターを作ろう！</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: 3D Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-stone-950/60 rounded-xl p-4 border border-stone-800">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider">3D リアルタイムプレビュー</span>
              <button
                onClick={handleRandomize}
                className="flex items-center gap-1 text-xs bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded text-stone-300 transition"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>ランダム</span>
              </button>
            </div>

            <div className="w-full h-56 flex items-center justify-center relative">
              <canvas ref={previewCanvasRef} className="w-full h-full cursor-grab" />
            </div>

            {/* Avatar Name Input */}
            <div className="w-full mt-3">
              <label className="text-xs text-stone-400 font-medium block mb-1">キャラクター名</label>
              <input
                type="text"
                value={profile.name}
                maxLength={16}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-800 pb-2 mb-4">
              <button
                onClick={() => setActiveTab('preset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'preset' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                プリセット
              </button>
              <button
                onClick={() => setActiveTab('face')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'face' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                顔・髪型
              </button>
              <button
                onClick={() => setActiveTab('clothes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'clothes' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                服・パンツ
              </button>
              <button
                onClick={() => setActiveTab('acc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'acc' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                アクセサリ
              </button>
            </div>

            {/* Tab: Presets */}
            {activeTab === 'preset' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">ワンタップでお気に入りの外見に着替えられます：</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(AVATAR_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setProfile({ ...preset, name: profile.name || preset.name })}
                      className="p-3 bg-stone-800 hover:bg-stone-700/80 border border-stone-700 rounded-xl text-left flex items-center gap-2 transition"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-stone-600 shrink-0"
                        style={{ backgroundColor: preset.shirtColor }}
                      />
                      <span className="text-xs font-semibold">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Face & Hair */}
            {activeTab === 'face' && (
              <div className="space-y-4 text-xs">
                {/* Skin tone */}
                <div>
                  <span className="text-stone-400 block mb-2">肌のトーン</span>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setProfile({ ...profile, skinColor: item.color })}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          profile.skinColor === item.color ? 'border-emerald-400 scale-110' : 'border-stone-600'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair style */}
                <div>
                  <span className="text-stone-400 block mb-2">髪型</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setProfile({ ...profile, hairStyle: style.id })}
                        className={`py-1.5 px-2 rounded-lg border text-center transition ${
                          profile.hairStyle === style.id
                            ? 'bg-emerald-700/50 border-emerald-400 text-white'
                            : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair color */}
                <div>
                  <span className="text-stone-400 block mb-2">髪の色</span>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setProfile({ ...profile, hairColor: item.color })}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          profile.hairColor === item.color ? 'border-emerald-400 scale-110' : 'border-stone-600'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Eye color */}
                <div>
                  <span className="text-stone-400 block mb-2">目の色</span>
                  <div className="flex flex-wrap gap-2">
                    {EYE_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setProfile({ ...profile, eyeColor: item.color })}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          profile.eyeColor === item.color ? 'border-emerald-400 scale-110' : 'border-stone-600'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Clothes */}
            {activeTab === 'clothes' && (
              <div className="space-y-4 text-xs">
                {/* Shirt Color */}
                <div>
                  <span className="text-stone-400 block mb-2">シャツ・上着の色</span>
                  <div className="flex flex-wrap gap-2">
                    {SHIRT_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setProfile({ ...profile, shirtColor: item.color })}
                        className={`w-8 h-8 rounded-lg border-2 transition ${
                          profile.shirtColor === item.color ? 'border-emerald-400 scale-110' : 'border-stone-600'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Pants Color */}
                <div>
                  <span className="text-stone-400 block mb-2">ズボン・パンツの色</span>
                  <div className="flex flex-wrap gap-2">
                    {PANTS_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setProfile({ ...profile, pantsColor: item.color })}
                        className={`w-8 h-8 rounded-lg border-2 transition ${
                          profile.pantsColor === item.color ? 'border-emerald-400 scale-110' : 'border-stone-600'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Accessories */}
            {activeTab === 'acc' && (
              <div className="space-y-4 text-xs">
                <span className="text-stone-400 block mb-2">頭部アクセサリ</span>
                <div className="grid grid-cols-2 gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setProfile({ ...profile, accessory: acc.id })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        profile.accessory === acc.id
                          ? 'bg-emerald-700/50 border-emerald-400 text-white'
                          : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      <span className="font-medium">{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <button
            onClick={() => setProfile(DEFAULT_AVATAR_PROFILE)}
            className="text-xs text-stone-400 hover:text-stone-200 transition"
          >
            デフォルトに戻す
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs rounded-xl font-medium transition"
            >
              キャンセル
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs rounded-xl font-bold text-white flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/40"
            >
              <Check className="w-4 h-4" />
              <span>保存して島へ適用</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
