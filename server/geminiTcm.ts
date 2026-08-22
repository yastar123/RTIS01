import { GoogleGenAI } from "@google/genai";

export interface HospitalDocItem {
  id?: string;
  name: string;
  type?: string;
  note?: string;
  url?: string;
}

export interface PatientScreeningInput {
  answers: Record<string, string | number>;
  questions?: Array<{ id: string; questionText: string }>;
  patientProfile?: {
    name?: string;
    age?: number | string;
    gender?: string;
    height?: number | string;
    weight?: number | string;
    complaints?: string;
    tonguePhoto?: string | null;
    hospitalDocs?: HospitalDocItem[];
  };
  basicResults?: {
    totalScore?: number;
    maxScore?: number;
    balanceScore?: number;
    weiQi?: number;
    dominantConstitution?: string;
    riskLevel?: string;
  };
}

export interface TitikAkupunkturItem {
  namaTitik: string;
  meridian: string;
  lokasiAnatomi: string;
  indikasiTerapi: string;
  metodeStimulasi: string;
}

export interface TitikBekamItem {
  namaTitik: string;
  lokasiAnatomi: string;
  indikasiTerapi: string;
  jenisKop: string;
  teknikBekam: string;
  durasiDanFrequensi: string;
}

export interface TitikPijatItem {
  namaTitik: string;
  lokasiAnatomi: string;
  indikasiTerapi: string;
  teknikPijat: string;
  durasiDanPenekanan: string;
  manfaatUtama: string;
}

export interface TcmAiAnalysisResponse {
  kesimpulanHolistik: {
    statusVitalitas: string;
    ringkasanAnalisa: string;
    polaSindromUtama: string;
    manifestasiKeluhan: string;
    kondisiPsikoEmosional: string;
    analisaWeiQiDanPatogen: string;
    prioritasTerapiUtama: string;
  };
  profilKetidakseimbanganDasar: Array<{
    nama: string;
    persentase: number;
    tingkat: string;
    penjelasan: string;
  }>;
  profilKetidakseimbanganOrgan: Array<{
    organ: string;
    persentase: number;
    status: string;
    peranFungsi: string;
  }>;
  polaTcm: Array<{
    namaSindrom: string;
    tipe: string;
    confidenceMatch: number;
    kataKunci: string[];
    deskripsi: string;
  }>;
  peringatanPrioritasTinggi: string[];
  titikAkupunktur?: TitikAkupunkturItem[];
  titikBekam?: TitikBekamItem[];
  titikPijat?: TitikPijatItem[];
  rekomendasiDietGayaHidup: {
    dietDianjurkan: string;
    dietDihindari: string;
    polaHidup: string;
    titikAkupresur: Array<{
      titik: string;
      lokasi: string;
      manfaat: string;
      caraTekan: string;
    }>;
  };
  herbalIndonesia: Array<{
    namaIndonesia: string;
    namaLatin: string;
    sifatRasa: string;
    targetOrgan: string;
    khasiatTcm: string;
    caraPengolahan: string;
    anjuranKonsumsi: string;
    catatanPeringatan: string;
  }>;
  herbalChina: Array<{
    namaPinyin: string;
    namaLatin: string;
    sifatRasa: string;
    masukMeridian: string;
    fungsiUtama: string;
    indikasi: string;
    rekomendasiFormula: string;
  }>;
  faktorPencetus: string[];
  isAiGenerated: boolean;
}

/**
 * Fallback generator when Gemini API Key is not set or network call fails
 */
