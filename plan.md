# スマホWEB向けマインクラフト開発計画書 (plan.md)

## 1. 概要
スマートフォンブラウザ（iOS Safari / Android Chrome）およびデスクトップWebで快適に動作する3Dボクセルクラフトゲーム（マインクラフト風サンドボックス）。
スキーマ駆動設計（Zod）、軽量DDD（ドメイン駆動設計）、BDD/TDDによるテスト駆動開発を採用。

## 2. アーキテクチャ構成 (軽量DDD & スキーマ駆動)

### 2.1 スキーマ駆動層 (`src/domain/schemas.ts`)
- **BlockTypeSchema**: ブロック種別のZodスキーマ（air, grass, dirt, stone, cobblestone, wood, leaves, planks, sand, glass, brick, water, flower）
- **Position3DSchema**: 3次元座標値オブジェクトのスキーマと整数グリッドスナップ
- **VoxelBlockSchema**: ブロック個体データのスキーマ
- **PlayerStateSchema**: プレイヤーの座標、視線（Pitch/Yaw）、速度、接地判定、選択ブロック
- **WorldConfigSchema**: ワールド生成設定（シード値、サイズ、重力、移動速度など）

### 2.2 ドメイン層 (`src/domain/`)
- **Value Objects**:
  - `Vector3D`: 不変な3次元ベクトル、グリッド座標変換、距離計算、正規化
  - `BlockDefinition`: 各ブロックの特性（透過性、固体判定、破壊時間、テクスチャ定義）
  - `RaycastHit`: 視線とボクセル交差判定結果（対象ブロック座標、法線面＝設置座標）
- **Entities / Aggregates**:
  - `VoxelWorld`: ボクセルワールド集約。ブロック取得・配置・破壊、チャンク境界、周辺ブロックのAABB衝突判定
  - `Player`: プレイヤーエンティティ。AABBコリジョンボックス（幅0.6、高さ1.8）、重力・移動・ジャンプ・飛行
  - `Inventory`: 所持ブロック・ホットバー管理エンティティ
- **Domain Services**:
  - `TerrainGenerator`: パーリン/シンプレックス風ノイズを用いた地形生成（起伏、表層草、土層、岩盤層、木、葉、水面、花）
  - `PhysicsEngine`: プレイヤーとボクセル群の連続AABB衝突解決（X, Z, Y軸分離衝突判定）
  - `SoundSynthesizer`: Web Audio APIによる手続き的8-bitサウンド生成（掘る・置く・ジャンプ・歩行音）

### 2.3 インフラストラクチャ・永続化層 (`src/infrastructure/`)
- `WorldStorageRepository`: LocalStorageを活用したワールドデータのセーブ＆ロード機能

### 2.4 プレゼンテーション・描画層 (`src/presentation/` & `src/components/`)
- **Three.js Voxel Engine**:
  - 露出面カリング（隠蔽面除去）による超高速メッシュ生成（モバイル60FPS維持）
  - 16x16ピクセルの手描き風マインクラフトテクスチャをプロシージャル生成
  - 日照・環境光・影・ターゲットブロックの枠線表示
- **Mobile Web UI**:
  - 左画面: バーチャルアナログジョイスティック（前後左右移動）
  - 右画面: タッチスワイプによる視点回転（スムーズな追従 & 感度調整）
  - アクションボタン: [掘る / 壊す] [置く] [ジャンプ] [飛行切替]
  - ホットバー: 画面下部に配置された直感的なアイテムスロット
  - インベントリモーダル: 全ブロックパレット選択
  - HUD: 座標(XYZ)、FPS、照準クロスヘア、各種設定パネル
  - デスクトップ対応: WASD + マウス視点（Pointer Lock）+ クリック操作

## 3. 開発プロセス (TDD / BDD & Red-Green-Refactor)

- **BDD/TDDアプローチ**:
  - ドメインの振る舞い（Given-When-Then）をVitestテストコードで定義
  - サイクル:
    1. **Red**: 失敗するテストを作成（仕様と振る舞いの定義）
    2. **Green**: テストを通過する最小限の実装
    3. **Refactor**: 設計の洗練・最適化・軽量DDD準拠
    4. **Commit & Changelog**: 履歴にRed->Green->Refactorを1回のコミットとして記録

## 4. GitHub Pages (github.io) デプロイ対応 & 初心者ガイド機能
- **相対パスビルド (`base: './'`)**:
  - `vite.config.ts` で `base: './'` を設定し、`username.github.io/repo-name/` のようなサブディレクトリ配下でもアセット（JS/CSS/アイコン）が404にならず正常読み込み可能に設定。
- **GitHub Actions 自動デプロイ ワークフロー (`.github/workflows/deploy.yml`)**:
  - `main`/`master` ブランチへの push または手動トリガー時に、自動で依存関係インストール、テスト実行（Vitest）、ビルド（Vite）、GitHub Pagesへの発行を完全自動化。
  - `package-lock.json` 生成・コミットおよび `deploy.yml` 内のフォールバックによりロックファイル未検出エラーを防止。
- **インタラクティブ・操作説明 & ヒント表示機能**:
  - `TutorialHintManager` (`src/domain/tutorialHints.ts`): BDD/TDDでテストされたチュートリアルヒント管理サービス。
  - `HintBanner.tsx`: 画面上部に視点移動、掘る、置く、飛行、セーブなどの重要ヒントをカルーセル表示。
  - `GuideModal.tsx`: スマホ操作、PC操作、GitHub Pages公開手順、建築ヒントをタブ別にわかりやすく表示。

## 5. 地面の連続化（落下防止）・島の名前設定・アバター作成システム
- **地面の連続化 & 落下防止機構**:
  - `VoxelWorld` の床面保護: `y <= 0` を常に破壊不能な岩盤（Bedrock / Stone）として扱い、ワールド外周でも奈落へ突き抜けない継続的フロアおよび境界セーフガードを整備。
  - `Player` の安全リスポーン: 万が一足場外や低高度（`y < 1`）へ転落した際は、島の中央地表の安全座標へ自動でソフト復帰し、落下ループを防止。
  - ワールドサイズを拡張（40x40x32）し、周縁部にも砂浜・海・足場が途切れず続く連続的な地形生成。
- **島の名前設定（Island Profile Domain）**:
  - `IslandProfileSchema`: 島の名前（例: 「エメラルド島」「ひらめきクラフト島」）、作成者名、バイオーム設定をZodスキーマ駆動で管理。
  - HUDおよび設定画面からいつでもワンタップで島の名称を変更可能にし、LocalStorageに永続化。
- **アバター作成 & 3Dモデル表示（Avatar Domain & 3D Renderer）**:
  - `AvatarProfileSchema`: 肌の色、髪型（ショート、ロング、スパイキー、アフロなど）、髪色、服（シャツ/パンツ色）、目色、アクセサリ（王冠、メガネ、ヘルメット、猫耳、ヘッドホンなど）の定義。
  - 3Dボクセルキャラクター（頭、胴体、腕、足）のThree.jsメッシュ生成と、移動時の歩行・腕振りアニメーション。
  - カメラ視点切替機能（1人称視点 ↔ 3人称背面視点 ↔ 3人称正面自撮り視点）をボタン（📷）およびキー（F5）で提供。
  - 直感的なカラーパレットやプリセットを備えた「アバター作成モーダル」の実装。

