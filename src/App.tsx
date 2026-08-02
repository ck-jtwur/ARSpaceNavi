import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Compass,
  Hand,
  HelpCircle,
  Loader2,
  MapPin,
  Orbit,
  Ruler,
  Sparkles,
  Telescope,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { calculateCelestialBodies, CelestialBody, GeoLocation, shortestAngleDelta } from "./astro";
import {
  CelestialId,
  CelestialInfo,
  CelestialKind,
  getRandomCelestialFallbackInfo,
} from "./celestialCatalog";
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
  "星図データを読み込んでいます",
  "この天体までの距離を確かめています",
  "遠い昔に放たれた光をたどっています",
  "観測記録を照合しています",
  "天体の記録をまとめています",
  "宇宙の座標を計算しています",
  "解説を組み立てています",
];

// リストと解説シートで使う天体の種別ラベル
const kindLabels: Record<CelestialKind, string> = {
  "solar-system": "太陽系の天体",
  "dwarf-planet": "準惑星",
  star: "恒星",
  "black-hole": "ブラックホール",
  quasar: "クエーサー",
  "deep-sky": "銀河・銀河団",
  exoplanet: "系外惑星",
};

// 近い天体から遠い天体へ。リストを探しやすくするための並び順。
const kindOrder: CelestialKind[] = [
  "solar-system",
  "dwarf-planet",
  "star",
  "black-hole",
  "quasar",
  "deep-sky",
  "exoplanet",
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
  const [locationStatus, setLocationStatus] = useState("現在地を確認中");
  const [orientation, setOrientation] = useState<OrientationState>({ heading: 180, pitch: 25 });
  const [sensorStatus, setSensorStatus] = useState("オフ / 指で見渡すモード");
  const [isSensorEnabled, setIsSensorEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("目の前の景色に重ねて表示");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedBodyId, setSelectedBodyId] = useState<CelestialId | null>(null);
  const [info, setInfo] = useState<CelestialInfo | null>(null);
  const [displayedDescription, setDisplayedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageOrder, setLoadingMessageOrder] = useState(() => shuffleMessages(loadingMessages));
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isTargetListOpen, setIsTargetListOpen] = useState(false);
  // パネルの高さは isTargetListOpen と1テンポずらす: 古いビューの退場アニメーションが
  // 終わるまで高さを変えず、onExitComplete で初めて isTargetListOpen に同期させる。
  // これにより、古いビューが新しい高さに合わせて一瞬伸縮して見える問題を防ぐ。
  const [isTargetViewExpanded, setIsTargetViewExpanded] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("東京を基準に表示中");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("現在地から計算中");
      },
      () => setLocationStatus("東京を基準に表示中"),
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
  // 天体リストは種別ごとにまとめて見出しを付ける（項目自体は増減しない）
  const groupedBodies = useMemo(
    () =>
      kindOrder
        .map((kind) => ({ kind, items: bodies.filter((body) => body.kind === kind) }))
        .filter((group) => group.items.length > 0),
    [bodies],
  );

  function attachOrientationListener() {
    if (orientationListenerRef.current) {
      window.removeEventListener(orientationEventName, orientationListenerRef.current, true);
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const nextOrientation = orientationFromDevice(event, 0);
      if (nextOrientation) {
        setOrientation(nextOrientation);
      }
      setSensorStatus("スマホの向きに追従中");
    };

    orientationListenerRef.current = handleOrientation;
    window.addEventListener(orientationEventName, handleOrientation, true);
    setSensorStatus("センサーを準備中");
    setIsSensorEnabled(true);
  }

  function disableSensors() {
    if (orientationListenerRef.current) {
      window.removeEventListener(orientationEventName, orientationListenerRef.current, true);
      orientationListenerRef.current = null;
    }

    setIsSensorEnabled(false);
    setSensorStatus("オフ / 指で見渡すモード");
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
          setSensorStatus("センサーの利用を許可してください");
          setIsSensorEnabled(false);
          return false;
        }
      }

      attachOrientationListener();
      return true;
    } catch {
      setSensorStatus("この端末では利用できません");
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
      setCameraStatus("映像に重ねて表示中");
    } catch {
      setCameraEnabled(false);
      setCameraStatus("カメラを利用できません");
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
  }

  async function selectBody(body: CelestialBody) {
    setIsControlsOpen(false);
    setSelectedBodyId(body.id);
    setInfo(null);
    setDisplayedDescription("");
    setIsLoading(true);

    try {
      setInfo(await requestCelestialInfo(body));
    } catch (error) {
      const fallbackReason = error instanceof Error ? error.message : "client-request-failed";
      setInfo({ ...getRandomCelestialFallbackInfo(body.id), source: "fallback", triedModels: [], fallbackReason });
    } finally {
      setIsLoading(false);
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
    setCameraStatus("目の前の景色に重ねて表示");
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

    setIsControlsOpen(false);

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
      <section className="sky-view" aria-label="いまの空と天体">
        <VirtualSky heading={orientation.heading} pitch={orientation.pitch} />
        <video ref={videoRef} className={`camera-feed ${cameraEnabled ? "is-active" : ""}`} playsInline muted />
        <div className="scan-grid" aria-hidden="true" />
        <div className="sky-vignette" aria-hidden="true" />
        <div
          className="pan-surface"
          onPointerDown={handlePanPointerDown}
          onPointerMove={handlePanPointerMove}
          onPointerUp={handlePanPointerEnd}
          onPointerCancel={handlePanPointerEnd}
          aria-hidden="true"
        />

        <div className="instrument-stack" aria-label="いま見ている方向">
          <div className="instrument-card glass">
            <div className="instrument-cell">
              <small>方角</small>
              <div className="instrument-value">
                <span className="compass-label">{directionName(orientation.heading)}</span>
                {orientation.heading.toFixed(0)}
                <span className="unit">°</span>
              </div>
            </div>
            <div className="instrument-cell">
              <small>高さ</small>
              <div className="instrument-value">
                {orientation.pitch.toFixed(0)}
                <span className="unit">°</span>
              </div>
            </div>
          </div>
          <span className="location-chip glass">
            <MapPin size={12} />
            {locationStatus}
          </span>
        </div>

        <button
          className="help-button glass"
          type="button"
          onClick={() => {
            setIsControlsOpen(false);
            setIsHelpOpen(true);
          }}
          aria-label="使い方を見る"
        >
          <HelpCircle size={22} />
        </button>

        <div className="fab-cluster" aria-label="メニュー">
          <button
            className={`menu-fab glass ${isControlsOpen ? "is-active" : ""}`}
            type="button"
            onClick={() => {
              // 天体リスト画面の状態は保持する。閉じて開き直しても同じ画面に戻る。
              setIsControlsOpen((current) => !current);
            }}
            aria-label={isControlsOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isControlsOpen}
          >
            <Orbit size={26} className={`menu-fab-icon ${isControlsOpen ? "is-glowing" : ""}`} />
          </button>
        </div>

        <AnimatePresence>
          {isControlsOpen && (
            <motion.aside
              className={`control-panel glass-aurora ${isTargetViewExpanded ? "is-target-view" : ""}`}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
            >
              <AnimatePresence
                mode="wait"
                initial={false}
                onExitComplete={() => {
                  setIsTargetViewExpanded(isTargetListOpen);
                }}
              >
                {!isTargetListOpen ? (
                  <motion.div
                    key="actions"
                    className="control-actions"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <button
                      className={`panel-action ${isSensorEnabled ? "is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        enableSensors();
                      }}
                      aria-pressed={isSensorEnabled}
                    >
                      <span className="panel-action-icon">
                        <Compass size={19} />
                      </span>
                      <span className="panel-action-text">
                        <span className="panel-action-label">空にかざす</span>
                        <span className="panel-action-note">{sensorStatus}</span>
                      </span>
                      <span className="panel-action-mark">
                        <span className="state-dot" aria-hidden="true" />
                      </span>
                    </button>
                    <button
                      className={`panel-action ${cameraEnabled ? "is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        toggleCamera();
                      }}
                      aria-pressed={cameraEnabled}
                    >
                      <span className="panel-action-icon">
                        <Camera size={19} />
                      </span>
                      <span className="panel-action-text">
                        <span className="panel-action-label">カメラに重ねる</span>
                        <span className="panel-action-note">{cameraStatus}</span>
                      </span>
                      <span className="panel-action-mark">
                        <span className="state-dot" aria-hidden="true" />
                      </span>
                    </button>
                    <button
                      className="panel-action"
                      type="button"
                      onClick={() => setIsTargetListOpen(true)}
                    >
                      <span className="panel-action-icon">
                        <Telescope size={19} />
                      </span>
                      <span className="panel-action-text">
                        <span className="panel-action-label">天体をさがす</span>
                        <span className="panel-action-note">選んだ天体の方向へ移動</span>
                      </span>
                      <span className="panel-action-mark">
                        <ChevronRight size={18} />
                      </span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="target-list-view"
                    className="target-list-view"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="target-list-head">
                      <button
                        className="back-button"
                        type="button"
                        onClick={() => setIsTargetListOpen(false)}
                        aria-label="メニューに戻る"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <span className="target-list-heading">
                        <strong>天体をさがす</strong>
                        <span>
                          {isSensorEnabled
                            ? "「空にかざす」をオフにすると使えます"
                            : "選ぶとその天体の方向へ移動します"}
                        </span>
                      </span>
                    </div>
                    <div className="target-list" aria-label="天体の一覧">
                      {groupedBodies.map((group) => (
                        <div key={group.kind} className="target-group" role="group" aria-label={kindLabels[group.kind]}>
                          <div className="target-group-label">{kindLabels[group.kind]}</div>
                          {group.items.map((body) => (
                            <button
                              key={body.id}
                              type="button"
                              className={`target-item ${selectedBodyId === body.id ? "is-active" : ""}`}
                              style={{ "--body-color": body.color } as React.CSSProperties}
                              disabled={isSensorEnabled}
                              onClick={() => {
                                jumpToBody(body);
                              }}
                              title={
                                isSensorEnabled
                                  ? "「空にかざす」がオンの間は、この移動は使えません"
                                  : `${body.name}の方向へ移動`
                              }
                              aria-label={`${body.name}の方向へ移動`}
                            >
                              <span className="target-thumb" aria-hidden="true">
                                {body.imageSrc ? (
                                  <img src={body.imageSrc} alt="" />
                                ) : (
                                  <span className="target-dot" />
                                )}
                              </span>
                              <span className="target-name">{body.name}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>
          )}
        </AnimatePresence>

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
                className="help-modal glass-aurora"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="help-head">
                  <span className="help-title">
                    <strong>いまの空を、そのまま見る</strong>
                    <span>
                      いる場所と時刻から計算した天体の位置を、画面に重ねて表示します。位置情報を許可しない場合は東京の空になります。
                    </span>
                  </span>
                  <button
                    className="close-button"
                    type="button"
                    onClick={() => {
                      setIsHelpOpen(false);
                    }}
                    aria-label="使い方を閉じる"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="help-scroll">
                  <div className="help-steps">
                    <section className="help-step">
                      <span className="help-step-icon" aria-hidden="true">
                        <Compass size={19} />
                      </span>
                      <span className="help-step-body">
                        <strong>空にかざす</strong>
                        <p>メニューの「空にかざす」をオンにすると、スマホを向けた方向の空がそのまま画面に映ります。</p>
                      </span>
                    </section>
                    <section className="help-step">
                      <span className="help-step-icon" aria-hidden="true">
                        <Hand size={19} />
                      </span>
                      <span className="help-step-body">
                        <strong>指で見渡す</strong>
                        <p>画面をドラッグすると、好きな方角へ視点を動かせます。左上に、いま見ている方角と高さが出ます。</p>
                      </span>
                    </section>
                    <section className="help-step">
                      <span className="help-step-icon" aria-hidden="true">
                        <Telescope size={19} />
                      </span>
                      <span className="help-step-body">
                        <strong>天体をさがす</strong>
                        <p>一覧から選ぶと、その天体がいる方向へ一気に移動します。太陽系の惑星から、数億光年先の銀河まで。</p>
                      </span>
                    </section>
                    <section className="help-step">
                      <span className="help-step-icon" aria-hidden="true">
                        <Camera size={19} />
                      </span>
                      <span className="help-step-body">
                        <strong>カメラに重ねる</strong>
                        <p>カメラをオンにすると、目の前の景色に天体が重なって見えます。</p>
                      </span>
                    </section>
                    <section className="help-step">
                      <span className="help-step-icon" aria-hidden="true">
                        <Sparkles size={19} />
                      </span>
                      <span className="help-step-body">
                        <strong>タップして知る</strong>
                        <p>気になる天体をタップすると、地球からの距離とその天体の解説が読めます。</p>
                      </span>
                    </section>
                  </div>
                </div>
                <button
                  className="help-start"
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                  }}
                >
                  空を見上げる
                </button>
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
              aria-label={`${body.name}の解説を見る`}
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
              className="info-sheet glass-aurora"
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
              <div className="sheet-head">
                <span className="sheet-heading">
                  <h2>{selectedBody?.name ?? "読み込み中"}</h2>
                  {selectedBody && <span className="kind-chip">{kindLabels[selectedBody.kind]}</span>}
                </span>
                <button className="close-button" type="button" onClick={closeInfo} aria-label="解説を閉じる">
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sheet-body">
                    <div className="stat-row">
                      <span className="stat-label">
                        <Ruler size={13} />
                        地球からの距離
                      </span>
                      <span className="stat-value">{info.distanceString}</span>
                    </div>
                    <p className="sheet-text">{displayedDescription}</p>
                    <span className={`source-badge ${info.source === "gemini" ? "is-gemini" : ""}`}>
                      <Sparkles size={12} />
                      {info.source === "gemini" ? "AIが書いた解説" : "収録されている解説"}
                    </span>
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