export function generateFallbackTcmAnalysis(input: PatientScreeningInput): TcmAiAnalysisResponse {
  const answers = input.answers || {};
  const totalScore = Object.values(answers).reduce(
    (acc, v) => acc + (typeof v === "number" ? v : 0),
    0,
  );
  const totalQuestions = input.questions?.length || Object.keys(answers).length || 10;
  const maxScore = totalQuestions * 3;
  const severityRatio = maxScore > 0 ? totalScore / maxScore : 0.3;

  const balanceScore = Math.max(15, Math.min(95, Math.round(100 - severityRatio * 75)));
  const weiQi = Math.max(10, Math.min(95, Math.round(100 - severityRatio * 90)));

  // Specific question responses
  const qTired = answers["dq1"] ?? (totalScore > 5 ? 2 : 1);
  const qSleep = answers["dq2"] ?? 1;
  const qStress = answers["dq3"] ?? answers["dq6"] ?? 1;
  const qDigestion = answers["dq5"] ?? 2;
  const qColdWarm = answers["dq7"] ?? 1;
  const qEdema = answers["dq8"] ?? 0;
  const qGlobus = answers["dq9"] ?? 0;
  const qStickyStool = answers["dq10"] ?? (qDigestion >= 2 ? 2 : 1);

  const isDampPredominant = qStickyStool >= 2 || qEdema >= 2 || severityRatio > 0.4;
  const isYangDeficient = qColdWarm >= 2 || qTired >= 2 || qEdema >= 1;
  const isQiStagnant = qStress >= 2 || qGlobus >= 1;

  let mainSindrom = "Defisiensi Yang Limpa & Ginjal disertai Retensi Lembap";
  let therapeuticFocus =
    "Menghangatkan Yang Ginjal dan Limpa (Wen Shen Jian Pi), serta mengeringkan dan melarutkan kelembapan (Hua Shi).";

  if (isQiStagnant && !isYangDeficient) {
    mainSindrom = "Disharmoni Qi Hati-Limpa disertai Stagnasi Emosional";
    therapeuticFocus =
      "Melancarkan sirkulasi Qi Hati (Shu Gan Li Qi), menguatkan Limpa (Jian Pi), dan menenangkan pikiran (An Shen).";
  } else if (severityRatio < 0.25) {
    mainSindrom = "Defisiensi Qi Limpa Ringan dengan Ketidakseimbangan Fungsional";
    therapeuticFocus = "Memelihara Qi vital dan memperkuat sistem pencernaan dasar.";
  }

  const criticalWarnings: string[] = [];
  if (severityRatio >= 0.5) {
    criticalWarnings.push(
      "Tingkat kelembapan dan kelemahan energi metabolik (Yang) tergolong signifikan (≥ 60%).",
    );
    criticalWarnings.push(
      "Fungsi transformasi cairan dan nutrisi limpa-ginjal mengalami hambatan yang perlu penanganan.",
    );
  }
  if (qStress >= 2) {
    criticalWarnings.push(
      "Stagnasi Qi Hati akibat stres dan ketegangan emosi mulai memicu gangguan organ pencernaan.",
    );
  }
  if (criticalWarnings.length === 0 && severityRatio > 0.3) {
    criticalWarnings.push("Terdapat kecenderungan penurunan energi pertahanan tubuh (Wei Qi).");
  }

  return {
    isAiGenerated: false,
    kesimpulanHolistik: {
      statusVitalitas:
        balanceScore >= 75
          ? "Kondisi Relatif Seimbang"
          : balanceScore >= 45
            ? "Ketidakseimbangan Ringan-Sedang"
            : "Ketidakseimbangan Sangat Dominan",
      ringkasanAnalisa: `Berdasarkan evaluasi kuesioner dan profil keluhan ${input.patientProfile?.name || "pasien"}, tubuh Anda menunjukkan pola ketidakseimbangan pada meridian Limpa dan Ginjal dengan kecenderungan penumpukan kelembapan (Dampness) dan defisiensi Yang. Cadangan energi esensial menurun sehingga tubuh mudah mengalami kelelahan, kembung, dan rasa berat di badan.`,
      polaSindromUtama: mainSindrom,
      manifestasiKeluhan:
        input.patientProfile?.complaints ||
        "Mudah lelah setelah beraktivitas, perut kembung atau pencernaan kurang stabil, dan energi tubuh menurun.",
      kondisiPsikoEmosional:
        qStress >= 2
          ? "Tekanan emosi dan overthinking menghambat kelancaran Qi Hati yang kemudian menekan fungsi Limpa (Wood overacting on Earth)."
          : "Kondisi emosional relatif terkendali namun perlu relaksasi teratur untuk mencegah stagnasi energi.",
      analisaWeiQiDanPatogen: `Energi pelindung luar (Wei Qi) Anda berada di angka ${weiQi}%. Tubuh memerlukan perlindungan dari paparan patogen eksternal seperti Angin Dingin (Feng Han) dan Kelembapan (Shi Xie).`,
      prioritasTerapiUtama: therapeuticFocus,
    },
    profilKetidakseimbanganDasar: [
      {
        nama: "Kekurangan Energi (Qi)",
        persentase: Math.min(95, Math.round(40 + qTired * 18)),
        tingkat: qTired >= 2 ? "Tinggi" : "Sedang",
        penjelasan: "Kelemahan energi vital tubuh yang memicu mudah lelah.",
      },
      {
        nama: "Kekurangan Darah (Blood)",
        persentase: Math.min(90, Math.round(30 + qSleep * 15)),
        tingkat: qSleep >= 2 ? "Sedang" : "Rendah",
        penjelasan: "Kualitas nutrisi cairan darah yang mendukung fungsi organ dan tidur nyenyak.",
      },
      {
        nama: "Kekurangan Yin",
        persentase: Math.min(90, Math.round(25 + qSleep * 15)),
        tingkat: "Sedang",
        penjelasan: "Cairan esensial pendingin tubuh.",
      },
      {
        nama: "Kekurangan Yang",
        persentase: Math.min(95, Math.round(35 + (isYangDeficient ? 35 : 15))),
        tingkat: isYangDeficient ? "Tinggi" : "Sedang",
        penjelasan: "Energi hangat penggerak metabolisme dan transformasi cairan.",
      },
      {
        nama: "Stagnasi Energi (Qi)",
        persentase: Math.min(95, Math.round(30 + qStress * 20)),
        tingkat: qStress >= 2 ? "Tinggi" : "Sedang",
        penjelasan: "Sumbatan aliran energi yang dipicu stres atau kurang gerak.",
      },
      {
        nama: "Stasis Darah",
        persentase: Math.min(85, Math.round(25 + severityRatio * 30)),
        tingkat: "Rendah-Sedang",
        penjelasan: "Hambatan sirkulasi mikrovaskular pada jaringan otot.",
      },
      {
        nama: "Kelembapan Berlebih (Dampness)",
        persentase: Math.min(95, Math.round(40 + (isDampPredominant ? 35 : 15))),
        tingkat: isDampPredominant ? "Tinggi" : "Sedang",
        penjelasan: "Penumpukan cairan kental keruh akibat fungsi limpa menurun.",
      },
      {
        nama: "Dahak Internal (Phlegm)",
        persentase: Math.min(90, Math.round(30 + (qStickyStool >= 2 ? 30 : 10))),
        tingkat: "Sedang",
        penjelasan: "Kondensasi kelembapan menahun di saluran pernapasan atau pencernaan.",
      },
      {
        nama: "Panas Internal (Heat)",
        persentase: Math.min(85, Math.round(20 + (qStress >= 2 ? 25 : 10))),
        tingkat: "Rendah",
        penjelasan: "Gejala panas akibat stagnasi atau defisiensi yin.",
      },
      {
        nama: "Dingin Internal (Cold)",
        persentase: Math.min(95, Math.round(35 + (isYangDeficient ? 35 : 15))),
        tingkat: isYangDeficient ? "Tinggi" : "Sedang",
        penjelasan: "Sensasi tubuh mudah dingin dan lambung lambat mencerna.",
      },
    ],
    profilKetidakseimbanganOrgan: [
      {
        organ: "Limpa (Spleen / Pi)",
        persentase: Math.min(98, Math.round(55 + qDigestion * 12)),
        status: "Prioritas Utama",
        peranFungsi: "Pusat metabolisme makanan dan transportasi cairan tubuh.",
      },
      {
        organ: "Ginjal (Kidney / Shen)",
        persentase: Math.min(95, Math.round(50 + (isYangDeficient ? 25 : 10))),
        status: "Prioritas Tinggi",
        peranFungsi: "Akar energi bawaan tubuh dan penentu kehangatan Yang.",
      },
      {
        organ: "Hati (Liver / Gan)",
        persentase: Math.min(95, Math.round(45 + qStress * 15)),
        status: qStress >= 2 ? "Prioritas Tinggi" : "Sedang",
        peranFungsi: "Pengatur kelancaran emosi dan aliran Qi bebas.",
      },
      {
        organ: "Lambung (Stomach / Wei)",
        persentase: Math.min(90, Math.round(45 + qDigestion * 10)),
        status: "Sedang",
        peranFungsi: "Penerima dan penghancur makanan awal.",
      },
      {
        organ: "Paru-paru (Lung / Fei)",
        persentase: Math.min(90, Math.round(35 + (100 - weiQi) * 0.4)),
        status: "Sedang",
        peranFungsi: "Pengendali pernapasan dan penyebar Wei Qi ke permukaan kulit.",
      },
      {
        organ: "Jantung (Heart / Xin)",
        persentase: Math.min(85, Math.round(30 + qSleep * 15)),
        status: "Sedang",
        peranFungsi: "Rumah bagi pikiran (Shen) dan pemompa sirkulasi darah.",
      },
    ],
    polaTcm: [
      {
        namaSindrom: mainSindrom,
        tipe: "Kombinasi Sindrom Zang-Fu",
        confidenceMatch: Math.round(75 + severityRatio * 20),
        kataKunci: ["Yang Limpa", "Yang Ginjal", "Lembap Dingin", "Kelelahan"],
        deskripsi:
          "Kelemahan energi pembakaran metabolisme di ginjal dan limpa menyebabkan cairan tidak terolah sempurna dan menumpuk menjadi rasa kembung, letih, dan berat.",
      },
      {
        namaSindrom: "Disharmoni Qi Hati-Limpa disertai Lembap",
        tipe: "Hubungan Antar-Organ",
        confidenceMatch: Math.round(65 + qStress * 10),
        kataKunci: ["Stagnasi Qi Hati", "Defisiensi Limpa", "Stres"],
        deskripsi:
          "Ketegangan pikiran dan beban kerja mengganggu sirkulasi Qi yang mengakibatkan gangguan fungsi pencernaan secara berulang.",
      },
    ],
    peringatanPrioritasTinggi: criticalWarnings,
    titikBekam: [
      {
        namaTitik: "Daqu (BL-17 / 膈俞) & area Pinggang",
        lokasiAnatomi:
          "Punggung atas (BL-17 setinggi vertebra torakal ke-7, 1.5 cun di luar garis tengah) dan area pinggang bawah (lumbal II-IV).",
        indikasiTerapi:
          "Memperlancar sirkulasi darah (Huo Xue), membuang sumbatan Stasis, memperkuat fungsi Limpa-Ginjal, dan menghilangkan kelembapan internal.",
        jenisKop: "Bekam Kering (Hijamah Jaffa) / Bekam Api",
        teknikBekam:
          "Tempelkan kop ukuran sedang pada titik yang telah diolesi minyak zaitun, biarkan selama 10-15 menit. Pastikan kulit bersih dan tidak ada lesi terbuka.",
        durasiDanFrequensi: "10-15 menit per sesi, 1 kali per minggu selama 4 minggu, lalu evaluasi oleh terapis.",
      },
      {
        namaTitik: "Zusanli (ST-36 / 足三里) & Sanyinjiao (SP-6)",
        lokasiAnatomi:
          "ST-36: 4 jari di bawah tempurung lutut, 1 jari di luar tulang kering. SP-6: 3 jari di atas mata kaki dalam, belakang tulang kering.",
        indikasiTerapi:
          "Menguatkan Qi Limpa dan Lambung (Jian Pi He Wei), membuang kelembapan, meningkatkan daya tahan tubuh (Wei Qi).",
        jenisKop: "Bekam Luncur (Sliding Cupping) / Bekam Kering",
        teknikBekam:
          "Olesi tungkai bawah dengan minyak bekam hangat. Geser kop perlahan dari ST-36 ke arah bawah hingga mata kaki untuk menstimulasi meridian Lambung dan Limpa.",
        durasiDanFrequensi: "15-20 menit luncuran per sesi, 1 kali per 10 hari.",
      },
      {
        namaTitik: "Zhongwan (RN-12 / 中脘) & Qihai (RN-6)",
        lokasiAnatomi:
          "RN-12: Garis tengah perut, antara ujung tulang dada dan pusar. RN-6: 1.5 cun di bawah pusar.",
        indikasiTerapi:
          "Harmonisasi Lambung, memperkuat fungsi pencernaan, menghangatkan Yang Ginjal, dan membuang kelembapan perut.",
        jenisKop: "Bekam Kering (Dry Cupping) ringan",
        teknikBekam:
          "Gunakan kop kecil, tempel lembut di RN-12 dan RN-6 selama 8-10 menit. Hindari hisapan terlalu kuat pada area perut.",
        durasiDanFrequensi: "8-10 menit, 1 kali per minggu. Hindari saat perut penuh atau menstruasi.",
      },
    ],
    titikPijat: [
      {
        namaTitik: "Zusanli (ST-36 / 足三里)",
        lokasiAnatomi:
          "4 jari di bawah tempurung lutut (patella), 1 jari ke arah luar dari tepi anterior tulang kering (tibia).",
        indikasiTerapi:
          "Menguatkan Qi Limpa dan Lambung, meningkatkan energi vital, memperbaiki penyerapan nutrisi, dan memperkuat daya tahan tubuh.",
        teknikPijat:
          "Gunakan ibu jari, tekan dengan kekuatan sedang menggunakan gerakan memutar searah jarum jam (tonifikasi). Lakukan pada kedua kaki secara bergantian.",
        durasiDanPenekanan: "2-3 menit per titik, 2 kali sehari (pagi dan sore).",
        manfaatUtama: "Titik tonik utama TCM untuk stamina dan pencernaan.",
      },
      {
        namaTitik: "Sanyinjiao (SP-6 / 三阴交)",
        lokasiAnatomi:
          "3 jari di atas puncak mata kaki bagian dalam (malleolus medialis), tepat di belakang tepi tulang kering.",
        indikasiTerapi:
          "Menyelaraskan meridian Limpa, Hati, dan Ginjal, membuang kelembapan, melancarkan sirkulasi darah, dan menenangkan Shen.",
        teknikPijat:
          "Tekan dengan ibu jari menggunakan tekanan mantap namun lembut, gerakan memutar. Hindari pijatan keras.",
        durasiDanPenekanan: "1-2 menit per titik. PERHATIAN: Kontraindikasi untuk ibu hamil.",
        manfaatUtama: "Titik pertemuan 3 meridian Yin kaki yang sangat efektif untuk keluhan kelembapan dan hormonal.",
      },
      {
        namaTitik: "Taichong (LR-3 / 太冲)",
        lokasiAnatomi:
          "Di punggung kaki, pada cekungan antara pangkal tulang metatarsal ibu jari kaki dan jari telunjuk kaki.",
        indikasiTerapi:
          "Mengurai stagnasi Qi Hati akibat stres, meredakan ketegangan otot leher dan pundak, menstabilkan emosi.",
        teknikPijat:
          "Tekan dengan ujung jempol atau pensil tumpul ke arah sela jari, gerakan mendorong perlahan selama 1-2 menit.",
        durasiDanPenekanan: "1-2 menit per titik, lakukan saat merasa tegang atau stres.",
        manfaatUtama: "Titik pereda stres dan penenang Qi Hati yang paling sering digunakan.",
      },
      {
        namaTitik: "Neiguan (PC-6 / 内关)",
        lokasiAnatomi:
          "2 jari di atas lipatan pergelangan tangan bagian dalam, di antara dua tendon otot flexor.",
        indikasiTerapi:
          "Menenangkan dada dan pikiran (An Shen), meredakan mual, asam lambung naik, kecemasan, dan palpitasi jantung.",
        teknikPijat:
          "Tekan dengan ibu jari tegak lurus, tahan 5-10 detik, lepas, ulangi selama 1-2 menit.",
        durasiDanPenekanan: "1-2 menit, dapat dilakukan kapan saja terutama saat mual atau cemas.",
        manfaatUtama: "Titik ketenangan pikiran dan mual yang efektif untuk akupresur mandiri.",
      },
    ],
    titikAkupunktur: [
      {
        namaTitik: "Zusanli (ST-36 / 足三里)",
        meridian: "Meridian Lambung Foot-Yangming",
        lokasiAnatomi:
          "4 jari di bawah tempurung lutut (patella), 1 jari di sisi luar tulang tibia.",
        indikasiTerapi:
          "Menguatkan Qi Limpa & Lambung, mereharmonisasi pencernaan, meningkatkan daya tahan tubuh (Wei Qi).",
        metodeStimulasi:
          "Penusukan jarum steril tegak lurus 1-1.5 cun dengan teknik tonifikasi (Bu Fa) / pemijatan hangat 2-3 menit.",
      },
      {
        namaTitik: "Sanyinjiao (SP-6 / 三阴交)",
        meridian: "Meridian Limpa Foot-Taiyin (Pertemuan 3 Meridian Yin kaki: Limpa, Hati, Ginjal)",
        lokasiAnatomi:
          "3 jari di atas puncak malleolus medialis (mata kaki dalam), tepat di belakang tepi tulang tibia.",
        indikasiTerapi:
          "Menyelaraskan metabolisme Limpa, Hati, Ginjal, mengurai kelembapan internal, dan menutrisi Darah.",
        metodeStimulasi:
          "Penusukan tegak lurus 1-1.5 cun / pemijatan lembut melingkar. (Kontraindikasi: Wanita hamil).",
      },
      {
        namaTitik: "Zhongwan (RN-12 / 中脘)",
        meridian: "Meridian Ren (Conception Vessel) - Titik Mu Depan Lambung",
        lokasiAnatomi:
          "Di garis tengah perut, pertengahan antara ujung prosesus xiphoideus (tulang dada) dan pusat (pusar).",
        indikasiTerapi:
          "Harmonisasi Lambung, meredakan kembung, mual, rasa begah, serta mengurai kelembapan perut.",
        metodeStimulasi:
          "Penusukan tegak lurus 0.8-1.2 cun / moksibusi hangat (Moxa) / penekanan telapak tangan hangat.",
      },
      {
        namaTitik: "Taichong (LR-3 / 太冲)",
        meridian: "Meridian Hati Foot-Jueyin - Titik Shu-Stream & Yuan-Source",
        lokasiAnatomi:
          "Di punggung kaki, pada cekungan antara tulang metatarsal I dan II (pangkal sela jempol dan telunjuk kaki).",
        indikasiTerapi:
          "Mengurai stagnasi Qi Hati akibat stres/emosi, meredakan ketegangan leher-bahu, dan menenangkan Shen.",
        metodeStimulasi:
          "Penusukan miring ke arah sela jari 0.5-1.0 cun dengan teknik sedasi (Xie Fa) / penekanan perlahan.",
      },
      {
        namaTitik: "Shenshu (BL-23 / 肾俞)",
        meridian: "Meridian Kandung Kemih Foot-Taiyang - Titik Back-Shu Ginjal",
        lokasiAnatomi:
          "Di punggung bawah (lumbal II), 1.5 cun (2 jari) di sisi luar garis tengah tulang belakang.",
        indikasiTerapi:
          "Menghangatkan Yang Ginjal, menguatkan pinggang & lutut, memulihkan energi esensial tubuh.",
        metodeStimulasi:
          "Penusukan tegak lurus 1.0-1.2 cun / moksibusi hangat (Moxa) untuk menghangatkan Yang.",
      },
      {
        namaTitik: "Neiguan (PC-6 / 内关)",
        meridian: "Meridian Perikardium Hand-Jueyin",
        lokasiAnatomi:
          "2 jari di atas lipatan pergelangan tangan bagian dalam, di antara dua tendon otot tangan.",
        indikasiTerapi:
          "Menenangkan dada dan pikiran, meredakan mual/asam lambung, mengatasi kecemasan dan palpitasi.",
        metodeStimulasi:
          "Penusukan tegak lurus 0.5-1.0 cun / pemijatan titik dengan ibu jari selama 2 menit.",
      },
    ],
    rekomendasiDietGayaHidup: {
      dietDianjurkan:
        "Santap makanan bersuhu hangat, sup kaldu rempah, bubur beras merah, rebusan jahe, labu kuning, ubi jalar, kayu manis, dan sayuran matang yang dimasak dengan bumbu penghangat.",
      dietDihindari:
        "Hindari minuman es/dingin, makanan mentah (raw salad), gorengan berminyak, santan kental berlebih, produk susu berlebih, dan makanan manis olahan yang memicu kelembapan (Dampness).",
      polaHidup:
        "Jaga jadwal tidur sebelum pukul 23:00 WIB untuk pemulihan meridian Hati dan Empedu. Hindari paparan AC langsung ke leher dan pinggang. Lakukan latihan napas dalam atau jalan santai di pagi hari.",
      titikAkupresur: [
        {
          titik: "Zusanli (ST-36)",
          lokasi: "4 jari di bawah tempurung lutut, 1 jari di sisi luar tulang kering.",
          manfaat:
            "Menguatkan Qi Limpa & Lambung, meningkatkan energi vital dan memperbaiki penyerapan nutrisi.",
          caraTekan:
            "Tekan memutar searah jarum jam selama 1-2 menit pada kedua kaki secara bergantian.",
        },
        {
          titik: "Sanyinjiao (SP-6)",
          lokasi: "3 jari di atas mata kaki bagian dalam, tepat di belakang tepi tulang kering.",
          manfaat:
            "Menyelaraskan meridian Limpa, Hati, dan Ginjal serta melancarkan pembuangan kelembapan.",
          caraTekan:
            "Pijat lembut dengan tekanan mantap selama 1-2 menit. (Perhatian: hindari jika sedang hamil).",
        },
        {
          titik: "Zhongwan (RN-12)",
          lokasi:
            "Di garis tengah perut, tepat di pertengahan antara ujung bawah tulang dada dan pusar.",
          manfaat: "Harmonisasi lambung, meredakan rasa begah, kembung, dan mual.",
          caraTekan:
            "Lakukan pijatan memutar lembut dengan telapak tangan hangat selama 2-3 menit.",
        },
        {
          titik: "Taichong (LR-3)",
          lokasi:
            "Di punggung kaki, pada cekungan antara pangkal jempol kaki dan jari telunjuk kaki.",
          manfaat:
            "Mengurai stagnasi Qi Hati, meredakan ketegangan otot leher/pundak, dan meredakan stres.",
          caraTekan: "Tekan perlahan dengan gerakan mendorong ke arah sela jari selama 1-2 menit.",
        },
      ],
    },
    herbalIndonesia: [
      {
        namaIndonesia: "Temulawak",
        namaLatin: "Curcuma xanthorrhiza",
        sifatRasa: "Hangat, Sedikit Pahit dan Manis",
        targetOrgan: "Limpa, Lambung, Hati",
        khasiatTcm:
          "Menguatkan energi pencernaan (Jian Pi), melancarkan produksi empedu, serta mengeringkan kelembapan internal.",
        caraPengolahan:
          "Iris tipis 15 gram rimpang temulawak segar, rebus dengan 2 gelas air hingga mendidih dan tersisa 1 gelas. Saring dan minum hangat.",
        anjuranKonsumsi: "Diminum 1 kali sehari sebelum makan.",
        catatanPeringatan:
          "Sangat baik untuk lambung yang kembung; kurangi dosis jika terjadi sensasi perih pada penderita maag akut.",
      },
      {
        namaIndonesia: "Jahe Merah",
        namaLatin: "Zingiber officinale var. rubrum",
        sifatRasa: "Panas / Hangat, Pedas Menyegarkan",
        targetOrgan: "Limpa, Lambung, Paru-paru",
        khasiatTcm:
          "Menghangatkan Yang tubuh (Wen Yang), mengusir patogen dingin (San Han), dan meredakan mual kembung.",
        caraPengolahan:
          "Memarkan 1 ruas jahe merah (10-15 gram), seduh dengan air mendidih 200 ml, tambahkan sedikit madu murni atau gula aren.",
        anjuranKonsumsi: "Diminum hangat 1 gelas di pagi hari atau sore hari saat cuaca dingin.",
        catatanPeringatan:
          "Hindari konsumsi malam hari jika merasa tenggorokan kering atau sariawan.",
      },
      {
        namaIndonesia: "Kunyit",
        namaLatin: "Curcuma longa",
        sifatRasa: "Hangat, Pedas dan Sedikit Pahit",
        targetOrgan: "Hati, Limpa",
        khasiatTcm:
          "Melancarkan sirkulasi Qi dan darah (Xing Qi Huo Xue), meredakan peradangan mukosa lambung, dan mengurai nyeri.",
        caraPengolahan:
          "Parut 2 ruas kunyit, peras dengan air hangat 100 ml, tambahkan 1 sendok teh madu alami.",
        anjuranKonsumsi: "Diminum 1 kali sehari setelah makan.",
        catatanPeringatan: "Aman untuk jangka panjang; sangat mendukung kesehatan lambung.",
      },
      {
        namaIndonesia: "Kayu Manis",
        namaLatin: "Cinnamomum verum / burmannii",
        sifatRasa: "Hangat / Panas, Manis dan Pedas",
        targetOrgan: "Ginjal, Limpa, Jantung",
        khasiatTcm:
          "Menghangatkan api gerbang vitalitas (Ming Men Huo), memperlancar jalur meridian, dan membantu stabilitas metabolisme.",
        caraPengolahan:
          "Seduh 1 batang kecil kayu manis ke dalam teh herbal atau rebusan jahe selama 5-10 menit.",
        anjuranKonsumsi: "Diminum 2-3 kali seminggu bersama ramuan hangat.",
        catatanPeringatan: "Gunakan secukupnya sebagai herbal pendukung penghangat.",
      },
      {
        namaIndonesia: "Daun Kelor",
        namaLatin: "Moringa oleifera",
        sifatRasa: "Sejuk-Netral, Manis",
        targetOrgan: "Hati, Limpa, Ginjal",
        khasiatTcm:
          "Menutrisi kekurangan Darah dan Esensi vital (Bu Xue Yi Jing), memasok mikronutrien alami.",
        caraPengolahan:
          "Seduh daun kelor kering sebagai teh herbal atau masak bening daun segar tanpa pemanasan berlebih.",
        anjuranKonsumsi: "1 cangkir teh kelor per hari.",
        catatanPeringatan: "Pilihan terbaik untuk memulihkan stamina pada pasien yang mudah lelah.",
      },
    ],
    herbalChina: [
      {
        namaPinyin: "Huang Qi (黄芪)",
        namaLatin: "Astragalus membranaceus (Astragalus Root)",
        sifatRasa: "Sedikit Hangat, Manis",
        masukMeridian: "Paru-paru (Fei), Limpa (Pi)",
        fungsiUtama:
          "Menambah Qi vital tubuh (Bu Zhong Yi Qi), mengangkat Yang yang turun (Sheng Yang), dan memperkuat Wei Qi (sistem imun).",
        indikasi:
          "Kelelahan kronis, nafas pendek saat aktivitas, keringat dingin, dan daya tahan tubuh rendah.",
        rekomendasiFormula:
          "Bisa direbus sebagai teh herbal (10-15g) atau diracik dalam formula klasik 'Bu Zhong Yi Qi Tang'.",
      },
      {
        namaPinyin: "Bai Zhu (白术)",
        namaLatin: "Atractylodes macrocephala",
        sifatRasa: "Hangat, Pahit dan Manis",
        masukMeridian: "Limpa (Pi), Lambung (Wei)",
        fungsiUtama:
          "Menguatkan fungsi pencernaan Limpa (Jian Pi), mengeringkan kelembapan tubuh (Zao Shi), dan melancarkan diuresis.",
        indikasi:
          "Perut kembung, feses lengket/lembek, rasa berat pada anggota gerak, nafsu makan turun.",
        rekomendasiFormula:
          "Komponen kunci dalam formula 'Si Jun Zi Tang' atau 'Shen Ling Bai Zhu San'.",
      },
      {
        namaPinyin: "Fu Ling (茯苓)",
        namaLatin: "Poria cocos (Poria Mushroom)",
        sifatRasa: "Netral, Manis dan Tawar",
        masukMeridian: "Jantung (Xin), Limpa (Pi), Ginjal (Shen)",
        fungsiUtama:
          "Membuang kelembapan berlebih melalui urin (Li Shi), menguatkan limpa, serta menenangkan Shen (pikiran).",
        indikasi:
          "Retensi cairan, sembab, tidur tidak nyenyak, gelisah disertai perut mudah kembung.",
        rekomendasiFormula:
          "Diramu bersama Bai Zhu dan Gan Cao dalam racikan sup herbal penyeimbang.",
      },
      {
        namaPinyin: "Gou Qi Zi (枸杞子)",
        namaLatin: "Lycium barbarum (Goji Berry)",
        sifatRasa: "Netral, Manis Alami",
        masukMeridian: "Hati (Gan), Ginjal (Shen), Paru-paru (Fei)",
        fungsiUtama:
          "Menutrisi Yin dan Darah Ginjal & Hati (Zi Bu Gan Shen), menajamkan penglihatan, dan menjaga kelembapan esensi.",
        indikasi:
          "Mata lelah akibat layar, pinggang pegal, kekeringan tubuh, dan pemulihan stamina.",
        rekomendasiFormula:
          "Seduh 10-15 butir goji berry dengan air panas, bisa dinikmati bersama bunga krisan (Ju Hua).",
      },
      {
        namaPinyin: "Chen Pi (陈皮)",
        namaLatin: "Citrus reticulata (Aged Tangerine Peel)",
        sifatRasa: "Hangat, Pedas dan Pahit",
        masukMeridian: "Limpa (Pi), Paru-paru (Fei)",
        fungsiUtama:
          "Mengatur sirkulasi Qi (Li Qi), mengeringkan kelembapan (Zao Shi), dan mengurai dahak (Hua Tan).",
        indikasi: "Rasa penuh di dada atau ulu hati, mual, tenggorokan berlendir, sendawa sering.",
        rekomendasiFormula:
          "Diramu dalam formula 'Er Chen Tang' atau diseduh bersama teh hitam/jahe.",
      },
      {
        namaPinyin: "Formula Klasik: Bu Zhong Yi Qi Wan / Xiao Yao San",
        namaLatin: "TCM Classical Herbal Formula Prescription",
        sifatRasa: "Harmonis, Menguatkan Qi dan Menyelaraskan Organ",
        masukMeridian: "Sistem Zang-Fu menyeluruh",
        fungsiUtama:
          "Mengatasi defisiensi energi pencernaan, melancarkan stagnasi emosi/Qi hati, dan mengembalikan vitalitas tubuh.",
        indikasi: "Kombinasi keluhan lelah menahun, perut kembung, dan stres emosional.",
        rekomendasiFormula:
          "Disarankan untuk berkonsultasi langsung dengan Sinshe / Terapis TCM kami di Rumah Terapy Ikhtiar Sehat untuk dosis presisi.",
      },
    ],
    faktorPencetus: [
      "Kebiasaan mengonsumsi minuman dingin / es dan makanan manis berlebih",
      "Stres emosional dan beban pikiran (overthinking) yang menghambat sirkulasi Qi",
      "Pola tidur kurang teratur atau sering tidur larut malam (> 23:00 WIB)",
      "Paparan suhu dingin pendingin ruangan (AC) secara terus-menerus",
      "Kurangnya aktivitas fisik aerobik ringan atau latihan pernapasan",
    ],
  };
}

