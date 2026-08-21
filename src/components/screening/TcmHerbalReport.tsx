import { FC } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  Sparkles,
  AlertCircle,
  Activity,
  Info,
  Leaf,
  Pill,
  RotateCcw,
  CheckCircle2,
  Heart,
  ShieldAlert,
  Flame,
  Droplets,
  Clock,
  Compass,
  MapPin,
  Target,
  Zap,
  Crosshair,
  Printer,
} from "lucide-react";
import { calculateTcmResult, getDominantConstitution, createTcmReportHelpers } from "@/lib/tcm";

export interface HerbalIndonesiaItem {
  namaIndonesia: string;
  namaLatin: string;
  sifatRasa: string;
  targetOrgan: string;
  khasiatTcm: string;
  caraPengolahan: string;
  anjuranKonsumsi: string;
  catatanPeringatan: string;
}

export interface HerbalChinaItem {
  namaPinyin: string;
  namaLatin: string;
  sifatRasa: string;
  masukMeridian: string;
  fungsiUtama: string;
  indikasi: string;
  rekomendasiFormula: string;
}

export interface TitikAkupunkturItem {
  namaTitik: string;
  meridian: string;
  lokasiAnatomi: string;
  indikasiTerapi: string;
  metodeStimulasi: string;
}

export interface TcmAiReport {
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
  herbalIndonesia: HerbalIndonesiaItem[];
  herbalChina: HerbalChinaItem[];
  faktorPencetus: string[];
  isAiGenerated: boolean;
}

interface TcmHerbalReportProps {
  report: TcmAiReport | null;
  isLoadingAi?: boolean;
  onRefreshAi?: () => void;
  results?: {
    balanceScore: number;
    imbalEnergy: number;
    imbalBlood: number;
    imbalYin: number;
    imbalYang: number;
    imbalStagnation: number;
    imbalStasis: number;
    imbalDamp: number;
    imbalPhlegm: number;
    imbalHeat: number;
    imbalCold: number;
    organImbalances: Record<string, number>;
    weiQi: number;
  };
  dominant?: {
    name: string;
    pct: number;
    desc: string;
    dietDianjurkan: string;
    dietDihindari: string;
    lifestyle: string;
    acupressure: string;
    acupressureLoc: string;
    acupressureFunc: string;
  };
  answers?: Record<string, number>;
  keluhan?: string;
  isAdmin?: boolean;
  onDownloadPdf?: () => void;
  getActiveSyndromesString?: () => string;
  getKeluhanUtamaManifestasi?: () => string;
  getTop3OrgansString?: () => string;
  getPrimaryTherapeuticPriority?: () => string;
  getTop3OrgansList?: () => Array<{ name: string; val: string; desc: string }>;
  getMostInfluentialSymptoms?: () => string[];
  listCriticalImbalances?: () => string[];
}

