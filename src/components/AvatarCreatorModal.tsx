import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AvatarProfile,
  DEFAULT_AVATAR_PROFILE,
  AVATAR_PRESETS,
  HairStyle,
  Accessory,
  AvatarBlockType,
} from '../domain/islandAvatarSchemas';
import { AvatarModel } from '../engine/avatarMesh';
import { X, Shuffle, Check, Smile, Box, User, Shirt, Crown, Layers } from 'lucide-react';

interface AvatarCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: AvatarProfile;
  onSave?: (profile: AvatarProfile) => void;
  onSaveProfile?: (profile: AvatarProfile) => void;
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

const AVATAR_BLOCK_OPTIONS: { id: AvatarBlockType; label: string; icon: string; previewColor: string }[] = [
  { id: 'none', label: '通常カラー', icon: '🎨', previewColor: '#78716c' },
  { id: 'diamond', label: 'ダイヤ', icon: '💎', previewColor: '#38bdf8' },
  { id: 'gold', label: 'ゴールド', icon: '🪙', previewColor: '#eab308' },
  { id: 'iron', label: '鉄', icon: '⛓️', previewColor: '#cbd5e1' },
  { id: 'tnt', label: 'TNT', icon: '💣', previewColor: '#ef4444' },
  { id: 'obsidian', label: '黒曜石', icon: '🌌', previewColor: '#1e1b4b' },
  { id: 'glowstone', label: 'グロウ', icon: '💡', previewColor: '#fde047' },
  { id: 'wood', label: '原木', icon: '🪵', previewColor: '#78350f' },
  { id: 'leaves', label: '葉っぱ', icon: '🍃', previewColor: '#22c55e' },
  { id: 'planks', label: '木材', icon: '🪑', previewColor: '#d97706' },
  { id: 'brick', label: 'レンガ', icon: '🧱', previewColor: '#b91c1c' },
  { id: 'bookshelf', label: '本棚', icon: '📚', previewColor: '#92400e' },
  { id: 'cactus', label: 'サボテン', icon: '🌵', previewColor: '#16a34a' },
  { id: 'stone', label: '石', icon: '🪨', previewColor: '#64748b' },
  { id: 'cobblestone', label: '丸石', icon: '🏰', previewColor: '#71717a' },
  { id: 'glass', label: 'ガラス', icon: '🪟', previewColor: '#67e8f9' },
  { id: 'sand', label: '砂', icon: '🏖️', previewColor: '#fcd34d' },
  { id: 'snow', label: '雪', icon: '❄️', previewColor: '#f1f5f9' },
];

