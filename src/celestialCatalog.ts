export type CelestialId =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "ceres"
  | "pluto"
  | "haumea"
  | "makemake"
  | "eris"
  | "sirius"
  | "alpha-centauri"
  | "betelgeuse"
  | "sagittarius-a-star"
  | "cygnus-x-1"
  | "andromeda"
  | "trappist-1e"
  | "kepler-22b"
  | "3c-273"
  | "coma-cluster";

export type CelestialKind =
  | "solar-system"
  | "dwarf-planet"
  | "star"
  | "deep-sky"
  | "black-hole"
  | "exoplanet"
  | "quasar";

export type CelestialInfo = {
  name: string;
  distanceString: string;
  description: string;
  source?: "gemini" | "fallback";
  modelUsed?: string;
  triedModels?: string[];
};

export type CelestialCatalogItem = {
  id: CelestialId;
  name: string;
  englishName: string;
  shortLabel: string;
  kind: CelestialKind;
  color: string;
  magnitudeHint: number;
  astronomyBody?: "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";
  rightAscensionHours?: number;
  declinationDegrees?: number;
  fallbackInfo: CelestialInfo;
};

export const celestialCatalog: CelestialCatalogItem[] = [
  {
    id: "sun",
    name: "太陽",
    englishName: "Sun",
    shortLabel: "SUN",
    kind: "solar-system",
    color: "#ffd166",
    magnitudeHint: 1,
    astronomyBody: "Sun",
    fallbackInfo: {
      name: "太陽",
      distanceString: "約1億4960万km",
      description:
        "地球の生命を支える巨大な核融合炉です。中心では水素がヘリウムへ変わり、失われた質量が光と熱になって宇宙へ放たれています。",
    },
  },
  {
    id: "moon",
    name: "月",
    englishName: "Moon",
    shortLabel: "MOON",
    kind: "solar-system",
    color: "#dce7ff",
    magnitudeHint: 0.92,
    astronomyBody: "Moon",
    fallbackInfo: {
      name: "月",
      distanceString: "約38万km",
      description:
        "人類が降り立った唯一の地球外天体です。潮の満ち引きを生み、地球の自転を少しずつ遅くしながら、夜空の時間感覚を刻んでいます。",
    },
  },
  {
    id: "mercury",
    name: "水星",
    englishName: "Mercury",
    shortLabel: "MER",
    kind: "solar-system",
    color: "#c9c2b8",
    magnitudeHint: 0.72,
    astronomyBody: "Mercury",
    fallbackInfo: {
      name: "水星",
      distanceString: "約7700万-2億2000万km",
      description:
        "太陽に最も近い岩石惑星です。昼は灼熱、夜は極寒という極端な世界で、巨大な金属核が小さな惑星の内側を占めています。",
    },
  },
  {
    id: "venus",
    name: "金星",
    englishName: "Venus",
    shortLabel: "VEN",
    kind: "solar-system",
    color: "#ffd6a0",
    magnitudeHint: 0.9,
    astronomyBody: "Venus",
    fallbackInfo: {
      name: "金星",
      distanceString: "約4100万-2億6100万km",
      description:
        "明けの明星、宵の明星として輝く地球の隣人です。分厚い二酸化炭素の大気が熱を閉じ込め、表面は鉛も溶けるほど高温です。",
    },
  },
  {
    id: "mars",
    name: "火星",
    englishName: "Mars",
    shortLabel: "MARS",
    kind: "solar-system",
    color: "#ff8a5b",
    magnitudeHint: 0.78,
    astronomyBody: "Mars",
    fallbackInfo: {
      name: "火星",
      distanceString: "約5500万-4億km",
      description:
        "かつて川や湖があった痕跡を残す赤い惑星です。薄い大気、巨大火山、地下氷を持ち、人類の次の探査拠点として注目されています。",
    },
  },
  {
    id: "jupiter",
    name: "木星",
    englishName: "Jupiter",
    shortLabel: "JUP",
    kind: "solar-system",
    color: "#f6c47f",
    magnitudeHint: 0.86,
    astronomyBody: "Jupiter",
    fallbackInfo: {
      name: "木星",
      distanceString: "約6億-9億km",
      description:
        "太陽系最大のガス惑星です。強大な重力は小天体の軌道を乱し、地球が入るほど巨大な大赤斑は何世紀も続く嵐です。",
    },
  },
  {
    id: "saturn",
    name: "土星",
    englishName: "Saturn",
    shortLabel: "SAT",
    kind: "solar-system",
    color: "#e7d7a1",
    magnitudeHint: 0.72,
    astronomyBody: "Saturn",
    fallbackInfo: {
      name: "土星",
      distanceString: "約12億-17億km",
      description:
        "氷と岩の欠片でできた環をまとう巨大惑星です。全体の密度は水より低く、衛星タイタンには濃い大気と液体の湖があります。",
    },
  },
  {
    id: "uranus",
    name: "天王星",
    englishName: "Uranus",
    shortLabel: "URA",
    kind: "solar-system",
    color: "#7fe7e7",
    magnitudeHint: 0.62,
    astronomyBody: "Uranus",
    fallbackInfo: {
      name: "天王星",
      distanceString: "約26億-32億km",
      description:
        "横倒しに自転する氷の巨大惑星です。過去の大衝突で軸が傾いたと考えられ、季節は地球とはまったく違う長さで巡ります。",
    },
  },
  {
    id: "neptune",
    name: "海王星",
    englishName: "Neptune",
    shortLabel: "NEP",
    kind: "solar-system",
    color: "#5f8cff",
    magnitudeHint: 0.6,
    astronomyBody: "Neptune",
    fallbackInfo: {
      name: "海王星",
      distanceString: "約43億-47億km",
      description:
        "数学的な予測から発見された青い惑星です。太陽から遠い冷たい世界なのに、音速を超えるほどの激しい風が吹いています。",
    },
  },
  {
    id: "ceres",
    name: "ケレス",
    englishName: "Ceres",
    shortLabel: "CER",
    kind: "dwarf-planet",
    color: "#b8c0c7",
    magnitudeHint: 0.5,
    rightAscensionHours: 21.4,
    declinationDegrees: -24.5,
    fallbackInfo: {
      name: "ケレス",
      distanceString: "約2億6000万-4億km",
      description:
        "火星と木星の間にある小惑星帯最大の天体です。表面の明るい塩の斑点は、地下に水を含む活動があった手がかりです。",
    },
  },
  {
    id: "pluto",
    name: "冥王星",
    englishName: "Pluto",
    shortLabel: "PLU",
    kind: "dwarf-planet",
    color: "#d7bda6",
    magnitudeHint: 0.52,
    astronomyBody: "Pluto",
    fallbackInfo: {
      name: "冥王星",
      distanceString: "約43億-75億km",
      description:
        "かつて第9惑星と呼ばれた準惑星です。氷の平原と薄い大気を持ち、衛星カロンとは互いに同じ面を向け合っています。",
    },
  },
  {
    id: "haumea",
    name: "ハウメア",
    englishName: "Haumea",
    shortLabel: "HAU",
    kind: "dwarf-planet",
    color: "#e6f4ff",
    magnitudeHint: 0.48,
    rightAscensionHours: 14.1,
    declinationDegrees: 13.8,
    fallbackInfo: {
      name: "ハウメア",
      distanceString: "約70億km",
      description:
        "高速回転で引き伸ばされた卵形の準惑星です。氷の表面、環、衛星を持ち、太陽系外縁の衝突史を物語ります。",
    },
  },
  {
    id: "makemake",
    name: "マケマケ",
    englishName: "Makemake",
    shortLabel: "MAK",
    kind: "dwarf-planet",
    color: "#f3d0b5",
    magnitudeHint: 0.47,
    rightAscensionHours: 13.4,
    declinationDegrees: 27.2,
    fallbackInfo: {
      name: "マケマケ",
      distanceString: "約78億km",
      description:
        "太陽系外縁を巡る赤みがかった準惑星です。凍ったメタンが表面を覆い、遠い太陽の光をかすかに反射しています。",
    },
  },
  {
    id: "eris",
    name: "エリス",
    englishName: "Eris",
    shortLabel: "ERI",
    kind: "dwarf-planet",
    color: "#d8dcff",
    magnitudeHint: 0.46,
    rightAscensionHours: 1.7,
    declinationDegrees: -1.5,
    fallbackInfo: {
      name: "エリス",
      distanceString: "約140億km",
      description:
        "冥王星級の大きさを持つ遠方の準惑星です。その発見は惑星の定義を揺さぶり、太陽系の地図を書き換えました。",
    },
  },
  {
    id: "sirius",
    name: "シリウス",
    englishName: "Sirius",
    shortLabel: "SIR",
    kind: "star",
    color: "#a9d8ff",
    magnitudeHint: 0.95,
    rightAscensionHours: 6.7525,
    declinationDegrees: -16.7161,
    fallbackInfo: {
      name: "シリウス",
      distanceString: "約8.6光年",
      description:
        "全天で一番明るい恒星です。青白い主星のそばには白色矮星があり、燃え尽きた星の未来を連星として見せています。",
    },
  },
  {
    id: "alpha-centauri",
    name: "アルファ・ケンタウリ",
    englishName: "Alpha Centauri",
    shortLabel: "A-CEN",
    kind: "star",
    color: "#fff0b5",
    magnitudeHint: 0.88,
    rightAscensionHours: 14.6601,
    declinationDegrees: -60.8339,
    fallbackInfo: {
      name: "アルファ・ケンタウリ",
      distanceString: "約4.37光年",
      description:
        "太陽系に最も近い恒星系です。複数の星が重力で踊り、その一員プロキシマには惑星も見つかっています。",
    },
  },
  {
    id: "betelgeuse",
    name: "ベテルギウス",
    englishName: "Betelgeuse",
    shortLabel: "BET",
    kind: "star",
    color: "#ff6b4a",
    magnitudeHint: 0.84,
    rightAscensionHours: 5.9195,
    declinationDegrees: 7.4071,
    fallbackInfo: {
      name: "ベテルギウス",
      distanceString: "約550光年",
      description:
        "オリオン座の赤色超巨星です。太陽なら木星軌道近くまで膨らむほど巨大で、将来の超新星爆発を待っています。",
    },
  },
  {
    id: "sagittarius-a-star",
    name: "いて座A*",
    englishName: "Sagittarius A*",
    shortLabel: "SgrA*",
    kind: "black-hole",
    color: "#b78cff",
    magnitudeHint: 0.7,
    rightAscensionHours: 17.7611,
    declinationDegrees: -29.0078,
    fallbackInfo: {
      name: "いて座A*",
      distanceString: "約2万7000光年",
      description:
        "天の川銀河の中心に潜む超大質量ブラックホールです。周囲の星々の高速運動が、見えない重力の存在を暴きました。",
    },
  },
  {
    id: "cygnus-x-1",
    name: "はくちょう座X-1",
    englishName: "Cygnus X-1",
    shortLabel: "CygX1",
    kind: "black-hole",
    color: "#8bd3ff",
    magnitudeHint: 0.68,
    rightAscensionHours: 19.9725,
    declinationDegrees: 35.2016,
    fallbackInfo: {
      name: "はくちょう座X-1",
      distanceString: "約7200光年",
      description:
        "人類が初めて見つけたブラックホール候補です。伴星から奪われたガスが高温になり、強烈なX線を放っています。",
    },
  },
  {
    id: "andromeda",
    name: "アンドロメダ銀河",
    englishName: "Andromeda Galaxy",
    shortLabel: "M31",
    kind: "deep-sky",
    color: "#f0a6ff",
    magnitudeHint: 0.76,
    rightAscensionHours: 0.7123,
    declinationDegrees: 41.2692,
    fallbackInfo: {
      name: "アンドロメダ銀河",
      distanceString: "約250万光年",
      description:
        "肉眼で見える最遠級の銀河です。約40億年後には天の川銀河と衝突し、夜空と銀河の形を大きく変えます。",
    },
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    englishName: "TRAPPIST-1e",
    shortLabel: "T-1e",
    kind: "exoplanet",
    color: "#4ee8c8",
    magnitudeHint: 0.64,
    rightAscensionHours: 23.1082,
    declinationDegrees: -5.0414,
    fallbackInfo: {
      name: "TRAPPIST-1e",
      distanceString: "約39光年",
      description:
        "赤色矮星を回る地球サイズの岩石惑星です。液体の水が存在できる領域にあり、生命の可能性を想像させます。",
    },
  },
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    englishName: "Kepler-22b",
    shortLabel: "K22b",
    kind: "exoplanet",
    color: "#58b8ff",
    magnitudeHint: 0.62,
    rightAscensionHours: 19.2794,
    declinationDegrees: 47.886,
    fallbackInfo: {
      name: "Kepler-22b",
      distanceString: "約600光年",
      description:
        "地球より大きいスーパーアース候補です。もし深い海に覆われているなら、空も波も地球とは違う表情を持つでしょう。",
    },
  },
  {
    id: "3c-273",
    name: "3C 273",
    englishName: "3C 273",
    shortLabel: "3C273",
    kind: "quasar",
    color: "#ff5fd2",
    magnitudeHint: 0.58,
    rightAscensionHours: 12.4852,
    declinationDegrees: 2.0524,
    fallbackInfo: {
      name: "3C 273",
      distanceString: "約24億光年",
      description:
        "巨大ブラックホールへ落ち込むガスが、銀河全体をしのぐ光を放つクエーサーです。静かな点の奥に極限の物理があります。",
    },
  },
  {
    id: "coma-cluster",
    name: "かみのけ座銀河団",
    englishName: "Coma Cluster",
    shortLabel: "COMA",
    kind: "deep-sky",
    color: "#c8a2ff",
    magnitudeHint: 0.56,
    rightAscensionHours: 12.9987,
    declinationDegrees: 27.9806,
    fallbackInfo: {
      name: "かみのけ座銀河団",
      distanceString: "約3億2000万光年",
      description:
        "1000個以上の銀河が集う巨大構造です。見える銀河だけでは重力が足りず、暗黒物質の存在を示す舞台になりました。",
    },
  },
];

export const celestialFallbackInfo: Record<CelestialId, CelestialInfo> = Object.fromEntries(
  celestialCatalog.map((item) => [item.id, item.fallbackInfo]),
) as Record<CelestialId, CelestialInfo>;

export function findCelestialItem(id: string) {
  return celestialCatalog.find((item) => item.id === id);
}