/**
 * Calls Gemini AI or OpenRouter model to generate holistic TCM & Herbal analysis
 */
export async function generateOpenRouterTcmAnalysis(
  input: PatientScreeningInput,
): Promise<TcmAiAnalysisResponse> {
  const geminiApiKey = (process.env.GEMINI_API_KEY || "").trim();
  const openRouterApiKey = (process.env.OPENROUTER_API_KEY || "").trim();

  if (!geminiApiKey && !openRouterApiKey) {
    console.warn(
      "[TCM AI Engine] Neither GEMINI_API_KEY nor OPENROUTER_API_KEY found in environment. Using TCM knowledge engine fallback.",
    );
    return generateFallbackTcmAnalysis(input);
  }

  try {
    const patientName = input.patientProfile?.name || "Pasien";
    const patientAge = input.patientProfile?.age || 30;
    const patientGender = input.patientProfile?.gender || "Laki-laki";
    const patientComplaints =
      input.patientProfile?.complaints || "Tidak ada keluhan spesifik tertulis.";
    const hasTonguePhoto = Boolean(input.patientProfile?.tonguePhoto);
    const hospitalDocs = input.patientProfile?.hospitalDocs || [];
    const hospitalDocsSummary =
      hospitalDocs.length > 0
        ? hospitalDocs
            .map(
              (doc, i) =>
                `  ${i + 1}. [${doc.name || "Dokumen/Foto RS"}] ${doc.note ? `Keterangan/Catatan Pasien: "${doc.note}"` : "Terlampir hasil laboratorium / rekam medis rumah sakit"}`,
            )
            .join("\n")
        : "Tidak ada lampiran dokumen/foto rumah sakit tambahan.";

    let questionsList = "";
    if (input.questions && input.questions.length > 0) {
      questionsList = input.questions
        .map((q, idx) => {
          const ansVal = input.answers[q.id];
          if (ansVal === undefined || ansVal === null) return `${idx + 1}. [${q.id}] ${q.questionText} -> Jawaban Pasien: -(Belum diisi)-`;
          if (typeof ansVal === "number") {
            const labels = ["Tidak pernah (0 pt)", "Kadang (1 pt)", "Sering (2 pt)", "Selalu (3 pt)"];
            return `${idx + 1}. [${q.id}] ${q.questionText} -> Jawaban Pasien: ${labels[ansVal] || `${ansVal} pt`}`;
          }
          return `${idx + 1}. [${q.id}] ${q.questionText} -> Jawaban Pasien: "${ansVal}"`;
        })
        .join("\n");
    } else {
      questionsList = Object.entries(input.answers || {})
        .map(([k, v], idx) => `${idx + 1}. [${k}] -> Jawaban Pasien: "${v}"`)
        .join("\n");
    }

    const promptText = `
Anda adalah seorang Dokter / Sinshe Senior Konsultan Traditional Chinese Medicine (TCM) dan Herbalis Holistik Terakreditasi di klinik "Rumah Terapy Ikhtiar Sehat".
Tugas Anda adalah melakukan analisa mendalam terhadap hasil skrining mandiri kesehatan TCM pasien, lalu menghasilkan rekomendasi pengobatan komprehensif yang mencakup:
1. Herbal Tradisional Indonesia (Jamu / Fitofarmaka / Simplisia)
2. Herbal Tradisional China (TCM Single Herbs & Formula Klasik Zang-Fu)
3. Rekomendasi Titik Akupunktur & Meridian Terapi Utama (4-6 titik meridian akurat beserta lokasi anatomis, indikasi terapi, dan metode stimulasi penusukan/pijat)
4. Rekomendasi Titik Bekam (3-4 titik/area bekam beserta jenis kop, teknik, lokasi anatomis, indikasi TCM, durasi dan frekuensi) - KHUSUS TERAPIS
5. Rekomendasi Titik Pijat Terapi (3-4 titik pijat meridian beserta lokasi, teknik pijat, durasi, dan manfaat utama) - KHUSUS TERAPIS
6. Kesimpulan Analisa Holistik (Status Vitalitas, Root Cause, Qi & Blood, Psiko-Emosional, Wei Qi, Patogen, Prioritas Terapi)
7. Profil Ketidakseimbangan Dasar (Qi, Blood, Yin, Yang, Qi Stagnation, Blood Stasis, Dampness, Phlegm, Heat, Cold dalam persentase 0-100)
8. Profil Ketidakseimbangan Organ (Limpa, Ginjal, Hati, Jantung, Paru, Lambung, Kandung Empedu, Usus Besar, Usus Kecil, Kandung Kemih, San Jiao)
9. Rekomendasi Pola Hidup & Diet (Makanan dianjurkan, dihindari, gaya hidup, 3-4 titik akupresur mandiri)
10. Pola Ketidakseimbangan TCM (Sindrom kombinasi TCM beserta confidence match %)
11. Peringatan Prioritas Tinggi! (Jika ada ketidakseimbangan kritis atau red flag klinis)

DATA PASIEN & ANAMNESIS LANGKAH 2:
- Nama: ${patientName}
- Usia: ${patientAge} tahun
- Jenis Kelamin: ${patientGender}
- Tinggi Badan: ${input.patientProfile?.height || "-"} cm, Berat: ${input.patientProfile?.weight || "-"} kg
- Keluhan Utama & Keterangan Rinci Pasien (Langkah 2): "${patientComplaints}"
- Lampiran Foto/Video Lidah (Langkah 2): ${hasTonguePhoto ? "Pasien mengunggah foto/video sampel lidah untuk pengamatan Lidah (She Zhen)" : "Tidak ada foto lidah"}
- Lampiran Dokumen/Foto Rumah Sakit (Hasil Lab, Rekam Medis, Rujukan Dokter) (Langkah 2):
${hospitalDocsSummary}

DAFTAR JAWABAN KUESIONER SKRINING PASIEN (LANGKAH 1):
${questionsList || JSON.stringify(input.answers)}

BERIKAN OUTPUT DALAM FORMAT JSON PERSIS DENGAN STRUKTUR BERIKUT:
{
  "kesimpulanHolistik": {
    "statusVitalitas": "string (contoh: Kondisi Sangat Seimbang / Ketidakseimbangan Ringan-Sedang / Ketidakseimbangan Sangat Dominan)",
    "ringkasanAnalisa": "string (narasi komprehensif dan empatik mengenai kondisi fisik, metabolisme, dan akar masalah pasien)",
    "polaSindromUtama": "string (nama sindrom TCM utama, contoh: Defisiensi Yang Limpa-Ginjal disertai Lembap)",
    "manifestasiKeluhan": "string (ringkasan gejala fisik yang dilaporkan)",
    "kondisiPsikoEmosional": "string (analisa keterkaitan stres emosional terhadap sirkulasi Qi Hati/Shen)",
    "analisaWeiQiDanPatogen": "string (analisa energi pertahanan tubuh Wei Qi dan patogen luar Angin, Dingin, Lembap, Panas)",
    "prioritasTerapiUtama": "string (tujuan utama terapi dalam terminologi TCM, misal: Wen Shen Jian Pi, Hua Shi)"
  },
  "profilKetidakseimbanganDasar": [
    { "nama": "Kekurangan Energi (Qi)", "persentase": 65, "tingkat": "Sedang", "penjelasan": "string" },
    { "nama": "Kekurangan Darah (Blood)", "persentase": 40, "tingkat": "Rendah", "penjelasan": "string" },
    { "nama": "Kekurangan Yin", "persentase": 35, "tingkat": "Rendah", "penjelasan": "string" },
    { "nama": "Kekurangan Yang", "persentase": 70, "tingkat": "Tinggi", "penjelasan": "string" },
    { "nama": "Stagnasi Energi (Qi)", "persentase": 60, "tingkat": "Sedang", "penjelasan": "string" },
    { "nama": "Stasis Darah", "persentase": 30, "tingkat": "Rendah", "penjelasan": "string" },
    { "nama": "Kelembapan Berlebih (Dampness)", "persentase": 75, "tingkat": "Tinggi", "penjelasan": "string" },
    { "nama": "Dahak Internal (Phlegm)", "persentase": 50, "tingkat": "Sedang", "penjelasan": "string" },
    { "nama": "Panas Internal (Heat)", "persentase": 25, "tingkat": "Rendah", "penjelasan": "string" },
    { "nama": "Dingin Internal (Cold)", "persentase": 65, "tingkat": "Sedang", "penjelasan": "string" }
  ],
  "profilKetidakseimbanganOrgan": [
    { "organ": "Limpa (Spleen)", "persentase": 75, "status": "Prioritas Tinggi", "peranFungsi": "string" },
    { "organ": "Ginjal (Kidney)", "persentase": 70, "status": "Prioritas Tinggi", "peranFungsi": "string" },
    { "organ": "Hati (Liver)", "persentase": 60, "status": "Sedang", "peranFungsi": "string" },
    { "organ": "Lambung (Stomach)", "persentase": 55, "status": "Sedang", "peranFungsi": "string" },
    { "organ": "Paru-paru (Lung)", "persentase": 45, "status": "Sedang", "peranFungsi": "string" },
    { "organ": "Jantung (Heart)", "persentase": 40, "status": "Rendah-Sedang", "peranFungsi": "string" }
  ],
  "polaTcm": [
    {
      "namaSindrom": "string",
      "tipe": "string (Kombinasi / Zang-Fu)",
      "confidenceMatch": 85,
      "kataKunci": ["string", "string"],
      "deskripsi": "string"
    }
  ],
  "peringatanPrioritasTinggi": [
    "string peringatan klinis atau red flags (jika ada)"
  ],
  "titikAkupunktur": [
    {
      "namaTitik": "Zusanli (ST-36)",
      "meridian": "Meridian Lambung Foot-Yangming",
      "lokasiAnatomi": "4 jari di bawah tempurung lutut, 1 jari di luar tepi anterior tulang kering",
      "indikasiTerapi": "Menguatkan Limpa & Lambung, mereharmonisasi pencernaan, menyerap kelembapan",
      "metodeStimulasi": "Penusukan tegak lurus 1-1.5 cun / pemijatan hangat 2-3 menit"
    }
  ],
  "titikBekam": [
    {
      "namaTitik": "string nama titik / area bekam",
      "lokasiAnatomi": "string deskripsi lokasi anatomi yang tepat",
      "indikasiTerapi": "string manfaat dan tujuan bekam pada titik ini dalam terminologi TCM",
      "jenisKop": "string (Bekam Kering / Bekam Basah / Bekam Luncur / Bekam Api)",
      "teknikBekam": "string langkah-langkah teknik penerapan bekam",
      "durasiDanFrequensi": "string durasi per sesi dan frekuensi per minggu/bulan"
    }
  ],
  "titikPijat": [
    {
      "namaTitik": "string nama titik pijat / area pijat",
      "lokasiAnatomi": "string deskripsi lokasi yang tepat",
      "indikasiTerapi": "string manfaat pijatan dalam terminologi TCM",
      "teknikPijat": "string cara dan arah gerakan pijatan",
      "durasiDanPenekanan": "string durasi dan tingkat tekanan yang dianjurkan",
      "manfaatUtama": "string manfaat utama singkat"
    }
  ],
  "rekomendasiDietGayaHidup": {
    "dietDianjurkan": "string (daftar makanan hangat, sup, rempah bergizi)",
    "dietDihindari": "string (makanan dingin, berminyak, manis, mentah)",
    "polaHidup": "string (jadwal tidur, olahraga, manajemen stres)",
    "titikAkupresur": [
      {
        "titik": "Zusanli (ST-36)",
        "lokasi": "string",
        "manfaat": "string",
        "caraTekan": "string"
      }
    ]
  },
  "herbalIndonesia": [
    {
      "namaIndonesia": "Temulawak",
      "namaLatin": "Curcuma xanthorrhiza",
      "sifatRasa": "Hangat, Sedikit Pahit",
      "targetOrgan": "Limpa, Lambung, Hati",
      "khasiatTcm": "Menguatkan Limpa (Jian Pi) dan membuang lembap",
      "caraPengolahan": "string cara rebus/seduh",
      "anjuranKonsumsi": "string dosis dan waktu minum",
      "catatanPeringatan": "string catatan"
    }
  ],
  "herbalChina": [
    {
      "namaPinyin": "Huang Qi (黄芪)",
      "namaLatin": "Astragalus membranaceus",
      "sifatRasa": "Hangat, Manis",
      "masukMeridian": "Paru-paru, Limpa",
      "fungsiUtama": "Menambah Qi vital dan Wei Qi",
      "indikasi": "Kelelahan, lemas, keringat dingin",
      "rekomendasiFormula": "string formula atau cara racik"
    }
  ],
  "faktorPencetus": [
    "string faktor 1",
    "string faktor 2"
  ]
}

PASTIKAN SEMUA TEXT DALAM BAHASA INDONESIA YANG BAIK, JELAS, PROFESIONAL, EMPATIK, DAN MUDAH DIPAHAMI OLEH PASIEN MAUPUN PRAKTISI TCM.
`;

    if (geminiApiKey) {
      try {
        console.log("[TCM AI Engine] Generating TCM analysis using Gemini API...");
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptText,
          config: {
            systemInstruction:
              "Anda adalah pakar Traditional Chinese Medicine (TCM), Sinse, dan Herbalis Indonesia & China terkemuka. Selalu kembalikan respon dalam format JSON murni yang valid tanpa awalan/akhiran penjelasan.",
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawContent = response.text?.trim();
        if (rawContent) {
          let cleaned = rawContent;
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
          }
          const firstBrace = cleaned.indexOf("{");
          const lastBrace = cleaned.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleaned = cleaned.slice(firstBrace, lastBrace + 1);
          }
          const parsedData = JSON.parse(cleaned.trim()) as TcmAiAnalysisResponse;
          parsedData.isAiGenerated = true;
          console.log("[TCM AI Engine] Berhasil generate analisa TCM dengan Gemini API!");
          return parsedData;
        }
      } catch (geminiErr) {
        console.warn("[TCM AI Engine] Gemini API call error:", geminiErr);
      }
    }

    if (openRouterApiKey) {
      const candidateModels = [
        process.env.OPENROUTER_MODEL,
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "google/gemini-2.0-flash-001",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1:free",
        "openai/gpt-4o-mini",
      ].filter(Boolean) as string[];

      for (const modelToUse of candidateModels) {
        try {
          console.log(`[OpenRouter TCM] Mengirimkan request ke model: ${modelToUse}`);
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterApiKey}`,
              "HTTP-Referer": "https://rumahterapyikhtiarsehat.my.id",
              "X-Title": "Rumah Terapy Ikhtiar Sehat",
            },
            body: JSON.stringify({
              model: modelToUse,
              messages: [
                {
                  role: "system",
                  content:
                    "Anda adalah pakar Traditional Chinese Medicine (TCM), Sinse, dan Herbalis Indonesia & China terkemuka. Selalu kembalikan respon dalam format JSON murni yang valid tanpa awalan/akhiran penjelasan.",
                },
                {
                  role: "user",
                  content: promptText,
                },
              ],
              temperature: 0.3,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            console.warn(`[OpenRouter TCM] Model ${modelToUse} HTTP ${response.status}: ${errText}`);
            continue;
          }

          const resData = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawContent = resData?.choices?.[0]?.message?.content?.trim();

          if (!rawContent) {
            console.warn(`[OpenRouter TCM] Model ${modelToUse} mengembalikan respon kosong.`);
            continue;
          }

          let cleaned = rawContent;
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
          }
          const firstBrace = cleaned.indexOf("{");
          const lastBrace = cleaned.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleaned = cleaned.slice(firstBrace, lastBrace + 1);
          }
          cleaned = cleaned.trim();

          try {
            const parsedData = JSON.parse(cleaned) as TcmAiAnalysisResponse;
            parsedData.isAiGenerated = true;
            console.log(`[OpenRouter TCM] Berhasil generate analisa AI dengan model ${modelToUse}!`);
            return parsedData;
          } catch (parseErr) {
            console.warn(`[OpenRouter TCM] Gagal parse JSON dari model ${modelToUse}:`, parseErr);
          }
        } catch (reqErr) {
          console.warn(`[OpenRouter TCM] Error saat menghubungi model ${modelToUse}:`, reqErr);
        }
      }
    }

    console.warn("[TCM AI Engine] Semua model AI gagal, menggunakan fallback engine.");
    return generateFallbackTcmAnalysis(input);
  } catch (error) {
    console.error("[TCM AI Engine] Exception saat proses AI:", error);
    return generateFallbackTcmAnalysis(input);
  }
}

export const generateGeminiTcmAnalysis = generateOpenRouterTcmAnalysis;
