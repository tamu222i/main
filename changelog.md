# 変更履歴 (changelog.md)

すべての変更履歴とRed-Green-Refactorの開発サイクルを記録します。

## [0.1.0] - 2026-09-13
### 初期設計 & 計画策定
- **Plan**: `plan.md` にスキーマ駆動・軽量DDD・スマホWEB最適化の設計計画を策定。
- **Environment**: Three.js, Zod, Vitestを導入。Gitリポジトリを初期化。

### [Cycle 1: Domain Core & BDD/TDD] - Red -> Green -> Refactor
- **Red (Test First)**:
  - `src/domain/schemas.test.ts`: Zodスキーマによるブロック定義・位置情報・プレイヤー状態の仕様化
  - `src/domain/voxelWorld.test.ts`: ボクセル集約（ブロック配置・破壊・境界外保護・AABB衝突・DDAレイキャスト）の振る舞いテスト
  - `src/domain/player.test.ts`: プレイヤー物理（重力・接地判定・ステップ昇降・AABB障害物衝突・飛行）の仕様化
  - `src/domain/terrainGenerator.test.ts`: 決定論的シード地形生成の仕様化
- **Green (Implementation)**:
  - `schemas.ts`: ブロック種別・物性レジストリ（透過・固体・破壊度・音響）
  - `valueObjects.ts`: `Vector3D` 不変オブジェクト & `AABB`
  - `voxelWorld.ts`: DDA高速レイキャスト & 3Dボクセル配列管理
  - `player.ts`: 軸分離衝突判定 & スムーズステップ昇降
  - `terrainGenerator.ts`: 多重調波ノイズによる自然な起伏・木・水面・花生成
  - 全19件のユニットテストが合格
- **Refactor (Clean DDD)**:
  - 値オブジェクトのイミュータブル化、境界値チェックの最適化、メモリ効率化（TypedArray `Uint8Array`）

### [Cycle 2: Infrastructure, Engine & Mobile Web UI] - Red -> Green -> Refactor
- **Red (Test First)**:
  - `src/infrastructure/worldRepository.test.ts`: LocalStorage永続化および復元、エラー時の安全なフォールバックをテスト化
- **Green (Implementation)**:
  - `worldRepository.ts`: ワールドシリアライズ & LocalStorage永続化リポジトリ
  - `soundSynthesizer.ts`: Web Audio APIによるプロシージャル8-bitレトロ音響（掘る、置く、跳ぶ、歩行）
  - `textureAtlas.ts`: 16x16 HTML5 Canvasによる高解像度ピクセルアートテクスチャ自動生成（NearestFilter）
  - `voxelMeshBuilder.ts`: 隠蔽面カリング（隣接ブロック判定）によるモバイル高速60FPSボクセルメッシュ構築
  - `sceneManager.ts`: Three.js環境光、指向性日光・影、昼夜サイクル、視線対象ブロック枠線描画
  - `inputManager.ts`: マルチタッチ対応バーチャルジョイスティック、視点スワイプ、感度調整、PC（WASD/マウス）互換
  - `TouchControls.tsx`: アクションボタン（⛏️掘る, 🧱置く, ⬆️跳ぶ, 🕊️飛行, 🐢しゃがみ）
  - `Hotbar.tsx` & `BlockPaletteModal.tsx`: 9スロットホットバー & 全12ブロック選択モーダル
  - `SettingsModal.tsx`: シード値による新規ワールド生成、セーブ/ロード、操作マニュアル
  - 全21件のユニットテストが合格
- **Refactor (Production Polish)**:
  - TypeScript strict型安全性クリア（`tsc --noEmit` エラー 0件）
  - 本番ビルド（`vite build`）検証完了

### [Cycle 3: GitHub Pages Deployment & Interactive Operations Guide] - Red -> Green -> Refactor
- **Red (Test First)**:
  - `src/domain/tutorialHints.test.ts`: チュートリアルヒント管理（取得、次へ巡回、前へ巡回、ループ、表示/非表示切替）の振る舞いテストを作成・検証
- **Green (Implementation)**:
  - `vite.config.ts`: GitHub Pages用の相対ベースURL設定 (`base: './'`) を追加
  - `.github/workflows/deploy.yml`: GitHub ActionsによるGitHub Pages自動ビルド＆デプロイCI/CDワークフローを作成
  - `tutorialHints.ts`: 視点操作・掘る・置く・飛行・ホットバー・セーブ・PC操作のチュートリアルヒント管理サービスを実装
  - `HintBanner.tsx`: 画面上部に自動巡回するインタラクティブな初心者ヒントバナーを実装
  - `GuideModal.tsx`: スマホ操作図解・PCキー対応表・GitHub Pages公開手順・建築ヒントのタブ付き操作ガイドモーダルを実装
  - `GameHUD.tsx`: [📖 操作説明] ボタンと [💡 ヒント切替] ボタンを追加
  - 全25件のユニットテストが合格
- **Refactor (Clean Polish)**:
  - TypeScript型チェック（`tsc --noEmit`）合格
  - プロダクションビルド（`vite build`）合格

### [Cycle 4: Fix GitHub Actions Deploy Lockfile Error] - Red -> Green -> Refactor
- **Red (Issue Identification)**:
  - GitHub Actionsの `actions/setup-node@v4` で `cache: 'npm'` 指定時に、リポジトリに `package-lock.json` が存在しないため `Dependencies lock file is not found` エラーでビルドジョブが停止する問題を特定
- **Green (Implementation)**:
  - `package-lock.json` を生成しリポジトリにコミット
  - `.github/workflows/deploy.yml` の `setup-node` で必須キャッシュ指定を解除し、依存関係インストール部を `package-lock.json` の有無に応じて `npm ci` / `npm install` へフォールバックする耐障害性の高い処理に改善
- **Refactor (Verification)**:
  - 全25件のユニットテスト合格確認（`npm test`）
  - 本番ビルド検証完了（`vite build`）
