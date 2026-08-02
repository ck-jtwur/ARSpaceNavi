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
  fallbackReason?: string;
};

export type CelestialCatalogItem = {
  id: CelestialId;
  name: string;
  kind: CelestialKind;
  color: string;
  magnitudeHint: number;
  imageSrc?: string;
  astronomyBody?: "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";
  rightAscensionHours?: number;
  declinationDegrees?: number;
  fallbackInfo: CelestialInfo;
};

export const celestialFallbackDescriptions: Record<CelestialId, [string, string, string]> = {
  sun: [
    "太陽系の中心に君臨する巨大なプラズマの球体です。核融合が生む膨大な光と熱が、惑星たちを照らし生命の舞台を支えています。",
    "表面は約6000度、外側のコロナは100万度を超える謎多き星です。フレアはオーロラを生み、磁気嵐も起こします。",
    "太陽系の質量のほとんどを一身に背負う重力の支配者です。黒点は強力な磁場活動を映す、燃える表面のサインです。",
  ],
  moon: [
    "地球をめぐる唯一の自然衛星で、人類が降り立った唯一の地球外天体です。常に同じ面を見せる姿に静かな神秘があります。",
    "大気や水がほぼないため、無数のクレーターが古い衝突の記憶を残しています。黒い月の海は、冷え固まった溶岩の平原です。",
    "月の重力は海の潮の満ち引きを生みます。巨大衝突で生まれたという説は、地球と月の深い関係を物語っています。",
  ],
  mercury: [
    "太陽系で最も小さく内側を回る岩石惑星です。大気がほとんどなく、昼夜で極端に温度が変わる過酷な荒野です。",
    "表面は無数のクレーターに覆われ、月に似た荒涼の景色が広がります。自転と公転のリズムも奇妙で、時間感覚を揺さぶります。",
    "小さな体の奥には巨大な鉄の核が詰まり、弱いながら磁場も持ちます。太陽風を浴び続ける、灼熱の最前線です。",
  ],
  venus: [
    "地球の双子と呼ばれるほど似た大きさを持ちながら、分厚い二酸化炭素の大気で鉛も溶ける灼熱の世界です。",
    "硫酸の雲が全体を覆い、太陽光を強く反射して明けの明星や宵の明星として輝きます。逆向きの自転も不思議です。",
    "地表は深海のような高圧に押しつぶされる環境です。かつて海があったかもしれない過去が、失われた地球の影を感じさせます。",
  ],
  mars: [
    "酸化鉄に覆われ赤く輝く岩石惑星です。巨大火山オリンポス山やマリネリス峡谷など、地球をしのぐ地形が広がります。",
    "今は寒く乾いた砂漠の世界ですが、昔は川や湖があった証拠が残ります。生命の痕跡を探す夢を背負った惑星です。",
    "薄い二酸化炭素の大気と、季節で姿を変える極冠を持ちます。人類の移住先としても研究される、赤い未来の舞台です。",
  ],
  jupiter: [
    "太陽系最大のガス惑星で、固い地表を持たない巨大な大気の世界です。縞模様の雲が高速の風で複雑に流れます。",
    "大赤斑は地球を飲み込むほどの巨大な嵐で、数百年以上も荒れ続けています。内部には金属水素の海があると考えられます。",
    "強い重力と磁場を持ち、多数の衛星を従えるミニ太陽系のような存在です。エウロパの氷下の海は生命探しの希望です。",
  ],
  saturn: [
    "太陽系で最も壮麗な環を持つ巨大ガス惑星です。無数の氷や岩の粒が太陽光を反射し、薄く輝く円盤を作ります。",
    "水素とヘリウムに満ちた低密度の惑星で、巨大な水槽があれば浮かぶほど軽いと例えられます。その優雅さが魅力です。",
    "高速自転で赤道がふくらんだ姿をしています。衛星タイタンには分厚い大気とメタンの湖があり、異世界の気配に満ちています。",
  ],
  uranus: [
    "水やアンモニア、メタンの氷でできた巨大氷惑星です。メタンが赤い光を吸収し、静かな青緑色の姿を見せます。",
    "自転軸が大きく傾き、横倒しで転がるように太陽を回ります。過去の巨大衝突を思わせる、奇妙で印象的な惑星です。",
    "横倒しの姿勢のため、極地方では長い昼と長い夜が続きます。淡い色の奥に、極端な季節を秘めた氷の世界です。",
  ],
  neptune: [
    "太陽系外縁を回る濃い青の巨大氷惑星です。極寒の世界ながら内部熱が強く、猛烈な暴風が吹き荒れています。",
    "大暗斑と呼ばれる黒い渦や白い雲が現れては消えます。超高圧の内部ではダイヤモンドの雨が降るという説もあります。",
    "最大の衛星トリトンは逆向きに公転する捕獲天体と考えられています。窒素の氷を噴き出す火山活動も確認されています。",
  ],
  ceres: [
    "小惑星帯最大の天体で、唯一の準惑星です。岩石と氷を抱え、地下には凍った塩水の層が残ると考えられます。",
    "オッカトル・クレーターの白い斑点は、内部から出た塩水の名残です。暗い表面に輝くその模様が謎めいた魅力です。",
    "小さな体に水や有機物を含むケレスは、太陽系初期の記憶を閉じ込めた天体です。生命の材料を探る鍵でもあります。",
  ],
  pluto: [
    "かつて第9惑星と呼ばれた氷の準惑星です。窒素やメタンの氷が作るハート形の平原は、今も多くの人を惹きつけます。",
    "巨大な衛星カロンと互いに振り回されるように回る、二重惑星のような関係を持ちます。小さな世界の壮大なダンスです。",
    "極寒の暗闇にありながら、地下には液体の海が残る可能性があります。氷の山脈や火山が、眠らない冥王星を物語ります。",
  ],
  haumea: [
    "カイパーベルトにある細長い準惑星です。異常に速い自転でラグビーボールのように伸びた姿が、ほかにない個性です。",
    "表面は新鮮な水の氷に覆われ、宇宙で明るく輝きます。小さな体の周りには細い環もあり、意外な優雅さを持ちます。",
    "過去の巨大衝突で高速回転する姿になり、衛星や似た軌道の小天体群を生んだと考えられます。衝突の記憶を持つ世界です。",
  ],
  makemake: [
    "太陽系外縁の準惑星で、冥王星に次いで明るい天体です。メタンやエタンの氷に覆われ、少し赤みを帯びています。",
    "普段は大気が表面に凍りついていますが、太陽に近づく時期には薄い大気をまとうと考えられます。静かな変身が魅力です。",
    "長く単独の天体と思われていましたが、暗い小さな衛星が見つかりました。淡い本体と黒い伴星の対比が印象的です。",
  ],
  eris: [
    "冥王星の再分類を促した歴史的な準惑星です。冥王星より重く、反射率の高い白い氷に覆われた明るい天体です。",
    "大きく傾いた細長い軌道を描いて太陽を回ります。メタンの氷が白い雪原のように輝き、遠い外縁世界の孤高さを感じさせます。",
    "衛星ディスノミアを従え、季節によってメタンの大気が凍って雪のように降ると考えられます。静かで壮大な変化の星です。",
  ],
  sirius: [
    "全天で最も明るく見える青白い恒星です。高温の表面から強いエネルギーを放ち、夜空に鋭い輝きを刻みます。",
    "肉眼では一つに見えますが、主星と白色矮星の伴星からなる連星です。星の一生の終わりを隣に抱く、美しい系です。",
    "古代エジプトではナイル川の季節を告げる重要な星でした。青白い閃光は、時代を超えて人の暦と想像力を照らします。",
  ],
  "alpha-centauri": [
    "ケンタウルス座で明るく輝く三重連星です。太陽に似た黄色い星も含まれ、宇宙の隣人のような親しみを感じさせます。",
    "小さな赤色矮星プロキシマの周りには、岩石の惑星が見つかっています。生命探しと恒星間探査の夢を集める星系です。",
    "SFでは人類が最初に目指す恒星系として描かれてきました。レーザー推進探査機を送る構想もあり、未来への入口です。",
  ],
  betelgeuse: [
    "オリオン座の肩で赤く輝く赤色超巨星です。寿命の終盤で大きく膨らみ、夜空に老いた巨星の迫力を放っています。",
    "膨張と収縮を繰り返して明るさが変わる変光星です。一時的な大減光は、星が吐き出した塵が光を遮った現象と考えられます。",
    "内部の燃料を使い果たしつつあり、将来は超新星爆発を起こすと考えられます。夜空を一変させる壮大な最期が待っています。",
  ],
  "sagittarius-a-star": [
    "天の川銀河の中心に潜む超大質量ブラックホールです。光さえ逃さない重力の渦が、銀河全体の奥深くに鎮座しています。",
    "イベント・ホライズン・テレスコープにより、曲げられた光が作るリング状の姿が撮影されました。見えないものを写した快挙です。",
    "本体は暗黒ですが、周囲の高温ガスが渦を巻き、X線や電波を放ちます。沈黙する中心が、銀河の鼓動を示しています。",
  ],
  "cygnus-x-1": [
    "初めてブラックホールと確実視された歴史的天体です。青色超巨星と見えない重力源が回り合い、強烈なX線を放ちます。",
    "伴星から流れ出すガスがブラックホールへ落ち込み、超高温に加熱されます。その激しい降着円盤が宇宙にX線を放ちます。",
    "正体をめぐり物理学者たちの賭けにもなった有名な天体です。観測が積み重なり、ブラックホールの実在を強く示しました。",
  ],
  andromeda: [
    "天の川銀河の隣にある巨大な渦巻銀河です。無数の星が集まり、条件が良ければ淡い光のしみとして肉眼でも見えます。",
    "天の川銀河と互いの重力で引き合い、将来は衝突して新しい巨大銀河になると考えられます。宇宙規模の運命の相手です。",
    "中心には巨大ブラックホールが潜み、複雑な核構造を持ちます。優雅な渦巻きの奥に、激しい重力の心臓が隠れています。",
  ],
  "trappist-1e": [
    "小さく低温な赤色矮星を回る、地球に近いサイズの岩石惑星です。液体の水を保てる可能性があり、注目されています。",
    "恒星に近いため、いつも同じ面を向けていると考えられます。永遠の昼と夜に分かれた、想像力を刺激する世界です。",
    "大気や雲を調べる観測の重要ターゲットです。水蒸気や生命の手がかりが見つかれば、宇宙観を揺さぶる発見になります。",
  ],
  "kepler-22b": [
    "太陽に似た恒星の生命居住可能領域で見つかった記念碑的な系外惑星です。地球より大きいスーパーアースと考えられます。",
    "温暖な環境かもしれませんが、厚い大気と深い海に覆われた海洋惑星の可能性があります。雲と水の世界が想像されます。",
    "もし一面が海なら、地球とはまったく違う進化をたどった生命がいるかもしれません。水の惑星というロマンを宿します。",
  ],
  "3c-273": [
    "人類が初めて発見したクエーサーです。若い銀河の中心で巨大ブラックホールが物質を飲み込み、圧倒的な光を放ちます。",
    "銀河全体を上回るほど明るい、宇宙で最もエネルギッシュな現象の一つです。小さな点の奥に途方もない力があります。",
    "光の分析から、クエーサーが宇宙初期の活動的な天体であることを示しました。天文学史に残る重要な観測対象です。",
  ],
  "coma-cluster": [
    "1000個以上の銀河が集まる巨大な銀河団です。宇宙空間に浮かぶ都市のように、無数の銀河が重力で結ばれています。",
    "銀河の動きから、見えない質量である暗黒物質の存在を考えるきっかけになりました。目に見えない宇宙を開いた舞台です。",
    "銀河団の空間は高温プラズマで満たされ、X線を放ちます。銀河とガス雲が織りなす、宇宙最大級の構造です。",
  ],
};

