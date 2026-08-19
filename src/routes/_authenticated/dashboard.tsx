import { createFileRoute, Link } from "@/lib/route";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  Filter,
  Globe,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserCircle,
  Users,
  MapPin,
  X,
} from "lucide-react";
import { useAuth, useProfile, authHeaders } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  serviceOptions,
  fetchServiceOptions,
  formatPrice,
  saveReservation,
  type Reservation,
  type ServiceOption,
} from "@/lib/reservations";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Rumah Terapy Ikhtiar Sehat" },
      { name: "description", content: "Dashboard pengguna Rumah Terapy Ikhtiar Sehat." },
      { property: "og:title", content: "Dashboard — Rumah Terapy Ikhtiar Sehat" },
      { property: "og:description", content: "Dashboard pengguna Rumah Terapy Ikhtiar Sehat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

type Section =
  "overview" | "profile" | "reservations" | "screening" | "articles" | "cms" | "users" | "settings";

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const [section, setSection] = useState<Section>(() => {
    if (location.pathname === "/profile") return "profile";
    if (location.pathname === "/skrining") return "screening";
    return isAdmin ? "overview" : "screening";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/profile") setSection("profile");
    else if (location.pathname === "/skrining") setSection("screening");
  }, [location.pathname]);

  const navItems: { key: Section; label: string; icon: typeof LayoutDashboard }[] = isAdmin
    ? [
        { key: "overview", label: "Ringkasan", icon: LayoutDashboard },
        { key: "profile", label: "Profil Saya", icon: UserCircle },
        { key: "reservations", label: "Reservasi", icon: CalendarDays },
        { key: "screening", label: "Skrening", icon: Stethoscope },
        { key: "articles", label: "Artikel", icon: BookOpen },
        { key: "users", label: "Manajemen User", icon: Users },
        { key: "cms", label: "Kelola CMS", icon: Globe },
        { key: "settings", label: "Pengaturan WA", icon: Settings },
      ]
    : [
        { key: "screening", label: "Skrening", icon: Stethoscope },
        { key: "articles", label: "Artikel", icon: BookOpen },
        { key: "reservations", label: "Reservasi", icon: CalendarDays },
        { key: "profile", label: "Profil Saya", icon: UserCircle },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="flex md:hidden"
            onClick={() => setIsMobileOpen(true)}
            title="Buka Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <img
              src="/logon.png"
              alt="Logo Rumah Terapy"
              className="h-9 w-auto shrink-0 rounded-lg bg-white p-0.5 border"
            />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display text-base font-semibold text-foreground sm:text-lg">
                  Rumah Terapy
                </span>
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className={`text-[10px] sm:text-[11px] ${
                    isAdmin ? "bg-amber-600 text-white hover:bg-amber-700" : ""
                  }`}
                >
                  {isAdmin ? "Admin" : "Pasien"}
                </Badge>
              </div>
              <p className="eyebrow hidden text-[10px] text-muted-foreground sm:block">
                {isAdmin ? "Workspace Admin Klinik" : "Dashboard Ikhtiar Sehat"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-amber-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Panel Admin</span>
            </Link>
          )}

          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted md:flex"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            Website Utama
          </Link>

          <div className="hidden text-right text-xs md:block">
            <p className="font-medium text-foreground truncate max-w-[160px]">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">
              {isAdmin ? "Administrator Klinik" : "Pasien Terdaftar"}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-1.5 text-xs px-2.5 sm:px-3"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      {/* Main Container with Collapsible Sidebar */}
      <div className="relative flex flex-1">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col justify-between border-r bg-card transition-all duration-300 ease-in-out md:flex ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex flex-col p-3">
            {!isSidebarCollapsed && (
              <p className="eyebrow px-3 pt-1 pb-3 text-[11px] font-semibold tracking-wider text-muted-foreground">
                {isAdmin ? "WORKSPACE ADMIN" : "WORKSPACE PASIEN"}
              </p>
            )}
            <nav className="space-y-1.5">
              {navItems.map(({ key, label, icon: Icon }) => {
                const isActive = section === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSection(key)}
                    title={isSidebarCollapsed ? label : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t p-3 space-y-2">
            {isAdmin && (
              <Link
                to="/admin"
                title={isSidebarCollapsed ? "Panel Admin" : undefined}
                className={`flex items-center gap-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 transition-colors ${
                  isSidebarCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
                {!isSidebarCollapsed && <span>Panel Admin (/admin)</span>}
              </Link>
            )}

            <Link
              to="/"
              title={isSidebarCollapsed ? "Lihat Website Utama" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
                isSidebarCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Website Utama</span>}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
                isSidebarCollapsed ? "justify-center px-0" : ""
              }`}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span>Sembunyikan Sidebar</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-card p-4 transition-transform duration-300 ease-in-out md:hidden ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logon.png"
                alt="Logo Rumah Terapy"
                className="h-8 w-auto bg-white p-0.5 rounded-lg border"
              />
              <div>
                <span className="font-display font-semibold text-foreground text-sm">
                  Rumah Terapy
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {isAdmin ? "Workspace Admin" : "Menu Pasien"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="mt-4 flex-1 space-y-1.5">
            {navItems.map(({ key, label, icon: Icon }) => {
              const isActive = section === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSection(key);
                    setIsMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t pt-4 space-y-2">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
              >
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>Panel Admin (/admin)</span>
              </Link>
            )}
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span>Lihat Website Utama</span>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 p-3 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-xs">
                {isAdmin ? "Dashboard Administrator" : "Dashboard Pasien"}
              </p>
              <h1 className="mt-1 font-display text-xl text-foreground sm:text-2xl lg:text-3xl">
                {section === "overview"
                  ? "Ringkasan Kesehatan"
                  : section === "profile"
                    ? "Profil & Informasi Medis"
                    : section === "reservations"
                      ? isAdmin
                        ? "Kelola Semua Reservasi Pasien"
                        : "Kelola Reservasi Janji Temu"
                      : section === "screening"
                        ? isAdmin
                          ? "Kelola & Uji Soal Skrening"
                          : "Skrening Kesehatan"
                        : section === "cms"
                          ? "Kelola Konten Halaman (CMS)"
                          : section === "users"
                            ? "Manajemen Pengguna & Pasien"
                            : section === "settings"
                              ? "Pengaturan WhatsApp Klinik"
                              : "Artikel & Edukasi Kesehatan"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Selamat datang kembali,{" "}
              <span className="font-medium text-foreground">{user?.email ?? "Pengguna"}</span>
              {isAdmin && (
                <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  (Admin)
                </span>
              )}
            </p>
          </div>

          {/* Render Sections */}
          {section === "overview" && <OverviewTab onNavigate={setSection} />}
          {section === "profile" && <ProfileTab />}
          {section === "reservations" && <ReservationsTab />}
          {section === "screening" && <ScreeningTab onNavigate={setSection} />}
          {section === "articles" && <ArticlesTab />}
          {section === "cms" && <CmsTab />}
          {section === "users" && <UsersTab />}
          {section === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

function CmsTab() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [cmsPageKey, setCmsPageKey] = useState<"home" | "about">("home");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  // Fallbacks
  const homeFallback = {
    stats: [
      { value: "23", label: "Layanan" },
      { value: "13", label: "Jumlah Pasien" },
      { value: "2", label: "Terapis" },
    ],
    reasons: [
      {
        title: "Terapis Bersertifikat",
        text: "Tim praktisi kami memiliki sertifikasi resmi dan pengalaman mendalam di bidang Pengobatan Tradisional Tiongkok.",
      },
      {
        title: "Privasi Terjamin 100%",
        text: "Kami memprioritaskan kerahasiaan dan keamanan data pasien dalam setiap sesi konsultasi.",
      },
      {
        title: "Metode Terbukti",
        text: "Pendekatan holistik dan personal yang terbukti efektif mengembalikan keseimbangan tubuh dan menangani berbagai keluhan kesehatan.",
      },
    ],
    therapists: [
      { name: "Imroatus Solikhah, Amd.Akp", role: "Akupunturis" },
      {
        name: "Master Jun, S.Ud, B.Med, M.T (Biomed)",
        role: "TCM (Traditional Chinese Medicine)",
      },
    ],
    featured: [
      {
        title: "Formula Herbal",
        text: "Formula herbal personalisasi — kami memahami setiap tubuh itu unik, sehingga racikan disusun sesuai konstitusi dan akar masalah Anda.",
      },
      {
        title: "BSM & Tuina Lengkap",
        text: "Perpaduan Body Space Medicine berbasis energi dengan terapi manual Tuina untuk penyembuhan yang menyeluruh.",
      },
      {
        title: "Tuina Chuzhen Kepala",
        text: "Terapi pijat khas TCM pada area kepala untuk relaksasi mendalam, meredakan pusing, dan memperbaiki kualitas tidur.",
      },
      {
        title: "Akupunktur Face Lift 500 Jarum",
        text: "Transformasi alami tanpa operasi. Rangsangan maksimal untuk menyegarkan dan mengencangkan wajah dari dalam.",
      },
    ],
    reviews: [
      {
        quote:
          "Alhamdulillah dengan adanya TCM memberikan informasi yang akurat dan terstruktur, dan perawatan disesuaikan secara tepat dengan kondisi tubuh.",
        name: "Efendi Mohammad",
      },
      {
        quote:
          "Setelah diterapi akupunktur fullbody, badan langsung terasa enak dan ringan dibandingkan sebelumnya. Terima kasih.",
        name: "Triono Nugroho",
      },
      {
        quote: "Sangat puas dengan pelayanannya. Dan insyaAllah akan melanjutkan terapi.",
        name: "Tatik Rustin Rahayu Ningsih",
      },
    ],
    articles: [
      {
        title: "Mengenal Akupunktur: Mengembalikan Keseimbangan Energi Tubuh",
        text: "Akupunktur telah digunakan argumen ribuan tahun untuk mengatasi berbagai masalah kesehatan dengan menyeimbangkan aliran energi tubuh (Qi).",
      },
      {
        title: "Pentingnya Menjaga Kesehatan Holistik di Era Modern",
        text: "Kesehatan sejati bukan sekadar bebas dari penyakit, melainkan harmoni antara pikiran, tubuh, dan jiwa.",
      },
    ],
  };

  const aboutFallback = {
    philosophyText:
      "Kami berpegang pada diagnosa sindrom TCM — pengamatan lidah, palpasi nadi, dan wawancara mendalam — lalu menerjemahkannya menjadi rencana terapi yang terukur. Setiap racikan herbal ditakar ulang mengikuti perkembangan pasien.",
    values: [
      [
        "Keseimbangan",
        "Tubuh dipandang sebagai satu sistem. Kami mencari akar, bukan menutup gejala.",
      ],
      ["Ketenangan", "Ruang terapi dirancang hening agar tubuh masuk ke mode pemulihan."],
      ["Kejujuran", "Kami menyampaikan ekspektasi terapi apa adanya, termasuk batasannya."],
      ["Pendampingan", "Setiap pasien dievaluasi tiap sesi, bukan sekadar diberi resep."],
    ] as [string, string][],
    timeline: [
      ["2013", "Praktik pertama akupunktur dan herbal dalam skala rumahan."],
      ["2017", "Menambahkan Tuina dan konseling sebagai bagian dari protokol terapi."],
      ["2021", "Mengadopsi pendekatan BSM untuk kasus kronis dan degeneratif."],
      ["2024", "Membuka layanan audioterapi dan sistem reservasi terjadwal."],
    ] as [string, string][],
  };

  // Home arrays state
  const [stats, setStats] = useState<{ value: string; label: string }[]>([]);
  const [reasons, setReasons] = useState<{ title: string; text: string }[]>([]);
  const [therapists, setTherapists] = useState<{ name: string; role: string }[]>([]);
  const [featured, setFeatured] = useState<{ title: string; text: string }[]>([]);
  const [reviews, setReviews] = useState<{ quote: string; name: string }[]>([]);
  const [articles, setArticles] = useState<{ title: string; text: string }[]>([]);

  // About arrays state
  const [philosophyText, setPhilosophyText] = useState("");
  const [values, setValues] = useState<[string, string][]>([]);
  const [timeline, setTimeline] = useState<[string, string][]>([]);

  const [isLoadingCms, setIsLoadingCms] = useState(false);
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [cmsMessage, setCmsMessage] = useState("");

  const loadCms = async (key: "home" | "about") => {
    setIsLoadingCms(true);
    setCmsMessage("");
    try {
      const res = await fetch(`/api/cms/${key}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setHeroTitle(data.heroTitle ?? "");
        setHeroSubtitle(data.heroSubtitle ?? "");

        const parsed = JSON.parse(data.contentJson ?? "{}");
        if (key === "home") {
          setStats(parsed.stats || homeFallback.stats);
          setReasons(parsed.reasons || homeFallback.reasons);
          setTherapists(parsed.therapists || homeFallback.therapists);
          setFeatured(parsed.featured || homeFallback.featured);
          setReviews(parsed.reviews || homeFallback.reviews);
          setArticles(parsed.articles || homeFallback.articles);
        } else {
          setPhilosophyText(parsed.philosophyText || aboutFallback.philosophyText);
          setValues(parsed.values || aboutFallback.values);
          setTimeline(parsed.timeline || aboutFallback.timeline);
        }
      }
    } catch {
      setCmsMessage("Gagal memuat data CMS.");
    } finally {
      setIsLoadingCms(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadCms(cmsPageKey);
    }
  }, [isAdmin, cmsPageKey]);

  const handleSaveCms = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingCms(true);
    setCmsMessage("");

    let contentObj = {};
    if (cmsPageKey === "home") {
      contentObj = { stats, reasons, therapists, featured, reviews, articles };
    } else {
      contentObj = { philosophyText, values, timeline };
    }

    try {
      const res = await fetch(`/api/admin/cms/${cmsPageKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          title,
          description,
          heroTitle,
          heroSubtitle,
          contentJson: JSON.stringify(contentObj),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal menyimpan CMS.");
      setCmsMessage("Berhasil menyimpan perubahan halaman CMS secara live!");
    } catch (err) {
      setCmsMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSavingCms(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-xl">Kelola Konten Halaman (CMS)</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ubah judul, deskripsi, hero, dan seluruh data yang ter-hardcode secara instan dan
                live.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={cmsPageKey === "home" ? "default" : "outline"}
                size="sm"
                onClick={() => setCmsPageKey("home")}
                className="text-xs"
              >
                Halaman Home
              </Button>
              <Button
                variant={cmsPageKey === "about" ? "default" : "outline"}
                size="sm"
                onClick={() => setCmsPageKey("about")}
                className="text-xs"
              >
                Halaman About
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {cmsMessage && (
            <div
              className={`p-3 rounded-lg text-xs sm:text-sm ${
                cmsMessage.includes("Berhasil")
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {cmsMessage}
            </div>
          )}

          {isLoadingCms ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSaveCms} className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-semibold text-base capitalize text-primary">
                  Pengaturan Halaman: {cmsPageKey}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  Visual CRUD Builder
                </Badge>
              </div>

              {/* SECTION 1: METADATA & HERO */}
              <div className="space-y-4 rounded-lg bg-sand-soft p-4 border border-primary/5">
                <h5 className="font-semibold text-sm text-primary">
                  1. Informasi Utama &amp; Hero
                </h5>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="cms-title">Meta Title / Judul Browser</Label>
                    <Input
                      id="cms-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cms-desc">Meta Description / Deskripsi SEO</Label>
                    <Input
                      id="cms-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cms-herotitle">Judul Utama (Hero Title)</Label>
                  <Input
                    id="cms-herotitle"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cms-herosub">Subjudul / Deskripsi Hero</Label>
                  <Textarea
                    id="cms-herosub"
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* SECTION 2: DYNAMIC LISTS (CRUD) */}
              {cmsPageKey === "home" ? (
                <div className="space-y-6">
                  {/* HOME STATS */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">2. Statistik Klinik</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStats([...stats, { value: "0", label: "Label" }])}
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Stat
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {stats.map((s, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input
                            value={s.value}
                            onChange={(e) => {
                              const updated = [...stats];
                              updated[idx].value = e.target.value;
                              setStats(updated);
                            }}
                            placeholder="Value"
                            className="w-24 text-center font-semibold"
                          />
                          <Input
                            value={s.label}
                            onChange={(e) => {
                              const updated = [...stats];
                              updated[idx].label = e.target.value;
                              setStats(updated);
                            }}
                            placeholder="Label"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setStats(stats.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WHY CHOOSE US (REASONS) */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">3. Alasan Memilih Kami</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReasons([
                            ...reasons,
                            { title: "Alasan Baru", text: "Keterangan alasan..." },
                          ])
                        }
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Alasan
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border space-y-2">
                          <div className="flex gap-2 items-center justify-between">
                            <Input
                              value={r.title}
                              onChange={(e) => {
                                const updated = [...reasons];
                                updated[idx].title = e.target.value;
                                setReasons(updated);
                              }}
                              placeholder="Judul Alasan"
                              className="font-medium flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setReasons(reasons.filter((_, i) => i !== idx))}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={r.text}
                            onChange={(e) => {
                              const updated = [...reasons];
                              updated[idx].text = e.target.value;
                              setReasons(updated);
                            }}
                            placeholder="Deskripsi penjelasan alasan..."
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* THERAPISTS */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">4. Profil Terapis</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTherapists([
                            ...therapists,
                            { name: "Nama Terapis", role: "Spesialisasi" },
                          ])
                        }
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Terapis
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {therapists.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center bg-background p-2 rounded-md border"
                        >
                          <Input
                            value={t.name}
                            onChange={(e) => {
                              const updated = [...therapists];
                              updated[idx].name = e.target.value;
                              setTherapists(updated);
                            }}
                            placeholder="Nama Terapis"
                            className="flex-1 font-medium"
                          />
                          <Input
                            value={t.role}
                            onChange={(e) => {
                              const updated = [...therapists];
                              updated[idx].role = e.target.value;
                              setTherapists(updated);
                            }}
                            placeholder="Peran / Spesialisasi"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setTherapists(therapists.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FEATURED SERVICES */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">5. Layanan Unggulan</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFeatured([
                            ...featured,
                            { title: "Layanan Baru", text: "Penjelasan layanan..." },
                          ])
                        }
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Layanan
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {featured.map((f, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border space-y-2">
                          <div className="flex gap-2 items-center justify-between">
                            <Input
                              value={f.title}
                              onChange={(e) => {
                                const updated = [...featured];
                                updated[idx].title = e.target.value;
                                setFeatured(updated);
                              }}
                              placeholder="Nama Layanan"
                              className="font-medium flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setFeatured(featured.filter((_, i) => i !== idx))}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={f.text}
                            onChange={(e) => {
                              const updated = [...featured];
                              updated[idx].text = e.target.value;
                              setFeatured(updated);
                            }}
                            placeholder="Deskripsi detail layanan..."
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REVIEWS */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">6. Rating &amp; Ulasan</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReviews([...reviews, { quote: "Ulasan baru...", name: "Nama Klien" }])
                        }
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Ulasan
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {reviews.map((r, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border space-y-2">
                          <Textarea
                            value={r.quote}
                            onChange={(e) => {
                              const updated = [...reviews];
                              updated[idx].quote = e.target.value;
                              setReviews(updated);
                            }}
                            placeholder="Isi Ulasan / Testimoni"
                            rows={2}
                          />
                          <div className="flex gap-2 items-center justify-between">
                            <Input
                              value={r.name}
                              onChange={(e) => {
                                const updated = [...reviews];
                                updated[idx].name = e.target.value;
                                setReviews(updated);
                              }}
                              placeholder="Nama Pemberi Ulasan"
                              className="max-w-[250px]"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setReviews(reviews.filter((_, i) => i !== idx))}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ARTICLES */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">7. Artikel Terkini</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setArticles([
                            ...articles,
                            { title: "Judul Artikel", text: "Ringkasan artikel..." },
                          ])
                        }
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Artikel
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {articles.map((a, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border space-y-2">
                          <div className="flex gap-2 items-center justify-between">
                            <Input
                              value={a.title}
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[idx].title = e.target.value;
                                setArticles(updated);
                              }}
                              placeholder="Judul Artikel"
                              className="font-medium flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setArticles(articles.filter((_, i) => i !== idx))}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={a.text}
                            onChange={(e) => {
                              const updated = [...articles];
                              updated[idx].text = e.target.value;
                              setArticles(updated);
                            }}
                            placeholder="Ringkasan atau teks kutipan artikel..."
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ABOUT PHILOSOPHY */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <h5 className="font-semibold text-sm text-primary">2. Teks Filosofi Utama</h5>
                    <Textarea
                      value={philosophyText}
                      onChange={(e) => setPhilosophyText(e.target.value)}
                      placeholder="Tuliskan filosofi klinik kami secara holistik di sini..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* ABOUT VALUES */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">3. Nilai-Nilai Utama</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setValues([...values, ["Nilai Baru", "Penjelasan nilai..."]])
                        }
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Nilai
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {values.map(([valTitle, valText], idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border space-y-2">
                          <div className="flex gap-2 items-center justify-between">
                            <Input
                              value={valTitle}
                              onChange={(e) => {
                                const updated = [...values];
                                updated[idx] = [e.target.value, valText];
                                setValues(updated);
                              }}
                              placeholder="Nama Nilai (e.g. Kejujuran)"
                              className="font-medium flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setValues(values.filter((_, i) => i !== idx))}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={valText}
                            onChange={(e) => {
                              const updated = [...values];
                              updated[idx] = [valTitle, e.target.value];
                              setValues(updated);
                            }}
                            placeholder="Deskripsi nilai..."
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ABOUT TIMELINE */}
                  <div className="space-y-3 rounded-lg bg-sand-soft p-4 border border-primary/5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-primary">
                        4. Perjalanan &amp; Linimasa
                      </h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setTimeline([...timeline, ["Tahun", "Peristiwa..."]])}
                        className="text-xs gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" /> Tambah Linimasa
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {timeline.map(([timeYear, timeText], idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-start bg-background p-2 rounded-md border"
                        >
                          <Input
                            value={timeYear}
                            onChange={(e) => {
                              const updated = [...timeline];
                              updated[idx] = [e.target.value, timeText];
                              setTimeline(updated);
                            }}
                            placeholder="Tahun"
                            className="w-24 text-center font-bold"
                          />
                          <Textarea
                            value={timeText}
                            onChange={(e) => {
                              const updated = [...timeline];
                              updated[idx] = [timeYear, e.target.value];
                              setTimeline(updated);
                            }}
                            placeholder="Peristiwa penting"
                            rows={1}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setTimeline(timeline.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSavingCms} className="gap-1.5 px-6">
                  <Save className="h-4 w-4" />
                  {isSavingCms ? "Menyimpan..." : "Simpan Perubahan Live CMS"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

{
  /* Tab 1: Overview Component */
}
function OverviewTab({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-600 text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-amber-900 dark:text-amber-100 text-base">
                  Anda Masuk Sebagai Administrator Klinik
                </h3>
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                  Sebagai admin, Anda memiliki akses penuh ke Panel Admin untuk mengelola jadwal
                  reservasi seluruh pasien, mengubah status kedatangan, serta menerbitkan artikel
                  kesehatan.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" /> Buka Panel Admin
            </Link>
          </div>
        </Card>
      )}

      <Card className="border-primary/20 bg-card p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary text-xs">
              {isAdmin ? "Sesi Administrator Aktif" : "Status Akun Aktif"}
            </Badge>
            <h2 className="font-display text-xl sm:text-2xl font-medium text-foreground">
              {profile?.full_name ?? profile?.fullName ?? user?.email ?? "Pengguna Klinik"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Selamat datang di portal pelayanan Rumah Terapy Ikhtiar Sehat. Kelola jadwal terapi,
              pantau kondisi tubuh, dan baca rekomendasi kesehatan.
            </p>
          </div>
          <div className="flex flex-wrap shrink-0 gap-2 pt-2 sm:pt-0">
            <Button size="sm" onClick={() => onNavigate("reservations")}>
              <Plus className="mr-1.5 h-4 w-4" /> Buat Reservasi
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("screening")}>
              <Stethoscope className="mr-1.5 h-4 w-4" /> Tes Skrining
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card shadow-xs transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium">
              <UserCircle className="h-5 w-5 text-primary" />
              Profil Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Gender:</strong> {profile.gender ?? "-"}
                </p>
                <p>
                  <strong className="text-foreground">Usia:</strong> {profile.age} tahun
                </p>
                <p>
                  <strong className="text-foreground">TB / BB:</strong> {profile.height} cm /{" "}
                  {profile.weight} kg
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Profil belum lengkap. Lengkapi data medis Anda untuk pelayanan terbaik.
              </p>
            )}
            <button
              type="button"
              onClick={() => onNavigate("profile")}
              className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Lihat dan edit profil →
            </button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium">
              <CalendarDays className="h-5 w-5 text-primary" />
              Reservasi Terapi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Jadwalkan sesi Akupunktur, Tuina, BSM, Herbal Formula, atau Konseling secara online.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("reservations")}
              className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Kelola reservasi →
            </button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium">
              <Stethoscope className="h-5 w-5 text-primary" />
              Skrining Mandiri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kenali pola ketidakseimbangan tubuh Anda melalui 8 pertanyaan kuesioner mandiri TCM.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("screening")}
              className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Mulai tes sekarang →
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

{
  /* Tab 2: Profile Component */
}
function ProfileTab() {
  const { data: profile, isLoading, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    gender: "Laki-laki",
    age: 25,
    height: 165,
    weight: 60,
    phone: "",
    address: "",
    tongue_photo_url: "",
    referral_code: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name ?? profile.fullName ?? "",
        gender: profile.gender ?? "Laki-laki",
        age: profile.age ?? 25,
        height: profile.height ?? 165,
        weight: profile.weight ?? 60,
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        tongue_photo_url: profile.tongue_photo_url ?? profile.tonguePhotoUrl ?? "",
        referral_code: profile.referral_code ?? profile.referralCode ?? "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Gagal menyimpan profil");

      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setIsEditing(false);
      refetch();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memperbarui profil.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">Memuat data profil...</Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="font-display text-lg sm:text-xl">Profil & Data Medis</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informasi ini digunakan praktisi untuk catatan terapi Anda.
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? "Batal Edit" : "Edit Profil"}
          </Button>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                <span className="text-muted-foreground font-medium sm:font-normal">
                  Nama Lengkap
                </span>
                <span className="font-medium text-foreground">
                  {formData.full_name || "Belum diisi"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                <span className="text-muted-foreground font-medium sm:font-normal">
                  Jenis Kelamin
                </span>
                <span className="font-medium text-foreground">{formData.gender}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                <span className="text-muted-foreground font-medium sm:font-normal">Usia</span>
                <span className="font-medium text-foreground">{formData.age} tahun</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                <span className="text-muted-foreground font-medium sm:font-normal">
                  Tinggi / Berat
                </span>
                <span className="font-medium text-foreground">
                  {formData.height} cm / {formData.weight} kg
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                <span className="text-muted-foreground font-medium sm:font-normal">
                  No. HP / WhatsApp
                </span>
                <span className="font-medium text-foreground">
                  {formData.phone || "Belum diisi"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                <span className="text-muted-foreground font-medium sm:font-normal">
                  Alamat Domisili
                </span>
                <span className="font-medium text-foreground break-words">
                  {formData.address || "Belum diisi"}
                </span>
              </div>
              {formData.referral_code && (
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 border-b pb-2">
                  <span className="text-muted-foreground font-medium sm:font-normal">
                    Kode Referal
                  </span>
                  <span className="font-medium text-foreground">{formData.referral_code}</span>
                </div>
              )}
              {formData.tongue_photo_url && (
                <div className="pt-2">
                  <p className="mb-2 text-muted-foreground font-medium sm:font-normal">
                    Foto Lidah
                  </p>
                  <img
                    src={formData.tongue_photo_url}
                    alt="Foto lidah"
                    className="h-32 w-auto max-w-full rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="age">Usia (Tahun)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="height">Tinggi Badan (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight">Berat Badan (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">No. HP / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Alamat Domisili</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tongue_photo_url">URL Foto Lidah (Opsional)</Label>
                  <Input
                    id="tongue_photo_url"
                    placeholder="https://..."
                    value={formData.tongue_photo_url}
                    onChange={(e) => setFormData({ ...formData, tongue_photo_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
      <div>
        Menampilkan <span className="font-semibold text-foreground">{startItem}</span> -{" "}
        <span className="font-semibold text-foreground">{endItem}</span> dari{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> data
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Sebelumnya</span>
          </Button>

          <span className="px-2 font-medium text-foreground">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

{
  /* Tab 3: Reservations Component */
}
function ReservationsTab() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: profile } = useProfile();

  const [activeSubTab, setActiveSubTab] = useState<"list" | "services" | "new" | "check">(
    isAdmin ? "list" : "new",
  );

  const [serviceOptionsList, setServiceOptionsList] = useState<ServiceOption[]>(serviceOptions);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const data = await fetchServiceOptions();
      setServiceOptionsList(data);
      if (data.length > 0 && !form.service) {
        setForm((prev) => ({ ...prev, service: data[0].name }));
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  // Admin Service CRUD State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOption | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: 150000,
    duration: "± 60 menit",
    description: "",
  });
  const [serviceFormError, setServiceFormError] = useState("");
  const [isSavingService, setIsSavingService] = useState(false);

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceForm({ name: "", price: 150000, duration: "± 60 menit", description: "" });
    setServiceFormError("");
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (srv: ServiceOption) => {
    setEditingService(srv);
    setServiceForm({
      name: srv.name,
      price: srv.price,
      duration: srv.duration,
      description: srv.description,
    });
    setServiceFormError("");
    setIsServiceModalOpen(true);
  };

  const handleSaveServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingService(true);
    setServiceFormError("");
    try {
      const url = editingService?.id
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services";
      const method = editingService?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(serviceForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal menyimpan layanan.");
      setIsServiceModalOpen(false);
      await loadServices();
    } catch (err) {
      setServiceFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id?: string, name?: string) => {
    if (!id) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal menghapus layanan.");
      await loadServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus layanan.");
    }
  };

  const [form, setForm] = useState({
    name: profile?.full_name ?? profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    service: serviceOptions[0].name,
    date: "",
    time: "09:00",
    note: "",
  });

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || profile.full_name || profile.fullName || "",
        phone: prev.phone || profile.phone || "",
      }));
    }
  }, [profile]);

  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [searchCode, setSearchCode] = useState("");
  const [foundReservation, setFoundReservation] = useState<Reservation | null | undefined>(
    undefined,
  );
  const [isSearching, setIsSearching] = useState(false);

  // Admin Reservations State
  const [adminReservations, setAdminReservations] = useState<Reservation[]>([]);
  const [isLoadingAdminRes, setIsLoadingAdminRes] = useState(false);
  const [adminResError, setAdminResError] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("Semua");
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);

  const fetchAdminReservations = async () => {
    if (!isAdmin) return;
    setIsLoadingAdminRes(true);
    setAdminResError("");
    try {
      const res = await fetch("/api/admin/reservations", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Gagal memuat data reservasi.");
      const data = await res.json();
      setAdminReservations(data);
    } catch (err) {
      setAdminResError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setIsLoadingAdminRes(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void fetchAdminReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    reservationItem: Reservation,
  ) => {
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          ...reservationItem,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status reservasi.");
      await fetchAdminReservations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengupdate status.");
    }
  };

  const handleDeleteReservation = async (id: string, code: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus reservasi dengan kode ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Gagal menghapus reservasi.");
      await fetchAdminReservations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus reservasi.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await saveReservation(form);
      setCreatedReservation(res);
      if (isAdmin) {
        void fetchAdminReservations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan reservasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`/api/reservations?query=${encodeURIComponent(searchCode)}`);
      if (response.ok) {
        const data = await response.json();
        setFoundReservation(data ?? null);
      } else {
        setFoundReservation(null);
      }
    } catch {
      setFoundReservation(null);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredAdminReservations = adminReservations.filter((item) => {
    const matchesStatus = adminStatusFilter === "Semua" || item.status === adminStatusFilter;
    const matchesQuery =
      adminSearch.trim() === "" ||
      [item.code, item.name, item.phone, item.service, item.note ?? ""].some((val) =>
        val.toLowerCase().includes(adminSearch.toLowerCase()),
      );
    return matchesStatus && matchesQuery;
  });

  const totalAdminPages = Math.ceil(filteredAdminReservations.length / 10) || 1;
  const paginatedAdminReservations = filteredAdminReservations.slice(
    (adminCurrentPage - 1) * 10,
    adminCurrentPage * 10,
  );

  const getStatusBadge = (status: string) => {
    if (status === "Terkonfirmasi") {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Terkonfirmasi</Badge>
      );
    }
    if (status === "Selesai") {
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Selesai</Badge>;
    }
    if (status === "Dibatalkan") {
      return <Badge variant="destructive">Dibatalkan</Badge>;
    }
    return (
      <Badge
        variant="secondary"
        className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      >
        Menunggu Konfirmasi
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button
              variant={activeSubTab === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSubTab("list")}
              className="text-xs sm:text-sm gap-1.5"
            >
              <CalendarDays className="h-4 w-4" />
              Daftar Reservasi Pasien ({adminReservations.length})
            </Button>
          )}
          {isAdmin && (
            <Button
              variant={activeSubTab === "services" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSubTab("services")}
              className="text-xs sm:text-sm gap-1.5"
            >
              <Stethoscope className="h-4 w-4" />
              Kelola Layanan ({serviceOptionsList.length})
            </Button>
          )}
          {!isAdmin && (
            <Button
              variant={activeSubTab === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSubTab("new")}
              className="text-xs sm:text-sm gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Buat Reservasi Baru
            </Button>
          )}
          <Button
            variant={activeSubTab === "check" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSubTab("check")}
            className="text-xs sm:text-sm gap-1.5"
          >
            <Search className="h-4 w-4" />
            Cek Kode Reservasi
          </Button>
        </div>

        {isAdmin && activeSubTab === "list" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void fetchAdminReservations()}
            disabled={isLoadingAdminRes}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAdminRes ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>
        )}
      </div>

      {/* SUB-TAB: KELOLA LAYANAN (ADMIN) */}
      {isAdmin && activeSubTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Kelola Layanan Terapi</h3>
              <p className="text-xs text-muted-foreground">
                Tambah, edit, atau hapus layanan yang tersedia untuk reservasi pasien.
              </p>
            </div>
            <Button size="sm" onClick={openAddServiceModal} className="gap-1.5 text-xs sm:text-sm">
              <Plus className="h-4 w-4" /> Tambah Layanan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceOptionsList.map((srv) => (
              <Card
                key={srv.id ?? srv.name}
                className="bg-card shadow-xs flex flex-col justify-between"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-semibold text-base sm:text-lg text-foreground">
                        {srv.name}
                      </h4>
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {formatPrice(srv.price)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {srv.duration}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {srv.description}
                  </p>
                </CardContent>
                <div className="border-t px-4 py-3 bg-muted/20 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditServiceModal(srv)}
                    className="text-xs gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDeleteService(srv.id, srv.name)}
                    className="text-xs text-destructive hover:bg-destructive/10 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Service Add/Edit Modal with hidden scrollbar */}
          <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">
                  {editingService ? "Edit Layanan Terapi" : "Tambah Layanan Terapi Baru"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Lengkapi informasi layanan, harga, durasi, dan deskripsi singkat.
                </DialogDescription>
              </DialogHeader>

              {serviceFormError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
                  {serviceFormError}
                </div>
              )}

              <form onSubmit={handleSaveServiceSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="srv-name">Nama Layanan</Label>
                  <Input
                    id="srv-name"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="Contoh: Akupunktur"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="srv-price">Harga (Rp)</Label>
                    <Input
                      id="srv-price"
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, price: Number(e.target.value) })
                      }
                      placeholder="150000"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="srv-duration">Estimasi Durasi</Label>
                    <Input
                      id="srv-duration"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      placeholder="± 60 menit"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-desc">Deskripsi Layanan</Label>
                  <Textarea
                    id="srv-desc"
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, description: e.target.value })
                    }
                    placeholder="Penusukan titik meridian untuk meredakan nyeri..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsServiceModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSavingService}>
                    {isSavingService ? "Menyimpan..." : "Simpan Layanan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* SUB-TAB 1: ADMIN RESERVATIONS LIST */}
      {isAdmin && activeSubTab === "list" && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 sm:p-4 bg-card shadow-xs">
              <p className="text-xs font-medium text-muted-foreground">Total Reservasi</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1">
                {adminReservations.length}
              </p>
            </Card>
            <Card className="p-3 sm:p-4 bg-amber-500/5 border-amber-500/20 shadow-xs">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Menunggu</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-amber-800 dark:text-amber-200 mt-1">
                {
                  adminReservations.filter((r) => r.status === "Menunggu Konfirmasi" || !r.status)
                    .length
                }
              </p>
            </Card>
            <Card className="p-3 sm:p-4 bg-emerald-500/5 border-emerald-500/20 shadow-xs">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Terkonfirmasi
              </p>
              <p className="text-xl sm:text-2xl font-bold font-display text-emerald-800 dark:text-emerald-200 mt-1">
                {adminReservations.filter((r) => r.status === "Terkonfirmasi").length}
              </p>
            </Card>
            <Card className="p-3 sm:p-4 bg-blue-500/5 border-blue-500/20 shadow-xs">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Selesai</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-blue-800 dark:text-blue-200 mt-1">
                {adminReservations.filter((r) => r.status === "Selesai").length}
              </p>
            </Card>
          </div>

          {/* Filters Bar */}
          <Card className="bg-card p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode, nama pasien, no. HP, atau layanan..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="Terkonfirmasi">Terkonfirmasi</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Reservations List */}
          {isLoadingAdminRes ? (
            <Card className="p-8 text-center bg-card">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Memuat daftar reservasi pasien...
              </p>
            </Card>
          ) : adminResError ? (
            <Card className="p-6 text-center bg-destructive/10 text-destructive">
              <p className="text-sm font-medium">{adminResError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchAdminReservations()}
                className="mt-3"
              >
                Coba Lagi
              </Button>
            </Card>
          ) : filteredAdminReservations.length === 0 ? (
            <Card className="p-8 text-center bg-card">
              <p className="text-sm font-medium text-foreground">
                Tidak ada reservasi yang ditemukan.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coba ubah kata kunci pencarian atau filter status.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginatedAdminReservations.map((item) => (
                <Card
                  key={item.id}
                  className="bg-card shadow-xs transition-all hover:border-primary/40"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm sm:text-base font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                            {item.code}
                          </span>
                          {getStatusBadge(item.status)}
                          <span className="text-[11px] text-muted-foreground ml-auto md:ml-0">
                            Dibuat:{" "}
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm pt-1">
                          <div className="flex items-center gap-2 text-foreground font-medium">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-emerald-600 dark:text-emerald-400 font-mono"
                            >
                              {item.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {item.date} ({item.time} WIB)
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-foreground bg-muted/40 p-2.5 rounded-md mt-2">
                          <p className="font-medium text-muted-foreground mb-0.5">
                            Layanan Terapi:
                          </p>
                          <p className="font-semibold text-primary">{item.service}</p>
                          {item.note && (
                            <p className="mt-1 text-muted-foreground italic border-t pt-1">
                              "{item.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <Label
                            htmlFor={`status-${item.id}`}
                            className="text-xs text-muted-foreground hidden lg:inline"
                          >
                            Status:
                          </Label>
                          <select
                            id={`status-${item.id}`}
                            value={item.status}
                            onChange={(e) => void handleUpdateStatus(item.id, e.target.value, item)}
                            className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                            <option value="Terkonfirmasi">Terkonfirmasi</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                          </select>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDeleteReservation(item.id, item.code)}
                          className="text-xs text-destructive hover:bg-destructive/10 gap-1 ml-auto md:ml-0"
                          title="Hapus Reservasi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <PaginationControls
                currentPage={adminCurrentPage}
                totalPages={totalAdminPages}
                totalItems={filteredAdminReservations.length}
                itemsPerPage={10}
                onPageChange={setAdminCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: NEW RESERVATION FORM */}
      {activeSubTab === "new" &&
        (createdReservation ? (
          <Card className="bg-card p-4 sm:p-6 shadow-xs">
            <div className="text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold">
                Reservasi Berhasil Dibuat!
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Simpan Kode Reservasi Anda untuk ditunjukkan saat kedatangan:
              </p>
              <div className="mx-auto max-w-xs rounded-xl bg-primary/10 py-3 text-center font-mono text-xl sm:text-2xl font-bold tracking-wider text-primary">
                {createdReservation.code}
              </div>
              <div className="mt-4 rounded-lg border p-3 sm:p-4 text-left text-xs sm:text-sm space-y-1.5 break-words">
                <p>
                  <strong>Nama:</strong> {createdReservation.name}
                </p>
                <p>
                  <strong>Layanan:</strong> {createdReservation.service}
                </p>
                <p>
                  <strong>Jadwal:</strong> {createdReservation.date} pukul {createdReservation.time}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge variant="secondary">{createdReservation.status}</Badge>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedReservation(null);
                  setForm({
                    name: profile?.full_name ?? "",
                    phone: profile?.phone ?? "",
                    service: serviceOptions[0].name,
                    date: "",
                    time: "09:00",
                    note: "",
                  });
                }}
              >
                Buat Reservasi Lain
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="font-display text-lg sm:text-xl">
                Formulir Reservasi Terapi
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Pilih layanan dan waktu janji temu yang paling sesuai dengan kebutuhan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="res-name">Nama Pasien</Label>
                    <Input
                      id="res-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="res-phone">No. HP / WhatsApp</Label>
                    <Input
                      id="res-phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="res-service">Pilih Layanan Terapi</Label>
                    <select
                      id="res-service"
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                    >
                      {serviceOptionsList.map((opt) => (
                        <option key={opt.id ?? opt.name} value={opt.name}>
                          {opt.name} ({formatPrice(opt.price)} — {opt.duration})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="res-date">Tanggal Kedatangan</Label>
                    <Input
                      id="res-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="res-time">Jam Sesi (Kustom)</Label>
                    <Input
                      id="res-time"
                      placeholder="Contoh: 09:30, 14:00, atau Sore"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="res-note">Keluhan Utama / Catatan (Opsional)</Label>
                    <Textarea
                      id="res-note"
                      rows={3}
                      placeholder="Contoh: Nyeri leher kaku, susah tidur, pencernaan kembung..."
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Memproses..." : "Konfirmasi Reservasi"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}

      {/* SUB-TAB 3: CHECK RESERVATION CODE */}
      {activeSubTab === "check" && (
        <Card className="bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="font-display text-lg sm:text-xl">
              Cek Status Kode Reservasi
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Masukkan kode unik reservasi (misal: RIS-1A2B3C) atau nomor telepon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Masukkan kode reservasi atau nomor telepon..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching} className="gap-1.5 shrink-0">
                <Search className="h-4 w-4" /> Cari
              </Button>
            </form>

            {foundReservation === null && (
              <div className="rounded-lg bg-amber-500/10 p-4 text-center text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                Kode reservasi tidak ditemukan. Pastikan huruf dan angka dimasukkan dengan benar.
              </div>
            )}

            {foundReservation && (
              <div className="rounded-lg border p-4 space-y-2 text-xs sm:text-sm break-words">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-primary">
                    {foundReservation.code}
                  </span>
                  {getStatusBadge(foundReservation.status)}
                </div>
                <p>
                  <strong>Nama:</strong> {foundReservation.name}
                </p>
                <p>
                  <strong>No. HP:</strong> {foundReservation.phone}
                </p>
                <p>
                  <strong>Layanan:</strong> {foundReservation.service}
                </p>
                <p>
                  <strong>Jadwal:</strong> {foundReservation.date} ({foundReservation.time} WIB)
                </p>
                {foundReservation.note && (
                  <p>
                    <strong>Catatan:</strong> {foundReservation.note}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

{
  /* Tab 4: Screening Component */
}
interface ScreeningQuestion {
  id: string;
  questionText: string;
  sortOrder: number;
}

interface ScreeningResultHistory {
  id: string;
  userId: string;
  answers: string;
  score: number;
  maxScore: number;
  level: string;
  advice: string;
  createdAt: string;
}

function ScreeningTab({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [adminModeTab, setAdminModeTab] = useState<"manage" | "test">("manage");

  // State for adding new question
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const [screeningCurrentPage, setScreeningCurrentPage] = useState(1);
  const totalScreeningPages = Math.ceil(questions.length / 10) || 1;
  const paginatedQuestions = questions.slice(
    (screeningCurrentPage - 1) * 10,
    screeningCurrentPage * 10,
  );

  // Patient answers
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Profile data and global WhatsApp settings
  const { data: profile } = useProfile();
  const [waSettings, setWaSettings] = useState<{
    whatsappNumber: string;
    whatsappMessageTemplate: string;
    whatsappFreeConsultationTemplate?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setWaSettings(data))
      .catch((err) => console.error("Gagal memuat pengaturan WA:", err));
  }, []);

  // Patient screening history & loading states
  const [patientTab, setPatientTab] = useState<"new" | "history">("new");
  const [history, setHistory] = useState<ScreeningResultHistory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ScreeningResultHistory | null>(
    null,
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (isAdmin) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/profile/screening-results", {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat skrining:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      void fetchHistory();
    }
  }, [isAdmin]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/screening/questions");
      if (!res.ok) throw new Error("Gagal memuat daftar soal skrening.");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat soal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchQuestions();
  }, []);

  const handleAddQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/screening/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          questionText: newQuestionText.trim(),
          sortOrder: questions.length + 1,
        }),
      });
      if (!res.ok) throw new Error("Gagal menambah soal.");
      setNewQuestionText("");
      await fetchQuestions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambah soal.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`/api/admin/screening/questions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          questionText: editingText.trim(),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan soal.");
      setEditingId(null);
      setEditingText("");
      await fetchQuestions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengedit soal.");
    }
  };

  const handleDeleteQuestion = async (id: string, text: string) => {
    if (!window.confirm(`Hapus soal ini?\n"${text}"`)) return;
    try {
      const res = await fetch(`/api/admin/screening/questions/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Gagal menghapus soal.");
      await fetchQuestions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus soal.");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const currentQ = questions[index];
    const targetQ = questions[targetIdx];

    try {
      await Promise.all([
        fetch(`/api/admin/screening/questions/${currentQ.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ questionText: currentQ.questionText, sortOrder: targetIdx + 1 }),
        }),
        fetch(`/api/admin/screening/questions/${targetQ.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ questionText: targetQ.questionText, sortOrder: index + 1 }),
        }),
      ]);
      await fetchQuestions();
    } catch (err) {
      console.error("Gagal mengubah urutan:", err);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = questions.length > 0 && answeredCount === questions.length;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxPossibleScore = questions.length * 3;
  const scoreRatio = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

  const getResult = () => {
    if (scoreRatio <= 0.2)
      return {
        level: "Rendah",
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
        advice:
          "Kondisi tubuh Anda relatif seimbang. Pertahankan pola hidup sehat, nutrisi seimbang, dan istirahat teratur.",
      };
    if (scoreRatio <= 0.55)
      return {
        level: "Sedang",
        color: "bg-amber-500/10 text-amber-700 border-amber-500/30",
        advice:
          "Terdapat beberapa indikasi ketidakseimbangan energi/qi. Disarankan melakukan konsultasi awal untuk menentukan terapi pendukung yang tepat.",
      };
    return {
      level: "Tinggi",
      color: "bg-rose-500/10 text-rose-700 border-rose-500/30",
      advice:
        "Banyak tanda ketidakseimbangan signifikan terdeteksi. Kami menyarankan Anda menjadwalkan konsultasi mendalam dengan praktisi kami agar dapat ditangani secara dini.",
    };
  };

  const getWhatsAppUrlForPatient = () => {
    if (!profile?.phone) return null;
    let template =
      waSettings?.whatsappMessageTemplate ||
      "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat";

    const resultPayload = {
      nama: profile?.fullName || user?.email.split("@")[0] || "Pasien",
      usia: profile?.age || 25,
      kelamin: profile?.gender === "Perempuan" ? "P" : "L",
      tinggi: profile?.height || 165,
      berat: profile?.weight || 60,
      keluhan: profile?.address || "",
      tonguePhoto: profile?.tonguePhotoUrl || "",
      answers: answers,
    };
    const encodedPayload = btoa(encodeURIComponent(JSON.stringify(resultPayload)));
    const reportUrl = `${window.location.origin}/skrining?resultData=${encodedPayload}`;
    const name = profile?.fullName || user?.email.split("@")[0] || "Pasien";

    template = template.replace("[nama]", name);
    template = template.replace("[link]", reportUrl);

    let cleaned = profile.phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }

    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(template)}`;
  };

  const getWhatsAppUrlForClinic = () => {
    const waNum = waSettings?.whatsappNumber || "6281369729617";
    let template =
      "Halo Rumah Terapy Ikhtiar Sehat,\n\nSaya telah menyelesaikan skrining mandiri TCM di website dengan hasil:\nTingkat Risiko: [level]\nSkor: [skor]/[maxSkor]\n\nLink hasil skrining saya:\n[link]";

    const resultPayload = {
      nama: profile?.fullName || user?.email.split("@")[0] || "Pasien",
      usia: profile?.age || 25,
      kelamin: profile?.gender === "Perempuan" ? "P" : "L",
      tinggi: profile?.height || 165,
      berat: profile?.weight || 60,
      keluhan: profile?.address || "",
      tonguePhoto: profile?.tonguePhotoUrl || "",
      answers: answers,
    };
    const encodedPayload = btoa(encodeURIComponent(JSON.stringify(resultPayload)));
    const reportUrl = `${window.location.origin}/skrining?resultData=${encodedPayload}`;
    const scoreText = `${totalScore}`;
    const maxScoreText = `${maxPossibleScore}`;
    const levelText = getResult().level;

    template = template.replace("[level]", levelText);
    template = template.replace("[skor]", scoreText);
    template = template.replace("[maxSkor]", maxScoreText);
    template = template.replace("[link]", reportUrl);

    return `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(template)}`;
  };

  const handleSaveScreening = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/screening-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          answers: answers,
          score: totalScore,
          maxScore: maxPossibleScore,
          level: getResult().level,
          advice: getResult().advice,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan hasil skrening.");
      }

      setIsSubmitted(true);
      void fetchHistory();

      // Automatically open the WhatsApp share link for the patient in a new tab
      const waUrl = getWhatsAppUrlForPatient();
      if (waUrl) {
        window.open(waUrl, "_blank");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Patient Tab Switcher */}
      {!isAdmin && (
        <div className="flex items-center gap-2 border-b pb-3">
          <Button
            variant={patientTab === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setPatientTab("new");
              setIsSubmitted(false);
              setAnswers({});
            }}
            className="text-xs sm:text-sm gap-1.5"
          >
            <Stethoscope className="h-4 w-4" />
            Isi Skrening Baru
          </Button>
          <Button
            variant={patientTab === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setPatientTab("history");
              setSelectedHistoryItem(null);
              void fetchHistory();
            }}
            className="text-xs sm:text-sm gap-1.5"
          >
            <History className="h-4 w-4" />
            Riwayat Skrening Saya ({history.length})
          </Button>
        </div>
      )}
      {/* Admin Mode Sub-Navigation Header */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={adminModeTab === "manage" ? "default" : "outline"}
              size="sm"
              onClick={() => setAdminModeTab("manage")}
              className="text-xs sm:text-sm gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Kelola Soal Skrening ({questions.length})
            </Button>
            <Button
              variant={adminModeTab === "test" ? "default" : "outline"}
              size="sm"
              onClick={() => setAdminModeTab("test")}
              className="text-xs sm:text-sm gap-1.5"
            >
              <Stethoscope className="h-4 w-4" />
              Uji Coba Tampilan Pasien
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void fetchQuestions()}
            disabled={isLoading}
            className="text-xs text-muted-foreground gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <Card className="p-8 text-center bg-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-xs sm:text-sm text-muted-foreground">Memuat soal skrening...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 text-center bg-destructive/10 text-destructive">
          <p className="text-sm font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchQuestions()}
            className="mt-3"
          >
            Coba Lagi
          </Button>
        </Card>
      ) : isAdmin && adminModeTab === "manage" ? (
        /* ADMIN MANAGEMENT PANEL */
        <div className="space-y-6">
          {/* Add Question Card */}
          <Card className="bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base sm:text-lg flex items-center justify-between">
                <span>Tambah Soal Skrening Baru</span>
                <Badge variant="secondary" className="font-mono text-xs font-normal">
                  Total: {questions.length} Soal
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Admin dapat menentukan pertanyaan skrening sesuai kebutuhan analisis kesehatan
                pasien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => void handleAddQuestion(e)}
                className="flex flex-col sm:flex-row gap-2"
              >
                <Input
                  placeholder="Ketikkan teks pertanyaan baru di sini..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 text-xs sm:text-sm"
                  disabled={isAdding}
                />
                <Button
                  type="submit"
                  disabled={isAdding || !newQuestionText.trim()}
                  size="sm"
                  className="gap-1.5 shrink-0"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Tambah Soal
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List of Questions for Admin */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1">
              Daftar Pertanyaan Saat Ini:
            </h3>
            {questions.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-xs sm:text-sm">
                Belum ada pertanyaan skrening. Silakan tambahkan pertanyaan di atas.
              </Card>
            ) : (
              questions.map((q, idx) => (
                <Card
                  key={q.id}
                  className="bg-card shadow-xs border transition-all hover:border-primary/40"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {editingId === q.id ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 text-xs sm:text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => void handleSaveEdit(q.id)}
                            className="gap-1 text-xs"
                          >
                            <Save className="h-3.5 w-3.5" /> Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingText("");
                            }}
                            className="text-xs"
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="font-mono text-xs sm:text-sm font-bold text-primary bg-primary/10 rounded-md px-2 py-1 shrink-0">
                            #{idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-foreground font-medium pt-0.5 leading-relaxed break-words">
                            {q.questionText}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleMoveOrder(idx, "up")}
                            disabled={idx === 0}
                            title="Naikkan Urutan"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleMoveOrder(idx, "down")}
                            disabled={idx === questions.length - 1}
                            title="Turunkan Urutan"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(q.id);
                              setEditingText(q.questionText);
                            }}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDeleteQuestion(q.id, q.questionText)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Hapus
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : !isAdmin && patientTab === "history" ? (
        /* PATIENT HISTORY VIEW */
        selectedHistoryItem ? (
          /* DETAILED VIEW OF SPECIFIC HISTORY ATTEMPT */
          <Card className="bg-card p-5 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHistoryItem(null)}
                className="gap-1.5 text-xs sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Kembali ke Riwayat
              </Button>
              <span className="text-xs text-muted-foreground">
                {new Date(selectedHistoryItem.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="text-center space-y-4">
              <Badge
                className={`px-3 py-1 text-xs border ${
                  selectedHistoryItem.level === "Rendah"
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                    : selectedHistoryItem.level === "Sedang"
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                }`}
              >
                Tingkat Risiko: {selectedHistoryItem.level}
              </Badge>
              <h3 className="font-display text-xl sm:text-2xl font-semibold">
                Hasil Penilaian Skrening Mandiri
              </h3>
              <p className="mx-auto max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedHistoryItem.advice}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Skor: <strong>{selectedHistoryItem.score}</strong> dari maksimum{" "}
                <strong>{selectedHistoryItem.maxScore}</strong>
              </p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h4 className="text-sm font-medium text-foreground">Detail Jawaban Anda:</h4>
              <div className="space-y-3">
                {questions.map((q, qidx) => {
                  let answerVal: number | null = null;
                  try {
                    const parsedAnswers =
                      typeof selectedHistoryItem.answers === "string"
                        ? JSON.parse(selectedHistoryItem.answers)
                        : selectedHistoryItem.answers;
                    answerVal = parsedAnswers[q.id] ?? null;
                  } catch (e) {
                    console.error("Error parsing answers:", e);
                  }

                  const labels = ["Tidak pernah", "Kadang", "Sering", "Selalu"];
                  const answerLabel = answerVal !== null ? labels[answerVal] : "Tidak dijawab";

                  return (
                    <div
                      key={q.id}
                      className="p-3 bg-muted/40 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <div className="space-y-1">
                        <span className="font-semibold text-primary">Pertanyaan #{qidx + 1}</span>
                        <p className="text-foreground">{q.questionText}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 self-start sm:self-center bg-background border-primary/30 text-primary"
                      >
                        {answerLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ) : (
          /* HISTORY LIST */
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Riwayat Penilaian Kesehatan TCM</h3>
            {isLoadingHistory ? (
              <Card className="p-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Memuat riwayat skrening...</p>
              </Card>
            ) : history.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <History className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm font-medium text-foreground">Belum ada riwayat skrening.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Silakan pilih tab "Isi Skrening Baru" di atas untuk melakukan skrening pertama
                  Anda.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-card border hover:border-primary/40 transition-colors"
                  >
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <Badge
                            className={`px-2 py-0 text-[10px] border ${
                              item.level === "Rendah"
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                : item.level === "Sedang"
                                  ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                            }`}
                          >
                            Risiko: {item.level}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                          {item.advice}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Skor: <strong>{item.score}</strong> / {item.maxScore}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedHistoryItem(item)}
                        className="shrink-0"
                      >
                        Lihat Detail
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      ) : /* PATIENT / TEST VIEW (NEW ATTEMPT) */
      !isSubmitted ? (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="p-8 text-center bg-card">
              <p className="text-sm font-medium text-foreground">
                Belum ada pertanyaan skrening yang tersedia.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Admin dapat menambah pertanyaan dari menu pengelolaan.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {paginatedQuestions.map((q, idx) => {
                const globalIdx = (screeningCurrentPage - 1) * 10 + idx;
                return (
                  <Card key={q.id} className="bg-card shadow-xs">
                    <CardContent className="p-3.5 sm:p-5">
                      <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                        {globalIdx + 1}. {q.questionText}
                      </p>
                      <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        {[
                          ["Tidak pernah", 0],
                          ["Kadang", 1],
                          ["Sering", 2],
                          ["Selalu", 3],
                        ].map(([label, val]) => {
                          const active = answers[q.id] === val;
                          return (
                            <button
                              key={label as string}
                              type="button"
                              onClick={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: val as number }))
                              }
                              className={`rounded-full px-3 py-1.5 text-center text-xs transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground shadow-xs font-medium"
                                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                              }`}
                            >
                              {label as string}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <PaginationControls
                currentPage={screeningCurrentPage}
                totalPages={totalScreeningPages}
                totalItems={questions.length}
                itemsPerPage={10}
                onPageChange={setScreeningCurrentPage}
              />
            </div>
          )}

          {questions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-muted-foreground">
                {answeredCount} dari {questions.length} pertanyaan dijawab
              </span>
              <Button
                disabled={!isComplete || isSaving}
                onClick={handleSaveScreening}
                className="w-full sm:w-auto gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan & Lihat Hasil
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-card p-5 sm:p-8 shadow-xs text-center space-y-4">
          <Badge className={`px-3 py-1 text-xs border ${getResult().color}`}>
            Tingkat Risiko: {getResult().level}
          </Badge>
          <h2 className="font-display text-xl sm:text-2xl font-semibold">
            Hasil Penilaian Skrening Mandiri Berhasil Disimpan
          </h2>
          <p className="mx-auto max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {getResult().advice}
          </p>
          <p className="text-xs text-muted-foreground">
            Total Skor: <strong>{totalScore}</strong> dari maksimum{" "}
            <strong>{maxPossibleScore}</strong> ({questions.length} soal)
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button onClick={() => onNavigate("reservations")}>
              <CalendarDays className="mr-1.5 h-4 w-4" /> Jadwalkan Konsultasi
            </Button>
            {profile?.phone && (
              <a
                href={getWhatsAppUrlForPatient() || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                <Phone className="mr-1 h-4 w-4" /> Kirim Hasil ke WhatsApp Saya
              </a>
            )}
            <a
              href={getWhatsAppUrlForClinic() || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-teal-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              <Phone className="mr-1 h-4 w-4" /> Kirim Hasil ke WhatsApp Klinik
            </a>
            <Button
              variant="outline"
              onClick={() => {
                setAnswers({});
                setIsSubmitted(false);
              }}
            >
              Ulangi Skrening
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

{
  /* Tab 5: Articles Component */
}
interface ArticleItem {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt?: string;
}

const defaultArticles: ArticleItem[] = [
  {
    id: "a1",
    category: "Akupunktur",
    title: "Apa yang terjadi saat jarum akupunktur merangsang titik meridian?",
    excerpt:
      "Penjelasan ilmiah sederhana tentang titik meridian, merangsang sistem saraf lokal, dan memicu pelepasan endorfin.",
    content:
      "Akupunktur bekerja dengan menstimulasi titik-titik spesifik di sepanjang meridian tubuh. Stimulasi jarum steril merangsang serabut saraf periferal yang mengirimkan sinyal ke otak dan sumsum tulang belakang, memicu pelepasan neurotransmiter serta hormon alami penawar nyeri.",
  },
  {
    id: "a2",
    category: "Herbal Formula",
    title: "Mengapa racikan herbal TCM selalu disesuaikan dengan sindrom pribadi?",
    excerpt:
      "Prinsip individualisasi herbal berdasarkan pola Yin-Yang dan kondisi organ tubuh pasien.",
    content:
      "Berbeda dengan pengobatan sintetis tunggal, racikan herbal TCM disusun sebagai suatu kesatuan formula yang saling melengkapi (Jun, Chen, Zuo, Shi) untuk memulihkan keseimbangan tanpa memicu efek samping berlebih.",
  },
  {
    id: "a3",
    category: "Gaya Hidup",
    title: "Ritme harian jam organ tubuh dan dampaknya pada istirahat",
    excerpt: "Bagaimana menyesuaikan jadwal makan dan tidur sesuai dengan jam puncak kerja organ.",
    content:
      "Dalam siklus organ TCM, jam 23.00–03.00 adalah waktu pemulihan kantung empedu dan hati. Tidur nyenyak pada rentang waktu ini sangat penting untuk proses regenerasi darah dan detoksifikasi seluler.",
  },
];

function ArticlesTab() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [articlesList, setArticlesList] = useState<ArticleItem[]>(defaultArticles);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [articleCurrentPage, setArticleCurrentPage] = useState(1);

  // Admin CRUD states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [formCategory, setFormCategory] = useState("Akupunktur");
  const [formTitle, setFormTitle] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error("Gagal memuat artikel.");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setArticlesList(
          data.map(
            (item: {
              id: string;
              category: string;
              title: string;
              excerpt: string;
              content: string;
              publishedAt: string;
            }) => ({
              id: item.id,
              category: item.category,
              title: item.title,
              excerpt: item.excerpt,
              content: item.content,
              publishedAt: item.publishedAt,
            }),
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat artikel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchArticles();
  }, []);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormCategory("Akupunktur");
    setFormTitle("");
    setFormExcerpt("");
    setFormContent("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (art: ArticleItem) => {
    setEditingArticle(art);
    setFormCategory(art.category);
    setFormTitle(art.title);
    setFormExcerpt(art.excerpt);
    setFormContent(art.content);
    setIsFormOpen(true);
  };

  const handleSaveArticle = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim() || !formContent.trim()) {
      alert("Semua field wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : "/api/admin/articles";
      const method = editingArticle ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          category: formCategory.trim(),
          title: formTitle.trim(),
          excerpt: formExcerpt.trim(),
          content: formContent.trim(),
          readTime: "5 menit",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal menyimpan artikel.");
      }

      setIsFormOpen(false);
      await fetchArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error("Gagal menghapus artikel.");
      await fetchArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus artikel.");
    }
  };

  const filtered = articlesList.filter(
    (art) =>
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.category.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase()),
  );

  const totalArticlePages = Math.ceil(filtered.length / 10) || 1;
  const paginatedArticles = filtered.slice((articleCurrentPage - 1) * 10, articleCurrentPage * 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex w-full max-w-md items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Cari artikel kesehatan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setArticleCurrentPage(1);
            }}
            className="w-full"
          />
        </div>

        {isAdmin && (
          <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Tambah Artikel Baru</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center bg-card shadow-xs">
          <p className="text-sm text-muted-foreground">Tidak ada artikel yang ditemukan.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.map((art) => (
            <Card
              key={art.id}
              className="bg-card shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="w-fit text-[11px]">
                      {art.category}
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-base font-semibold leading-snug mt-1">
                    {art.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-3">{art.excerpt}</p>
                </CardContent>
              </div>

              <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-border/40 mt-auto pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 text-xs font-medium text-primary hover:bg-transparent hover:underline"
                  onClick={() => setSelectedArticle(art)}
                >
                  Baca Selengkapnya →
                </Button>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(art)}
                      title="Edit Artikel"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80"
                      onClick={() => handleDeleteArticle(art.id, art.title)}
                      title="Hapus Artikel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <PaginationControls
        currentPage={articleCurrentPage}
        totalPages={totalArticlePages}
        totalItems={filtered.length}
        itemsPerPage={10}
        onPageChange={setArticleCurrentPage}
      />

      {/* View Article Modal */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="w-[92vw] max-w-lg max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <DialogHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="w-fit">
                  {selectedArticle.category}
                </Badge>
              </div>
              <DialogTitle className="font-display text-lg sm:text-xl">
                {selectedArticle.title}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-foreground/90 pt-3 whitespace-pre-wrap">
              {selectedArticle.content}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Add/Edit Article Modal */}
      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="w-[92vw] max-w-lg max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <DialogHeader>
              <DialogTitle className="font-display text-lg sm:text-xl">
                {editingArticle ? "Edit Artikel Kesehatan" : "Tambah Artikel Kesehatan Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Isi detail informasi artikel edukasi kesehatan untuk pasien.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveArticle} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="art-category">Kategori</Label>
                <Input
                  id="art-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Mis. Akupunktur, Herbal Formula, Gaya Hidup"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="art-title">Judul Artikel</Label>
                <Input
                  id="art-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Judul menarik..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="art-excerpt">Ringkasan Singkat (Excerpt)</Label>
                <Textarea
                  id="art-excerpt"
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat yang muncul di kartu artikel..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="art-content">Isi Artikel Lengkap</Label>
                <Textarea
                  id="art-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tulis isi artikel lengkap di sini..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingArticle ? "Simpan Perubahan" : "Terbitkan Artikel"}</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface RegisteredUser {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  phone: string | null;
  address: string | null;
  referralCode: string | null;
  tonguePhotoUrl: string | null;
  screeningAnswers?: string | null;
  createdAt: string;
}

function UsersTab() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [whatsappSettings, setWhatsappSettings] = useState<{
    whatsappNumber: string;
    whatsappMessageTemplate: string;
    whatsappFreeConsultationTemplate?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setWhatsappSettings(data))
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const getWhatsAppUserUrl = (u: RegisteredUser) => {
    if (!whatsappSettings) return "";
    let template =
      whatsappSettings.whatsappMessageTemplate ||
      "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat";

    let reportUrl = `${window.location.origin}/skrining?userId=${u.id}`;
    if (u.screeningAnswers) {
      try {
        const parsed =
          typeof u.screeningAnswers === "string"
            ? JSON.parse(u.screeningAnswers)
            : u.screeningAnswers;
        const answers = parsed?.answers || parsed || {};
        const keluhan = parsed?.keluhan || u.address || "";
        const tonguePhoto = parsed?.tonguePhoto || u.tonguePhotoUrl || "";

        const resultPayload = {
          nama: u.fullName || "Pasien",
          usia: u.age || 25,
          kelamin: u.gender === "Perempuan" ? "P" : "L",
          tinggi: u.height || 165,
          berat: u.weight || 60,
          keluhan: keluhan,
          tonguePhoto: tonguePhoto,
          answers: answers,
        };
        const encodedPayload = btoa(encodeURIComponent(JSON.stringify(resultPayload)));
        reportUrl = `${window.location.origin}/skrining?resultData=${encodedPayload}`;
      } catch (err) {
        console.error("Gagal memformat data skrining untuk link WhatsApp:", err);
      }
    }

    template = template.replace("[nama]", u.fullName || "Pasien");
    template = template.replace("[link]", reportUrl);

    const phoneNum = u.phone || "";
    let cleaned = phoneNum.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }

    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(template)}`;
  };

  const getWhatsAppFreeConsultationUrl = (u: RegisteredUser) => {
    if (!whatsappSettings) return "";
    let template =
      whatsappSettings.whatsappFreeConsultationTemplate ||
      "Halo [nama],\n\nKabar gembira! Rumah Terapy Ikhtiar Sehat sedang membuka layanan Konsultasi Kesehatan TCM Gratis secara online. Silakan klik link berikut untuk memulai konsultasi gratis Anda dengan praktisi kami:\n\n[link]\n\nYuk, jaga kesehatan tubuh Anda secara alami!\nSalam sehat,\nRumah Terapy Ikhtiar Sehat";
    const consultUrl = `${window.location.origin}/skrining?userId=${u.id}`;

    template = template.replace("[nama]", u.fullName || "Pasien");
    template = template.replace("[link]", consultUrl);

    const phoneNum = u.phone || "";
    let cleaned = phoneNum.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }

    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(template)}`;
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    gender: "Laki-laki",
    age: "",
    height: "",
    weight: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          ...authHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna.");
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error("Format respons tidak valid (kemungkinan server sedang memuat ulang).");
      }
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setForm({
      email: "",
      password: "",
      fullName: "",
      gender: "Laki-laki",
      age: "",
      height: "",
      weight: "",
      phone: "",
      address: "",
      role: "user",
    });
    setSaveError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: RegisteredUser) => {
    setSelectedUser(user);
    setForm({
      email: user.email,
      password: "",
      fullName: user.fullName || "",
      gender: user.gender || "Laki-laki",
      age: user.age ? String(user.age) : "",
      height: user.height ? String(user.height) : "",
      weight: user.weight ? String(user.weight) : "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "user",
    });
    setSaveError("");
    setDialogOpen(true);
  };

  const handleDelete = async (user: RegisteredUser) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Hapus akun user "${user.fullName || user.email}"?`)
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal menghapus pengguna.");
      }
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const handleGPS = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lon = position.coords.longitude.toFixed(6);
          setForm((f) => ({
            ...f,
            address: `GPS (${lat}, ${lon}) - Surabaya, Jawa Timur`,
          }));
          setGpsLoading(false);
        },
        () => {
          setForm((f) => ({
            ...f,
            address: "Surabaya, Jawa Timur (Lokasi GPS simulasi)",
          }));
          setGpsLoading(false);
        },
      );
    } else {
      setForm((f) => ({
        ...f,
        address: "Lokasi tidak didukung peramban ini.",
      }));
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      if (!selectedUser && (!form.password || form.password.length < 8)) {
        throw new Error("Password wajib diisi minimal 8 karakter.");
      }

      const url = selectedUser ? `/api/admin/users/${selectedUser.id}` : "/api/admin/users";
      const method = selectedUser ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
          height: form.height ? Number(form.height) : null,
          weight: form.weight ? Number(form.weight) : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan.");
      }

      setDialogOpen(false);
      await loadUsers();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    [u.email, u.fullName ?? "", u.phone ?? "", u.address ?? "", u.role]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <Card className="border-emerald-100 bg-white">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <CardTitle className="text-emerald-950 font-display text-lg">
            Kelola Akun Pengguna
          </CardTitle>
          <CardDescription>{users.length} akun terdaftar di sistem Rumah Terapy</CardDescription>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto gap-1.5 bg-primary hover:bg-primary/95"
        >
          <Plus className="h-4 w-4" /> Tambah user baru
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama, email, nomor HP, peran..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-destructive font-medium border rounded-lg bg-destructive/5">
            {error}
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto border rounded-xl">
              <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                <thead className="bg-emerald-50/50 text-emerald-900 font-medium border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Nama & Email</th>
                    <th className="px-4 py-3">No. HP / WhatsApp</th>
                    <th className="px-4 py-3">Jenis Kelamin</th>
                    <th className="px-4 py-3">Usia / Fisik</th>
                    <th className="px-4 py-3">Alamat Domisili</th>
                    <th className="px-4 py-3">Peran</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-emerald-950">{u.fullName || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{u.phone || "—"}</td>
                      <td className="px-4 py-3">{u.gender || "—"}</td>
                      <td className="px-4 py-3 text-xs">
                        {u.age ? `${u.age} Tahun` : "—"}
                        {u.height || u.weight ? (
                          <div className="text-muted-foreground mt-0.5">
                            {u.height ? `${u.height} cm` : "—"} ·{" "}
                            {u.weight ? `${u.weight} kg` : "—"}
                          </div>
                        ) : null}
                      </td>
                      <td
                        className="px-4 py-3 max-w-[180px] truncate text-xs"
                        title={u.address || ""}
                      >
                        {u.address || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={u.role === "admin" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {u.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {u.phone && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  title="Kirim WhatsApp"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-56 bg-white border border-emerald-100"
                              >
                                <DropdownMenuItem asChild>
                                  <a
                                    href={getWhatsAppUserUrl(u)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center gap-2 cursor-pointer"
                                  >
                                    <span>🩺 Kirim Hasil Skrining</span>
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={getWhatsAppFreeConsultationUrl(u)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center gap-2 cursor-pointer"
                                  >
                                    <span>🎁 Kirim Broadcast Konsultasi</span>
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(u)}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(u)}
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="h-28 text-center text-muted-foreground">
                        Belum ada user terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid gap-3 lg:hidden">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg border p-4 space-y-3 bg-white shadow-xs hover:border-primary/40 transition-all text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-950 text-base">
                      {u.fullName || "—"}
                    </span>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>
                      <strong className="text-emerald-950">Email:</strong> {u.email}
                    </p>
                    <p>
                      <strong className="text-emerald-950">No. HP:</strong> {u.phone || "—"}
                    </p>
                    <p>
                      <strong className="text-emerald-950">Detail Fisik:</strong> {u.gender || "—"}{" "}
                      · {u.age ? `${u.age} Tahun` : "—"} · {u.height ? `${u.height} cm` : "—"} /{" "}
                      {u.weight ? `${u.weight} kg` : "—"}
                    </p>
                    <p className="line-clamp-2">
                      <strong className="text-emerald-950">Alamat:</strong> {u.address || "—"}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    {u.phone && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/20 font-semibold"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Kirim WA</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-white border border-emerald-100"
                        >
                          <DropdownMenuItem asChild>
                            <a
                              href={getWhatsAppUserUrl(u)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center gap-2 cursor-pointer"
                            >
                              <span>🩺 Kirim Hasil Skrining</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={getWhatsAppFreeConsultationUrl(u)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center gap-2 cursor-pointer"
                            >
                              <span>🎁 Kirim Broadcast Konsultasi</span>
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(u)}
                      className="h-8 text-xs gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(u)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                  Belum ada user terdaftar.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Add / Edit Dialog */}
      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Edit Akun User" : "Tambah Akun User Baru"}</DialogTitle>
              <DialogDescription>
                Isi formulir profil pengguna secara lengkap di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Nama Lengkap *</Label>
                  <Input
                    required
                    placeholder="Nama lengkap Anda"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Jenis Kelamin *</Label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Usia *</Label>
                  <div className="relative">
                    <Input
                      required
                      type="number"
                      placeholder="Tahun"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                      Tahun
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Tinggi Badan *</Label>
                    <div className="relative">
                      <Input
                        required
                        type="number"
                        placeholder="cm"
                        value={form.height}
                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                        className="pr-8"
                      />
                      <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">
                        cm
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Berat Badan *</Label>
                    <div className="relative">
                      <Input
                        required
                        type="number"
                        placeholder="kg"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        className="pr-8"
                      />
                      <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">
                        kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{selectedUser ? "Password (Isi jika ingin ganti)" : "Password *"}</Label>
                  <Input
                    required={!selectedUser}
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label>No. HP / WhatsApp *</Label>
                  <Input
                    required
                    placeholder="0812xxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    * Hasil skrining akan dikirimkan ke WhatsApp ini. Pastikan nomor aktif.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Alamat Domisili *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGPS}
                      disabled={gpsLoading}
                      className="h-8 text-xs gap-1"
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{gpsLoading ? "Mencari..." : "Gunakan GPS"}</span>
                    </Button>
                  </div>
                  <Textarea
                    required
                    placeholder="Masukkan alamat domisili lengkap Anda"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Role Akses</Label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden"
                  >
                    <option value="user">User / Pasien</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {saveError && <p className="text-sm text-destructive font-medium">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Akun"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function SettingsTab() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessageTemplate, setWhatsappMessageTemplate] = useState("");
  const [whatsappFreeConsultationTemplate, setWhatsappFreeConsultationTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Gagal memuat pengaturan.");
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Format respons tidak valid (kemungkinan server sedang memuat ulang).");
      }
      setWhatsappNumber(data.whatsappNumber || "6281369729617");
      setWhatsappMessageTemplate(
        data.whatsappMessageTemplate ||
          "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat",
      );
      setWhatsappFreeConsultationTemplate(
        data.whatsappFreeConsultationTemplate ||
          "Halo [nama],\n\nKabar gembira! Rumah Terapy Ikhtiar Sehat sedang membuka layanan Konsultasi Kesehatan TCM Gratis secara online. Silakan klik link berikut untuk memulai konsultasi gratis Anda dengan praktisi kami:\n\n[link]\n\nYuk, jaga kesehatan tubuh Anda secara alami!\nSalam sehat,\nRumah Terapy Ikhtiar Sehat",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          whatsappNumber,
          whatsappMessageTemplate,
          whatsappFreeConsultationTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan pengaturan.");
      }

      setWhatsappNumber(data.whatsappNumber);
      setWhatsappMessageTemplate(data.whatsappMessageTemplate);
      setWhatsappFreeConsultationTemplate(data.whatsappFreeConsultationTemplate);
      setMessage("Pengaturan WhatsApp berhasil diperbarui!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-emerald-100 bg-white">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-emerald-950 font-display text-lg">
          Pengaturan WhatsApp Utama & Broadcast
        </CardTitle>
        <CardDescription>
          Atur nomor telepon klinik dan sesuaikan draf pesan otomatis yang akan dikirimkan berisi
          link hasil skrining TCM ke WhatsApp pasien.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wa-num">Nomor WhatsApp Klinik *</Label>
              <div className="relative">
                <Input
                  id="wa-num"
                  required
                  placeholder="Contoh: 6281369729617 atau 081369729617"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="pl-3 max-w-md"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Format nomor internasional otomatis diubah (contoh: nomor dimulai dengan 0 atau 8
                otomatis dikonversi ke kode negara 62).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wa-template">Pesan Broadcast Hasil Skrining *</Label>
              <textarea
                id="wa-template"
                required
                rows={6}
                placeholder="Masukkan draf pesan broadcast hasil skrining..."
                value={whatsappMessageTemplate}
                onChange={(e) => setWhatsappMessageTemplate(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="rounded-md bg-emerald-50/50 p-3 border border-emerald-100/60 text-xs text-emerald-900 space-y-1">
                <p className="font-semibold">Placeholder Dinamis yang Didukung:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>
                    <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950 font-mono font-bold">
                      [nama]
                    </code>{" "}
                    - Diganti dengan nama lengkap pasien
                  </li>
                  <li>
                    <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950 font-mono font-bold">
                      [link]
                    </code>{" "}
                    - Diganti dengan link laporan skrining pasien
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wa-consult-template">Pesan Broadcast Konsultasi Gratis *</Label>
              <textarea
                id="wa-consult-template"
                required
                rows={6}
                placeholder="Masukkan draf pesan broadcast konsultasi gratis..."
                value={whatsappFreeConsultationTemplate}
                onChange={(e) => setWhatsappFreeConsultationTemplate(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="rounded-md bg-emerald-50/50 p-3 border border-emerald-100/60 text-xs text-emerald-900 space-y-1">
                <p className="font-semibold">Placeholder Dinamis yang Didukung:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>
                    <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950 font-mono font-bold">
                      [nama]
                    </code>{" "}
                    - Diganti dengan nama lengkap pasien
                  </li>
                  <li>
                    <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950 font-mono font-bold">
                      [link]
                    </code>{" "}
                    - Diganti dengan link skrining/konsultasi pasien
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 font-medium border border-emerald-100">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
