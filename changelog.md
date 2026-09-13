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

### [Cycle 5: Ground Continuity, Fall Prevention, Island Naming & Avatar Customization] - Red -> Green -> Refactor
- **Red (Test First)**:
  - `src/domain/islandAvatar.test.ts`: 島のプロフィール（名前・作成者・バイオーム）およびアバター（肌・髪型・髪色・シャツ・パンツ・目・アクセサリ）のZodスキーマ検証、デフォルト値フォールバックの振る舞いテストを作成
  - `src/infrastructure/worldRepository.test.ts`: 島データおよびアバターデータのLocalStorage永続化・復元テストを追加
  - `src/domain/voxelWorld.test.ts` & `src/domain/player.test.ts`: 底面保護（y<=0岩盤）、ワールド外周境界クランプ、落下時の安全地点リスポーンの振る舞いテストを追加
- **Green (Implementation)**:
  - `islandAvatarSchemas.ts`: 島プロフィール（`IslandProfile`）とアバター（`AvatarProfile`）のZodスキーマとプリセット定義
  - `worldRepository.ts`: 島の名前およびアバター外見設定のLocalStorage保存・ロードメソッドを実装
  - `voxelWorld.ts`: y<=0を常に堅牢な岩盤として扱い、奈落落下を防止する床面セーフガードを実装
  - `player.ts`: 外周境界クランプ（0.6〜worldSize-0.6）、安全スポーン座標（`safeSpawn`）追跡、y<1.0転落時の自動リスポーン処理を実装
  - `avatarMesh.ts`: Three.jsによる3Dボクセルアバターモデル（頭、胴体、腕、脚、髪、アクセサリ）の生成および歩行・飛行・採掘スイングアニメーションを実装
  - `AvatarCreatorModal.tsx`: 直感的なカラーパレット・髪型・アクセサリ選択が可能なアバター着せ替えモーダルUIを実装
  - `IslandRenameModal.tsx`: 島の名前をいつでも変更できるモーダルUI（おすすめプリセット付き）を実装
  - `GameHUD.tsx`: 画面左上に島の名前バッジ、右上に3段階カメラ視点切替ボタン（1人称 / 3人称背面 / 自撮り正面）およびアバター作成ボタンを統合
  - `SettingsModal.tsx`: 設定画面トップに島の名前変更およびアバター編集へのショートカットを追加
  - `App.tsx`: 3Dシーン内へのアバター配置、F5キー/ボタンによる視点切替、安全リスポーン時のトースト通知、44x44x32の広大で連続した地面生成を統合
  - 全32件のユニットテストが合格
- **Refactor (Clean Polish & Verification)**:
  - TypeScript型安全性検証（`tsc --noEmit` エラー 0件）
  - 全ユニットテスト（7ファイル、32テスト）完全パス
  - 本番ビルド（`vite build`）検証完了

