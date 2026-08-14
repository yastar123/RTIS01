import { useState, useEffect, FormEvent, useRef } from "react";
import { createFileRoute, Link } from "@/lib/route";
import { useAuth, authHeaders, useProfile } from "@/hooks/use-auth";
import { PageHeader } from "@/components/site/PageHeader";
import {
  Printer,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Heart,
  Scale,
  Activity,
  CheckCircle,
  FileText,
  Info,
  Sparkles,
  Phone,
  Calendar,
  Instagram,
  User,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/skrining")({
  head: () => ({
    meta: [
      { title: "Hasil & Skrining Mandiri TCM — Rumah Terapy Ikhtiar Sehat" },
      {
        name: "description",
        content:
          "Hasil kuesioner mandiri dan profiling holistik berbasis Traditional Chinese Medicine (TCM).",
      },
    ],
  }),
  component: Skrining,
});

interface ScreeningQuestion {
  id: string;
  questionText: string;
}

// 48 TCM Zang-Fu Syndromes described by the user
const tcmSyndromes = [
  {
    id: 1,
    title: "Defisiensi Yang Limpa-Ginjal disertai Lembap",
    keywords: ["Yang Limpa", "Yang Ginjal", "Lembap"],
    type: "Kombinasi",
  },
  {
    id: 2,
    title: "Disharmoni Qi Hati-Limpa disertai Lembap",
    keywords: ["Stagnasi Qi Hati", "Defisiensi Limpa", "Lembap"],
    type: "Kombinasi",
  },
  {
    id: 3,
    title: "Defisiensi Qi Paru-Limpa disertai Dahak",
    keywords: ["Defisiensi Qi Paru", "Defisiensi Qi Limpa", "Dahak"],
    type: "Kombinasi",
  },
  {
    id: 4,
    title: "Disharmoni Jantung dan Ginjal (Yin Defisiensi)",
    keywords: ["Defisiensi Yin Ginjal", "Api Jantung"],
    type: "Kombinasi",
  },
  {
    id: 5,
    title: "Stagnasi Qi Hati berubah menjadi Api",
    keywords: ["Stagnasi Qi Hati", "Api Hati", "Panas"],
    type: "Kombinasi",
  },
  {
    id: 6,
    title: "Defisiensi Darah Jantung dan Hati",
    keywords: ["Defisiensi Darah Jantung", "Defisiensi Darah Hati"],
    type: "Kombinasi",
  },
  {
    id: 7,
    title: "Lembap Dingin Menghambat Limpa",
    keywords: ["Lembap Dingin", "Limpa"],
    type: "Zang-Fu",
  },
  {
    id: 8,
    title: "Limpa Gagal Mengendalikan Darah",
    keywords: ["Qi Limpa", "Darah"],
    type: "Zang-Fu",
  },
  { id: 9, title: "Defisiensi Yin & Yang Ginjal", keywords: ["Yin Yang Ginjal"], type: "Zang-Fu" },
  { id: 10, title: "Retensi Makanan di Lambung", keywords: ["Retensi Makanan"], type: "Zang-Fu" },
  { id: 11, title: "Dingin di Lambung", keywords: ["Dingin Lambung"], type: "Zang-Fu" },
  { id: 12, title: "Defisiensi Yin Lambung", keywords: ["Yin Lambung"], type: "Zang-Fu" },
  { id: 13, title: "Qi Lambung Memberontak", keywords: ["Qi Lambung Naungan"], type: "Zang-Fu" },
  { id: 14, title: "Defisiensi Jing (Esensi) Ginjal", keywords: ["Jing Ginjal"], type: "Zang-Fu" },
  { id: 15, title: "Defisiensi Qi Ginjal", keywords: ["Qi Ginjal"], type: "Zang-Fu" },
  { id: 16, title: "Dingin di Usus Besar", keywords: ["Dingin", "Usus Besar"], type: "Zang-Fu" },
  {
    id: 17,
    title: "Kekeringan Usus Besar",
    keywords: ["Kekeringan", "Usus Besar"],
    type: "Zang-Fu",
  },
  { id: 18, title: "Defisiensi Qi Kandung Kemih", keywords: ["Qi Kandung Kemih"], type: "Zang-Fu" },
  {
    id: 19,
    title: "Defisiensi Yang Kandung Kemih",
    keywords: ["Yang Kandung Kemih"],
    type: "Zang-Fu",
  },
  {
    id: 20,
    title: "Gangguan Transformasi Cairan (San Jiao)",
    keywords: ["San Jiao Bawah"],
    type: "Zang-Fu",
  },
  {
    id: 21,
    title: "Gangguan Jalur Qi (San Jiao Atas)",
    keywords: ["San Jiao Atas"],
    type: "Zang-Fu",
  },
  {
    id: 22,
    title: "Dahak Menutupi Perikardium",
    keywords: ["Dahak", "Perikardium"],
    type: "Zang-Fu",
  },
  {
    id: 23,
    title: "Lembap Panas Menghambat Limpa",
    keywords: ["Lembap Panas", "Limpa"],
    type: "Zang-Fu",
  },
  { id: 24, title: "Lembap Panas di Lambung", keywords: ["Lembap Panas Lambung"], type: "Zang-Fu" },
  { id: 25, title: "Lembap Panas Kandung Kemih", keywords: ["Lembap Panas"], type: "Zang-Fu" },
  {
    id: 26,
    title: "Defisiensi Yin Hati dan Ginjal",
    keywords: ["Hati", "Ginjal"],
    type: "Zang-Fu",
  },
  { id: 27, title: "Hati Menyerang Lambung", keywords: ["Hati", "Lambung"], type: "Zang-Fu" },
  {
    id: 28,
    title: "Ketidakharmonisan Jantung dan Ginjal",
    keywords: ["Jantung", "Ginjal"],
    type: "Zang-Fu",
  },
  {
    id: 29,
    title: "Defisiensi Darah Jantung dan Limpa",
    keywords: ["Jantung", "Limpa"],
    type: "Zang-Fu",
  },
  { id: 30, title: "Panas di Usus Besar", keywords: ["Panas", "Usus Besar"], type: "Zang-Fu" },
  {
    id: 31,
    title: "Panas Menyerang Perikardium",
    keywords: ["Panas", "Perikardium"],
    type: "Zang-Fu",
  },
  {
    id: 32,
    title: "Dingin Menyerang Meridian Hati",
    keywords: ["Hati", "Dingin"],
    type: "Zang-Fu",
  },
  {
    id: 33,
    title: "Angin dan Dahak Menyumbat Meridian",
    keywords: ["Hati", "Angin"],
    type: "Zang-Fu",
  },
  {
    id: 34,
    title: "Dahak Lembap Menghambat Paru",
    keywords: ["Dahak Lembap", "Paru"],
    type: "Zang-Fu",
  },
  { id: 35, title: "Ginjal Gagal Menerima Qi", keywords: ["Qi Ginjal", "Paru"], type: "Zang-Fu" },
  {
    id: 36,
    title: "Defisiensi Yin Paru dan Ginjal",
    keywords: ["Paru", "Ginjal"],
    type: "Zang-Fu",
  },
  { id: 37, title: "Yang Hati Naik (Liver Yang Rising)", keywords: ["Yang Hati"], type: "Zang-Fu" },
  { id: 38, title: "Lembap Panas di Hati", keywords: ["Lembap Panas Hati"], type: "Zang-Fu" },
  { id: 39, title: "Defisiensi Qi Jantung", keywords: ["Qi Jantung"], type: "Zang-Fu" },
  { id: 40, title: "Dahak Mengaburkan Shen", keywords: ["Dahak", "Shen Jantung"], type: "Zang-Fu" },
  { id: 41, title: "Invasi Angin Dingin", keywords: ["Angin Dingin", "Paru"], type: "Zang-Fu" },
  { id: 42, title: "Kegagalan Paru Menurunkan Qi", keywords: ["Paru"], type: "Zang-Fu" },
  { id: 43, title: "Dahak Panas di Paru", keywords: ["Dahak Panas", "Paru"], type: "Zang-Fu" },
  {
    id: 44,
    title: "Dahak Menyumbat Jantung dan Paru",
    keywords: ["Jantung", "Paru"],
    type: "Zang-Fu",
  },
  { id: 45, title: "Api Jantung Membara", keywords: ["Api Jantung"], type: "Zang-Fu" },
  { id: 46, title: "Api Hati Mengganggu Paru", keywords: ["Hati", "Paru"], type: "Zang-Fu" },
  {
    id: 47,
    title: "Panas Jantung Turun ke Usus Kecil",
    keywords: ["Jantung", "Usus Kecil"],
    type: "Zang-Fu",
  },
  {
    id: 48,
    title: "Gangguan Pemisahan Jernih & Keruh",
    keywords: ["Usus Kecil", "Metabolisme"],
    type: "Zang-Fu",
  },
];

