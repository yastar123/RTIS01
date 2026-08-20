import { TcmAiReport } from "@/components/screening/TcmHerbalReport";

export function calculateTcmResult(
  jawaban: Record<string, number>,
  totalQuestionsCount: number = 10,
) {
  const totalQuestions = totalQuestionsCount || 1;
  const answeredCount = Object.keys(jawaban).length;

  let totalScoreSum = 0;
  Object.values(jawaban).forEach((v) => {
    totalScoreSum += typeof v === "number" ? v : 0;
  });

  const maxPossibleScore = totalQuestions * 3;
  const answeredMaxScore = answeredCount * 3 || 1;
  const severityRatio = totalScoreSum / answeredMaxScore;

  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - severityRatio * 100)));

  const calcBasicImbalance = (multiplier: number, offset: number) => {
    const val = Math.round(severityRatio * multiplier + offset);
    return Math.max(10, Math.min(100, val));
  };

  const imbalEnergy = calcBasicImbalance(80, 20);
  const imbalBlood = calcBasicImbalance(75, 25);
  const imbalYin = calcBasicImbalance(70, 30);
  const imbalYang = calcBasicImbalance(85, 15);
  const imbalStagnation = calcBasicImbalance(80, 20);
  const imbalStasis = calcBasicImbalance(75, 25);
  const imbalDamp = calcBasicImbalance(90, 10);
  const imbalPhlegm = calcBasicImbalance(85, 15);
  const imbalHeat = Math.max(10, Math.min(100, Math.round(severityRatio * 75 + 22)));
  const imbalCold = calcBasicImbalance(80, 20);

  const organImbalances = {
    Hati: Math.max(10, Math.min(100, Math.round(severityRatio * 75 + 22))),
    Jantung: Math.max(10, Math.min(100, Math.round(severityRatio * 72 + 24))),
    Limpa: calcBasicImbalance(90, 10),
    Paru: Math.max(10, Math.min(100, Math.round(severityRatio * 82 + 13))),
    Ginjal: calcBasicImbalance(90, 10),
    Perikardium: calcBasicImbalance(90, 10),
    KandungEmpedu: calcBasicImbalance(90, 10),
    UsusKecil: Math.max(10, Math.min(100, Math.round(severityRatio * 65 + 10))),
    Lambung: calcBasicImbalance(90, 10),
    UsusBesar: calcBasicImbalance(90, 10),
    KandungKemih: calcBasicImbalance(90, 10),
    SanJiao: calcBasicImbalance(90, 10),
  };

  const weiQi = Math.max(2, Math.min(98, Math.round(100 - severityRatio * 98)));

  return {
    balanceScore,
    imbalEnergy,
    imbalBlood,
    imbalYin,
    imbalYang,
    imbalStagnation,
    imbalStasis,
    imbalDamp,
    imbalPhlegm,
    imbalHeat,
    imbalCold,
    organImbalances,
    weiQi,
  };
}

