import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  Camera,
  ChevronLeft,
  Compass,
  HelpCircle,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { calculateCelestialBodies, CelestialBody, GeoLocation, shortestAngleDelta } from "./astro";
import { CelestialId, CelestialInfo, getRandomCelestialFallbackInfo } from "./celestialCatalog";
import VirtualSky from "./VirtualSky";


type OrientationState = {
  heading: number;
  pitch: number;
};

type ProjectedBody = {
  body: CelestialBody;
  visible: boolean;
  left: number;
  top: number;
};

const fallbackLocation: GeoLocation = {
  latitude: 35.6762,
  longitude: 139.6503,
};

const loadingMessages = [
  "深宇宙通信ネットワークを確立中...",
  "対象天体との通信プロトコルを同期中...",
  "亜空間センサーからのデータを解析中...",
  "アーカイブから星図データを復号中...",
  "数億年前に放たれた光子を捕捉中...",
  "データベースへ照会中...",
  "重力レンズ効果による座標のズレを補正中...",
  "天体のスペクトル分析を実行中...",
  "大気圏外のノイズフィルターを適用中...",
];

function shuffleMessages(messages: string[]) {
  const shuffled = [...messages];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function supportsOrientationPermission() {
  return typeof DeviceOrientationEvent !== "undefined" && "requestPermission" in DeviceOrientationEvent;
}

// Android Chrome の deviceorientation は相対値（alpha の基準が北でない）のため、
// 真北基準の deviceorientationabsolute をサポートしていれば優先する。
// iOS には存在しないので deviceorientation（webkitCompassHeading 付き）を使う。
const orientationEventName = (
  typeof window !== "undefined" && "ondeviceorientationabsolute" in window
    ? "deviceorientationabsolute"
    : "deviceorientation"
) as "deviceorientation";

function directionName(degrees: number) {
  const names = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
  return names[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

const radians = Math.PI / 180;
const degrees = 180 / Math.PI;

type Quaternion = {
  x: number;
  y: number;
  z: number;
  w: number;
};

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion {
  return {
    x: a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y,
    y: a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z,
    z: a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

function quaternionFromAxisAngle(axis: Vector3, angle: number): Quaternion {
  const half = angle / 2;
  const scale = Math.sin(half);

  return {
    x: axis.x * scale,
    y: axis.y * scale,
    z: axis.z * scale,
    w: Math.cos(half),
  };
}

function quaternionFromEulerYXZ(x: number, y: number, z: number): Quaternion {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);

  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 - s1 * s2 * c3,
    w: c1 * c2 * c3 + s1 * s2 * s3,
  };
}

function applyQuaternion(vector: Vector3, quaternion: Quaternion): Vector3 {
  const ix = quaternion.w * vector.x + quaternion.y * vector.z - quaternion.z * vector.y;
  const iy = quaternion.w * vector.y + quaternion.z * vector.x - quaternion.x * vector.z;
  const iz = quaternion.w * vector.z + quaternion.x * vector.y - quaternion.y * vector.x;
  const iw = -quaternion.x * vector.x - quaternion.y * vector.y - quaternion.z * vector.z;

  return {
    x: ix * quaternion.w + iw * -quaternion.x + iy * -quaternion.z - iz * -quaternion.y,
    y: iy * quaternion.w + iw * -quaternion.y + iz * -quaternion.x - ix * -quaternion.z,
    z: iz * quaternion.w + iw * -quaternion.z + ix * -quaternion.y - iy * -quaternion.x,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function screenOrientationAngle() {
  const legacyOrientation = window as Window & { orientation?: number };
  return screen.orientation?.angle ?? legacyOrientation.orientation ?? 0;
}

// iOS のみ webkitCompassHeading（磁気センサー由来の真のコンパス値）を返す。
// それ以外はクォータニオン経路で方角を計算する（360 - alpha 式は端末をロール
// させた姿勢で大きくズレるため使わない）。
function compassHeadingFromEvent(event: DeviceOrientationEvent) {
  const webkitCompassHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof webkitCompassHeading === "number") {
    return normalizeDegrees(webkitCompassHeading + screenOrientationAngle());
  }

  return null;
}

function orientationFromDevice(event: DeviceOrientationEvent, compassOffset: number): OrientationState | null {
  if (typeof event.alpha !== "number" || typeof event.beta !== "number" || typeof event.gamma !== "number") {
    return null;
  }

  const alpha = event.alpha * radians;
  const beta = event.beta * radians;
  const gamma = event.gamma * radians;
  const screenAngle = screenOrientationAngle() * radians;
  const deviceQuaternion = quaternionFromEulerYXZ(beta, alpha, -gamma);
  const cameraCorrection = quaternionFromAxisAngle({ x: 1, y: 0, z: 0 }, -Math.PI / 2);
  const screenCorrection = quaternionFromAxisAngle({ x: 0, y: 0, z: 1 }, -screenAngle);
  const viewQuaternion = multiplyQuaternions(multiplyQuaternions(deviceQuaternion, cameraCorrection), screenCorrection);
  const viewVector = applyQuaternion({ x: 0, y: 0, z: -1 }, viewQuaternion);
  const compassHeading = compassHeadingFromEvent(event);
  const heading = compassHeading ?? normalizeDegrees(Math.atan2(viewVector.x, -viewVector.z) * degrees);

  return {
    heading: normalizeDegrees(heading + compassOffset),
    pitch: Math.asin(clamp(viewVector.y, -1, 1)) * degrees,
  };
}

function projectBody(body: CelestialBody, orientation: OrientationState): ProjectedBody {
  const horizontalFieldOfView = 92;
  const verticalFieldOfView = 68;
  const horizontalDelta = shortestAngleDelta(body.position.azimuth, orientation.heading);
  const verticalDelta = body.position.altitude - orientation.pitch;

  return {
    body,
    visible: Math.abs(horizontalDelta) <= horizontalFieldOfView / 2 && Math.abs(verticalDelta) <= verticalFieldOfView / 2,
    left: 50 + (horizontalDelta / horizontalFieldOfView) * 100,
    top: 50 - (verticalDelta / verticalFieldOfView) * 100,
  };
}

async function requestCelestialInfo(body: CelestialBody): Promise<CelestialInfo> {
  let response: Response;

  try {
    response = await fetch("/api/celestial-info", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ id: body.id, name: body.name }),
    });
  } catch {
    throw new Error("api-network-failed");
  }

  if (!response.ok) {
    throw new Error(`api-http-${response.status}`);
  }

  try {
    return (await response.json()) as CelestialInfo;
  } catch {
    throw new Error("api-invalid-json");
  }
}

const PAN_SENSITIVITY = 0.25; // 度/ピクセル

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const orientationListenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const panRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);
  const [location, setLocation] = useState<GeoLocation>(fallbackLocation);
  const [locationStatus, setLocationStatus] = useState("位置情報待機");
  const [orientation, setOrientation] = useState<OrientationState>({ heading: 180, pitch: 25 });
  const [sensorStatus, setSensorStatus] = useState("仮想星空モード");
  const [isSensorEnabled, setIsSensorEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("カメラ未起動");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedBodyId, setSelectedBodyId] = useState<CelestialId | null>(null);
  const [info, setInfo] = useState<CelestialInfo | null>(null);
  const [displayedDescription, setDisplayedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageOrder, setLoadingMessageOrder] = useState(() => shuffleMessages(loadingMessages));
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showCompleteNotice, setShowCompleteNotice] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isTargetListOpen, setIsTargetListOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("東京座標で代替");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("現在地を使用中");
      },
      () => setLocationStatus("東京座標で代替"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    return () => {
      if (orientationListenerRef.current) {
        window.removeEventListener(orientationEventName, orientationListenerRef.current, true);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const nextOrder = shuffleMessages(loadingMessages);
    setLoadingMessageOrder(nextOrder);
    setLoadingMessageIndex(0);
    const timer = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % nextOrder.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!showCompleteNotice) {
      return;
    }

    const timer = window.setTimeout(() => setShowCompleteNotice(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showCompleteNotice]);

  useEffect(() => {
    if (!info?.description || isLoading) {
      setDisplayedDescription("");
      return;
    }

    let index = 0;
    setDisplayedDescription("");

    const timer = window.setInterval(() => {
      index += 2;
      setDisplayedDescription(info.description.slice(0, index));

      if (index >= info.description.length) {
        window.clearInterval(timer);
      }
    }, 34);

    return () => window.clearInterval(timer);
  }, [info?.description, isLoading]);

  const bodies = useMemo(() => calculateCelestialBodies(location, now), [location, now]);
  const projectedBodies = useMemo(
    () => bodies.map((body) => projectBody(body, orientation)).sort((a, b) => b.body.magnitudeHint - a.body.magnitudeHint),
    [bodies, orientation],
  );
  const selectedBody = bodies.find((body) => body.id === selectedBodyId) ?? null;

  function attachOrientationListener() {
    if (orientationListenerRef.current) {
      window.removeEventListener(orientationEventName, orientationListenerRef.current, true);
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const nextOrientation = orientationFromDevice(event, 0);
      if (nextOrientation) {
        setOrientation(nextOrientation);
      }
      setSensorStatus("端末の向きに同期");
    };

    orientationListenerRef.current = handleOrientation;
    window.addEventListener(orientationEventName, handleOrientation, true);
    setSensorStatus("センサー待機中");
    setIsSensorEnabled(true);
  }

  function disableSensors() {
    if (orientationListenerRef.current) {
      window.removeEventListener(orientationEventName, orientationListenerRef.current, true);
      orientationListenerRef.current = null;
    }

    setIsSensorEnabled(false);
    setSensorStatus("仮想星空モード");
    if (cameraEnabled) {
      stopCamera();
    }
  }

  async function enableSensors(): Promise<boolean> {
    if (isSensorEnabled) {
      disableSensors();
      return false;
    }

    try {
      if (supportsOrientationPermission()) {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<PermissionState> }
        ).requestPermission();
        if (permission !== "granted") {
          setSensorStatus("センサー許可が必要");
          setIsSensorEnabled(false);
          return false;
        }
      }

      attachOrientationListener();
      return true;
    } catch {
      setSensorStatus("センサー未対応");
      setIsSensorEnabled(false);
      return false;
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraEnabled(true);
      setCameraStatus("カメラ合成");
    } catch {
      setCameraEnabled(false);
      setCameraStatus("カメラ不可");
    }
  }

  async function toggleCamera() {
    if (cameraEnabled) {
      stopCamera();
      return;
    }

    await startCamera();
    if (!isSensorEnabled) {
      const enabled = await enableSensors();
      if (!enabled) {
        stopCamera();
      }
    }
  }

  function closeInfo() {
    setSelectedBodyId(null);
    setInfo(null);
    setDisplayedDescription("");
    setIsLoading(false);
    setShowCompleteNotice(false);
  }

  async function selectBody(body: CelestialBody) {
    setSelectedBodyId(body.id);
    setInfo(null);
    setDisplayedDescription("");
    setShowCompleteNotice(false);
    setIsLoading(true);

    try {
      setInfo(await requestCelestialInfo(body));
    } catch (error) {
      const fallbackReason = error instanceof Error ? error.message : "client-request-failed";
      setInfo({ ...getRandomCelestialFallbackInfo(body.id), source: "fallback", triedModels: [], fallbackReason });
    } finally {
      setIsLoading(false);
      setShowCompleteNotice(true);
    }
  }

  function jumpToBody(body: CelestialBody) {
    if (isSensorEnabled) {
      return;
    }

    const jumpTime = new Date();
    const currentBody = calculateCelestialBodies(location, jumpTime).find((item) => item.id === body.id) ?? body;
    setNow(jumpTime);
    setOrientation({
      heading: currentBody.position.azimuth,
      pitch: Math.max(-90, Math.min(90, currentBody.position.altitude)),
    });
  }

  function stopCamera() {
    videoRef.current?.srcObject &&
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
    setCameraStatus("仮想星空");
  }

  function manuallySetOrientation(
    update: Partial<OrientationState> | ((current: OrientationState) => Partial<OrientationState>),
  ) {
    if (isSensorEnabled) {
      disableSensors();
    }

    if (cameraEnabled) {
      stopCamera();
    }

    setOrientation((current) => ({ ...current, ...(typeof update === "function" ? update(current) : update) }));
  }

  function handlePanPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
  }

  function handlePanPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = panRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    manuallySetOrientation((current) => ({
      heading: normalizeDegrees(current.heading - deltaX * PAN_SENSITIVITY),
      pitch: clamp(current.pitch + deltaY * PAN_SENSITIVITY, -90, 90),
    }));
  }

  function handlePanPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (panRef.current?.pointerId === event.pointerId) {
      panRef.current = null;
    }
  }

  return (
    <main className="app-shell">
      <section className="sky-view" aria-label="AR天体ナビゲーション">
        <VirtualSky heading={orientation.heading} pitch={orientation.pitch} />
        <video ref={videoRef} className={`camera-feed ${cameraEnabled ? "is-active" : ""}`} playsInline muted />
        <div className="scan-grid" />
        <div
          className="pan-surface"
          onPointerDown={handlePanPointerDown}
          onPointerMove={handlePanPointerMove}
          onPointerUp={handlePanPointerEnd}
          onPointerCancel={handlePanPointerEnd}
          aria-hidden="true"
        />

        <div className="mini-instruments" aria-label="観測計器">
          <span className="instrument-card hud-style">
            <div className="hud-corner top-left" aria-hidden="true" />
            <div className="hud-corner top-right" aria-hidden="true" />
            <div className="hud-corner bottom-left" aria-hidden="true" />
            <div className="hud-corner bottom-right" aria-hidden="true" />
            <div className="instrument-info">
              <small>方角</small>
              <div className="instrument-value">
                {directionName(orientation.heading)} {orientation.heading.toFixed(0)}°
              </div>
            </div>
          </span>
          <span className="instrument-card hud-style">
            <div className="hud-corner top-left" aria-hidden="true" />
            <div className="hud-corner top-right" aria-hidden="true" />
            <div className="hud-corner bottom-left" aria-hidden="true" />
            <div className="hud-corner bottom-right" aria-hidden="true" />
            <div className="instrument-info">
              <small>見上げ</small>
              <div className="instrument-value">
                {orientation.pitch.toFixed(0)}°
              </div>
            </div>
          </span>
        </div>

        <button
          className="help-button"
          type="button"
          onClick={() => {
            setIsHelpOpen(true);
          }}
          aria-label="使い方を開く"
        >
          <HelpCircle size={17} />
        </button>

        <div className="fab-cluster" aria-label="操作">
          <button
            className={`settings-fab ${isControlsOpen ? "is-active" : ""}`}
            type="button"
            onClick={() => {
              setIsControlsOpen((current) => !current);
            }}
            aria-label="操作パネルを開く"
          >
            <Aperture size={21} className={`settings-fab-icon ${isControlsOpen ? "is-glowing" : ""}`} />
          </button>
        </div>

        <div className="panel-row">
          <AnimatePresence>
            {isControlsOpen && (
              <motion.aside
                className="control-panel"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
              >
                <div className="control-actions">
                  <button
                    className={`icon-button ${cameraEnabled ? "is-active" : ""}`}
                    type="button"
                    onClick={() => {
                      toggleCamera();
                    }}
                    aria-label="カメラ起動"
                  >
                    <Camera size={18} />
                    <span>{cameraEnabled ? "カメラ起動中" : "カメラ起動"}</span>
                  </button>
                  <button
                    className={`icon-button ${isSensorEnabled ? "is-active" : ""}`}
                    type="button"
                    onClick={() => {
                      enableSensors();
                    }}
                    aria-label="センサー同期モード"
                  >
                    <Compass size={18} />
                    <span>センサー同期モード</span>
                  </button>
                  <button
                    className={`icon-button ${isTargetListOpen ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setIsTargetListOpen((current) => !current)}
                    aria-label="天体ジャンプメニューを開く"
                  >
                    <ChevronLeft size={18} className={`target-toggle-icon ${isTargetListOpen ? "is-open" : ""}`} />
                    <span>天体にジャンプ</span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isControlsOpen && isTargetListOpen && (
              <motion.aside
                className="target-panel"
                initial={{ opacity: 0, scale: 0.96, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.96, x: 8 }}
              >
                <div className="target-list" aria-label="対象天体リスト">
                  {bodies.map((body) => (
                    <button
                      key={body.id}
                      type="button"
                      className={selectedBodyId === body.id ? "is-active" : ""}
                      style={{ "--body-color": body.color } as React.CSSProperties}
                      disabled={isSensorEnabled}
                      onClick={() => {
                        jumpToBody(body);
                      }}
                      title={isSensorEnabled ? "センサー同期モード中は天体ジャンプを使えません" : `${body.name}へジャンプ`}
                      aria-label={`${body.name}へジャンプ`}
                    >
                      {body.name}
                    </button>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              className="help-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label="使い方"
              onClick={() => {
                setIsHelpOpen(false);
              }}
            >
              <motion.aside
                className="help-modal"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="panel-title">
                  <span>
                    <HelpCircle size={17} />
                    使い方
                  </span>
                  <button
                    className="panel-close"
                    type="button"
                    onClick={() => {
                      setIsHelpOpen(false);
                    }}
                    aria-label="使い方を閉じる"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="help-steps">
                  <section>
                    <strong>📱 宙（そら）を見渡す</strong>
                    <p>センサー同期モードをオンにすると、スマホの傾きに連動して、現在の星空が画面に広がります。</p>
                  </section>
                  <section>
                    <strong>🌌 未知の天体を探す</strong>
                    <p>太陽系内惑星から数億光年彼方のブラックホールまで、様々な天体を見つけてみましょう。</p>
                  </section>
                  <section>
                    <strong>👆 宇宙の記憶に触れる</strong>
                    <p>気になる天体をタップして、解説を読み解いてみましょう。</p>
                  </section>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {projectedBodies.map((projected) => {
          const { body } = projected;
          const isSelected = selectedBodyId === body.id;
          const clampedLeft = Math.max(7, Math.min(93, projected.left));
          const clampedTop = Math.max(16, Math.min(78, projected.top));

          return (
            <button
              key={body.id}
              type="button"
              className={`celestial-marker marker-${body.kind} ${projected.visible ? "is-visible" : "is-offscreen"} ${
                isSelected ? "is-selected" : ""
              } ${
                body.imageSrc ? "has-image" : ""
              }`}
              style={{
                left: `${clampedLeft}%`,
                top: `${clampedTop}%`,
                color: body.color,
                "--marker-scale": String(0.78 + body.magnitudeHint * 0.34),
              } as CSSProperties}
              onClick={() => selectBody(body)}
              aria-label={`${body.name}を解説`}
            >
              <span className="marker-ring" />
              <span className={`marker-core ${body.imageSrc ? "has-image" : ""}`} aria-hidden="true">
                {body.imageSrc ? <img className="marker-image" src={body.imageSrc} alt="" /> : <span className="marker-glyph" />}
              </span>
            </button>
          );
        })}

        <AnimatePresence>
          {selectedBody?.imageSrc && (
            <motion.div
              key={selectedBody.id}
              className="body-spotlight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src={selectedBody.imageSrc}
                alt={selectedBody.name}
                className="body-spotlight-img"
                initial={{ scale: 0.84 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(selectedBody || isLoading) && (
            <motion.aside
              className="info-panel bottom-sheet"
              initial={{ y: "105%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "105%", opacity: 0 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 180 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 650) {
                  closeInfo();
                }
              }}
            >
              <div className="sheet-grip" aria-hidden="true" />
              <div className="panel-title">
                <span>
                  <Sparkles size={16} />
                  {selectedBody?.name ?? "解析中"}
                </span>
                <button className="panel-close" type="button" onClick={closeInfo} aria-label="説明を閉じる">
                  <X size={18} />
                </button>
              </div>
              {isLoading ? (
                <div className="loading-line">
                  <Loader2 size={18} className="spin" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loadingMessageIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.18 }}
                    >
                      {loadingMessageOrder[loadingMessageIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ) : (
                info && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="generated-copy">
                    <span className={`source-badge ${info.source === "gemini" ? "is-gemini" : "is-fallback"}`}>
                      {info.source === "gemini" ? "AI解説" : "解説"}
                    </span>
                    <strong>地球からの距離: {info.distanceString}</strong>
                    <p>{displayedDescription}</p>
                  </motion.div>
                )
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