const defaultQuestions: ScreeningQuestion[] = [
  {
    id: "dq1",
    questionText: "Saya sering merasa lelah atau kehilangan energi meski sudah cukup tidur.",
  },
  { id: "dq2", questionText: "Saya sulit tidur atau sering terbangun di tengah malam." },
  { id: "dq3", questionText: "Saya sering merasa cemas, gelisah, atau sulit berkonsentrasi." },
  { id: "dq4", questionText: "Saya mengalami nyeri atau ketegangan otot secara berulang." },
  {
    id: "dq5",
    questionText: "Pencernaan saya tidak stabil (kembung, nyeri lambung, atau BAB tidak teratur).",
  },
  {
    id: "dq6",
    questionText:
      "Saya sering merasakan ketidakseimbangan emosi (mudah marah, sedih, atau murung).",
  },
  {
    id: "dq7",
    questionText: "Saya merasakan tubuh saya mudah dingin atau sebaliknya mudah panas.",
  },
  {
    id: "dq8",
    questionText:
      "Apakah pembengkakan (edema) merata dari bawah pusar hingga kaki namun pinggang pegal?",
  },
  {
    id: "dq9",
    questionText:
      "Apakah saat menelan ludah tenggorokan terasa tersumbat benda asing tak terlihat?",
  },
  { id: "dq10", questionText: "BAB saya terasa lengket, basah, atau sulit dibersihkan." },
];