export function getDominantConstitution(results: ReturnType<typeof calculateTcmResult>) {
  const list = [
    {
      name: "Defisiensi Qi (Kekurangan Energi)",
      pct: results.imbalEnergy,
      desc: "Energi vital tubuh menurun, mudah lelah setelah beraktivitas, nafas pendek, dan pemulihan lambat.",
      dietDianjurkan:
        "Ubi manis, kurma, jahe hangat, daging ayam kampung, beras merah, kaldu tulang.",
      dietDihindari:
        "Makanan mentah (salad dingin), es, makanan terlalu asam, dan gorengan berlemak.",
      lifestyle:
        "Tidur sebelum jam 23.00, hindari begadang, latihan pernapasan ringan (Qigong / jalan santai).",
      acupressure: "Zusanli (ST36)",
      acupressureLoc: "4 jari di bawah tempurung lutut, 1 jari ke arah luar tulang kering.",
      acupressureFunc: "Menguatkan energi limpa dan lambung, mendongkrak stamina dan metabolisme.",
    },
    {
      name: "Defisiensi Yang (Kelemahan Hangat Vital)",
      pct: results.imbalYang,
      desc: "Kelemahan energi api metabolisme tubuh, anggota gerak mudah dingin, rentan diare/feses lembek.",
      dietDianjurkan:
        "Kayu manis, jahe merah, cengkeh, lada hitam, daging kambing/sapi berkuah hangat.",
      dietDihindari: "Minuman es, blewah, semangka, mentimun, dan sayur mentah.",
      lifestyle:
        "Kenakan pakaian hangat, jemur punggung di bawah sinar matahari pagi, rendam kaki air hangat.",
      acupressure: "Guanyuan (CV4)",
      acupressureLoc: "4 jari di bawah pusar.",
      acupressureFunc: "Menghangatkan Yang Ginjal dan memulihkan energi esensial dasar tubuh.",
    },
    {
      name: "Defisiensi Yin (Kekurangan Cairan Esensial)",
      pct: results.imbalYin,
      desc: "Kekeringan cairan tubuh, sensasi panas di telapak tangan/kaki, tenggorokan kering, tidur gelisah.",
      dietDianjurkan:
        "Goji berry (Kou Qi Zi), jamur kuping putih, pir kukus, biji teratai, madu murni.",
      dietDihindari: "Makanan pedas menyengat, kopi berlebih, gorengan garing, dan alkohol.",
      lifestyle: "Kelola stres, meditasi menenangkan Shen, minum air putih hangat secara berkala.",
      acupressure: "Taixi (KI3)",
      acupressureLoc: "Lekukan antara mata kaki bagian dalam dan tendon Achilles.",
      acupressureFunc: "Menutrisi Yin Ginjal, meredakan sensasi panas dan menenangkan pikiran.",
    },
    {
      name: "Stagnasi Qi Hati (Sumbatan Aliran Emosi)",
      pct: results.imbalStagnation,
      desc: "Aliran energi terhambat akibat beban emosional/stres, dada terasa sesak, sering mendesah, kembung.",
      dietDianjurkan:
        "Teh bunga mawar (Mei Gui Hua), kulit jeruk mandarin (Chen Pi), daun mint, lobak putih.",
      dietDihindari: "Makanan berlemak berat, alkohol, makanan olahan cepat saji.",
      lifestyle:
        "Ekspresikan emosi secara sehat, jalan-jalan di alam hijau, relaksasi pernapasan dalam.",
      acupressure: "Taichong (LR3)",
      acupressureLoc: "Lekukan antara pangkal ibu jari kaki dan jari telunjuk kaki.",
      acupressureFunc:
        "Membuka sumbatan Qi Hati, meredakan ketegangan stres, dan menstabilkan emosi.",
    },
    {
      name: "Kelembapan & Dahak (Dampness-Phlegm)",
      pct: Math.max(results.imbalDamp, results.imbalPhlegm),
      desc: "Penumpukan cairan keruh dan dahak metabolik, badan terasa berat, kepala pening seperti diikat, BAB lengket.",
      dietDianjurkan:
        "Barley (Jali-jali), kacang merah (Chi Xiao Dou), labu kuning, bawang putih, temulawak.",
      dietDihindari:
        "Gula pasir, susu olahan/keju berlebih, makanan berminyak tinggi, tepung-tepungan.",
      lifestyle:
        "Olahraga teratur hingga berkeringat ringan, jaga sirkulasi udara ruangan tetap kering.",
      acupressure: "Fenglong (ST40)",
      acupressureLoc: "Pertengahan antara lutut luar dan mata kaki luar.",
      acupressureFunc: "Titik utama TCM untuk melarutkan dahak dan membuang kelembapan internal.",
    },
  ];

  list.sort((a, b) => b.pct - a.pct);
  return list[0];
}

