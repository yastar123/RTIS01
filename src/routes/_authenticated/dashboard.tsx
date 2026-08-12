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
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserCircle,
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
import { serviceOptions, formatPrice, saveReservation, type Reservation } from "@/lib/reservations";

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

type Section = "overview" | "profile" | "reservations" | "screening" | "articles";

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const [section, setSection] = useState<Section>(() => {
    if (location.pathname === "/profile") return "profile";
    if (location.pathname === "/skrining") return "screening";
    return "overview";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/profile") setSection("profile");
    else if (location.pathname === "/skrining") setSection("screening");
  }, [location.pathname]);

  const navItems: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { key: "profile", label: "Profil Saya", icon: UserCircle },
    { key: "reservations", label: "Reservasi", icon: CalendarDays },
    { key: "screening", label: "Skrening", icon: Stethoscope },
    { key: "articles", label: "Artikel", icon: BookOpen },
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
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
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
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
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
        </main>
      </div>
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

  const [activeSubTab, setActiveSubTab] = useState<"list" | "new" | "check">(
    isAdmin ? "list" : "new",
  );

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
          <Button
            variant={activeSubTab === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSubTab("new")}
            className="text-xs sm:text-sm gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Buat Reservasi Baru
          </Button>
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
                      {serviceOptions.map((opt) => (
                        <option key={opt.name} value={opt.name}>
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
                    <Label htmlFor="res-time">Jam Sesi</Label>
                    <select
                      id="res-time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                    >
                      <option value="09:00">09:00 WIB</option>
                      <option value="11:00">11:00 WIB</option>
                      <option value="13:30">13:30 WIB</option>
                      <option value="15:30">15:30 WIB</option>
                      <option value="19:00">19:00 WIB</option>
                    </select>
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
      ) : /* PATIENT / TEST VIEW */
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
            questions.map((q, idx) => (
              <Card key={q.id} className="bg-card shadow-xs">
                <CardContent className="p-3.5 sm:p-5">
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                    {idx + 1}. {q.questionText}
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
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val as number }))}
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
            ))
          )}

          {questions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-muted-foreground">
                {answeredCount} dari {questions.length} pertanyaan dijawab
              </span>
              <Button
                disabled={!isComplete}
                onClick={() => setIsSubmitted(true)}
                className="w-full sm:w-auto"
              >
                Lihat Hasil Skrening
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
            Hasil Penilaian Skrening Mandiri
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
const sampleArticles = [
  {
    id: "a1",
    cat: "Akupunktur",
    title: "Apa yang terjadi saat jarum akupunktur merangsang titik meridian?",
    excerpt:
      "Penjelasan ilmiah sederhana tentang titik meridian, merangsang sistem saraf lokal, dan memicu pelepasan endorfin.",
    content:
      "Akupunktur bekerja dengan menstimulasi titik-titik spesifik di sepanjang meridian tubuh. Stimulasi jarum steril merangsang serabut saraf periferal yang mengirimkan sinyal ke otak dan sumsum tulang belakang, memicu pelepasan neurotransmiter serta hormon alami penawar nyeri.",
  },
  {
    id: "a2",
    cat: "Herbal Formula",
    title: "Mengapa racikan herbal TCM selalu disesuaikan dengan sindrom pribadi?",
    excerpt:
      "Prinsip individualisasi herbal berdasarkan pola Yin-Yang dan kondisi organ tubuh pasien.",
    content:
      "Berbeda dengan pengobatan sintetis tunggal, racikan herbal TCM disusun sebagai suatu kesatuan formula yang saling melengkapi (Jun, Chen, Zuo, Shi) untuk memulihkan keseimbangan tanpa memicu efek samping berlebih.",
  },
  {
    id: "a3",
    cat: "Gaya Hidup",
    title: "Ritme harian jam organ tubuh dan dampaknya pada istirahat",
    excerpt: "Bagaimana menyesuaikan jadwal makan dan tidur sesuai dengan jam puncak kerja organ.",
    content:
      "Dalam siklus organ TCM, jam 23.00–03.00 adalah waktu pemulihan kantung empedu dan hati. Tidur nyenyak pada rentang waktu ini sangat penting untuk proses regenerasi darah dan detoksifikasi seluler.",
  },
];

function ArticlesTab() {
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<(typeof sampleArticles)[0] | null>(null);
  const [articleCurrentPage, setArticleCurrentPage] = useState(1);

  const filtered = sampleArticles.filter(
    (art) =>
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.cat.toLowerCase().includes(search.toLowerCase()),
  );

  const totalArticlePages = Math.ceil(filtered.length / 10) || 1;
  const paginatedArticles = filtered.slice(
    (articleCurrentPage - 1) * 10,
    articleCurrentPage * 10,
  );

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedArticles.map((art) => (
          <Card key={art.id} className="bg-card shadow-xs transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit text-[11px]">
                {art.cat}
              </Badge>
              <CardTitle className="font-display text-base font-semibold leading-snug">
                {art.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-3">{art.excerpt}</p>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 text-xs font-medium text-primary hover:bg-transparent hover:underline"
                onClick={() => setSelectedArticle(art)}
              >
                Baca Selengkapnya →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationControls
        currentPage={articleCurrentPage}
        totalPages={totalArticlePages}
        totalItems={filtered.length}
        itemsPerPage={10}
        onPageChange={setArticleCurrentPage}
      />

      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="w-[92vw] max-w-lg">
            <DialogHeader>
              <Badge variant="secondary" className="w-fit mb-1">
                {selectedArticle.cat}
              </Badge>
              <DialogTitle className="font-display text-lg sm:text-xl">
                {selectedArticle.title}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-foreground/90 pt-2">
              {selectedArticle.content}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