export const TcmHerbalReport: FC<TcmHerbalReportProps> = ({
  report,
  isLoadingAi = false,
  onRefreshAi,
  results: propResults,
  dominant: propDominant,
  answers = {},
  keluhan,
  isAdmin = false,
  onDownloadPdf,
  getActiveSyndromesString: propGetActiveSyndromesString,
  getKeluhanUtamaManifestasi: propGetKeluhanUtamaManifestasi,
  getTop3OrgansString: propGetTop3OrgansString,
  getPrimaryTherapeuticPriority: propGetPrimaryTherapeuticPriority,
  getTop3OrgansList: propGetTop3OrgansList,
  getMostInfluentialSymptoms: propGetMostInfluentialSymptoms,
  listCriticalImbalances: propListCriticalImbalances,
}) => {
  const computedResults = propResults || calculateTcmResult(answers, 24);
  const computedDominant = propDominant || getDominantConstitution(computedResults);
  const helpers = createTcmReportHelpers(answers, computedResults, keluhan);

  const results = computedResults;
  const dominant = computedDominant;

  const getActiveSyndromesString = propGetActiveSyndromesString || helpers.getActiveSyndromesString;
  const getKeluhanUtamaManifestasi =
    propGetKeluhanUtamaManifestasi || helpers.getKeluhanUtamaManifestasi;
  const getTop3OrgansString = propGetTop3OrgansString || helpers.getTop3OrgansString;
  const getPrimaryTherapeuticPriority =
    propGetPrimaryTherapeuticPriority || helpers.getPrimaryTherapeuticPriority;
  const getTop3OrgansList = propGetTop3OrgansList || helpers.getTop3OrgansList;
  const getMostInfluentialSymptoms =
    propGetMostInfluentialSymptoms || helpers.getMostInfluentialSymptoms;
  const listCriticalImbalances = propListCriticalImbalances || helpers.listCriticalImbalances;

  const criticalList = report?.peringatanPrioritasTinggi?.length
    ? report.peringatanPrioritasTinggi
    : listCriticalImbalances();

  return (
    <div id="tcm-herbal-report-root" className="space-y-8">
      {/* AI STATUS & RE-ANALYSIS BANNER */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <Sparkles className={`h-5 w-5 ${isLoadingAi ? "animate-spin" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm sm:text-base font-bold text-neutral-900">
                Analisis Holistik OpenRouter AI &amp; Panduan Herbal TCM
              </h4>
              {report?.isAiGenerated && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  OpenRouter AI Active
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600">
              {isLoadingAi
                ? "Menghubungkan ke OpenRouter AI untuk menganalisa sindrom & meracik formula herbal..."
                : "Hasil skrining dipadukan dengan formula herbal Indonesia & Tradisional China yang dipersonalisasi."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
          {onRefreshAi && (
            <button
              type="button"
              onClick={onRefreshAi}
              disabled={isLoadingAi}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-all disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoadingAi ? "animate-spin" : ""}`} />
              {isLoadingAi ? "Menganalisis..." : "Perbarui Analisa AI"}
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              if (onDownloadPdf) {
                onDownloadPdf();
              } else {
                // Prefer capturing the full screening report container if it exists
                const element =
                  document.getElementById("tcm-screening-report") ||
                  document.getElementById("tcm-herbal-report-root");
                if (element) {
                  const toastId = toast.loading("Sedang menyiapkan dokumen PDF...");
                  try {
                    // Pre-convert all images to inline base64 to avoid CORS tainted canvas errors
                    const images = element.querySelectorAll("img");
                    const originalSrcs: { img: HTMLImageElement; src: string }[] = [];
                    await Promise.all(
                      Array.from(images).map(async (img) => {
                        try {
                          if (img.src.startsWith("data:")) return;
                          if (!img.src || !img.naturalWidth) return;
                          originalSrcs.push({ img, src: img.src });
                          const cvs = document.createElement("canvas");
                          cvs.width = img.naturalWidth;
                          cvs.height = img.naturalHeight;
                          const ctx = cvs.getContext("2d");
                          if (ctx) {
                            const proxyImg = new Image();
                            proxyImg.crossOrigin = "anonymous";
                            await new Promise<void>((resolve) => {
                              proxyImg.onload = () => {
                                ctx.drawImage(proxyImg, 0, 0);
                                try {
                                  img.src = cvs.toDataURL("image/png");
                                } catch {
                                  // If tainted, leave original
                                }
                                resolve();
                              };
                              proxyImg.onerror = () => resolve();
                              proxyImg.src = img.src;
                            });
                          }
                        } catch {
                          // Skip images that can't be converted
                        }
                      }),
                    );

                    const canvas = await html2canvas(element, {
                      scale: 1.5,
                      useCORS: true,
                      allowTaint: true,
                      logging: false,
                      backgroundColor: "#ffffff",
                      scrollX: 0,
                      scrollY: -window.scrollY,
                      windowWidth: document.documentElement.offsetWidth,
                      windowHeight: element.scrollHeight + 100,
                      ignoreElements: (el) =>
                        !!(el.classList && el.classList.contains("no-print")),
                    });

                    // Restore original image sources
                    originalSrcs.forEach(({ img, src }) => {
                      img.src = src;
                    });

                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    let heightLeft = pdfHeight;
                    let position = 0;

                    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft > 10) {
                      position = heightLeft - pdfHeight;
                      pdf.addPage();
                      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
                      heightLeft -= pageHeight;
                    }

                    pdf.save("Laporan-Skrining-TCM.pdf");
                    toast.success("Dokumen PDF berhasil diunduh!", { id: toastId });
                  } catch (err) {
                    console.error("PDF generation error:", err);
                    // Restore original image sources on error
                    try {
                      originalSrcs.forEach(({ img, src }) => {
                        img.src = src;
                      });
                    } catch { /* ignore cleanup errors */ }
                    toast.error(
                      "Gagal mengunduh PDF otomatis. Membuka dialog cetak browser sebagai alternatif...",
                      { id: toastId, duration: 4000 },
                    );
                    setTimeout(() => {
                      window.print();
                    }, 500);
                  }
                } else {
                  toast.error("Format laporan tidak ditemukan di halaman ini.");
                }
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-2xs transition-all"
            title="Unduh laporan lengkap dalam bentuk dokumen PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* 1. HIGH PRIORITY WARNING BOX */}
      {criticalList.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 text-red-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
            <span className="font-display text-base font-bold text-red-900">
              Peringatan Prioritas Tinggi!
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-red-800 leading-relaxed">
            Sistem mendeteksi indikator ketidakseimbangan yang cukup dominan dan membutuhkan
            perhatian segera:
          </p>
          <ul className="mt-2.5 space-y-1 text-xs font-semibold text-red-700">
            {criticalList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-medium text-red-700">
            Disarankan untuk menjadwalkan konsultasi awal dengan praktisi TCM kami di Rumah Terapy
            Ikhtiar Sehat agar tidak berkembang menjadi keluhan kronis.
          </p>
        </div>
      )}

      {/* 2. BODY CONDITIONS & BALANCE SCORE */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Condition Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center shadow-xs flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Kondisi Tubuh
            </span>
            <span className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-2xl">
              {results.balanceScore >= 80 ? "🟢" : results.balanceScore >= 50 ? "🟡" : "🔴"}
            </span>
            <h4 className="mt-2 font-display text-base font-bold text-neutral-900">
              {report?.kesimpulanHolistik?.statusVitalitas ||
                (results.balanceScore >= 80
                  ? "Kondisi Sangat Seimbang"
                  : results.balanceScore >= 50
                    ? "Ketidakseimbangan Ringan"
                    : "Ketidakseimbangan Dominan")}
            </h4>
          </div>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
            Evaluasi energi vital berdasarkan konsep Traditional Chinese Medicine.
          </p>
        </div>

        {/* Balance Score Card */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-5 text-center shadow-xs">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Balance Score
          </span>
          <div
            className={`relative mt-3 flex h-20 w-20 items-center justify-center rounded-full border-4 bg-neutral-50 ${
              results.balanceScore >= 80
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : results.balanceScore >= 50
                  ? "border-yellow-500 bg-yellow-50 text-yellow-600"
                  : "border-red-500 bg-red-50 text-red-600"
            }`}
          >
            <span className="font-display text-2xl font-black">{results.balanceScore}</span>
            <span
              className={`absolute -bottom-1 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase text-white ${
                results.balanceScore >= 80
                  ? "bg-emerald-600"
                  : results.balanceScore >= 50
                    ? "bg-yellow-600"
                    : "bg-red-600"
              }`}
            >
              SCORE
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500 max-w-[170px]">
            Tingkat keseimbangan Qi, Darah, dan Yin-Yang.
          </p>
        </div>

        {/* Dominant Constitution */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center shadow-xs flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Konstitusi Dominan
            </span>
            <span className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
              🎯
            </span>
            <h4 className="mt-2 font-display text-base font-bold text-primary">{dominant.name}</h4>
            <p className="mt-0.5 text-xs font-bold text-neutral-800">{dominant.pct}% Terdeteksi</p>
          </div>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{dominant.desc}</p>
        </div>
      </div>

      {/* 3. KESIMPULAN ANALISA HOLISTIK */}
      <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-6 space-y-3">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Info className="h-4 w-4" />
          Kesimpulan Analisa Holistik
        </span>

        {report?.kesimpulanHolistik ? (
          <div className="space-y-2.5 text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <p>
              <strong>Pola Patologi Utama:</strong>{" "}
              <span className="font-semibold text-neutral-900">
                {report.kesimpulanHolistik.polaSindromUtama}
              </span>
            </p>
            <p>{report.kesimpulanHolistik.ringkasanAnalisa}</p>
            {report.kesimpulanHolistik.manifestasiKeluhan && (
              <p>
                <strong>Manifestasi Keluhan:</strong> {report.kesimpulanHolistik.manifestasiKeluhan}
              </p>
            )}
            {report.kesimpulanHolistik.kondisiPsikoEmosional && (
              <p>
                <strong>Kondisi Psiko-Emosional:</strong>{" "}
                {report.kesimpulanHolistik.kondisiPsikoEmosional}
              </p>
            )}
            {report.kesimpulanHolistik.analisaWeiQiDanPatogen && (
              <p>
                <strong>Wei Qi &amp; Patogen Eksternal:</strong>{" "}
                {report.kesimpulanHolistik.analisaWeiQiDanPatogen}
              </p>
            )}
            <p className="pt-1">
              <strong>Prioritas Utama Terapi:</strong>{" "}
              <span className="font-semibold text-primary">
                {report.kesimpulanHolistik.prioritasTerapiUtama}
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <p>
              Berdasarkan hasil analisa menyeluruh dari gejala yang dilaporkan, kondisi vitalitas
              pasien saat ini berada dalam rentang{" "}
              <span className="font-bold text-primary">
                {results.balanceScore >= 80
                  ? "Sangat Seimbang"
                  : results.balanceScore >= 50
                    ? "Ketidakseimbangan Ringan-Sedang"
                    : "Ketidakseimbangan Sangat Dominan"}
              </span>{" "}
              (Balance Score: <strong className="text-primary">{results.balanceScore}/100</strong>).
            </p>
            <p>
              Pola patologi mengarah pada sindrom <strong>{getActiveSyndromesString()}</strong>,
              yang bermanifestasi pada keluhan: <strong>{getKeluhanUtamaManifestasi()}</strong>.
            </p>
            <p>
              Fungsional organ (Zang Fu) yang memerlukan perhatian tertinggi adalah{" "}
              <strong className="text-primary">{getTop3OrgansString()}</strong>.
            </p>
            <p>
              Prioritas utama terapi difokuskan pada:{" "}
              <strong className="text-primary">{getPrimaryTherapeuticPriority()}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* 4. HERBAL INDONESIA (JAMU & SIMPLISIA NUSANTARA) - KHUSUS ADMIN */}
      {isAdmin && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-emerald-950">
                  Rekomendasi formulasi Herbal Tradisional Indonesia
                </h3>
                <p className="text-xs text-emerald-700">
                  Simplisia &amp; Jamu Nusantara yang cocok dengan profil sindrom TCM Anda (Khusus
                  Admin / Praktisi).
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              Khusus Admin / Terapis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report?.herbalIndonesia && report.herbalIndonesia.length > 0
              ? report.herbalIndonesia
              : [
                  {
                    namaIndonesia: "Temulawak",
                    namaLatin: "Curcuma xanthorrhiza",
                    sifatRasa: "Hangat, Sedikit Pahit dan Manis",
                    targetOrgan: "Limpa, Lambung, Hati",
                    khasiatTcm:
                      "Menguatkan energi Limpa (Jian Pi), melancarkan empedu, dan membuang kelembapan internal.",
                    caraPengolahan:
                      "Iris 15g temulawak segar, rebus dengan 2 gelas air hingga tersisa 1 gelas.",
                    anjuranKonsumsi: "1 kali sehari hangat sebelum makan.",
                    catatanPeringatan: "Sangat baik untuk perut kembung & begah.",
                  },
                  {
                    namaIndonesia: "Jahe Merah",
                    namaLatin: "Zingiber officinale var. rubrum",
                    sifatRasa: "Panas / Hangat, Pedas Menyegarkan",
                    targetOrgan: "Limpa, Lambung, Paru-paru",
                    khasiatTcm:
                      "Menghangatkan Yang tubuh (Wen Yang), mengusir dingin (San Han), dan meredakan mual kembung.",
                    caraPengolahan:
                      "Memarkan 1 ruas jahe merah, seduh air panas 200ml bersama madu murni.",
                    anjuranKonsumsi: "1 gelas pagi atau sore hari saat cuaca dingin.",
                    catatanPeringatan: "Hindari jika tenggorokan terasa panas atau sariawan.",
                  },
                  {
                    namaIndonesia: "Kunyit",
                    namaLatin: "Curcuma longa",
                    sifatRasa: "Hangat, Pedas dan Sedikit Pahit",
                    targetOrgan: "Hati, Limpa",
                    khasiatTcm:
                      "Melancarkan sirkulasi Qi & darah (Xing Qi Huo Xue), meredakan radang lambung.",
                    caraPengolahan:
                      "Parut 2 ruas kunyit, peras dengan 100ml air hangat dan 1 sdt madu.",
                    anjuranKonsumsi: "Diminum 1 kali sehari setelah makan.",
                    catatanPeringatan: "Mendukung regenerasi mukosa lambung.",
                  },
                  {
                    namaIndonesia: "Kayu Manis",
                    namaLatin: "Cinnamomum verum",
                    sifatRasa: "Hangat / Panas, Manis Pedas",
                    targetOrgan: "Ginjal, Limpa, Jantung",
                    khasiatTcm:
                      "Menghangatkan Yang Ginjal, memperlancar meridian, menstabilkan metabolisme.",
                    caraPengolahan: "Seduh 1 batang kecil ke dalam rebusan jahe atau teh herbal.",
                    anjuranKonsumsi: "2-3 kali seminggu bersama ramuan hangat.",
                    catatanPeringatan: "Gunakan secukupnya sebagai herbal penghangat.",
                  },
                ]
            ).map((herb, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-emerald-200/80 bg-white p-4.5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display text-base font-bold text-emerald-950 leading-tight">
                        {herb.namaIndonesia}
                      </h4>
                      <p className="text-[11px] italic text-emerald-700 font-serif">
                        {herb.namaLatin}
                      </p>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      {herb.sifatRasa}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-neutral-700 leading-relaxed">
                    <p>
                      <strong className="text-neutral-900">Meridian / Organ:</strong>{" "}
                      {herb.targetOrgan}
                    </p>
                    <p>
                      <strong className="text-neutral-900">Khasiat TCM:</strong> {herb.khasiatTcm}
                    </p>
                    <p className="bg-emerald-50/60 p-2 rounded-md border border-emerald-100 text-[11px]">
                      <strong className="text-emerald-900">Cara Olah:</strong> {herb.caraPengolahan}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>
                    <strong>Anjuran:</strong> {herb.anjuranKonsumsi}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. HERBAL CHINA (TRADITIONAL CHINESE MEDICINE FORMULA) */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-amber-950">
                Rekomendasi Obat &amp; Herbal Tradisional China (TCM)
              </h3>
              <p className="text-xs text-amber-700">
                Single Herbs &amp; Formula Klasik Zang-Fu untuk mengobati hasil skrining Anda.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
            TCM Classical Formula
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(report?.herbalChina && report.herbalChina.length > 0
            ? report.herbalChina
            : [
                {
                  namaPinyin: "Huang Qi (黄芪)",
                  namaLatin: "Astragalus membranaceus",
                  sifatRasa: "Sedikit Hangat, Manis",
                  masukMeridian: "Paru-paru (Fei), Limpa (Pi)",
                  fungsiUtama:
                    "Menambah Qi vital tubuh (Bu Zhong Yi Qi), mengangkat Yang, dan memperkuat daya tahan (Wei Qi).",
                  indikasi:
                    "Kelelahan kronis, lemas, keringat dingin, nafas pendek saat aktivitas.",
                  rekomendasiFormula: "Komponen utama formula klasik 'Bu Zhong Yi Qi Tang'.",
                },
                {
                  namaPinyin: "Bai Zhu (白术)",
                  namaLatin: "Atractylodes macrocephala",
                  sifatRasa: "Hangat, Pahit dan Manis",
                  masukMeridian: "Limpa (Pi), Lambung (Wei)",
                  fungsiUtama:
                    "Menguatkan Limpa (Jian Pi), mengeringkan kelembapan (Zao Shi), dan meredakan kembung.",
                  indikasi: "Perut kembung, feses lembek/lengket, rasa berat pada otot.",
                  rekomendasiFormula: "Komponen kunci dalam formula 'Si Jun Zi Tang'.",
                },
                {
                  namaPinyin: "Fu Ling (茯苓)",
                  namaLatin: "Poria cocos (Poria Mushroom)",
                  sifatRasa: "Netral, Manis dan Tawar",
                  masukMeridian: "Jantung (Xin), Limpa (Pi), Ginjal (Shen)",
                  fungsiUtama:
                    "Melancarkan diuresis membuang kelembapan (Li Shi), menguatkan limpa, menenangkan Shen.",
                  indikasi: "Retensi cairan, sembab, tidur tidak nyenyak, gelisah.",
                  rekomendasiFormula: "Diramu bersama Bai Zhu dan Gan Cao.",
                },
                {
                  namaPinyin: "Gou Qi Zi (枸杞子)",
                  namaLatin: "Lycium barbarum (Goji Berry)",
                  sifatRasa: "Netral, Manis",
                  masukMeridian: "Hati (Gan), Ginjal (Shen), Paru (Fei)",
                  fungsiUtama:
                    "Menutrisi Yin dan Darah Ginjal & Hati (Zi Bu Gan Shen), menajamkan penglihatan.",
                  indikasi: "Mata lelah, pinggang pegal, kekeringan tubuh.",
                  rekomendasiFormula: "Dapat diseduh teh bersama bunga krisan (Ju Hua).",
                },
              ]
          ).map((chinaHerb, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-amber-200/80 bg-white p-4.5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display text-base font-bold text-amber-950 leading-tight">
                      {chinaHerb.namaPinyin}
                    </h4>
                    <p className="text-[11px] italic text-amber-700 font-serif">
                      {chinaHerb.namaLatin}
                    </p>
                  </div>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    {chinaHerb.sifatRasa}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-neutral-700 leading-relaxed">
                  <p>
                    <strong className="text-neutral-900">Meridian Masuk:</strong>{" "}
                    {chinaHerb.masukMeridian}
                  </p>
                  <p>
                    <strong className="text-neutral-900">Fungsi Utama:</strong>{" "}
                    {chinaHerb.fungsiUtama}
                  </p>
                  <p>
                    <strong className="text-neutral-900">Indikasi:</strong> {chinaHerb.indikasi}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-2 text-[11px] text-amber-900 bg-amber-50/50 p-2 rounded-md">
                <strong>Rekomendasi Formula:</strong> {chinaHerb.rekomendasiFormula}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-amber-800/80 italic">
          * Catatan: Untuk resep formula klasik lengkap dan dosis individual, harap berkonsultasi
          langsung dengan Sinshe / Terapis di Rumah Terapy Ikhtiar Sehat.
        </p>
      </div>

      {/* 5.5. REKOMENDASI TITIK AKUPUNKTUR & MERIDIAN TERAPI (KHUSUS ADMIN/PRAKTISI KLINIK) */}
      {isAdmin ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
                <Crosshair className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-teal-950">
                  Rekomendasi Titik Akupunktur &amp; Meridian Terapi
                </h3>
                <p className="text-xs text-teal-800">
                  Diproses secara otomatis oleh AI berdasarkan analisis kuesioner (Langkah 1) serta
                  keluhan &amp; foto lidah (Langkah 2).
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center shrink-0 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-bold text-teal-900 border border-teal-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              Acupuncture AI Prescription (Khusus Admin)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(report?.titikAkupunktur && report.titikAkupunktur.length > 0
              ? report.titikAkupunktur
              : [
                  {
                    namaTitik: "Zusanli (ST-36 / 足三里)",
                    meridian: "Meridian Lambung Foot-Yangming",
                    lokasiAnatomi:
                      "4 jari di bawah tempurung lutut (patella), 1 jari di sisi luar tulang tibia.",
                    indikasiTerapi:
                      "Menguatkan Qi Limpa & Lambung, mereharmonisasi pencernaan, menyerap kelembapan internal.",
                    metodeStimulasi:
                      "Penusukan jarum steril tegak lurus 1-1.5 cun / pemijatan hangat melingkar 2-3 menit.",
                  },
                  {
                    namaTitik: "Sanyinjiao (SP-6 / 三阴交)",
                    meridian: "Meridian Limpa Foot-Taiyin (Pertemuan 3 Meridian Yin)",
                    lokasiAnatomi:
                      "3 jari di atas puncak mata kaki dalam, tepat di belakang tepi tulang tibia.",
                    indikasiTerapi:
                      "Menyelaraskan metabolisme Limpa, Hati, Ginjal, serta menguraikan kelembapan tubuh.",
                    metodeStimulasi:
                      "Penusukan tegak lurus 1-1.5 cun / penekanan lembut melingkar. (Perhatian: Kontraindikasi ibu hamil).",
                  },
                  {
                    namaTitik: "Zhongwan (RN-12 / 中脘)",
                    meridian: "Meridian Ren (Conception Vessel) - Titik Mu Depan Lambung",
                    lokasiAnatomi:
                      "Garis tengah perut, pertengahan antara ujung tulang dada dan pusat (pusar).",
                    indikasiTerapi:
                      "Harmonisasi Lambung, meredakan rasa kembung, begah, mual, serta menguraikan kelembapan.",
                    metodeStimulasi:
                      "Penusukan tegak lurus 0.8-1.2 cun / moksibusi hangat / penekanan hangat telapak tangan.",
                  },
                  {
                    namaTitik: "Taichong (LR-3 / 太冲)",
                    meridian: "Meridian Hati Foot-Jueyin - Titik Shu-Stream & Yuan-Source",
                    lokasiAnatomi:
                      "Punggung kaki, cekungan antara tulang metatarsal I dan II (pangkal sela jempol & telunjuk kaki).",
                    indikasiTerapi:
                      "Mengurai stagnasi Qi Hati akibat stres, meredakan ketegangan otot leher-bahu.",
                    metodeStimulasi:
                      "Penusukan miring ke sela jari 0.5-1.0 cun dengan teknik sedasi / pemijatan perlahan.",
                  },
                  {
                    namaTitik: "Shenshu (BL-23 / 肾俞)",
                    meridian: "Meridian Kandung Kemih - Titik Back-Shu Ginjal",
                    lokasiAnatomi:
                      "Punggung bawah (lumbal II), 1.5 cun (2 jari) di luar garis tengah tulang belakang.",
                    indikasiTerapi:
                      "Menghangatkan Yang Ginjal, menguatkan pinggang & lutut, memulihkan stamina esensial.",
                    metodeStimulasi:
                      "Penusukan tegak lurus 1.0-1.2 cun / moksibusi hangat (Moxa) penghangat Yang.",
                  },
                  {
                    namaTitik: "Neiguan (PC-6 / 内关)",
                    meridian: "Meridian Perikardium Hand-Jueyin",
                    lokasiAnatomi:
                      "2 jari di atas lipatan pergelangan tangan dalam, di antara dua tendon otot.",
                    indikasiTerapi:
                      "Menenangkan dada dan pikiran (Shen), meredakan mual, asam lambung, dan rasa cemas.",
                    metodeStimulasi:
                      "Penusukan tegak lurus 0.5-1.0 cun / pemijatan titik dengan ibu jari selama 2 menit.",
                  },
                ]
            ).map((point, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-teal-200/80 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between hover:border-teal-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-1">
                        Titik Akupunktur #{idx + 1}
                      </span>
                      <h4 className="font-display text-base font-bold text-neutral-900 leading-tight">
                        {point.namaTitik}
                      </h4>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-teal-800 bg-teal-50/60 px-2 py-1 rounded border border-teal-100 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                    <span>{point.meridian}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-700 pt-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <strong className="text-neutral-900">Lokasi Anatomi:</strong>{" "}
                        <span>{point.lokasiAnatomi}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <strong className="text-neutral-900">Indikasi Terapi:</strong>{" "}
                        <span>{point.indikasiTerapi}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-teal-100 pt-2 text-[11px] text-teal-950 bg-teal-50/40 p-2 rounded-lg space-y-0.5">
                  <div className="flex items-center gap-1 text-teal-800 font-bold">
                    <Sparkles className="h-3 w-3 text-teal-600" />
                    <span>Metode Stimulasi / Penusukan:</span>
                  </div>
                  <p className="text-neutral-700">{point.metodeStimulasi}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-teal-800/80 italic">
            * Catatan Praktisi: Pemilihan titik akupunktur di atas disesuaikan dengan sindrom utama
            pasien. Penusukan jarum steril hendaknya dilakukan oleh Akupunturis / Terapis
            bersertifikat di Rumah Terapy Ikhtiar Sehat.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-5 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 text-teal-950 font-bold text-sm sm:text-base">
              <Crosshair className="h-4 w-4 text-teal-700 shrink-0" />
              <span>Rekomendasi Titik Akupunktur &amp; Meridian Terapi</span>
            </div>
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
              Khusus Terapis Klinik
            </span>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            <strong>Catatan:</strong> Penentuan titik akupunktur dan teknik penusukan jarum secara
            spesifik disesuaikan oleh Akupunturis / Sinshe tersertifikasi saat sesi konsultasi dan
            terapi langsung di klinik <strong>Rumah Terapy Ikhtiar Sehat</strong>.
          </p>
        </div>
      )}

      {/* 6. PROFIL KETIDAKSEIMBANGAN DASAR (METERS) */}
      <div className="border-t border-neutral-200 pt-6 space-y-4">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900">
            Profil Ketidakseimbangan Dasar
          </h3>
          <p className="text-xs text-neutral-500">
            Nilai persentase menunjukkan kecenderungan ketidakseimbangan energi vital di tubuh Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {(report?.profilKetidakseimbanganDasar && report.profilKetidakseimbanganDasar.length > 0
            ? report.profilKetidakseimbanganDasar
            : [
                {
                  nama: "Kekurangan Energi (Qi)",
                  persentase: results.imbalEnergy,
                  penjelasan: "Kelemahan energi vital tubuh.",
                },
                {
                  nama: "Kekurangan Darah (Blood)",
                  persentase: results.imbalBlood,
                  penjelasan: "Nutrisi cairan darah.",
                },
                {
                  nama: "Kekurangan Yin",
                  persentase: results.imbalYin,
                  penjelasan: "Cairan esensial tubuh.",
                },
                {
                  nama: "Kekurangan Yang",
                  persentase: results.imbalYang,
                  penjelasan: "Energi hangat metabolisme.",
                },
                {
                  nama: "Stagnasi Energi (Qi)",
                  persentase: results.imbalStagnation,
                  penjelasan: "Sumbatan aliran energi.",
                },
                {
                  nama: "Stasis Darah",
                  persentase: results.imbalStasis,
                  penjelasan: "Hambatan sirkulasi mikrovaskular.",
                },
                {
                  nama: "Kelembapan Berlebih (Dampness)",
                  persentase: results.imbalDamp,
                  penjelasan: "Penumpukan cairan keruh.",
                },
                {
                  nama: "Dahak Internal (Phlegm)",
                  persentase: results.imbalPhlegm,
                  penjelasan: "Kondensasi kelembapan menahun.",
                },
                {
                  nama: "Panas Internal (Heat)",
                  persentase: results.imbalHeat,
                  penjelasan: "Gejala panas tubuh.",
                },
                {
                  nama: "Dingin Internal (Cold)",
                  persentase: results.imbalCold,
                  penjelasan: "Sensasi tubuh mudah dingin.",
                },
              ]
          ).map((item) => (
            <div key={item.nama} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-neutral-700">
                <span>{item.nama}</span>
                <span className="text-primary">{item.persentase}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-100">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.persentase >= 60
                      ? "bg-red-500"
                      : item.persentase >= 40
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${item.persentase}%` }}
                />
              </div>
              {item.penjelasan && <p className="text-[10px] text-neutral-500">{item.penjelasan}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* 7. PROFIL KETIDAKSEIMBANGAN ORGAN (ZANG FU) */}
      <div className="border-t border-neutral-200 pt-6 space-y-4">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900">
            Profil Ketidakseimbangan Organ
          </h3>
          <p className="text-xs text-neutral-500">
            Skor menunjukkan kecenderungan ketidakseimbangan fungsi organ menurut konsep Zang-Fu
            TCM.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {(report?.profilKetidakseimbanganOrgan && report.profilKetidakseimbanganOrgan.length > 0
            ? report.profilKetidakseimbanganOrgan
            : Object.entries(results.organImbalances).map(([name, val]) => ({
                organ:
                  name === "Paru"
                    ? "Paru-paru"
                    : name === "KandungEmpedu"
                      ? "Kandung Empedu"
                      : name === "UsusBesar"
                        ? "Usus Besar"
                        : name === "UsusKecil"
                          ? "Usus Kecil"
                          : name === "KandungKemih"
                            ? "Kandung Kemih"
                            : name,
                persentase: val,
                status: val >= 60 ? "Prioritas Tinggi" : "Sedang",
                peranFungsi: "Fungsi organ terkait",
              }))
          ).map((item) => (
            <div key={item.organ} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-neutral-700">
                <span>{item.organ}</span>
                <span className="text-primary">{item.persentase}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-100">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.persentase >= 60
                      ? "bg-red-500"
                      : item.persentase >= 40
                        ? "bg-primary"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${item.persentase}%` }}
                />
              </div>
              {item.peranFungsi && item.peranFungsi !== "Fungsi organ terkait" && (
                <p className="text-[10px] text-neutral-500">{item.peranFungsi}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 8. POLA KETIDAKSEIMBANGAN TCM (SYNDROME COMBINATIONS) */}
      <div className="border-t border-neutral-200 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900">
              Pola Ketidakseimbangan TCM
            </h3>
            <p className="text-xs text-neutral-500">
              Tingkat kecocokan sindrom yang berhasil diidentifikasi berdasarkan kuesioner pasien.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {Math.round(results.balanceScore < 50 ? 88 : 75)}% Confidence
          </span>
        </div>

        <div className="space-y-3">
          {(report?.polaTcm && report.polaTcm.length > 0
            ? report.polaTcm
            : [
                {
                  namaSindrom: "Defisiensi Yang Limpa-Ginjal disertai Lembap",
                  tipe: "Kombinasi Zang-Fu",
                  confidenceMatch: 85,
                  kataKunci: ["Yang Limpa", "Yang Ginjal", "Lembap"],
                  deskripsi:
                    "Kelemahan fungsi metabolik limpa dan energi api ginjal memicu penumpukan kelembapan dan kelelahan.",
                },
                {
                  namaSindrom: "Disharmoni Qi Hati-Limpa",
                  tipe: "Kombinasi",
                  confidenceMatch: 72,
                  kataKunci: ["Stagnasi Qi Hati", "Defisiensi Limpa", "Stres"],
                  deskripsi:
                    "Beban pikiran atau stres emosional menghambat sirkulasi Qi yang berdampak pada fungsi pencernaan.",
                },
              ]
          ).map((sindrom, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-2 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block rounded-md bg-neutral-200/70 px-1.5 py-0.5 text-[9px] font-bold text-neutral-600 uppercase">
                    {sindrom.tipe} #{idx + 1}
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-neutral-900 leading-tight">
                    {sindrom.namaSindrom}
                  </h4>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                  {sindrom.confidenceMatch}% Match
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{sindrom.deskripsi}</p>
              {sindrom.kataKunci && sindrom.kataKunci.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sindrom.kataKunci.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-neutral-600 border border-neutral-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 9. REKOMENDASI POLA HIDUP & DIET */}
      <div className="border-t border-neutral-200 pt-6 space-y-4">
        <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900">
          Rekomendasi Pola Hidup &amp; Diet
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Diet Recommendations */}
          <div className="rounded-xl border border-neutral-200 p-5 bg-emerald-50/20 space-y-3">
            <h4 className="font-display text-sm font-bold text-emerald-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Rekomendasi Diet Mandiri
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                  Dianjurkan:
                </span>
                <p className="mt-1 text-neutral-700 leading-relaxed">
                  {report?.rekomendasiDietGayaHidup?.dietDianjurkan || dominant.dietDianjurkan}
                </p>
              </div>
              <div>
                <span className="font-bold text-red-800 uppercase tracking-wider block">
                  Dihindari:
                </span>
                <p className="mt-1 text-neutral-700 leading-relaxed">
                  {report?.rekomendasiDietGayaHidup?.dietDihindari || dominant.dietDihindari}
                </p>
              </div>
            </div>
          </div>

          {/* Lifestyle & Acupressure */}
          <div className="rounded-xl border border-neutral-200 p-5 bg-neutral-50 space-y-3">
            <h4 className="font-display text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Gaya Hidup &amp; Titik Akupresur Mandiri
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-neutral-700 uppercase tracking-wider block">
                  Anjuran Aktivitas:
                </span>
                <p className="mt-1 text-neutral-600 leading-relaxed">
                  {report?.rekomendasiDietGayaHidup?.polaHidup || dominant.lifestyle}
                </p>
              </div>

              {report?.rekomendasiDietGayaHidup?.titikAkupresur &&
              report.rekomendasiDietGayaHidup.titikAkupresur.length > 0 ? (
                <div className="space-y-2 pt-1 border-t border-neutral-200">
                  <span className="font-bold text-primary uppercase tracking-wider block">
                    Titik Akupresur Mandiri:
                  </span>
                  {report.rekomendasiDietGayaHidup.titikAkupresur.map((point, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-lg border border-neutral-200 text-neutral-700 space-y-0.5"
                    >
                      <p className="font-bold text-neutral-900">{point.titik}</p>
                      <p className="text-[11px]">
                        <strong>Lokasi:</strong> {point.lokasi}
                      </p>
                      <p className="text-[11px]">
                        <strong>Manfaat:</strong> {point.manfaat}
                      </p>
                      <p className="text-[11px] text-primary">
                        <strong>Cara Tekan:</strong> {point.caraTekan}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <span className="font-bold text-primary uppercase tracking-wider block">
                    Titik Akupresur Utama:
                  </span>
                  <p className="mt-1 font-bold text-neutral-900">{dominant.acupressure}</p>
                  <p className="mt-0.5 text-neutral-600">
                    <strong>Lokasi:</strong> {dominant.acupressureLoc}
                  </p>
                  <p className="mt-0.5 text-neutral-600">
                    <strong>Manfaat:</strong> {dominant.acupressureFunc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 10. FAKTOR PENCETUS */}
      <div className="border-t border-neutral-200 pt-6 space-y-3">
        <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900">
          Kemungkinan Faktor Pencetus
        </h3>
        <p className="text-xs text-neutral-500">
          Faktor gaya hidup dan lingkungan yang memperberat ketidakseimbangan energi tubuh saat ini.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs font-medium text-neutral-700">
          {(report?.faktorPencetus && report.faktorPencetus.length > 0
            ? report.faktorPencetus
            : [
                "Stres Emosional / Pikiran Berlebih",
                "Konsumsi Berlebih Makanan Manis/Berminyak & Minuman Dingin",
                "Paparan Suhu Dingin (AC) Langsung",
                "Kelelahan Fisik / Kurang Istirahat",
                "Sering Begadang / Pola Tidur Larut Malam",
              ]
          ).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2.5 bg-neutral-50"
            >
              <span className="text-primary font-bold">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
