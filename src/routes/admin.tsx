import { createFileRoute, Link } from "@/lib/route";
import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePenLine,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
  MapPin,
} from "lucide-react";
import { useAuth, authHeaders } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Rumah Terapy Ikhtiar Sehat" },
      { name: "description", content: "Kelola reservasi dan artikel Rumah Terapy Ikhtiar Sehat." },
    ],
  }),
  component: AdminPage,
});

type Section = "overview" | "reservations" | "articles" | "users";
type Reservation = {
  id: string;
  code: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  note: string | null;
  status: string;
};
type Article = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  publishedAt: string;
};
type RegisteredUser = {
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
  createdAt: string;
};

const emptyReservation: Omit<Reservation, "id" | "code"> = {
  name: "",
  phone: "",
  service: "",
  date: "",
  time: "",
  note: "",
  status: "Menunggu Konfirmasi",
};
const emptyArticle: Omit<Article, "id" | "publishedAt"> = {
  category: "",
  title: "",
  excerpt: "",
  content: "",
  readTime: "5 menit",
};
const statusOptions = ["Menunggu Konfirmasi", "Dikonfirmasi", "Selesai", "Dibatalkan"];

async function adminFetch<T>(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "Permintaan gagal.");
  return data as T;
}

function AdminPage() {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationDialog, setReservationDialog] = useState<Reservation | "new" | null>(null);
  const [articleDialog, setArticleDialog] = useState<Article | "new" | null>(null);
  const [userDialog, setUserDialog] = useState<RegisteredUser | "new" | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [reservationData, articleData, userData] = await Promise.all([
        adminFetch<Reservation[]>("/api/admin/reservations"),
        adminFetch<Article[]>("/api/articles"),
        adminFetch<RegisteredUser[]>("/api/admin/users"),
      ]);
      setReservations(reservationData);
      setArticles(articleData);
      setUsersList(userData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat data dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const removeReservation = async (reservation: Reservation) => {
    if (typeof window !== "undefined" && !window.confirm(`Hapus reservasi ${reservation.code}?`))
      return;
    try {
      await adminFetch(`/api/admin/reservations/${reservation.id}`, { method: "DELETE" });
      await loadData();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Gagal menghapus reservasi.");
    }
  };

  const removeArticle = async (article: Article) => {
    if (typeof window !== "undefined" && !window.confirm(`Hapus artikel "${article.title}"?`))
      return;
    try {
      await adminFetch(`/api/admin/articles/${article.id}`, { method: "DELETE" });
      await loadData();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Gagal menghapus artikel.");
    }
  };

  const removeUser = async (registeredUser: RegisteredUser) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Hapus akun user "${registeredUser.fullName || registeredUser.email}"?`)
    )
      return;
    try {
      await adminFetch(`/api/admin/users/${registeredUser.id}`, { method: "DELETE" });
      await loadData();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Gagal menghapus user.");
    }
  };

  const filteredReservations = reservations.filter((reservation) =>
    [reservation.code, reservation.name, reservation.phone, reservation.service, reservation.status]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const filteredUsers = usersList.filter((u) =>
    [u.email, u.fullName ?? "", u.phone ?? "", u.address ?? "", u.role]
      .join(" ")
      .toLowerCase()
      .includes(userQuery.toLowerCase()),
  );

  const navItems: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { key: "reservations", label: "Reservasi Pasien", icon: CalendarDays },
    { key: "articles", label: "Artikel Health", icon: FileText },
    { key: "users", label: "Manajemen User", icon: Users },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
        <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo Rumah Terapy"
              className="h-9 w-auto shrink-0 rounded-lg bg-white p-0.5 border"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold text-foreground">
                  Rumah Terapy
                </span>
                <Badge variant="secondary" className="hidden text-[11px] sm:inline-flex">
                  Admin
                </Badge>
              </div>
              <p className="eyebrow hidden text-[10px] text-muted-foreground sm:block">
                Ikhtiar Sehat
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:flex"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            Lihat Website Utama
          </Link>

          <div className="hidden text-right text-xs sm:block">
            <p className="font-medium text-foreground">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>

          <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5 text-xs">
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
              <p className="eyebrow px-3 pt-1 pb-3 text-[11px] font-semibold text-muted-foreground tracking-wider">
                WORKSPACE ADMIN
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
            <Link
              to="/"
              title={isSidebarCollapsed ? "Lihat Website Utama" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${
                isSidebarCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Website Utama</span>}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${
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
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card p-4 transition-transform duration-300 ease-in-out md:hidden ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Logo Rumah Terapy"
                className="h-8 w-auto bg-white p-0.5 rounded-lg border"
              />
              <span className="font-display font-medium text-foreground">Menu Admin</span>
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
            <Link
              to="/"
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
              <span>Keluar dari Admin</span>
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-xs">Selamat datang kembali</p>
              <h1 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">
                {section === "overview"
                  ? "Ringkasan Klinik"
                  : section === "reservations"
                    ? "Kelola Reservasi Pasien"
                    : section === "articles"
                      ? "Kelola Artikel Health"
                      : "Manajemen Pengguna"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Perubahan tersimpan otomatis ke database.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                Tutup
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-xs">
              Memuat data dashboard...
            </div>
          ) : (
            <>
              {section === "overview" && (
                <Overview
                  reservations={reservations}
                  articles={articles}
                  users={usersList}
                  onNavigate={setSection}
                />
              )}
              {section === "reservations" && (
                <ReservationSection
                  reservations={filteredReservations}
                  query={query}
                  onQueryChange={setQuery}
                  onCreate={() => setReservationDialog("new")}
                  onEdit={setReservationDialog}
                  onDelete={removeReservation}
                />
              )}
              {section === "articles" && (
                <ArticleSection
                  articles={articles}
                  onCreate={() => setArticleDialog("new")}
                  onEdit={setArticleDialog}
                  onDelete={removeArticle}
                />
              )}
              {section === "users" && (
                <UserSection
                  users={filteredUsers}
                  query={userQuery}
                  onQueryChange={setUserQuery}
                  onCreate={() => setUserDialog("new")}
                  onEdit={setUserDialog}
                  onDelete={removeUser}
                />
              )}
            </>
          )}
        </main>
      </div>

      <ReservationDialog
        value={reservationDialog}
        onClose={() => setReservationDialog(null)}
        onSaved={loadData}
      />
      <ArticleDialog
        value={articleDialog}
        onClose={() => setArticleDialog(null)}
        onSaved={loadData}
      />
      <UserDialog value={userDialog} onClose={() => setUserDialog(null)} onSaved={loadData} />
    </div>
  );
}

function Overview({
  reservations,
  articles,
  users,
  onNavigate,
}: {
  reservations: Reservation[];
  articles: Article[];
  users: RegisteredUser[];
  onNavigate: (section: Section) => void;
}) {
  const pending = reservations.filter(
    (reservation) => reservation.status === "Menunggu Konfirmasi",
  ).length;
  const cards = [
    {
      label: "Total reservasi",
      value: reservations.length,
      icon: CalendarDays,
      section: "reservations" as Section,
    },
    {
      label: "User Terdaftar",
      value: users.length,
      icon: Users,
      section: "users" as Section,
    },
    {
      label: "Artikel terbit",
      value: articles.length,
      icon: FileText,
      section: "articles" as Section,
    },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, section }) => (
          <button
            type="button"
            key={label}
            onClick={() => onNavigate(section)}
            className="text-left"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 font-display text-4xl text-foreground">{value}</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FilePenLine className="h-5 w-5 text-primary" /> Alur kerja admin
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
          <p>
            <strong className="text-foreground">1. Reservasi masuk</strong>
            <br />
            Periksa detail pasien dan ubah status setelah dikonfirmasi.
          </p>
          <p>
            <strong className="text-foreground">2. Konten edukasi</strong>
            <br />
            Tulis artikel baru untuk membantu pasien memahami TCM.
          </p>
          <p>
            <strong className="text-foreground">3. Website terbarui</strong>
            <br />
            Artikel yang disimpan langsung muncul di halaman Artikel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReservationSection({
  reservations,
  query,
  onQueryChange,
  onCreate,
  onEdit,
  onDelete,
}: {
  reservations: Reservation[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Reservasi pasien</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {reservations.length} data ditampilkan
          </p>
        </div>
        <Button onClick={onCreate} className="w-full sm:w-auto gap-1.5">
          <Plus className="h-4 w-4" /> Tambah reservasi
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-5 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari nama, kode, nomor, layanan..."
            className="pl-9"
          />
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pasien</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <p className="font-medium">{reservation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.code} · {reservation.phone}
                    </p>
                  </TableCell>
                  <TableCell>{reservation.service}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.date}
                    <br />
                    <span className="text-xs text-muted-foreground">{reservation.time}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reservation.status === "Dibatalkan"
                          ? "destructive"
                          : reservation.status === "Selesai"
                            ? "secondary"
                            : ["Dikonfirmasi", "Terkonfirmasi"].includes(reservation.status)
                              ? "default"
                              : "outline"
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(reservation)}
                        aria-label="Edit reservasi"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(reservation)}
                        aria-label="Hapus reservasi"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                    Belum ada reservasi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Card List */}
        <div className="grid gap-3 md:hidden">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-lg border p-4 space-y-3 bg-card shadow-xs hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                  {reservation.code}
                </span>
                <Badge
                  variant={
                    reservation.status === "Dibatalkan"
                      ? "destructive"
                      : reservation.status === "Selesai"
                        ? "secondary"
                        : ["Dikonfirmasi", "Terkonfirmasi"].includes(reservation.status)
                          ? "default"
                          : "outline"
                  }
                  className="text-[10px]"
                >
                  {reservation.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{reservation.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{reservation.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Layanan</p>
                  <p className="font-medium text-foreground">{reservation.service}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Jadwal Sesi</p>
                  <p className="font-medium text-foreground">
                    {reservation.date} pukul {reservation.time}
                  </p>
                </div>
              </div>

              {reservation.note && (
                <div className="text-xs bg-muted/40 p-2.5 rounded-md mt-1 italic text-muted-foreground">
                  "{reservation.note}"
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(reservation)}
                  className="h-8 text-xs gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(reservation)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </Button>
              </div>
            </div>
          ))}
          {reservations.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
              Belum ada reservasi.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleSection({
  articles,
  onCreate,
  onEdit,
  onDelete,
}: {
  articles: Article[];
  onCreate: () => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Artikel edukasi</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} artikel tampil di website
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" /> Tulis artikel
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{article.category}</Badge>
                <span className="text-xs text-muted-foreground">{article.readTime} baca</span>
              </div>
              <h3 className="mt-2 font-display text-xl">{article.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="outline" size="sm" onClick={() => onEdit(article)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(article)}
                aria-label="Hapus artikel"
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            Belum ada artikel. Tulis artikel pertama Anda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReservationDialog({
  value,
  onClose,
  onSaved,
}: {
  value: Reservation | "new" | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(emptyReservation);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!value) return;
    setForm(
      value === "new"
        ? emptyReservation
        : {
            name: value.name,
            phone: value.phone,
            service: value.service,
            date: value.date,
            time: value.time,
            note: value.note ?? "",
            status: value.status,
          },
    );
    setError("");
  }, [value]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await adminFetch(
        value === "new" ? "/api/admin/reservations" : `/api/admin/reservations/${value?.id}`,
        { method: value === "new" ? "POST" : "PATCH", body: JSON.stringify(form) },
      );
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan reservasi.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={!!value} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{value === "new" ? "Tambah reservasi" : "Edit reservasi"}</DialogTitle>
          <DialogDescription>Perbarui data jadwal pasien dari dashboard admin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama pasien">
            <Input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label="Nomor telepon">
            <Input
              required
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </Field>
          <Field label="Layanan">
            <Input
              required
              value={form.service}
              onChange={(event) => setForm({ ...form, service: event.target.value })}
              placeholder="Akupunktur, Herbal..."
            />
          </Field>
          <Field label="Tanggal">
            <Input
              required
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
          </Field>
          <Field label="Waktu">
            <Input
              required
              type="time"
              value={form.time}
              onChange={(event) => setForm({ ...form, time: event.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option>{statusOptions[0]}</option>
              <option>{statusOptions[1]}</option>
              <option>{statusOptions[2]}</option>
              <option>{statusOptions[3]}</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Catatan">
              <Textarea
                value={form.note ?? ""}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
                placeholder="Catatan tambahan..."
              />
            </Field>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan reservasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ArticleDialog({
  value,
  onClose,
  onSaved,
}: {
  value: Article | "new" | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(emptyArticle);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!value) return;
    setForm(
      value === "new"
        ? emptyArticle
        : {
            category: value.category,
            title: value.title,
            excerpt: value.excerpt,
            content: value.content,
            readTime: value.readTime,
          },
    );
    setError("");
  }, [value]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await adminFetch(
        value === "new" ? "/api/admin/articles" : `/api/admin/articles/${value?.id}`,
        { method: value === "new" ? "POST" : "PATCH", body: JSON.stringify(form) },
      );
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan artikel.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={!!value} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{value === "new" ? "Tulis artikel baru" : "Edit artikel"}</DialogTitle>
          <DialogDescription>
            Artikel yang disimpan akan tampil di halaman Artikel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <Input
                required
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Herbal"
              />
            </Field>
            <Field label="Waktu baca">
              <Input
                required
                value={form.readTime}
                onChange={(event) => setForm({ ...form, readTime: event.target.value })}
                placeholder="5 menit"
              />
            </Field>
          </div>
          <Field label="Judul artikel">
            <Input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </Field>
          <Field label="Ringkasan">
            <Textarea
              required
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              rows={3}
            />
          </Field>
          <Field label="Isi artikel">
            <Textarea
              required
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              rows={8}
              placeholder="Tulis isi artikel di sini..."
            />
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan artikel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function UserSection({
  users,
  query,
  onQueryChange,
  onCreate,
  onEdit,
  onDelete,
}: {
  users: RegisteredUser[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (user: RegisteredUser) => void;
  onDelete: (user: RegisteredUser) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Manajemen User & Pasien</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} akun terdaftar di sistem
          </p>
        </div>
        <Button onClick={onCreate} className="w-full sm:w-auto gap-1.5">
          <Plus className="h-4 w-4" /> Tambah user baru
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama, email, nomor HP, peran..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-9"
          />
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama & Email</TableHead>
                <TableHead>No. HP / WhatsApp</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Usia / Fisik</TableHead>
                <TableHead>Alamat Domisili</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{u.fullName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{u.phone || "—"}</TableCell>
                  <TableCell>{u.gender || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {u.age ? `${u.age} Tahun` : "—"}
                    {u.height || u.weight ? (
                      <div className="text-muted-foreground mt-0.5">
                        {u.height ? `${u.height} cm` : "—"} · {u.weight ? `${u.weight} kg` : "—"}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs" title={u.address || ""}>
                    {u.address || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(u)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(u)}
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                    Belum ada user terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid gap-3 lg:hidden">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-lg border p-4 space-y-3 bg-card shadow-xs hover:border-primary/40 transition-all text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-base">{u.fullName || "—"}</span>
                <Badge
                  variant={u.role === "admin" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {u.role === "admin" ? "Admin" : "User"}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Email:</strong> {u.email}
                </p>
                <p>
                  <strong className="text-foreground">No. HP:</strong> {u.phone || "—"}
                </p>
                <p>
                  <strong className="text-foreground">Detail Fisik:</strong> {u.gender || "—"} ·{" "}
                  {u.age ? `${u.age} Tahun` : "—"} · {u.height ? `${u.height} cm` : "—"} /{" "}
                  {u.weight ? `${u.weight} kg` : "—"}
                </p>
                <p className="line-clamp-2">
                  <strong className="text-foreground">Alamat:</strong> {u.address || "—"}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(u)}
                  className="h-8 text-xs gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(u)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
              Belum ada user terdaftar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UserDialog({
  value,
  onClose,
  onSaved,
}: {
  value: RegisteredUser | "new" | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value) return;
    if (value === "new") {
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
    } else {
      setForm({
        email: value.email,
        password: "",
        fullName: value.fullName || "",
        gender: value.gender || "Laki-laki",
        age: value.age ? String(value.age) : "",
        height: value.height ? String(value.height) : "",
        weight: value.weight ? String(value.weight) : "",
        phone: value.phone || "",
        address: value.address || "",
        role: value.role || "user",
      });
    }
    setError("");
  }, [value]);

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      if (value === "new" && (!form.password || form.password.length < 8)) {
        throw new Error("Password wajib diisi minimal 8 karakter.");
      }
      await adminFetch(value === "new" ? "/api/admin/users" : `/api/admin/users/${value?.id}`, {
        method: value === "new" ? "POST" : "PATCH",
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
          height: form.height ? Number(form.height) : null,
          weight: form.weight ? Number(form.weight) : null,
        }),
      });
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!value} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{value === "new" ? "Tambah Akun User Baru" : "Edit Akun User"}</DialogTitle>
          <DialogDescription>
            Isi formulir profil pengguna secara lengkap di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap *">
              <Input
                required
                placeholder="Nama lengkap Anda"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </Field>

            <Field label="Jenis Kelamin *">
              <select
                required
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </Field>

            <Field label="Usia *">
              <div className="relative">
                <Input
                  required
                  type="number"
                  placeholder="Tahun"
                  value={form.age}
                  onChange={(event) => setForm({ ...form, age: event.target.value })}
                  className="pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                  Tahun
                </span>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Tinggi Badan *">
                <div className="relative">
                  <Input
                    required
                    type="number"
                    placeholder="cm"
                    value={form.height}
                    onChange={(event) => setForm({ ...form, height: event.target.value })}
                    className="pr-8"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">cm</span>
                </div>
              </Field>

              <Field label="Berat Badan *">
                <div className="relative">
                  <Input
                    required
                    type="number"
                    placeholder="kg"
                    value={form.weight}
                    onChange={(event) => setForm({ ...form, weight: event.target.value })}
                    className="pr-8"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">kg</span>
                </div>
              </Field>
            </div>

            <Field label="Email">
              <Input
                required
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>

            <Field label={value === "new" ? "Password *" : "Password (Isi jika ingin ganti)"}>
              <Input
                required={value === "new"}
                type="password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="No. HP / WhatsApp *">
                <Input
                  required
                  placeholder="0812xxxxxxxx"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  * Hasil skrining akan dikirimkan ke WhatsApp ini. Pastikan nomor aktif.
                </p>
              </Field>
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
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                rows={3}
              />
            </div>

            <Field label="Role Akses">
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden"
              >
                <option value="user">User / Pasien</option>
                <option value="admin">Administrator</option>
              </select>
            </Field>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