export function createTcmReportHelpers(
  jawaban: Record<string, number>,
  results: ReturnType<typeof calculateTcmResult>,
  keluhan?: string,
) {
  const getActiveSyndromesString = () => {
    return "Defisiensi Yang Limpa-Ginjal disertai Lembap / Disharmoni Qi Hati-Limpa disertai Lembap";
  };

  const getKeluhanUtamaManifestasi = () => {
    if (keluhan && typeof keluhan === "string" && keluhan.trim().length > 0) {
      return keluhan.trim();
    }

    const list: string[] = [];
    if (jawaban["dq1"] && jawaban["dq1"] > 0)
      list.push("mudah merasa lelah dan cepat kehilangan tenaga");
    if (jawaban["dq2"] && jawaban["dq2"] > 0)
      list.push("kualitas tidur menurun atau sering terbangun di malam hari");
    if (jawaban["dq3"] && jawaban["dq3"] > 0)
      list.push("perasaan cemas, gelisah, dan sulit berkonsentrasi");
    if (jawaban["dq4"] && jawaban["dq4"] > 0) list.push("nyeri atau ketegangan otot berulang");
    if (jawaban["dq5"] && jawaban["dq5"] > 0)
      list.push("pencernaan tidak stabil dan perut sering kembung");
    if (jawaban["dq6"] && jawaban["dq6"] > 0)
      list.push("ketidakstabilan emosi atau mudah merasa murung");
    if (jawaban["dq7"] && jawaban["dq7"] > 0)
      list.push("sensasi tubuh yang mudah merasa dingin atau panas");
    if (jawaban["dq8"] && jawaban["dq8"] > 0)
      list.push("pembengkakan (edema) di area bawah pusar hingga kaki");
    if (jawaban["dq9"] && jawaban["dq9"] > 0)
      list.push("sensasi tenggorokan tersumbat benda asing saat menelan");
    if (jawaban["dq10"] && jawaban["dq10"] > 0)
      list.push("buang air besar yang terasa lengket atau basah");

    if (list.length === 0) {
      return "mudah merasa lelah, cepat kehilangan tenaga setelah beraktivitas";
    }
    return list.join(", ");
  };

  const getTop3OrgansString = () => {
    const sorted = Object.entries(results.organImbalances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return sorted
      .map(([name, val]) => `${name === "Paru" ? "Paru-paru" : name} (${val}%)`)
      .join(", ");
  };

  const getPrimaryTherapeuticPriority = () => {
    const maxImbal = Math.max(
      results.imbalEnergy,
      results.imbalBlood,
      results.imbalYin,
      results.imbalYang,
      results.imbalStagnation,
    );
    if (maxImbal === results.imbalYang) {
      return "menghangatkan yang ginjal dan limpa (wen shen jian pi), serta melarutkan kelembapan (hua shi)";
    }
    if (maxImbal === results.imbalStagnation) {
      return "mengatur Qi Hati (shu gan li qi), menguatkan Qi Limpa (jian pi yi qi), dan menghilangkan lembap (hua shi)";
    }
    if (maxImbal === results.imbalEnergy) {
      return "menguatkan Qi Limpa dan Paru (jian pi yi fei), serta mengurai dahak (hua tan)";
    }
    if (maxImbal === results.imbalYin) {
      return "menutrisi Yin Ginjal (zi yin) dan menurunkan Api Jantung (jiang huo)";
    }
    return "menghangatkan yang ginjal dan limpa (wen shen jian pi), serta melarutkan kelembapan (hua shi)";
  };

  const getTop3OrgansList = () => {
    const sorted = Object.entries(results.organImbalances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const organDescs: Record<string, string> = {
      Limpa:
        "Akar energi pasca-kelahiran (Post-Heaven Qi), mengolah nutrisi dan metabolisme cairan.",
      Ginjal:
        "Akar energi pra-kelahiran (Pre-Heaven Qi), penyimpan Esensi (Jing) dan penguasa Yang vital.",
      Hati: "Pengatur aliran Qi bebas (Shu Xie), penyimpanan darah, dan pengontrol ketegangan emosional.",
      Lambung: "Lautan makanan dan cairan (Shui Gu Zhi Hai), berpasangan erat dengan Limpa.",
      Paru: "Pengendali pernapasan, penyebar Qi dan cairan, serta benteng pertahanan kulit (Wei Qi).",
      Jantung:
        "Raja organ (Jun Zhu Zhi Guan), pemompa darah dan tempat bersemayamnya pikiran (Shen).",
    };

    return sorted.map(([name, val]) => ({
      name: name === "Paru" ? "Paru-paru (Fei)" : `${name}`,
      val: `${val}%`,
      desc: organDescs[name] || "Organ vital berpengaruh pada metabolisme energi.",
    }));
  };

  const getMostInfluentialSymptoms = () => {
    const symptoms: string[] = [];
    if (jawaban["dq1"] && jawaban["dq1"] >= 2)
      symptoms.push("Kelelahan berlebih & penurunan energi vital");
    if (jawaban["dq2"] && jawaban["dq2"] >= 2)
      symptoms.push("Kualitas tidur terganggu / insomniak");
    if (jawaban["dq3"] && jawaban["dq3"] >= 2)
      symptoms.push("Gelisah / kecemasan & stres emosional");
    if (jawaban["dq4"] && jawaban["dq4"] >= 2) symptoms.push("Ketegangan otot berulang");
    if (jawaban["dq5"] && jawaban["dq5"] >= 2) symptoms.push("Gangguan pencernaan / perut kembung");
    if (jawaban["dq8"] && jawaban["dq8"] >= 1)
      symptoms.push("Kecenderungan edema/pembengkakan area bawah");
    if (jawaban["dq10"] && jawaban["dq10"] >= 1) symptoms.push("Feses lengket/retensi kelembapan");
    if (symptoms.length === 0) symptoms.push("Kelelahan ringan & penurunan stamina berkala");
    return symptoms;
  };

  const listCriticalImbalances = () => {
    const list: string[] = [];
    if (results.imbalEnergy >= 70) list.push("Defisiensi Energi (Qi) tingkat signifikan (≥70%)");
    if (results.imbalYang >= 70) list.push("Kelemahan Energi Hangat (Yang Ginjal/Limpa) tinggi");
    if (results.imbalDamp >= 70) list.push("Retensi Kelembapan (Dampness) tinggi di pencernaan");
    if (results.imbalStagnation >= 70)
      list.push("Stagnasi Qi Hati akibat stres/ketegangan emosional");
    if (results.weiQi <= 40)
      list.push("Energi Pertahanan Luar (Wei Qi) berada di tingkat rentan (≤40%)");
    return list;
  };

  return {
    getActiveSyndromesString,
    getKeluhanUtamaManifestasi,
    getTop3OrgansString,
    getPrimaryTherapeuticPriority,
    getTop3OrgansList,
    getMostInfluentialSymptoms,
    listCriticalImbalances,
  };
}