const fallbackDescriptionCoda =
  "スマホの空に重ねると、見えない物理の営みと宇宙のロマンが静かに立ち上がり、観測の時間を深めます。";

export const celestialCatalog: CelestialCatalogItem[] = [
  {
    id: "sun",
    name: "太陽",
    kind: "solar-system",
    color: "#ffd166",
    magnitudeHint: 1,
    imageSrc: "/celestial/sun.png",
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
    kind: "solar-system",
    color: "#dce7ff",
    magnitudeHint: 0.92,
    imageSrc: "/celestial/moon.png",
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
    kind: "solar-system",
    color: "#c9c2b8",
    magnitudeHint: 0.72,
    imageSrc: "/celestial/mercury.png",
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
    kind: "solar-system",
    color: "#ffd6a0",
    magnitudeHint: 0.9,
    imageSrc: "/celestial/venus.png",
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
    kind: "solar-system",
    color: "#ff8a5b",
    magnitudeHint: 0.78,
    imageSrc: "/celestial/mars.png",
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
    kind: "solar-system",
    color: "#f6c47f",
    magnitudeHint: 0.86,
    imageSrc: "/celestial/jupiter.png",
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
    kind: "solar-system",
    color: "#e7d7a1",
    magnitudeHint: 0.72,
    imageSrc: "/celestial/saturn.png",
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
    kind: "solar-system",
    color: "#7fe7e7",
    magnitudeHint: 0.62,
    imageSrc: "/celestial/uranus.png",
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
    kind: "solar-system",
    color: "#5f8cff",
    magnitudeHint: 0.6,
    imageSrc: "/celestial/neptune.png",
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
    kind: "dwarf-planet",
    color: "#b8c0c7",
    magnitudeHint: 0.5,
    imageSrc: "/celestial/ceres.png",
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
    kind: "dwarf-planet",
    color: "#d7bda6",
    magnitudeHint: 0.52,
    imageSrc: "/celestial/pluto.png",
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
    kind: "dwarf-planet",
    color: "#e6f4ff",
    magnitudeHint: 0.48,
    imageSrc: "/celestial/haumea.png",
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
    kind: "dwarf-planet",
    color: "#f3d0b5",
    magnitudeHint: 0.47,
    imageSrc: "/celestial/makemake.png",
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
    kind: "dwarf-planet",
    color: "#d8dcff",
    magnitudeHint: 0.46,
    imageSrc: "/celestial/eris.png",
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
    kind: "star",
    color: "#a9d8ff",
    magnitudeHint: 0.95,
    imageSrc: "/celestial/sirius.png",
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
    kind: "star",
    color: "#fff0b5",
    magnitudeHint: 0.88,
    imageSrc: "/celestial/alpha-centauri.png",
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
    kind: "star",
    color: "#ff6b4a",
    magnitudeHint: 0.84,
    imageSrc: "/celestial/betelgeuse.png",
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
    kind: "black-hole",
    color: "#b78cff",
    magnitudeHint: 0.7,
    imageSrc: "/celestial/sagittarius-a-star.png",
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
    kind: "black-hole",
    color: "#8bd3ff",
    magnitudeHint: 0.68,
    imageSrc: "/celestial/cygnus-x-1.png",
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
    kind: "deep-sky",
    color: "#f0a6ff",
    magnitudeHint: 0.76,
    imageSrc: "/celestial/andromeda.png",
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
    kind: "exoplanet",
    color: "#4ee8c8",
    magnitudeHint: 0.64,
    imageSrc: "/celestial/trappist-1e.png",
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
    kind: "exoplanet",
    color: "#58b8ff",
    magnitudeHint: 0.62,
    imageSrc: "/celestial/kepler-22b.png",
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
    kind: "quasar",
    color: "#ff5fd2",
    magnitudeHint: 0.58,
    imageSrc: "/celestial/3c-273.png",
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
    kind: "deep-sky",
    color: "#c8a2ff",
    magnitudeHint: 0.56,
    imageSrc: "/celestial/coma-cluster.png",
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

export function getRandomCelestialFallbackInfo(id: CelestialId): CelestialInfo {
  const fallback = celestialFallbackInfo[id];
  const variants = celestialFallbackDescriptions[id];
  const description = `${variants[Math.floor(Math.random() * variants.length)] ?? fallback.description}${fallbackDescriptionCoda}`;

  return {
    ...fallback,
    description,
  };
}

export function findCelestialItem(id: string) {
  return celestialCatalog.find((item) => item.id === id);
}
