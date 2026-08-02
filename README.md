# AR Space Navigation

スマホの位置情報、カメラ、端末の向きセンサーに同期して、現在の空にある天体の位置を画面上へ重ねて表示するAR天体ナビゲーションアプリです。

太陽、月、惑星、準惑星、恒星、ブラックホール、銀河、系外惑星などを対象に、画面上の天体アイコンをタップすると解説を表示します。AI解説が利用できない場合でも、あらかじめ用意したフォールバック解説をランダムに表示します。

## 主な機能

- 「空にかざす」：スマホの方位・傾きに合わせた天体位置の表示
- 「カメラに重ねる」：カメラ映像の上に天体アイコンを重ねるAR風ビュー
- 「指で見渡す」：ドラッグによる方角・高さの調整
- 「天体をさがす」：種別ごとにまとめた一覧から、その天体の方向へ移動
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
public/favicon.svg      アプリのアイコン（favicon-96.png / apple-touch-icon.png は同SVGから生成）
src/App.tsx             アプリ本体のUIと操作
src/astro.ts            天体位置計算
src/celestialCatalog.ts 天体カタログとフォールバック解説
src/celestialInfoService.ts Gemini API呼び出しとフォールバック処理
src/VirtualSky.tsx      3D背景表示
src/styles.css          スタイル
```

## 使い方

1. 位置情報を許可します（許可しない場合は東京の空を表示します）。
2. 右下の星ボタンでメニューを開き、「空にかざす」をオンにしてセンサーを許可します。
3. スマホを空へ向けると、その方向にある天体が画面に表示されます。必要に応じて「カメラに重ねる」をオンにします。
4. センサーを使わない場合は、画面をドラッグして見渡すか、「天体をさがす」から天体を選びます。
5. 気になる天体をタップすると、地球からの距離と解説を読むことができます。

## デプロイ

Vercelへのデプロイを想定しています。`GEMINI_API_KEY` をVercelのEnvironment Variablesに設定すると、本番環境でもAI解説が有効になります。

Vercel Analyticsは `src/main.tsx` で読み込んでいます。Vercel上にデプロイすると、プロジェクトのAnalytics画面で計測を確認できます。

---

# AR Space Navigation

AR Space Navigation is an AR-style celestial navigation app that syncs with a smartphone's location, camera, and orientation sensors to overlay the current positions of celestial bodies on the screen.

It covers the Sun, Moon, planets, dwarf planets, stars, black holes, galaxies, exoplanets, and more. When users tap a celestial icon on the screen, the app displays an explanation. If AI-generated explanations are unavailable, the app randomly shows one of the prepared fallback explanations.

## Key Features

- Sensor mode: displays celestial positions based on the smartphone's direction and tilt
- Camera mode: AR-style view that overlays celestial icons on the camera feed
- Drag to look around: manual controls for heading and altitude
- Search list: jump to a body's direction from a list grouped by object type
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
public/favicon.svg      App icon (favicon-96.png / apple-touch-icon.png are rendered from it)
src/App.tsx             Main app UI and interactions
src/astro.ts            Celestial position calculations
src/celestialCatalog.ts Celestial catalog and fallback explanations
src/celestialInfoService.ts Gemini API calls and fallback handling
src/VirtualSky.tsx      3D background rendering
src/styles.css          Styles
```

## How to Use

1. Allow location access (Tokyo is used as the fallback if you decline).
2. Open the menu with the star button at the bottom right, turn on sensor mode, and allow device orientation.
3. Point the smartphone at the sky to see the bodies in that direction. Turn on the camera if you want them overlaid on the live view.
4. Without sensors, drag the screen to look around or pick a body from the search list.
5. Tap a celestial body you are interested in to read its distance and explanation.

## Deployment

This project is designed to be deployed on Vercel. Set `GEMINI_API_KEY` in Vercel Environment Variables to enable AI explanations in production.

Vercel Analytics is loaded in `src/main.tsx`. After deploying to Vercel, usage metrics can be checked from the project's Analytics dashboard.