function Skrining() {
  const { user } = useAuth();

  // Demographic profiling states
  const [nama, setNama] = useState(user?.name || "");
  const [usia, setUsia] = useState("15");
  const [kelamin, setKelamin] = useState<"L" | "P">("L");
  const [tinggi, setTinggi] = useState("178");
  const [berat, setBerat] = useState("48");
  const [keluhan, setKeluhan] = useState("Sering merasa letih, perut kembung, dan badan dingin.");

  // Image upload and capture states
  const [tonguePhoto, setTonguePhoto] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile query
  const { data: profile } = useProfile();

  // Questionnaire States
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"profile" | "questions" | "result">("profile");

  // Shared Screening and Broadcast States
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [isSavingScreening, setIsSavingScreening] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [whatsappSettings, setWhatsappSettings] = useState<{
    whatsappNumber: string;
    whatsappMessageTemplate: string;
  } | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/screening/questions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(defaultQuestions);
      }
    } catch {
      setQuestions(defaultQuestions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQuestions();
  }, []);

  // Fetch settings for WhatsApp broadcast
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setWhatsappSettings(data);
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  // Handle loading shared screening result on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUserId = params.get("userId");
    if (sharedUserId) {
      setIsViewingShared(true);
      setLoading(true);
      fetch(`/api/profile/${sharedUserId}/screening`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          if (data && data.screeningAnswers) {
            const parsed = JSON.parse(data.screeningAnswers);
            setNama(parsed.nama || data.fullName);
            setUsia(parsed.usia ? String(parsed.usia) : String(data.age));
            setKelamin(parsed.kelamin || (data.gender === "Laki-laki" ? "L" : "P"));
            setTinggi(parsed.tinggi ? String(parsed.tinggi) : String(data.height));
            setBerat(parsed.berat ? String(parsed.berat) : String(data.weight));
            setKeluhan(parsed.keluhan || data.address);
            setTonguePhoto(parsed.tonguePhoto || data.tonguePhotoUrl);
            setJawaban(parsed.answers || {});
            setRecipientPhone(data.phone || "");
            setStep("result");
            setSubmitted(true);
          }
        })
        .catch((err) => {
          console.error("Gagal memuat data skrining bersama:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Sync profile phone number
  useEffect(() => {
    if (profile?.phone && !recipientPhone && !isViewingShared) {
      setRecipientPhone(profile.phone);
    }
  }, [profile, recipientPhone, isViewingShared]);

  // Sync user name when user loads
  useEffect(() => {
    if (user?.name && !nama && !isViewingShared) {
      setNama(user.name);
    }
  }, [user, nama, isViewingShared]);

  // Handle webcam capture
  const startCamera = async () => {
    setShowCameraModal(true);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert(
        "Tidak dapat mengakses kamera. Pastikan izin kamera aktif atau gunakan opsi unggah galeri.",
      );
      setShowCameraModal(false);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setTonguePhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setShowCameraModal(false);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTonguePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // TCM Calculations Engine
  // Generates real percentages and reports based on client answers
  const calculateTcmResult = () => {
    const totalQuestions = questions.length || 1;
    const answeredCount = Object.keys(jawaban).length;

    // Map answer indices to calculate imbalance indices
    // Calculates average response weights
    let totalScoreSum = 0;
    Object.values(jawaban).forEach((v) => {
      totalScoreSum += v;
    });

    const maxPossibleScore = totalQuestions * 3;
    const answeredMaxScore = answeredCount * 3 || 1;
    const severityRatio = totalScoreSum / answeredMaxScore;

    // Calculate dynamic balance score (high severity = low balance)
    const balanceScore = Math.max(0, Math.min(100, Math.round(100 - severityRatio * 100)));

    // Calculate Basic Imbalance Percentages
    const calcBasicImbalance = (multiplier: number, offset: number) => {
      const val = Math.round(severityRatio * multiplier + offset);
      return Math.max(10, Math.min(100, val));
    };

    const imbalEnergy = calcBasicImbalance(80, 20); // Kekurangan Energi
    const imbalBlood = calcBasicImbalance(75, 25); // Kekurangan Darah
    const imbalYin = calcBasicImbalance(70, 30); // Kekurangan Yin
    const imbalYang = calcBasicImbalance(85, 15); // Kekurangan Yang
    const imbalStagnation = calcBasicImbalance(80, 20); // Stagnasi Energi
    const imbalStasis = calcBasicImbalance(75, 25); // Stasis Darah
    const imbalDamp = calcBasicImbalance(90, 10); // Kelembapan Berlebih
    const imbalPhlegm = calcBasicImbalance(85, 15); // Dahak Internal
    const imbalHeat = Math.max(10, Math.min(100, Math.round(severityRatio * 75 + 22))); // Panas Internal
    const imbalCold = calcBasicImbalance(80, 20); // Dingin Internal

    // Calculate Organ Imbalances
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

    // Calculate Wei Qi (Inversely related to lung deficiency & tiredness)
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
  };

  const results = calculateTcmResult();

  const handleNextStep = () => {
    if (step === "profile") {
      setStep("questions");
    }
  };

  const handleSubmitAll = async () => {
    setIsSavingScreening(true);
    try {
      await fetch("/api/profile/screening", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          fullName: nama,
          gender: kelamin === "L" ? "Laki-laki" : "Perempuan",
          age: parseInt(usia) || 25,
          height: parseInt(tinggi) || 165,
          weight: parseInt(berat) || 60,
          phone: user?.phone || "",
          address: keluhan, // address is used as keluhan/main complaint context if no other table exists
          tonguePhotoUrl: tonguePhoto,
          screeningAnswers: {
            answers: jawaban,
            keluhan,
            nama,
            usia,
            kelamin,
            tinggi,
            berat,
            tonguePhoto,
          },
        }),
      });
    } catch (err) {
      console.error("Error saving screening results:", err);
    } finally {
      setIsSavingScreening(false);
      setStep("result");
      setSubmitted(true);
    }
  };

  const listCriticalImbalances = () => {
    const list: string[] = [];
    if (results.imbalEnergy >= 60) list.push("Kekurangan Energi");
    if (results.imbalBlood >= 60) list.push("Kekurangan Darah");
    if (results.imbalYin >= 60) list.push("Kekurangan Yin");
    if (results.imbalYang >= 60) list.push("Kekurangan Yang");
    if (results.imbalStagnation >= 60) list.push("Stagnasi Energi");
    if (results.imbalStasis >= 60) list.push("Stasis Darah");
    if (results.imbalDamp >= 60) list.push("Kelembapan Berlebih");
    if (results.imbalPhlegm >= 60) list.push("Dahak Internal");
    if (results.imbalHeat >= 60) list.push("Panas Internal");
    if (results.imbalCold >= 60) list.push("Dingin Internal");

    // Organs
    Object.entries(results.organImbalances).forEach(([name, val]) => {
      if (val >= 60) {
        list.push(`Organ ${name === "Paru" ? "Paru-paru" : name}`);
      }
    });
    return list;
  };

  const triggerPrint = () => {
    window.print();
  };

  const getWhatsAppShareUrl = (phoneNum: string) => {
    if (!whatsappSettings) return "";
    let template =
      whatsappSettings.whatsappMessageTemplate ||
      "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat";

    const params = new URLSearchParams(window.location.search);
    const sharedUserId = params.get("userId") || user?.id || "";
    const reportUrl = `${window.location.origin}/skrining?userId=${sharedUserId}`;

    template = template.replace("[nama]", nama || "Pasien");
    template = template.replace("[link]", reportUrl);

    let cleaned = phoneNum.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }

    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(template)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800">
      {/* Dynamic Printing Media Styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          .print-break {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Header Bar with Logo and Navigation Items */}
      <header className="no-print sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logon.png"
              alt="Logo Rumah Terapy"
              className="h-10 w-auto rounded-lg bg-white p-0.5 border border-neutral-200"
            />
            <div className="hidden sm:block leading-tight">
              <span className="block font-display text-sm font-semibold tracking-tight text-neutral-900">
                Rumah Terapy
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-primary">
                Ikhtiar Sehat
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/#about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/reservasi" className="hover:text-primary transition-colors">
              Reservasi
            </Link>
            <Link to="/reservasi" className="hover:text-primary transition-colors">
              Cek Reservasi
            </Link>
            <Link to="/#articles" className="hover:text-primary transition-colors">
              Artikel
            </Link>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              TikTok <ExternalLink className="h-3 w-3" />
            </a>
            <Link to="/#contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {step === "result" && (
              <button
                onClick={triggerPrint}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak PDF
              </button>
            )}
            <Link
              to="/dashboard"
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Kembali Ke Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* STEP 1: DEMOGRAPHIC PATIENT PROFILE FORM */}
      {step === "profile" && (
        <main className="no-print mx-auto max-w-2xl px-4 py-8 sm:py-14">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Identifikasi Pasien
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Informasi Pengguna Baru
            </h1>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Sebelum memulai skrining soal TCM, silakan lengkapi data fisik dan keluhan utama Anda
              di bawah ini agar sistem dapat memformulasikan profiling yang akurat.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextStep();
              }}
              className="mt-8 space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="p_nama" className="block text-sm font-semibold text-neutral-700">
                    Nama Lengkap
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute top-3 left-3 h-4 w-4 text-neutral-400" />
                    <input
                      id="p_nama"
                      type="text"
                      required
                      placeholder="Masukkan nama Anda"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="p_usia"
                      className="block text-sm font-semibold text-neutral-700"
                    >
                      Usia (Tahun)
                    </label>
                    <input
                      id="p_usia"
                      type="number"
                      required
                      placeholder="Contoh: 15"
                      value={usia}
                      onChange={(e) => setUsia(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="p_gender"
                      className="block text-sm font-semibold text-neutral-700"
                    >
                      Kelamin
                    </label>
                    <select
                      id="p_gender"
                      value={kelamin}
                      onChange={(e) => setKelamin(e.target.value as "L" | "P")}
                      className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="p_tinggi"
                      className="block text-sm font-semibold text-neutral-700"
                    >
                      Tinggi (cm)
                    </label>
                    <input
                      id="p_tinggi"
                      type="number"
                      required
                      placeholder="Contoh: 178"
                      value={tinggi}
                      onChange={(e) => setTinggi(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="p_berat"
                      className="block text-sm font-semibold text-neutral-700"
                    >
                      Berat (kg)
                    </label>
                    <input
                      id="p_berat"
                      type="number"
                      required
                      placeholder="Contoh: 48"
                      value={berat}
                      onChange={(e) => setBerat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="p_keluhan"
                    className="block text-sm font-semibold text-neutral-700"
                  >
                    Keluhan Utama Pasien
                  </label>
                  <textarea
                    id="p_keluhan"
                    rows={3}
                    required
                    placeholder="Tuliskan keluhan yang Anda rasakan secara detail..."
                    value={keluhan}
                    onChange={(e) => setKeluhan(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-3 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Interactive Tongue Upload Section */}
                <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
                  <span className="block text-sm font-semibold text-neutral-800">
                    Foto Lidah Pasien
                  </span>
                  <span className="block text-xs text-neutral-500">
                    Dokumentasi kondisi lidah pasien untuk diagnosa visual TCM
                  </span>

                  {tonguePhoto ? (
                    <div className="mt-4 flex flex-col items-center gap-3">
                      <img
                        src={tonguePhoto}
                        alt="Foto Lidah"
                        className="h-32 w-32 rounded-lg border object-cover shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setTonguePhoto(null)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Hapus & Ganti Foto
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-xs text-neutral-600 italic">
                        Belum ada foto lidah. Upload sekarang?
                      </p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          <Camera className="h-3.5 w-3.5 text-neutral-500" />
                          Kamera (Webcam)
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-neutral-500" />
                          Unggah Galeri
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
              >
                Mulai Skrining Pertanyaan
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </main>
      )}

      {/* STEP 2: SCREENING QUESTIONS FORM */}
      {step === "questions" && (
        <main className="no-print mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setStep("profile")}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Form Profil
            </button>
            <span className="text-xs text-neutral-500 font-semibold">
              {Object.keys(jawaban).length} dari {questions.length} Soal Dijawab
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="font-display text-2xl font-bold text-neutral-900">
              Kuesioner Pendekatan Gejala TCM
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Jawablah pertanyaan-pertanyaan berikut berdasarkan kondisi tubuh yang Anda rasakan
              akhir-akhir ini.
            </p>

            {loading ? (
              <div className="py-12 text-center text-sm text-neutral-500">
                Memuat soal skrening...
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5 hover:border-neutral-200 transition-colors"
                  >
                    <p className="text-sm font-medium text-neutral-900 leading-relaxed">
                      {idx + 1}. {q.questionText}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      {[
                        ["Tidak pernah", 0],
                        ["Kadang", 1],
                        ["Sering", 2],
                        ["Selalu", 3],
                      ].map(([label, score]) => {
                        const isSelected = jawaban[q.id] === score;
                        return (
                          <button
                            key={label as string}
                            type="button"
                            onClick={() =>
                              setJawaban((prev) => ({ ...prev, [q.id]: score as number }))
                            }
                            className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-primary text-white shadow-xs"
                                : "border border-neutral-300 bg-white text-neutral-600 hover:border-primary hover:text-primary"
                            }`}
                          >
                            {label as string}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mt-10 flex items-center justify-between border-t pt-6">
                  <span className="text-xs text-neutral-500 italic">
                    *Semua pertanyaan wajib dijawab untuk hasil analisa terbaik
                  </span>
                  <button
                    type="button"
                    disabled={Object.keys(jawaban).length < questions.length}
                    onClick={handleSubmitAll}
                    className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Lihat Hasil Profiling TCM
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* STEP 3: HIGH-FIDELITY TCM PROFILING REPORT DISPLAY (PRINT READY) */}
      {(step === "result" || submitted) && (
        <main className="print-container mx-auto max-w-5xl px-4 py-8 sm:py-14">
          {/* WHATSAPP BROADCAST SECTION */}
          {whatsappSettings && (
            <div className="no-print mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-xs">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="font-display">Kirim Hasil Skrining via WhatsApp</span>
                  </div>
                  <p className="text-xs text-emerald-950/70">
                    Kirimkan link laporan resmi analisa holistik TCM ini secara instan ke nomor
                    WhatsApp pasien.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">
                      No. HP:
                    </span>
                    <input
                      type="text"
                      placeholder="Masukkan No. HP Pasien"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="rounded-full border border-neutral-300 bg-white pl-16 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-56"
                    />
                  </div>
                  <a
                    href={getWhatsAppShareUrl(recipientPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Kirim Hasil Ke WhatsApp
                  </a>
                </div>
              </div>

              <div className="mt-4 border-t border-emerald-100/50 pt-3">
                <details className="group">
                  <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-emerald-800 select-none group-open:mb-2">
                    <span className="underline decoration-dashed">
                      Lihat Preview Pesan Broadcast
                    </span>
                  </summary>
                  <div className="rounded-lg bg-white p-3 border border-emerald-100/40 text-xs text-neutral-700 font-mono whitespace-pre-wrap leading-relaxed shadow-xs">
                    {whatsappSettings.whatsappMessageTemplate
                      ?.replace("[nama]", nama || "Pasien")
                      ?.replace(
                        "[link]",
                        `${window.location.origin}/skrining?userId=${new URLSearchParams(window.location.search).get("userId") || user?.id || ""}`,
                      )}
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Main Card Report Wrap */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md sm:p-10">
            {/* BRAND LOGO BAR */}
            <div className="flex flex-col items-center justify-between border-b pb-8 sm:flex-row gap-6">
              <div className="flex items-center gap-4">
                <img
                  src="/logon.png"
                  alt="Logo Rumah Terapy"
                  className="h-20 w-auto rounded-xl border p-1"
                />
                <div>
                  <h1 className="font-display text-2xl font-black uppercase tracking-wider text-neutral-900 sm:text-3xl">
                    RUMAH TERAPY IKHTIAR SEHAT
                  </h1>
                  <h2 className="text-sm font-semibold tracking-widest uppercase text-primary">
                    Rumah Sehat Tradisional Chinese Medicine
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Jl. Dukuh Kupang Timur XVI No.81-85, Pakis, Kec. Sawahan, Surabaya, Jawa Timur
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Hubungi Kami
                </span>
                <span className="block text-sm font-bold text-neutral-800">HP: 0813 6972 9617</span>
                <span className="block text-xs text-neutral-500">Epiphany.id</span>
              </div>
            </div>

            {/* DOCUMENT TITLE TITLE */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                OFFICIAL REPORT
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                HASIL PROFILING TCM
              </h3>
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-500 mt-1">
                Pemetaan kecenderungan tubuh berbasis indikator gejala
              </p>
            </div>

            {/* DEMOGRAPHICS GRID */}
            <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6 sm:grid-cols-4">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Nama
                </span>
                <span className="mt-1 block font-display text-base font-bold text-neutral-900">
                  {nama || "Pasien Rumah Terapy"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Usia & Kelamin
                </span>
                <span className="mt-1 block font-display text-base font-bold text-neutral-900">
                  {usia} Th, {kelamin === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Fisik
                </span>
                <span className="mt-1 block font-display text-base font-bold text-neutral-900">
                  {tinggi} cm / {berat} kg
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Tanggal Analisa
                </span>
                <span className="mt-1 block font-display text-base font-bold text-neutral-900">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* REASON/COMPLAINT */}
            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Keluhan Utama Pasien
              </span>
              <p className="mt-1.5 text-sm font-medium text-neutral-800 leading-relaxed italic">
                "{keluhan || "Tidak ada keluhan tertulis"}"
              </p>
            </div>

            {/* TONGUE PHOTO DISPLAY */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Foto Lidah Pasien
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Dokumentasi kondisi permukaan lidah untuk diagnosa holistik
              </span>

              <div className="mt-4 flex flex-col items-center sm:flex-row gap-6">
                {tonguePhoto ? (
                  <div className="relative">
                    <img
                      src={tonguePhoto}
                      alt="Lidah Pasien"
                      className="h-32 w-32 rounded-lg border object-cover shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1 text-white shadow-md">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white text-center text-xs text-neutral-400">
                    Belum ada foto lidah.
                  </div>
                )}
                <div className="flex-1 no-print">
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Kondisi lidah adalah jendela utama organ internal dalam TCM. Anda dapat
                    mengunggah atau mengganti foto lidah Anda di bawah ini jika ingin memperbarui
                    dokumentasi.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <Camera className="h-3 w-3" />
                      Gunakan Kamera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Pilih dari Galeri
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* HOLISTIC CONCLUSION TEXT */}
            <div className="mt-8 rounded-xl border-l-4 border-primary bg-primary/5 p-6">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Info className="h-4 w-4" />
                Kesimpulan Analisa Holistik
              </span>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Berdasarkan hasil analisa menyeluruh dari gejala yang dilaporkan, kondisi vitalitas
                pasien saat ini berada dalam rentang ketidakseimbangan sangat dominan
                <strong className="text-primary">
                  {" "}
                  (Balance Score: {results.balanceScore}/100)
                </strong>
                .
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Pola patologi pasien mengarah pada sindrom
                <strong>
                  {" "}
                  Defisiensi Yang Limpa-Ginjal disertai Lembap / Disharmoni Qi Hati-Limpa disertai
                  Lembap / Defisiensi Qi Paru-Limpa disertai Dahak / Disharmoni Jantung dan Ginjal
                  (Yin Defisiensi) / Stagnasi Qi Hati berubah menjadi Api / Defisiensi Darah Jantung
                  dan Hati / Lembap Dingin Menghambat Limpa / Limpa Gagal Mengendalikan Darah /
                  Defisiensi Yin & Yang Ginjal / Retensi Makanan di Lambung / Dingin di Lambung /
                  Defisiensi Yin Lambung / Qi Lambung Memberontak / Defisiensi Jing (Esensi) Ginjal
                  / Defisiensi Qi Ginjal / Dingin di Usus Besar / Kekeringan Usus Besar / Defisiensi
                  Qi Kandung Kemih / Defisiensi Yang Kandung Kemih / Gangguan Transformasi Cairan
                  (San Jiao) / Gangguan Jalur Qi (San Jiao Atas) / Dahak Menutupi Perikardium /
                  Lembap Panas Menghambat Limpa / Lembap Panas di Lambung / Lembap Panas Kandung
                  Kemih / Defisiensi Yin Hati dan Ginjal / Hati Menyerang Lambung /
                  Ketidakharmonisan Jantung dan Ginjal / Defisiensi Darah Jantung dan Limpa / Panas
                  di Usus Besar / Panas Menyerang Perikardium / Dingin Menyerang Meridian Hati /
                  Angin dan Dahak Menyumbat Meridian / Dahak Lembap Menghambat Paru / Ginjal Gagal
                  Menerima Qi / Defisiensi Yin Paru dan Ginjal / Yang Hati Naik (Liver Yang Rising)
                  / Lembap Panas di Hati / Defisiensi Qi Jantung / Dahak Mengaburkan Shen / Invasi
                  Angin Dingin / Kegagalan Paru Menurunkan Qi / Dahak Panas di Paru / Dahak
                  Menyumbat Jantung dan Paru / Api Jantung Membara / Api Hati Mengganggu Paru /
                  Panas Jantung Turun ke Usus Kecil / Gangguan Pemisahan Jernih & Keruh
                </strong>
                .
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Hal ini paling kuat bermanifestasi pada keluhan pasien berupa: mudah merasa lelah,
                cepat kehilangan tenaga setelah beraktivitas, dan membutuhkan waktu lama untuk pulih
                setelah beraktivitas.
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Dari segi fungsional organ (Zang Fu), organ
                <strong>
                  {" "}
                  Limpa ({results.organImbalances.Limpa}%), Ginjal ({results.organImbalances.Ginjal}
                  %), Perikardium ({results.organImbalances.Perikardium}%)
                </strong>{" "}
                menunjukkan tingkat ketidakseimbangan tertinggi yang perlu diperhatikan, yang
                kemungkinan besar menjadi akar/pusat (root cause) dari keluhan fisik dan emosional
                pasien saat ini.
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Energi pertahanan tubuh (Wei Qi) terpantau lemah, menyebabkan tubuh sangat rentan
                terhadap serangan cuaca atau penyakit eksternal. Saat ini, perhatian khusus harus
                difokuskan untuk membuang patogen
                <strong> Angin dan Dingin dan Panas dan Lembap dan Kering</strong> yang diam-diam
                mencoba mempengaruhi sistem tubuh pasien.
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Secara konstitusi dasar, tubuh pasien saat ini mengalami kekurangan cadangan energi
                (Qi) dan nutrisi darah (Blood) secara bersamaan, sehingga tubuh kehilangan tenaga
                untuk pemulihan alami.
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Dari sisi psiko-emosional, ketegangan pada sistem Liver (Hati) dan hambatan
                sirkulasi energi (Qi) menunjukkan adanya akumulasi tekanan pikiran atau stres
                terpendam yang sangat mempengaruhi keluhan fisik pasien saat ini.
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Pola ketidakseimbangan ini kemungkinan besar dipicu atau diperberat oleh faktor gaya
                hidup seperti:
                <strong>
                  {" "}
                  Stres Emosional / Pikiran Berlebih, Konsumsi Berlebih Makanan Manis/Berminyak,
                  Paparan Suhu Dingin (AC) / Makanan Dingin, Makanan Pedas / Kurang Tidur, Kelelahan
                  Fisik / Kurang Istirahat, Sering Begadang / Kurang Minum Cairan / Kelelahan
                  Kronis, Usia / Penyakit Kronis / Terlalu Sering Konsumsi Minuman Es, Diet Kurang
                  Nutrisi / Overthinking (Terlalu Banyak Berpikir), Kurang Olahraga / Cidera Lama /
                  Emosi Tertekan Menahun, Pola Makan Sangat Tidak Sehat / Gangguan Pencernaan Lama
                </strong>
                .
              </p>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">
                Secara holistik, prioritas utama dalam pemberian terapi (baik akupunktur, herbal,
                maupun gaya hidup) harus difokuskan pada:
                <strong>
                  {" "}
                  menghangatkan yang ginjal dan limpa (wen shen jian pi), serta melarutkan
                  kelembapan (hua shi)
                </strong>
                .
              </p>
            </div>

            {/* HIGH PRIORITY WARNING BOX */}
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <span className="font-display text-base font-bold text-red-800">
                  Peringatan Prioritas Tinggi!
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                Profil ketidakseimbangan Anda menunjukkan nilai yang sangat kritis (≥ 60%) pada:
              </p>
              <p className="mt-2 text-xs font-bold leading-relaxed tracking-wide">
                • {listCriticalImbalances().join(", ")}
              </p>
              <p className="mt-4 text-xs font-semibold text-red-700">
                Kami sangat merekomendasikan Anda untuk segera menjadwalkan konsultasi dengan
                terapis TCM kami untuk mencegah keluhan berkembang menjadi masalah kronis.
              </p>
            </div>

            {/* BODY CONDITIONS GRID */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* CONDITION STATUS BANNER */}
              <div className="rounded-xl border border-neutral-200 p-6 text-center shadow-xs">
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Kondisi Tubuh
                </span>
                <span className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
                  🔴
                </span>
                <h4 className="mt-3 font-display text-lg font-bold text-neutral-900">
                  Ketidakseimbangan Sangat Dominan
                </h4>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                  Profil menunjukkan beberapa pola ketidakseimbangan yang kuat menurut konsep TCM.
                  Disarankan berkonsultasi dengan praktisi TCM untuk evaluasi lebih lanjut.
                </p>
              </div>

              {/* BALANCE SCORE CIRCLE */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 p-6 text-center shadow-xs">
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Balance Score
                </span>
                <div className="relative mt-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-500 bg-red-50">
                  <span className="font-display text-3xl font-black text-red-600">
                    {results.balanceScore}
                  </span>
                  <span className="absolute -bottom-1 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                    SCORE
                  </span>
                </div>
                <p className="mt-3 text-xs text-neutral-500 max-w-[180px]">
                  Skor keseimbangan energi tubuh keseluruhan (0-100).
                </p>
              </div>

              {/* DOMINANT CONSTITUTION */}
              <div className="rounded-xl border border-neutral-200 p-6 text-center shadow-xs">
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Konstitusi Tubuh Dominan
                </span>
                <span className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                  🎯
                </span>
                <h4 className="mt-3 font-display text-lg font-bold text-primary">
                  Kekurangan Energi (Qi Deficiency)
                </h4>
                <p className="mt-1 text-sm font-bold text-neutral-800">
                  {results.imbalEnergy}% Terdeteksi
                </p>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                  Tubuh kekurangan energi vital, menyebabkan kelelahan kronis, napas pendek, dan
                  kurang tenaga.
                </p>
              </div>
            </div>

            <div className="print-break" />

            {/* BASE IMBALANCE PROFILES - METERS */}
            <div className="mt-10 border-t pt-8">
              <h3 className="font-display text-lg font-bold text-neutral-900">
                Profil Ketidakseimbangan Dasar
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Semakin tinggi nilai, semakin besar kecenderungan ketidakseimbangan.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  ["Kekurangan Energi", results.imbalEnergy],
                  ["Kekurangan Darah", results.imbalBlood],
                  ["Kekurangan Yin", results.imbalYin],
                  ["Kekurangan Yang", results.imbalYang],
                  ["Stagnasi Energi", results.imbalStagnation],
                  ["Stasis Darah", results.imbalStasis],
                  ["Kelembapan Berlebih", results.imbalDamp],
                  ["Dahak Internal", results.imbalPhlegm],
                  ["Panas Internal", results.imbalHeat],
                  ["Dingin Internal", results.imbalCold],
                ].map(([label, val]) => (
                  <div key={label as string} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>{label as string}</span>
                      <span className="text-primary">{val as number}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-100">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ORGAN IMBALANCES - METERS */}
            <div className="mt-10 border-t pt-8">
              <h3 className="font-display text-lg font-bold text-neutral-900">
                Profil Ketidakseimbangan Organ
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Skor menunjukkan kecenderungan ketidakseimbangan fungsi organ menurut konsep TCM.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {Object.entries(results.organImbalances).map(([name, val]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>{name === "Paru" ? "Paru-paru" : name}</span>
                      <span className="text-primary">{val}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-100">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIET & LIFESTYLE RECOMMENDATIONS */}
            <div className="mt-10 border-t pt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 p-6 bg-emerald-50/20">
                <h4 className="font-display text-base font-bold text-emerald-800">
                  Rekomendasi Diet
                </h4>
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                      Dianjurkan:
                    </span>
                    <p className="mt-1 text-neutral-700 leading-relaxed">
                      Makanan hangat dan mudah dicerna seperti sup ayam, jahe, kurma merah, ubi
                      jalar, gandum, dan daging sapi tanpa lemak.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-red-800 uppercase tracking-wider block">
                      Dihindari:
                    </span>
                    <p className="mt-1 text-neutral-700 leading-relaxed">
                      Makanan mentah, makanan bersuhu dingin (es), makanan berminyak berat yang
                      membebani pencernaan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 p-6 bg-neutral-50">
                <h4 className="font-display text-base font-bold text-neutral-800">
                  Gaya Hidup & Terapi Mandiri
                </h4>
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-neutral-700 uppercase tracking-wider block">
                      Gaya Hidup:
                    </span>
                    <p className="mt-1 text-neutral-600 leading-relaxed">
                      Hindari olahraga yang terlalu menguras tenaga. Prioritaskan tidur lebih awal,
                      jalan santai, dan latihan pernapasan.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-primary uppercase tracking-wider block">
                      Titik Akupresur Mandiri:
                    </span>
                    <p className="mt-1 font-bold text-neutral-800">Zusanli (ST-36)</p>
                    <p className="mt-0.5 text-neutral-600 leading-relaxed">
                      <strong>Lokasi:</strong> Empat jari di bawah tempurung lutut, satu jari di
                      luar tulang kering.
                    </p>
                    <p className="mt-0.5 text-neutral-600 leading-relaxed">
                      <strong>Fungsi:</strong> Meningkatkan energi vital dan menguatkan pencernaan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="print-break" />

            {/* TCM COMBINATION PATTERNS LIST (SCROLLABLE ACCORDION STYLE) */}
            <div className="mt-10 border-t pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-neutral-900">
                    Pola Ketidakseimbangan TCM
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Menunjukkan tingkat keyakinan sistem terhadap pola sindrom yang berhasil
                    diidentifikasi.
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Confidence
                  </span>
                  <span className="block font-display text-sm font-black text-primary">100%</span>
                </div>
              </div>

              {/* High-Fidelity Syndrome Mapping Cards */}
              <div className="mt-6 max-h-[400px] overflow-y-auto border rounded-xl divide-y bg-neutral-50/30 no-scrollbar">
                {tcmSyndromes.map((s, idx) => (
                  <div key={s.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block rounded-md bg-neutral-200/60 px-1.5 py-0.5 text-[9px] font-bold text-neutral-600 uppercase">
                          {s.type} #{idx + 1}
                        </span>
                        <h4 className="mt-1 text-sm font-bold text-neutral-900 leading-tight">
                          {s.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-primary">Aktif</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-neutral-500 border"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEI QI & PATHOGENS */}
            <div className="mt-10 border-t pt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900">
                  Wei Qi (Energi Pelindung)
                </h3>
                <div className="mt-4 rounded-xl border border-neutral-200 p-5 bg-yellow-50/30">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="font-display font-bold text-sm">Lemah ({results.weiQi}%)</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-700 leading-relaxed">
                    Sistem imun (Energi Pelindung) Anda terpantau rentan. Anda mungkin mudah masuk
                    angin, cepat lelah, atau tertular penyakit eksternal akibat lemahnya pertahanan
                    luar tubuh.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900">
                  Kerentanan Patogen Luar
                </h3>
                <div className="mt-4 space-y-3">
                  {[
                    ["Angin", 98],
                    ["Dingin", 100],
                    ["Panas", 99],
                    ["Lembap", 100],
                    ["Kering", 98],
                  ].map(([patogen, val]) => (
                    <div
                      key={patogen as string}
                      className="flex items-center justify-between text-xs font-medium"
                    >
                      <span className="text-neutral-700 font-semibold">{patogen as string}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-neutral-100">
                          <div
                            className="h-1.5 rounded-full bg-red-500"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="text-red-600 font-bold w-10 text-right">
                          {val as number}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PRECIPITATING FACTORS */}
            <div className="mt-10 border-t pt-8">
              <h3 className="font-display text-lg font-bold text-neutral-900">
                Kemungkinan Faktor Pencetus
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Gaya hidup dan faktor eksternal yang memperberat pola ketidakseimbangan tubuh saat
                ini.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs font-medium text-neutral-700">
                {[
                  "Stres Emosional / Pikiran Berlebih",
                  "Konsumsi Berlebih Makanan Manis/Berminyak",
                  "Paparan Suhu Dingin (AC) / Makanan Dingin",
                  "Makanan Pedas / Kurang Tidur",
                  "Kelelahan Fisik / Kurang Istirahat",
                  "Sering Begadang / Kurang Minum Cairan / Kelelahan Kronis",
                  "Usia / Penyakit Kronis / Terlalu Sering Konsumsi Minuman Es",
                  "Diet Kurang Nutrisi / Overthinking (Terlalu Banyak Berpikir)",
                  "Kurang Olahraga / Cidera Lama / Emosi Tertekan Menahun",
                  "Pola Makan Sangat Tidak Sehat / Gangguan Pencernaan Lama",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border p-2 bg-neutral-50"
                  >
                    <span className="text-red-500">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP 3 ORGANS HIGHEST ATTENTION */}
            <div className="mt-10 border-t pt-8">
              <h3 className="font-display text-lg font-bold text-neutral-900">
                Top 3 Organ yang Memerlukan Perhatian
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["Limpa", "100%", "Fungsi transformasi cairan dan energi makanan terganggu."],
                  ["Ginjal", "100%", "Cadangan esensi vital tubuh (Jing) dan Yang menurun."],
                  [
                    "Perikardium",
                    "100%",
                    "Menjaga energi emosional dan ketenangan sirkulasi darah.",
                  ],
                ].map(([organ, val, desc], idx) => (
                  <div key={organ} className="rounded-xl border p-4 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-400">#{idx + 1} Organ</span>
                      <span className="text-xs font-bold text-primary">{val}</span>
                    </div>
                    <h4 className="mt-2 font-display text-base font-bold text-neutral-900">
                      {organ}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GEJALA PALING BERPENGARUH */}
            <div className="mt-10 border-t pt-8">
              <h3 className="font-display text-lg font-bold text-neutral-900">
                Gejala yang Paling Berpengaruh
              </h3>
              <div className="mt-4 space-y-2 text-xs text-neutral-700 leading-relaxed">
                {[
                  "Apakah pembengkakan (edema) merata dari bawah pusar hingga kaki namun pinggang pegal?",
                  "Apakah saat menelan ludah tenggorokan terasa tersumbat benda asing tak terlihat?",
                  "BAB terasa lengket atau sulit dibersihkan.",
                  "Nafsu makan saya rendah.",
                  "Berat badan saya mudah bertambah.",
                ].map((gejala) => (
                  <div
                    key={gejala}
                    className="flex items-start gap-2.5 rounded-lg border p-3 bg-neutral-50/50"
                  >
                    <span className="text-primary text-base font-bold leading-none">•</span>
                    <span>{gejala}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PRIORITAS PERBAIKAN */}
            <div className="mt-10 border-t pt-8">
              <h3 className="font-display text-lg font-bold text-neutral-900">
                Prioritas Perbaikan
              </h3>
              <div className="mt-4 space-y-2 text-xs text-neutral-700 leading-relaxed">
                {[
                  "Menghangatkan Yang Ginjal dan Limpa (wen shen jian pi), serta melarutkan kelembapan (hua shi).",
                  "Mengatur Qi Hati (shu gan li qi), menguatkan Qi Limpa (jian pi yi qi), dan menghilangkan lembap (hua shi).",
                  "Menguatkan Qi Limpa dan Paru (jian pi yi fei), serta mengurai dahak (hua tan).",
                  "Menutrisi Yin Ginjal (zi yin) dan menurunkan Api Jantung (jiang huo).",
                  "Menenangkan Hati (ping gan), melancarkan Qi (li qi), dan membersihkan Api Hati (qing gan huo).",
                ].map((prioritas) => (
                  <div key={prioritas} className="flex items-start gap-2.5 rounded-lg border p-3">
                    <span className="text-primary text-base font-bold leading-none">•</span>
                    <span>{prioritas}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DISCLAIMER TEXT */}
            <div className="mt-10 border-t pt-8 text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 p-5 rounded-xl border">
              <strong>Disclaimer:</strong> Hasil ini merupakan Profiling Traditional Chinese
              Medicine (TCM) berdasarkan jawaban kuesioner. Hasil ini bertujuan sebagai informasi
              awal mengenai kecenderungan kondisi tubuh menurut konsep TCM dan tidak merupakan
              diagnosis medis. Apabila memiliki keluhan kesehatan, konsultasikan dengan praktisi TCM
              atau tenaga kesehatan yang kompeten.
            </div>

            {/* ACTION FOOTER BUTTONS */}
            <div className="no-print mt-10 flex flex-wrap justify-center gap-4 border-t pt-8">
              <Link
                to="/reservasi"
                className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-opacity"
              >
                <Calendar className="h-4 w-4" />
                Jadwalkan Konsultasi Sekarang
              </Link>
              <button
                type="button"
                onClick={() => {
                  setJawaban({});
                  setSubmitted(false);
                  setStep("profile");
                }}
                className="rounded-full border border-neutral-300 px-8 py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                Ulangi Skrining Mandiri
              </button>
            </div>
          </div>
        </main>
      )}

      {/* FOOTER SECTION */}
      <footer className="no-print border-t border-neutral-200 bg-white py-12 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <span className="font-display text-sm font-bold text-neutral-800 block">
                Epiphany.id
              </span>
              <p className="mt-2 leading-relaxed">
                Jl. Dukuh Kupang Timur XVI No.81-85, Pakis, Kec. Sawahan, Surabaya, Jawa Timur
                60256, Indonesia
              </p>
              <div className="mt-4 flex gap-3 text-neutral-400">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <span className="font-display text-sm font-bold text-neutral-800 block">
                Layanan Kami
              </span>
              <ul className="mt-2 space-y-1.5">
                <li>TCM (Traditional Chinese Medicine)</li>
                <li>Konseling Kesehatan</li>
                <li>Audioterapi Tradisional</li>
              </ul>
            </div>

            <div>
              <span className="font-display text-sm font-bold text-neutral-800 block">
                Tautan Navigasi
              </span>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <Link to="/#about" className="hover:underline">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/#articles" className="hover:underline">
                    Blog & Artikel
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" className="hover:underline">
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-display text-sm font-bold text-neutral-800 block">
                Klinik Rumah Terapy
              </span>
              <p className="mt-2 leading-relaxed">
                Kami siap membantu mendeteksi dan memulihkan sirkulasi Qi dan darah tubuh Anda demi
                keseimbangan sejati.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t pt-6 text-center">
            <p>© 2026 Epiphany.id. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>

      {/* WEBCAM CAMERA MODAL */}
      {showCameraModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-display text-base font-bold text-neutral-900">Ambil Foto Lidah</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Pastikan Anda berada di ruangan yang terang agar kondisi lidah terpotret jelas.
            </p>

            <div className="relative mt-4 overflow-hidden rounded-lg bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white hover:opacity-95"
              >
                Ambil Gambar
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 rounded-xl border py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