export const AvatarCreatorModal: React.FC<AvatarCreatorModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<AvatarProfile>(currentProfile);
  const [activeTab, setActiveTab] = useState<'block' | 'preset' | 'face' | 'clothes' | 'acc'>('block');
  const [activePart, setActivePart] = useState<'head' | 'body' | 'arms' | 'legs'>('head');

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
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

      rotationAngle += dt * 0.75;
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
        avatarModelRef.current.dispose?.();
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
    const randomBlocks: AvatarBlockType[] = ['none', 'diamond', 'gold', 'tnt', 'obsidian', 'wood', 'leaves', 'brick'];
    const randomBlock = () => randomBlocks[Math.floor(Math.random() * randomBlocks.length)];

    setProfile((prev) => ({
      ...prev,
      skinColor: randomSkin,
      hairColor: randomHair,
      shirtColor: randomShirt,
      pantsColor: randomPants,
      eyeColor: randomEye,
      accessory: randomAcc,
      hairStyle: randomStyle,
      headBlock: randomBlock(),
      bodyBlock: randomBlock(),
      armsBlock: randomBlock(),
      legsBlock: randomBlock(),
    }));
  };

  const handleApplyFullBlockTheme = (block: AvatarBlockType) => {
    setProfile((prev) => ({
      ...prev,
      headBlock: block,
      bodyBlock: block,
      armsBlock: block,
      legsBlock: block,
    }));
  };

  const handleApply = () => {
    const trimmedName = profile.name.trim() || 'スティーブ';
    const finalProfile: AvatarProfile = {
      ...profile,
      name: trimmedName,
    };

    const saveFn = onSave || onSaveProfile;
    if (saveFn) {
      saveFn(finalProfile);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-950 border border-emerald-700 rounded-lg text-emerald-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                アバター・ブロック着せ替え工房
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ブロック対応
                </span>
              </h2>
              <p className="text-xs text-stone-400">お好みのブロックや色で自分だけのキャラクターを作ろう！</p>
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
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: 3D Preview & Name input */}
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-stone-950/60 rounded-xl p-4 border border-stone-800">
            <div className="w-full flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider">3D リアルタイム回転</span>
              <button
                onClick={handleRandomize}
                className="flex items-center gap-1 text-xs bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-md text-stone-300 transition"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>ランダム</span>
              </button>
            </div>

            <div className="w-full h-56 flex items-center justify-center relative">
              <canvas ref={previewCanvasRef} className="w-full h-full cursor-grab" />
            </div>

            {/* Avatar Name Input with immediate Enter-to-save */}
            <div className="w-full mt-2 bg-stone-900/90 p-2.5 rounded-xl border border-stone-800">
              <label className="text-xs text-stone-300 font-medium flex items-center justify-between mb-1">
                <span>キャラクター名</span>
                <span className="text-[10px] text-emerald-400">Enterキーで即保存</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={profile.name}
                  maxLength={16}
                  placeholder="キャラクター名を入力..."
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApply();
                    }
                  }}
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={handleApply}
                  title="この名前で確定保存"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>保存</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 flex flex-col">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-stone-800 pb-2 mb-3">
              <button
                onClick={() => setActiveTab('block')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'block'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-emerald-200" />
                <span>ブロック素材</span>
              </button>
              <button
                onClick={() => setActiveTab('preset')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'preset'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>プリセット</span>
              </button>
              <button
                onClick={() => setActiveTab('face')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'face'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>顔・髪型</span>
              </button>
              <button
                onClick={() => setActiveTab('clothes')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'clothes'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>服・パンツ</span>
              </button>
              <button
                onClick={() => setActiveTab('acc')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'acc'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>アクセサリ</span>
              </button>
            </div>

            {/* TAB: BLOCK CUSTOMIZER */}
            {activeTab === 'block' && (
              <div className="space-y-4 text-xs">
                {/* 1. Quick Full Body Block */}
                <div className="bg-stone-950/40 p-3 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <span>⚡ 全身一括ブロック着せ替え</span>
                    </span>
                    <button
                      onClick={() => handleApplyFullBlockTheme('none')}
                      className="text-[11px] text-stone-400 hover:text-stone-200 underline"
                    >
                      通常カラーに戻す
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: 'diamond', label: 'ダイヤ', icon: '💎' },
                      { id: 'gold', label: '金', icon: '🪙' },
                      { id: 'tnt', label: 'TNT', icon: '💣' },
                      { id: 'obsidian', label: '黒曜石', icon: '🌌' },
                      { id: 'leaves', label: '葉っぱ', icon: '🍃' },
                      { id: 'wood', label: '原木', icon: '🪵' },
                      { id: 'brick', label: 'レンガ', icon: '🧱' },
                      { id: 'bookshelf', label: '本棚', icon: '📚' },
                      { id: 'cactus', label: 'サボテン', icon: '🌵' },
                      { id: 'glowstone', label: 'グロウ', icon: '💡' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleApplyFullBlockTheme(b.id as AvatarBlockType)}
                        className="py-1.5 px-2 bg-stone-800/90 hover:bg-stone-700 rounded-lg border border-stone-700 text-center flex items-center justify-center gap-1 transition"
                      >
                        <span>{b.icon}</span>
                        <span className="text-[11px] font-medium">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Part Selector */}
                <div>
                  <span className="font-bold text-stone-300 block mb-2">部位ごとに好みのブロックを選ぶ</span>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[
                      { key: 'head', label: '👤 頭部', current: profile.headBlock },
                      { key: 'body', label: '👕 胴体', current: profile.bodyBlock },
                      { key: 'arms', label: '🦾 両腕', current: profile.armsBlock },
                      { key: 'legs', label: '🦿 脚部', current: profile.legsBlock },
                    ].map((part) => (
                      <button
                        key={part.key}
                        onClick={() => setActivePart(part.key as any)}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          activePart === part.key
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                            : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        <span className="font-semibold">{part.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">
                          {AVATAR_BLOCK_OPTIONS.find((o) => o.id === part.current)?.label ?? '通常'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Block Options for current active part */}
                  <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                    <span className="text-stone-400 block mb-2 text-[11px]">
                      {activePart === 'head' && '👤 頭部に割り当てるブロックを選択：'}
                      {activePart === 'body' && '👕 胴体・アーマーに割り当てるブロックを選択：'}
                      {activePart === 'arms' && '🦾 両腕に割り当てるブロックを選択：'}
                      {activePart === 'legs' && '🦿 脚部に割り当てるブロックを選択：'}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {AVATAR_BLOCK_OPTIONS.map((opt) => {
                        const isSelected =
                          (activePart === 'head' && profile.headBlock === opt.id) ||
                          (activePart === 'body' && profile.bodyBlock === opt.id) ||
                          (activePart === 'arms' && profile.armsBlock === opt.id) ||
                          (activePart === 'legs' && profile.legsBlock === opt.id);

                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              if (activePart === 'head') setProfile({ ...profile, headBlock: opt.id });
                              if (activePart === 'body') setProfile({ ...profile, bodyBlock: opt.id });
                              if (activePart === 'arms') setProfile({ ...profile, armsBlock: opt.id });
                              if (activePart === 'legs') setProfile({ ...profile, legsBlock: opt.id });
                            }}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                              isSelected
                                ? 'bg-emerald-700/60 border-emerald-400 text-white ring-1 ring-emerald-400'
                                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                            }`}
                          >
                            <span className="text-base shrink-0">{opt.icon}</span>
                            <span className="text-xs truncate font-medium">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRESETS */}
            {activeTab === 'preset' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">ワンタップで完成アバターやブロックキャラクターに変身：</p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(AVATAR_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setProfile({
                          ...preset,
                          name: profile.name.trim() ? profile.name : preset.name,
                        })
                      }
                      className="p-2.5 bg-stone-800 hover:bg-stone-700/80 border border-stone-700 rounded-xl text-left flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-stone-600 shrink-0"
                          style={{
                            backgroundColor:
                              preset.headBlock && preset.headBlock !== 'none'
                                ? AVATAR_BLOCK_OPTIONS.find((b) => b.id === preset.headBlock)?.previewColor ?? '#fff'
                                : preset.shirtColor,
                          }}
                        />
                        <span className="text-xs font-semibold">{preset.name}</span>
                      </div>
                      {preset.headBlock && preset.headBlock !== 'none' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                          ブロック
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: FACE & HAIR */}
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

            {/* TAB: CLOTHES */}
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

            {/* TAB: ACCESSORIES */}
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
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
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
