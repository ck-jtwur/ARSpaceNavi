# AR Space Navigation

スマホの位置情報、カメラ、端末の向きセンサーに同期して、現在の空にある天体の位置を画面上へ重ねて表示するAR天体ナビゲーションアプリです。

太陽、月、惑星、準惑星、恒星、ブラックホール、銀河、系外惑星などを対象に、画面上の天体アイコンをタップすると解説を表示します。AI解説が利用できない場合でも、あらかじめ用意したフォールバック解説をランダムに表示します。

## 主な機能

- スマホの方位・傾きに合わせた天体位置の表示
- カメラ映像の上に天体アイコンを重ねるAR風ビュー
- 手動操作による方角・高さの調整
- 天体リストからのジャンプ表示
- Gemini APIによる天体解説
- 通信失敗時やAPI未設定時のフォールバック解説
- Vercel Analyticsによる利用状況計測

## 技術構成

- React 19
- TypeScript
- Vite
- astronomy-engine
- Three.js / React Three Fiber
- Framer Motion
- Vercel Serverless Functions
- Vercel Analytics

## セットアップ

```bash
npm install
```

Gemini APIを使う場合は、プロジェクトルートに `.env.local` を作成して以下を設定します。

```env
GEMINI_API_KEY=your_api_key_here
```

未設定でもアプリは動作し、解説はフォールバック文で表示されます。

## 開発

```bash
npm run dev
```

ローカルではViteの開発サーバー上で `/api/celestial-info` が動作します。

## ビルド

```bash
npm run build
```

ビルド結果は `dist/` に出力されます。

## プレビュー

```bash
npm run preview
```

## ディレクトリ構成

```text
api/                    Vercel用の天体解説API
public/celestial/       天体アイコン画像
src/App.tsx             アプリ本体のUIと操作
src/astro.ts            天体位置計算
src/celestialCatalog.ts 天体カタログとフォールバック解説
src/celestialInfoService.ts Gemini API呼び出しとフォールバック処理
src/VirtualSky.tsx      3D背景表示
src/styles.css          スタイル
```

## 使い方

1. 位置情報と端末の向きセンサーを許可します。
2. 必要に応じてカメラを起動します。
3. スマホを空へ向けると、現在の向きに合わせて天体アイコンが表示されます。
4. 気になる天体をタップすると、解説を読むことができます。

## デプロイ

Vercelへのデプロイを想定しています。`GEMINI_API_KEY` をVercelのEnvironment Variablesに設定すると、本番環境でもAI解説が有効になります。

Vercel Analyticsは `src/main.tsx` で読み込んでいます。Vercel上にデプロイすると、プロジェクトのAnalytics画面で計測を確認できます。

---

# AR Space Navigation

AR Space Navigation is an AR-style celestial navigation app that syncs with a smartphone's location, camera, and orientation sensors to overlay the current positions of celestial bodies on the screen.

It covers the Sun, Moon, planets, dwarf planets, stars, black holes, galaxies, exoplanets, and more. When users tap a celestial icon on the screen, the app displays an explanation. If AI-generated explanations are unavailable, the app randomly shows one of the prepared fallback explanations.

## Key Features

- Displays celestial positions based on the smartphone's direction and tilt
- AR-style view that overlays celestial icons on the camera feed
- Manual controls for heading and altitude
- Jump navigation from the celestial body list
- Celestial explanations powered by the Gemini API
- Fallback explanations for network failures or missing API configuration
- Usage tracking with Vercel Analytics

## Tech Stack

- React 19
- TypeScript
- Vite
- astronomy-engine
- Three.js / React Three Fiber
- Framer Motion
- Vercel Serverless Functions
- Vercel Analytics

## Setup

```bash
npm install
```

To use the Gemini API, create a `.env.local` file in the project root and set the following value.

```env
GEMINI_API_KEY=your_api_key_here
```

The app also works without this setting. In that case, explanations are shown using fallback text.

## Development

```bash
npm run dev
```

In local development, `/api/celestial-info` runs on the Vite development server.

## Build

```bash
npm run build
```

The build output is generated in `dist/`.

## Preview

```bash
npm run preview
```

## Directory Structure

```text
api/                    Celestial explanation API for Vercel
public/celestial/       Celestial icon images
src/App.tsx             Main app UI and interactions
src/astro.ts            Celestial position calculations
src/celestialCatalog.ts Celestial catalog and fallback explanations
src/celestialInfoService.ts Gemini API calls and fallback handling
src/VirtualSky.tsx      3D background rendering
src/styles.css          Styles
```

## How to Use

1. Allow location access and device orientation sensors.
2. Start the camera if needed.
3. Point the smartphone at the sky, and celestial icons will appear based on the current direction.
4. Tap a celestial body you are interested in to read its explanation.

## Deployment

This project is designed to be deployed on Vercel. Set `GEMINI_API_KEY` in Vercel Environment Variables to enable AI explanations in production.

Vercel Analytics is loaded in `src/main.tsx`. After deploying to Vercel, usage metrics can be checked from the project's Analytics dashboard.
