import { useState, useEffect, FormEvent, useRef, useCallback } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { createFileRoute, Link } from "@/lib/route";
import { useAuth, authHeaders, useProfile } from "@/hooks/use-auth";
import { PageHeader } from "@/components/site/PageHeader";
import {
  Printer,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
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
  Paperclip,
  UploadCloud,
  Trash2,
  Eye,
  Download,
  Loader2,
  Video,
} from "lucide-react";
import { TcmHerbalReport, TcmScreeningReport } from "@/components/screening/TcmHerbalReport";
import { toast } from "sonner";

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

export interface MedicalDocumentItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: string;
  note?: string;
  uploadedAt?: string;
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

interface DecodedPayload {
  nama?: string;
  usia?: string | number;
  kelamin?: string;
  tinggi?: string | number;
  berat?: string | number;
  keluhan?: string;
  complaints?: string;
  tonguePhoto?: string;
  tonguePhotoUrl?: string;
  hospitalDocs?: MedicalDocumentItem[];
  answers?: Record<string, number>;
}

const robustDecodePayload = (encodedStr: string): DecodedPayload | null => {
  let cleaned = encodedStr.replace(/ /g, "+").trim();

  // Repair Base64 padding if it is incorrect
  while (cleaned.length % 4 !== 0) {
    cleaned += "=";
  }

  let rawDecoded = "";
  try {
    rawDecoded = atob(cleaned);
  } catch (err) {
    try {
      const base64Cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, "");
      rawDecoded = atob(base64Cleaned);
    } catch (err2) {
      console.error("Critical base64 decode failure:", err2);
      return null;
    }
  }

  // Try decoding with and without decodeURIComponent
  let jsonStr = "";
  try {
    jsonStr = decodeURIComponent(rawDecoded);
  } catch {
    jsonStr = rawDecoded; // Fallback to raw if URI malformed
  }

  // Try standard JSON.parse
  try {
    return JSON.parse(jsonStr) as DecodedPayload;
  } catch (parseErr) {
    console.warn("JSON parse failed, attempting string repair for truncated payload:", parseErr);
    // Extract properties via regex as fallback
    const result: DecodedPayload = {
      nama: "",
      usia: "25",
      kelamin: "L",
      tinggi: "165",
      berat: "60",
      keluhan: "",
      tonguePhoto: "",
      hospitalDocs: [],
      answers: {},
    };

    const matchPropString = (propName: string) => {
      const regex = new RegExp(`"${propName}"\\s*:\\s*"([^"]*)"`);
      const match = jsonStr.match(regex);
      return match ? match[1] : null;
    };

    const matchPropNumber = (propName: string) => {
      const regex = new RegExp(`"${propName}"\\s*:\\s*([0-9.]+)`);
      const match = jsonStr.match(regex);
      return match ? match[1] : null;
    };

    const nama = matchPropString("nama");
    if (nama !== null) result.nama = nama;

    const usia = matchPropNumber("usia") || matchPropString("usia");
    if (usia !== null) result.usia = String(usia);

    const kelamin = matchPropString("kelamin");
    if (kelamin !== null) result.kelamin = kelamin;

    const tinggi = matchPropNumber("tinggi") || matchPropString("tinggi");
    if (tinggi !== null) result.tinggi = String(tinggi);

    const berat = matchPropNumber("berat") || matchPropString("berat");
    if (berat !== null) result.berat = String(berat);

    const keluhan = matchPropString("keluhan");
    if (keluhan !== null) result.keluhan = keluhan;

    const tonguePhoto = matchPropString("tonguePhoto");
    if (tonguePhoto !== null) result.tonguePhoto = tonguePhoto;

    // Extract answers object if partially intact
    try {
      const answersIndex = jsonStr.indexOf('"answers"');
      if (answersIndex !== -1) {
        const subStr = jsonStr.substring(answersIndex);
        const openBrace = subStr.indexOf("{");
        if (openBrace !== -1) {
          const uuidRegex = /"([a-f0-9-]{36})"\s*:\s*([0-9]+)/gi;
          let match;
          const extractedAnswers: Record<string, number> = {};
          while ((match = uuidRegex.exec(subStr)) !== null) {
            extractedAnswers[match[1]] = Number(match[2]);
          }
          if (Object.keys(extractedAnswers).length > 0) {
            result.answers = extractedAnswers;
          }
        }
      }
    } catch (e) {
      console.error("Gagal mengekstrak jawaban terpotong:", e);
    }

    return result;
  }
};

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

  // Hospital documents state
  const [hospitalDocs, setHospitalDocs] = useState<MedicalDocumentItem[]>([]);
  const [isUploadingHospitalDoc, setIsUploadingHospitalDoc] = useState(false);
  const hospitalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile query
  const { data: profile } = useProfile();

  // Questionnaire States
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"questions" | "detail" | "result">("questions");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [historyQuestionsPage, setHistoryQuestionsPage] = useState(1);

  // Generated TCM & Herbal State
  const [aiReport, setAiReport] = useState<TcmScreeningReport | null>(null);
  const [isLoadingReport, setIsLoadingAi] = useState(false);

  // Shared Screening States
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [isSavingScreening, setIsSavingScreening] = useState(false);

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

  // Handle loading shared screening result on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultDataParam = params.get("resultData");
    const sharedUserId = params.get("userId");

    if (resultDataParam) {
      setIsViewingShared(true);
      try {
        const decoded = robustDecodePayload(resultDataParam);
        if (decoded) {
          setNama(decoded.nama || "");
          setUsia(decoded.usia ? String(decoded.usia) : "25");
          setKelamin(decoded.kelamin || "L");
          setTinggi(decoded.tinggi ? String(decoded.tinggi) : "165");
          setBerat(decoded.berat ? String(decoded.berat) : "60");
          setKeluhan(decoded.keluhan || decoded.complaints || "");
          setTonguePhoto(decoded.tonguePhoto || decoded.tonguePhotoUrl || "");
          if (decoded.hospitalDocs && Array.isArray(decoded.hospitalDocs)) {
            setHospitalDocs(decoded.hospitalDocs);
          }
          setJawaban(decoded.answers || {});
          setStep("result");
          setSubmitted(true);

          // Fallback if assets are missing but userId is provided
          if (
            sharedUserId &&
            (!decoded.tonguePhoto ||
              decoded.tonguePhoto === "" ||
              !decoded.hospitalDocs ||
              decoded.hospitalDocs.length === 0)
          ) {
            fetch(`/api/profile/${sharedUserId}/screening`)
              .then((res) => {
                if (res.ok) return res.json();
                throw new Error();
              })
              .then((data) => {
                if (data) {
                  if (data.tonguePhotoUrl && (!decoded.tonguePhoto || decoded.tonguePhoto === "")) {
                    setTonguePhoto(data.tonguePhotoUrl);
                  }
                  if (data.screeningAnswers) {
                    try {
                      const parsed =
                        typeof data.screeningAnswers === "string"
                          ? JSON.parse(data.screeningAnswers)
                          : data.screeningAnswers;
                      if (
                        parsed.tonguePhoto &&
                        (!decoded.tonguePhoto || decoded.tonguePhoto === "")
                      ) {
                        setTonguePhoto(parsed.tonguePhoto);
                      }
                      if (
                        parsed.hospitalDocs &&
                        parsed.hospitalDocs.length > 0 &&
                        (!decoded.hospitalDocs || decoded.hospitalDocs.length === 0)
                      ) {
                        setHospitalDocs(parsed.hospitalDocs);
                      }
                    } catch (e) {
                      console.error("Gagal parse screeningAnswers tambahan:", e);
                    }
                  }
                }
              })
              .catch((err) => {
                console.error("Gagal memuat detail foto/dokumen tambahan:", err);
              });
          }
        }
      } catch (err) {
        console.error("Gagal memendekkan/mengurai data skrining:", err);
      }
    } else if (sharedUserId) {
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
            setKeluhan(parsed.keluhan || parsed.complaints || "");
            setTonguePhoto(
              parsed.tonguePhoto || parsed.tonguePhotoUrl || data.tonguePhotoUrl || null,
            );
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

  // Sync profile data when available
  useEffect(() => {
    if (profile && !isViewingShared) {
      if (profile.fullName && (!nama || nama === "Pasien")) setNama(profile.fullName);
      if (profile.phone && !recipientPhone) setRecipientPhone(profile.phone);
      if (profile.age) setUsia(String(profile.age));
      if (profile.gender) setKelamin(profile.gender === "Laki-laki" ? "L" : "P");
      if (profile.height) setTinggi(String(profile.height));
      if (profile.weight) setBerat(String(profile.weight));
    }
  }, [profile, recipientPhone, isViewingShared, nama]);

  // Sync profile tonguePhoto if it's missing in local state
  useEffect(() => {
    if (profile?.tonguePhotoUrl && !tonguePhoto) {
      setTonguePhoto(profile.tonguePhotoUrl);
    }
  }, [profile, tonguePhoto]);

  // Sync user name when user loads
  useEffect(() => {
    if (user?.name && (!nama || nama === "Pasien") && !isViewingShared) {
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
        setMediaType("image");
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
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File terlalu besar. Maksimal 50 MB.");
        return;
      }
      const isVid = file.type.startsWith("video/");
      setMediaType(isVid ? "video" : "image");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTonguePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHospitalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingHospitalDoc(true);
    const fileArray = Array.from(files);
    let processedCount = 0;

    fileArray.forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} terlalu besar. Maksimal 50 MB.`);
        processedCount++;
        return;
      }
      const sizeKB = (file.size / 1024).toFixed(0);
      const formattedSize =
        file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKB} KB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newDoc: MedicalDocumentItem = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            type: file.type || "application/octet-stream",
            url: event.target.result as string,
            size: formattedSize,
            note: "",
            uploadedAt: new Date().toISOString(),
          };
          setHospitalDocs((prev) => [...prev, newDoc]);
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          setIsUploadingHospitalDoc(false);
          if (hospitalFileInputRef.current) {
            hospitalFileInputRef.current.value = "";
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveHospitalDoc = (id: string) => {
    setHospitalDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDocNoteChange = (id: string, note: string) => {
    setHospitalDocs((prev) => prev.map((d) => (d.id === id ? { ...d, note } : d)));
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

  const getDominantConstitution = () => {
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
        acupressureFunc:
          "Menguatkan energi limpa dan lambung, mendongkrak stamina dan metabolisme.",
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
        lifestyle:
          "Kelola stres, meditasi menenangkan Shen, minum air putih hangat secara berkala.",
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
  };

  const dominant = getDominantConstitution();

  const requestAiAnalysis = useCallback(
    async (customAnswers?: Record<string, number>, customProfile?: Record<string, unknown>) => {
      setIsLoadingAi(true);
      try {
        const answersToUse = customAnswers || jawaban;
        const currentProfile = customProfile || {
          name: nama,
          age: parseInt(usia) || 25,
          gender: kelamin === "L" ? "Laki-laki" : "Perempuan",
          height: parseInt(tinggi) || 165,
          weight: parseInt(berat) || 60,
          complaints: keluhan,
          tonguePhoto,
        };

        const res = await fetch("/api/screening/generate-ai-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answersToUse,
            questions,
            patientProfile: currentProfile,
            basicResults: calculateTcmResult(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiReport(data);
        }
      } catch (err) {
        console.error("Gagal mendapatkan analisa:", err);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [jawaban, questions, nama, usia, kelamin, tinggi, berat, keluhan, tonguePhoto],
  );

  // Auto trigger AI analysis when reaching result step
  useEffect(() => {
    if (step === "result" && !aiReport && !isLoadingReport && Object.keys(jawaban).length > 0) {
      void requestAiAnalysis();
    }
  }, [step, aiReport, isLoadingReport, jawaban, requestAiAnalysis]);

  const getSyndromeConfidence = (syndrome: { title: string; keywords: string[] }) => {
    const totalQuestions = questions.length || 1;
    const answeredCount = Object.keys(jawaban).length || 1;
    let totalScoreSum = 0;
    Object.values(jawaban).forEach((v) => {
      totalScoreSum += v;
    });
    const answeredMaxScore = answeredCount * 3 || 1;
    const severityRatio = totalScoreSum / answeredMaxScore;

    // Base confidence is proportional to severityRatio
    const score = severityRatio * 70 + 30; // 30% to 100%

    // Check specific question answers (1, 2, or 3)
    const q8 = jawaban["dq8"] || 0; // Edema, Limpa-Ginjal, Lembap
    const q9 = jawaban["dq9"] || 0; // Globus, Hati
    const q10 = jawaban["dq10"] || 0; // BAB Lengket, Lembap, Dahak, Limpa
    const q1 = jawaban["dq1"] || 0; // Lelah, Qi Deficiency

    let boost = 0;

    // Apply TCM logic boosts
    if (
      q8 > 0 &&
      (syndrome.keywords.includes("Yang Ginjal") ||
        syndrome.keywords.includes("Limpa") ||
        syndrome.keywords.includes("Ginjal") ||
        syndrome.keywords.includes("Lembap"))
    ) {
      boost += q8 * 8;
    }
    if (
      q9 > 0 &&
      (syndrome.keywords.includes("Stagnasi Qi Hati") ||
        syndrome.keywords.includes("Hati") ||
        syndrome.keywords.includes("Qi"))
    ) {
      boost += q9 * 8;
    }
    if (
      q10 > 0 &&
      (syndrome.keywords.includes("Lembap") ||
        syndrome.keywords.includes("Dahak") ||
        syndrome.keywords.includes("Limpa"))
    ) {
      boost += q10 * 8;
    }
    if (
      q1 > 0 &&
      (syndrome.keywords.includes("Qi") ||
        syndrome.keywords.includes("Defisiensi Qi") ||
        syndrome.keywords.includes("Lelah"))
    ) {
      boost += q1 * 8;
    }

    const finalScore = Math.min(100, Math.round(score + boost));
    return finalScore;
  };

  const getActiveSyndromesString = () => {
    // Sort syndromes by confidence
    const active = tcmSyndromes
      .map((s) => ({ ...s, confidence: getSyndromeConfidence(s) }))
      .filter((s) => s.confidence >= 65)
      .sort((a, b) => b.confidence - a.confidence);

    if (active.length === 0) {
      return "Defisiensi Yang Limpa-Ginjal disertai Lembap / Disharmoni Qi Hati-Limpa disertai Lembap";
    }
    return active.map((s) => s.title).join(" / ");
  };

  const getKeluhanUtamaManifestasi = () => {
    const list: string[] = [];
    if (jawaban["dq1"] && jawaban["dq1"] > 0)
      list.push("mudah merasa lelah dan cepat kehilangan tenaga setelah beraktivitas");
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
      return (
        keluhan ||
        "mudah merasa lelah, cepat kehilangan tenaga setelah beraktivitas, dan membutuhkan waktu lama untuk pulih"
      );
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
      Limpa: "Fungsi transformasi cairan dan energi makanan terganggu.",
      Ginjal: "Cadangan esensi vital tubuh (Jing) dan Yang menurun.",
      Perikardium: "Menjaga energi emosional dan ketenangan sirkulasi darah.",
      Hati: "Mengatur sirkulasi Qi dan emosi tersumbat/stagnan.",
      Jantung: "Mengendalikan pikiran (Shen) dan sirkulasi darah terganggu.",
      Paru: "Mengatur pernapasan dan penyebaran Qi pelindung melemah.",
      Lambung: "Menerima dan mencerna makanan kurang maksimal.",
      UsusBesar: "Pembersihan dan eliminasi sisa makanan terganggu.",
      KandungKemih: "Transformasi dan eliminasi cairan tubuh terganggu.",
      SanJiao: "Sirkulasi cairan dan Qi di seluruh tubuh terhambat.",
      KandungEmpedu: "Keputusan mental dan sekresi cairan empedu terhambat.",
      UsusKecil: "Pemisahan cairan jernih dan keruh kurang optimal.",
    };

    return sorted.map(([name, val]) => ({
      name: name === "Paru" ? "Paru-paru" : name,
      val: `${val}%`,
      desc: organDescs[name] || "Kecenderungan ketidakseimbangan fungsi organ.",
    }));
  };

  const getMostInfluentialSymptoms = () => {
    const list: string[] = [];
    questions.forEach((q) => {
      const val = jawaban[q.id];
      if (val && val >= 2) {
        list.push(q.questionText);
      }
    });
    if (list.length === 0) {
      return [
        "Apakah pembengkakan (edema) merata dari bawah pusar hingga kaki namun pinggang pegal?",
        "Apakah saat menelan ludah tenggorokan terasa tersumbat benda asing tak terlihat?",
        "BAB terasa lengket, basah, atau sulit dibersihkan.",
        "Saya sering merasa lelah atau kehilangan energi meski sudah cukup tidur.",
        "Pencernaan saya tidak stabil (kembung, nyeri lambung, atau BAB tidak teratur).",
      ];
    }
    return list;
  };

  const handleNextStep = () => {
    if (step === "profile") {
      setStep("questions");
    }
  };

  const handleSubmitAll = async () => {
    setIsSavingScreening(true);
    try {
      const calcResults = calculateTcmResult();
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
          address: user?.address || "",
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
            hospitalDocs,
          },
          hospitalDocs,
          score: calcResults.score,
          maxScore: calcResults.maxScore,
          level: calcResults.level,
          advice: calcResults.advice,
          aiReport: aiReport ? JSON.stringify(aiReport) : null,
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

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const element = document.getElementById("tcm-screening-report");
    if (!element) {
      toast.error("Format laporan tidak ditemukan di halaman ini.");
      return;
    }
    const toastId = toast.loading("Sedang menyiapkan dokumen PDF...");
    const originalSrcs: { img: HTMLImageElement; src: string }[] = [];
    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;

    try {
      // 1. Scroll to top to ensure complete capture
      window.scrollTo(0, 0);

      // 2. Convert images to inline base64 where possible to avoid CORS issues
      const images = element.querySelectorAll("img");
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
                    // Ignore and use original source if tainted
                  }
                  resolve();
                };
                proxyImg.onerror = () => resolve();
                proxyImg.src = img.src;
              });
            }
          } catch {
            // Ignore pre-conversion error
          }
        }),
      );

      // 3. Render element to canvas
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false, // Must be false to prevent SecurityError on toDataURL()
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: element.scrollHeight + 100,
        ignoreElements: (el) => !!(el.classList && el.classList.contains("no-print")),
      });

      // 4. Restore scroll and image sources
      window.scrollTo(originalScrollX, originalScrollY);
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
      // Restore scroll and images on error
      window.scrollTo(originalScrollX, originalScrollY);
      try {
        originalSrcs.forEach(({ img, src }) => {
          img.src = src;
        });
      } catch { /* ignore */ }
      toast.error(
        "Gagal mengunduh PDF secara langsung. Silakan coba cetak halaman ini (Ctrl+P) sebagai alternatif.",
        { id: toastId, duration: 5000 },
      );
    }
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
              src="/logo.png"
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

          <div className="flex items-center gap-2 sm:gap-3">
            {step === "result" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep("questions");
                    setSubmitted(false);
                    setJawaban({});
                    setAiReport(null);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-primary hover:text-primary transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Isi Ulang
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Unduh PDF
                </button>
              </>
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
      {/* STEP 1: SCREENING QUESTIONS FORM (PILIHAN GANDA) */}
      {step === "questions" && (
        <main className="no-print mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Langkah 1 dari 2
              </span>
              <span className="text-xs font-semibold text-neutral-500">Kuesioner Gejala TCM</span>
            </div>
            <span className="text-xs font-semibold text-neutral-600 bg-white border px-3 py-1 rounded-full shadow-2xs">
              {Object.keys(jawaban).length} dari {questions.length} Soal Dijawab
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="font-display text-2xl font-bold text-neutral-900">
              1. Pengisian Soal Skrining Mandiri
            </h1>
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
              Jawablah pertanyaan-pertanyaan berikut berdasarkan kondisi tubuh yang Anda rasakan
              akhir-akhir ini.
            </p>

            {loading ? (
              <div className="py-12 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Memuat soal skrining...
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

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4">
                  <span className="text-xs text-neutral-500 italic">
                    *Harap jawab semua pertanyaan untuk melanjutkan ke tahap upload foto/video lidah
                  </span>
                  <button
                    type="button"
                    disabled={Object.keys(jawaban).length < questions.length}
                    onClick={() => setStep("detail")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Lanjut: Upload Foto/Video Lidah & Keterangan Rinci
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
      {/* STEP 2: UPLOAD PHOTO/VIDEO LIDAH & KETERANGAN LEBIH RINCI */}
      {step === "detail" && (
        <main className="no-print mx-auto max-w-2xl px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("questions")}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Soal Skrining
            </button>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Langkah 2 dari 2
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Camera className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Dokumentasi &amp; Anamnesis
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              2. Upload Foto/Video Lidah &amp; Keterangan Rinci
            </h1>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Silakan upload foto atau rekaman video lidah Anda dan lengkapi rincian keluhan tubuh
              agar diagnosa TCM &amp; Herbal semakin akurat.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmitAll();
              }}
              className="mt-8 space-y-6"
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="p_keluhan"
                    className="block text-sm font-semibold text-neutral-800"
                  >
                    Keluhan Utama &amp; Keterangan Lebih Rinci
                  </label>
                  <p className="mt-1 text-xs text-neutral-500">
                    Tuliskan keluhan atau gejala fisik yang Anda rasakan secara detail (misal:
                    sensasi panas/dingin, rasa tidak nyaman di perut, kualitas tidur, tingkat lelah,
                    durasi keluhan, dsb).
                  </p>
                  <textarea
                    id="p_keluhan"
                    rows={6}
                    required
                    placeholder="Tuliskan paragraf rincian keluhan Anda di sini..."
                    value={keluhan}
                    onChange={(e) => setKeluhan(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 p-3.5 text-sm leading-relaxed focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>

                {/* Interactive Tongue Upload Section (Photo & Video) */}
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-semibold text-neutral-800">
                        Upload Foto / Video Lidah
                      </span>
                      <span className="block text-xs text-neutral-500 mt-0.5">
                        Ambil foto via kamera atau upload foto/video singkat lidah dari galeri.
                      </span>
                    </div>
                    <Video className="h-5 w-5 text-neutral-400" />
                  </div>

                  {tonguePhoto ? (
                    <div className="mt-4 flex flex-col items-center gap-3">
                      {tonguePhoto.startsWith("data:video/") || mediaType === "video" ? (
                        <video
                          src={tonguePhoto}
                          controls
                          className="h-44 w-full max-w-sm rounded-xl border border-neutral-300 bg-black object-contain shadow-xs"
                        />
                      ) : (
                        <img
                          src={tonguePhoto}
                          alt="Foto Lidah"
                          className="h-44 w-44 rounded-xl border border-neutral-300 object-cover shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setTonguePhoto(null)}
                        className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                      >
                        Hapus &amp; Ambil Ulang Media
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-xs text-neutral-600 italic">
                        Belum ada media terlampir. Pilih salah satu opsi di bawah ini:
                      </p>
                      <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs"
                        >
                          <Camera className="h-4 w-4 text-primary" />
                          Ambil Foto (Kamera)
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs"
                        >
                          <ImageIcon className="h-4 w-4 text-primary" />
                          Upload Foto / Video Galeri
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                      />
                    </div>
                  )}
                </div>

                {/* Optional Hospital Medical Documents / Lab Results Upload */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                        <Paperclip className="h-4 w-4 text-primary" />
                        Lampiran Dokumen Medis &amp; Lab Rumah Sakit (Opsional)
                      </span>
                      <span className="block text-xs text-neutral-500 mt-0.5">
                        Unggah foto/file rontgen, hasil lab darah, EKG, atau resume dokter rumah
                        sakit.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => hospitalFileInputRef.current?.click()}
                      disabled={isUploadingHospitalDoc}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-primary" />
                      <span>{isUploadingHospitalDoc ? "Mengunggah..." : "Tambah Dokumen"}</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={hospitalFileInputRef}
                    onChange={handleHospitalDocUpload}
                    multiple
                    accept="image/*,application/pdf,.doc,.docx"
                    className="hidden"
                  />

                  {hospitalDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {hospitalDocs.map((doc) => {
                        const isImage =
                          doc.url &&
                          (doc.type.startsWith("image/") || doc.url.startsWith("data:image/"));
                        return (
                          <div
                            key={doc.id}
                            className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-start gap-2.5">
                              {isImage ? (
                                <img
                                  src={doc.url}
                                  alt={doc.name}
                                  className="h-12 w-12 rounded-lg object-cover border border-neutral-200 shrink-0 bg-white"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg border border-neutral-200 bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <FileText className="h-6 w-6" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs font-bold text-neutral-900 truncate"
                                  title={doc.name}
                                >
                                  {doc.name}
                                </p>
                                <span className="text-[10px] text-neutral-400 font-mono block">
                                  {doc.size || "File"} •{" "}
                                  {doc.type.split("/")[1]?.toUpperCase() || "DOC"}
                                </span>
                                <input
                                  type="text"
                                  placeholder="Catatan / keterangan dokumen..."
                                  value={doc.note || ""}
                                  onChange={(e) => handleDocNoteChange(doc.id, e.target.value)}
                                  className="mt-1.5 w-full rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveHospitalDoc(doc.id)}
                                className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                                title="Hapus dokumen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      onClick={() => hospitalFileInputRef.current?.click()}
                      className="rounded-xl border border-dashed border-neutral-200 p-4 text-center cursor-pointer hover:bg-neutral-50/50 transition-colors"
                    >
                      <FileText className="h-6 w-6 text-neutral-300 mx-auto mb-1" />
                      <p className="text-xs font-medium text-neutral-500">
                        Klik untuk memilih dokumen hasil lab/resume medis RS (opsional)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingScreening}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
              >
                {isSavingScreening ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses &amp; Menyimpan Hasil...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Lihat Hasil Skrining
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      )}{" "}
      {/* STEP 3: HIGH-FIDELITY TCM PROFILING REPORT DISPLAY (PRINT READY) */}
      {(step === "result" || submitted) && (
        <main
          className="print-container mx-auto max-w-5xl px-4 py-8 sm:py-14"
          id="tcm-screening-report"
        >
          {/* Main Card Report Wrap */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md sm:p-10">
            {/* BRAND LOGO BAR */}
            <div className="flex flex-col items-center justify-between border-b pb-8 sm:flex-row gap-6">
              <div className="flex items-center gap-4">
                <img
                  src="/logo.png"
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
                <span className="block text-xs text-neutral-500 font-medium">Epiphany.id</span>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
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
            {(() => {
              const hM = (parseFloat(tinggi) || 165) / 100;
              const wKg = parseFloat(berat) || 60;
              const bmiVal = hM > 0 ? (wKg / (hM * hM)).toFixed(1) : "22.0";
              const bmiNum = parseFloat(bmiVal);
              const bmiCategory =
                bmiNum < 18.5
                  ? "Kurus (Underweight)"
                  : bmiNum < 24.9
                    ? "Normal"
                    : bmiNum < 29.9
                      ? "Kelebihan Berat"
                      : "Obesitas";

              return (
                <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 sm:grid-cols-4 print:bg-white print:border-neutral-300">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Nama Pasien
                    </span>
                    <span className="mt-0.5 block font-display text-base font-bold text-neutral-900">
                      {nama || "Pasien Rumah Terapy"}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      ID: #
                      {Math.abs(
                        (nama || "PT")
                          .split("")
                          .reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0),
                      )
                        .toString()
                        .substring(0, 6)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Usia &amp; Kelamin
                    </span>
                    <span className="mt-0.5 block font-display text-base font-bold text-neutral-900">
                      {usia} Tahun, {kelamin === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Peran: {user?.role === "admin" ? "Admin / Praktisi" : "Pasien"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Fisik &amp; BMI
                    </span>
                    <span className="mt-0.5 block font-display text-base font-bold text-neutral-900">
                      {tinggi} cm / {berat} kg
                    </span>
                    <span className="text-[10px] font-medium text-primary">
                      BMI: {bmiVal} ({bmiCategory})
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Tanggal &amp; Waktu
                    </span>
                    <span className="mt-0.5 block font-display text-base font-bold text-neutral-900">
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date().toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* REASON/COMPLAINT */}
            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5 print:border-neutral-300">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Keluhan Utama Pasien (Anamnesis)
              </span>
              <p className="mt-1 text-xs sm:text-sm font-medium text-neutral-800 leading-relaxed italic">
                "{keluhan || "Tidak ada catatan keluhan khusus"}"
              </p>
            </div>

            {/* TONGUE PHOTO & MEDICAL DOCUMENTS SECTION */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TONGUE PHOTO DISPLAY */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 print:bg-white print:border-neutral-300">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Foto Lidah Pasien (She Zhen / 舌诊)
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  Dokumentasi lidah untuk pemetaan sindrom Zang-Fu
                </span>

                <div className="mt-3 flex items-center gap-4">
                  {tonguePhoto ? (
                    <div className="relative shrink-0">
                      <img
                        src={tonguePhoto}
                        alt="Lidah Pasien"
                        className="h-28 w-28 rounded-lg border border-neutral-300 object-cover shadow-2xs"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-primary p-0.5 text-white shadow-xs">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white text-center text-[10px] p-2 text-neutral-400">
                      <ImageIcon className="h-5 w-5 mb-1 text-neutral-300" />
                      Belum ada foto lidah
                    </div>
                  )}
                  <div className="flex-1 text-xs text-neutral-600 leading-relaxed">
                    <p className="line-clamp-2">
                      Kondisi permukaan, warna tubuh lidah, dan selaput lidah (Taizi) mencerminkan
                      kondisi cairan dan energi organ dalam.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2 no-print">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Camera className="h-3 w-3" />
                        Kamera
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <ImageIcon className="h-3 w-3" />
                        Galeri
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* HOSPITAL DOCUMENTS DISPLAY */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 print:bg-white print:border-neutral-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                      <Paperclip className="h-3 w-3 text-primary" />
                      Lampiran Dokumen Medis &amp; Lab RS
                    </span>
                    <span className="block text-xs text-neutral-500 mt-0.5">
                      {hospitalDocs.length > 0
                        ? `${hospitalDocs.length} berkas medis terlampir`
                        : "Tidak ada dokumen medis tambahan"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => hospitalFileInputRef.current?.click()}
                    className="no-print inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="mt-3 space-y-2 pr-1">
                  {hospitalDocs.length > 0 ? (
                    hospitalDocs.map((doc) => {
                      const isImg =
                        doc.url &&
                        (doc.type.startsWith("image/") || doc.url.startsWith("data:image/"));
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white p-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isImg ? (
                              <img
                                src={doc.url}
                                alt={doc.name}
                                className="h-7 w-7 rounded object-cover border shrink-0"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div className="h-7 w-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-neutral-900 truncate text-[11px]"
                                title={doc.name}
                              >
                                {doc.name}
                              </p>
                              {doc.note && (
                                <p className="text-[10px] text-neutral-500 italic truncate">
                                  {doc.note}
                                </p>
                              )}
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            download={doc.name}
                            className="text-primary hover:text-primary-dark shrink-0 p-1 no-print"
                            title="Unduh file"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white/70 text-center text-neutral-400 p-2">
                      <FileText className="h-5 w-5 mb-1 text-neutral-300" />
                      <span className="text-[11px]">Belum ada rontgen/lab terlampir</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* HASIL PENILAIAN SKRENING & RIWAYAT PENGISIAN SOAL */}
            {(() => {
              const totalScore = Object.values(jawaban).reduce((acc, val) => acc + (val || 0), 0);
              const maxPossibleScore = (questions.length || 1) * 3;
              const pct = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
              const riskInfo =
                pct < 30
                  ? {
                      level: "Rendah",
                      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
                      advice:
                        "Kondisi vitalitas tubuh Anda secara umum berada dalam keseimbangan yang baik. Tetap pertahankan pola hidup sehat dan pola makan seimbang.",
                    }
                  : pct < 65
                    ? {
                        level: "Sedang",
                        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
                        advice:
                          "Terdapat beberapa indikasi ketidakseimbangan energi/qi. Disarankan melakukan konsultasi awal untuk menentukan terapi pendukung yang tepat.",
                      }
                    : {
                        level: "Tinggi",
                        badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
                        advice:
                          "Banyak tanda ketidakseimbangan signifikan terdeteksi. Kami menyarankan Anda menjadwalkan konsultasi mendalam dengan praktisi kami agar dapat ditangani secara dini.",
                      };

              const historyPerPage = 5;
              const totalHistoryPages = Math.ceil((questions.length || 1) / historyPerPage) || 1;
              const paginatedHistoryQuestions = questions.slice(
                (historyQuestionsPage - 1) * historyPerPage,
                historyQuestionsPage * historyPerPage,
              );

              return (
                <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs sm:p-8">
                  {/* Summary Assessment Header */}
                  <div className="text-center space-y-3 pb-6 border-b border-neutral-100">
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${riskInfo.badgeClass}`}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Tingkat Risiko: {riskInfo.level}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-neutral-900 sm:text-2xl">
                      Hasil Penilaian Skrening Mandiri Berhasil Disimpan
                    </h3>
                    <p className="mx-auto max-w-xl text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                      {riskInfo.advice}
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-200">
                      <span>
                        Total Skor: <strong className="text-primary text-sm">{totalScore}</strong>{" "}
                        dari maksimum <strong>{maxPossibleScore}</strong> ({questions.length} soal)
                      </span>
                    </div>
                  </div>

                  {/* Riwayat Pengisian Soal */}
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-display text-base font-bold text-neutral-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Riwayat Pengisian & Detail Jawaban Kuesioner
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Rincian setiap pertanyaan yang dijawab oleh pasien beserta pilihan bobot
                          skornya:
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                        {Object.keys(jawaban).length} dari {questions.length} Soal Terisi
                      </span>
                    </div>

                    {/* Question Items (Interactive Paginated for Screen) */}
                    <div className="space-y-3 pt-2 no-print">
                      {paginatedHistoryQuestions.map((q, idx) => {
                        const globalIdx = (historyQuestionsPage - 1) * historyPerPage + idx;
                        const answerVal = jawaban[q.id];
                        const answerOptions = [
                          { label: "Tidak pernah", score: 0 },
                          { label: "Kadang-kadang", score: 1 },
                          { label: "Sering", score: 2 },
                          { label: "Selalu", score: 3 },
                        ];
                        return (
                          <div
                            key={q.id}
                            className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 transition-all hover:bg-neutral-50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  Soal #{globalIdx + 1}
                                </span>
                                <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-snug">
                                  {q.questionText}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
                              {answerOptions.map((opt) => {
                                const isSelected = answerVal === opt.score;
                                return (
                                  <span
                                    key={opt.score}
                                    className={`inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                      isSelected
                                        ? "bg-primary text-white font-bold shadow-xs border border-primary"
                                        : "bg-white text-neutral-400 border border-neutral-200 opacity-60"
                                    }`}
                                  >
                                    {isSelected && <CheckCircle className="h-3 w-3" />}
                                    <span>{opt.label}</span>
                                    <span className="text-[9px] opacity-80">({opt.score} pt)</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Full Question Breakdown (For Clean PDF / Print Export) */}
                    <div className="hidden print:block print-avoid-break mt-4">
                      <table className="w-full border-collapse text-left text-[10pt]">
                        <thead>
                          <tr className="border-b-2 border-neutral-300 bg-neutral-100/70">
                            <th className="py-2 px-3 font-bold text-neutral-800 w-12 text-center">
                              No
                            </th>
                            <th className="py-2 px-3 font-bold text-neutral-800">
                              Pertanyaan Skrening
                            </th>
                            <th className="py-2 px-3 font-bold text-neutral-800 w-44 text-center">
                              Respon Pasien
                            </th>
                            <th className="py-2 px-3 font-bold text-neutral-800 w-16 text-center">
                              Skor
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {questions.map((q, qIdx) => {
                            const val = jawaban[q.id] ?? 0;
                            const label =
                              val === 0
                                ? "Tidak pernah"
                                : val === 1
                                  ? "Kadang-kadang"
                                  : val === 2
                                    ? "Sering"
                                    : "Selalu";
                            return (
                              <tr key={q.id} className={qIdx % 2 === 1 ? "bg-neutral-50/50" : ""}>
                                <td className="py-1.5 px-3 font-mono text-center font-bold text-neutral-500">
                                  {qIdx + 1}
                                </td>
                                <td className="py-1.5 px-3 text-neutral-800 font-medium leading-tight">
                                  {q.questionText}
                                </td>
                                <td className="py-1.5 px-3 text-center">
                                  <span className="inline-block px-2 py-0.5 rounded font-semibold text-[9pt] border border-neutral-300">
                                    {label}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-center font-bold text-primary">
                                  {val}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {questions.length > historyPerPage && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200 pt-4 text-xs text-neutral-500 no-print">
                        <div>
                          Menampilkan soal{" "}
                          <strong className="text-neutral-900">
                            {(historyQuestionsPage - 1) * historyPerPage + 1}
                          </strong>{" "}
                          -{" "}
                          <strong className="text-neutral-900">
                            {Math.min(historyQuestionsPage * historyPerPage, questions.length)}
                          </strong>{" "}
                          dari <strong className="text-neutral-900">{questions.length}</strong> soal
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setHistoryQuestionsPage((p) => Math.max(1, p - 1))}
                            disabled={historyQuestionsPage <= 1}
                            className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Sebelumnya
                          </button>
                          <span className="px-2 font-bold text-neutral-800">
                            {historyQuestionsPage} / {totalHistoryPages}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setHistoryQuestionsPage((p) => Math.min(totalHistoryPages, p + 1))
                            }
                            disabled={historyQuestionsPage >= totalHistoryPages}
                            className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Selanjutnya
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* AI-POWERED TCM & HERBAL REPORT (INDONESIA & CHINA) */}
            <TcmHerbalReport
              report={aiReport}
              isLoadingReport={isLoadingReport}
              onRefreshReport={() => requestAiAnalysis()}
              results={results}
              dominant={dominant}
              isAdmin={user?.role === "admin"}
              getActiveSyndromesString={getActiveSyndromesString}
              getKeluhanUtamaManifestasi={getKeluhanUtamaManifestasi}
              getTop3OrgansString={getTop3OrgansString}
              getPrimaryTherapeuticPriority={getPrimaryTherapeuticPriority}
              getTop3OrgansList={getTop3OrgansList}
              getMostInfluentialSymptoms={getMostInfluentialSymptoms}
              listCriticalImbalances={listCriticalImbalances}
            />

            {/* DISCLAIMER TEXT */}
            <div className="mt-10 border-t pt-8 text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 p-5 rounded-xl border border-neutral-200 print:bg-white print:border-neutral-300">
              <strong>Disclaimer:</strong> Hasil ini merupakan Profiling Traditional Chinese
              Medicine (TCM) berdasarkan jawaban kuesioner. Hasil ini bertujuan sebagai informasi
              awal mengenai kecenderungan kondisi tubuh menurut konsep TCM dan tidak merupakan
              diagnosis medis. Apabila memiliki keluhan kesehatan, konsultasikan dengan praktisi TCM
              atau tenaga kesehatan yang kompeten.
            </div>

            {/* SINSHE & CLINIC SIGNATURE BOX (PRINT ONLY) */}
            <div className="hidden print:block print-avoid-break mt-8 pt-4 border-t border-neutral-300">
              <div className="grid grid-cols-2 gap-8 text-center text-[10pt]">
                <div>
                  <p className="font-semibold text-neutral-600">Pasien / Wali Pasien,</p>
                  <div className="h-20 flex items-end justify-center">
                    <div className="w-48 border-b border-neutral-400"></div>
                  </div>
                  <p className="mt-2 font-bold text-neutral-900">{nama || "Pasien"}</p>
                  <p className="text-[9pt] text-neutral-500">Tanda Tangan &amp; Nama Terang</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-600">
                    Surabaya,{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[9pt] text-neutral-500 font-medium">
                    Praktisi TCM / Sinshe Pemeriksa,
                  </p>
                  <div className="h-16 flex items-center justify-center">
                    <div className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-[8pt] text-primary font-bold uppercase tracking-widest">
                      Cap Resmi Rumah Terapy
                    </div>
                  </div>
                  <div className="w-48 mx-auto border-b border-neutral-400"></div>
                  <p className="mt-2 font-bold text-neutral-900">Sinshe / Tim Terapis TCM</p>
                  <p className="text-[9pt] text-neutral-500">Rumah Terapy Ikhtiar Sehat</p>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER BUTTONS */}
            <div className="no-print mt-10 flex flex-wrap justify-center gap-4 border-t pt-8">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>
              <a
                href="https://wa.me/6281369729617"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                <Phone className="h-4 w-4" />
                Hubungi Kami
              </a>
              <Link
                to="/reservasi"
                className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-opacity"
              >
                <Calendar className="h-4 w-4" />
                Reservasi Konsultasi
              </Link>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 rounded-full bg-neutral-800 px-6 py-3 text-xs font-semibold text-white hover:bg-neutral-900 transition-all"
              >
                <Printer className="h-4 w-4" />
                Unduh PDF
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
