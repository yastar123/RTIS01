import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Layers,
  FileQuestion,
  SlidersHorizontal,
  CheckCircle2,
  Search,
  Plus,
  ListPlus,
  RotateCcw,
  Loader2,
  Save,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Pencil,
  Trash2,
  ChevronRight,
  Check,
} from "lucide-react";
import { authHeaders } from "@/hooks/use-auth";
import { TcmQuestionSection, TcmQuestionField, TCM_SECTIONS } from "@/data/tcmQuestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function QuestionnaireManagerSection({ onNavigate }: { onNavigate?: (section: unknown) => void }) {
  const [sections, setSections] = useState<TcmQuestionSection[]>(TCM_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal dialog states
  const [fieldDialog, setFieldDialog] = useState<{
    isOpen: boolean;
    sectionId: string;
    field: TcmQuestionField | null;
    isNew: boolean;
  }>({
    isOpen: false,
    sectionId: "",
    field: null,
    isNew: true,
  });

  const [sectionDialog, setSectionDialog] = useState<{
    isOpen: boolean;
    section: TcmQuestionSection | null;
    isNew: boolean;
  }>({
    isOpen: false,
    section: null,
    isNew: true,
  });

  const normalizeSecList = (list: Array<Record<string, unknown>>): TcmQuestionSection[] => {
    return list.map((s, idx) => {
      const secId = (s.id || s.key || s.code || `sec_${idx}`) as string;
      const secLetter = (s.letter || s.code || String.fromCharCode(65 + idx)) as string;
      const rawFields = Array.isArray(s.fields) ? (s.fields as Array<Record<string, unknown>>) : [];
      return {
        ...(s as unknown as TcmQuestionSection),
        id: secId,
        key: (s.key as string) || secId,
        code: (s.code as string) || secLetter,
        letter: secLetter,
        title: (s.title as string) || `${secLetter}. BAGIAN ${idx + 1}`,
        fields: rawFields.map((f, fIdx) => ({
          ...(f as unknown as TcmQuestionField),
          id: (f.id as string) || `f_${secId}_${fIdx + 1}`,
          number: (f.number as number) ?? fIdx + 1,
          label: (f.label as string) || "Pertanyaan",
          type: (f.type as TcmQuestionField["type"]) || "text",
          required: Boolean(f.required),
        })),
      };
    });
  };

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/screening/sections");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized = normalizeSecList(data);
          setSections(normalized);
          // Expand all by default
          const exp: Record<string, boolean> = {};
          normalized.forEach((s) => {
            exp[s.id] = true;
          });
          setExpandedSections(exp);
          setHasUnsavedChanges(false);
          return;
        }
      }
      const normalizedTcm = normalizeSecList(TCM_SECTIONS);
      setSections(normalizedTcm);
      const exp: Record<string, boolean> = {};
      normalizedTcm.forEach((s) => {
        exp[s.id] = true;
      });
      setExpandedSections(exp);
    } catch {
      const normalizedTcm = normalizeSecList(TCM_SECTIONS);
      setSections(normalizedTcm);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  const toggleExpand = (secId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const expandAll = () => {
    const exp: Record<string, boolean> = {};
    sections.forEach((s) => {
      exp[s.id] = true;
    });
    setExpandedSections(exp);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  // Save all sections to backend API
  const handleSaveSections = async (customSecList?: TcmQuestionSection[]) => {
    const target = customSecList || sections;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/screening/sections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ sections: target }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menyimpan soal ke server.");
      }

      toast.success("Daftar soal skrining TCM berhasil disimpan ke database!");
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default standard TCM sections
  const handleResetSections = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin mereset seluruh formulir soal ke standar 12 bagian TCM awal? Semua kustomisasi akan dikembalikan.",
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/screening/sections/reset", {
        method: "POST",
        headers: {
          ...authHeaders(),
        },
      });

      if (!res.ok) throw new Error("Gagal mereset soal di database.");

      setSections(TCM_SECTIONS);
      const exp: Record<string, boolean> = {};
      TCM_SECTIONS.forEach((s) => {
        exp[s.id] = true;
      });
      setExpandedSections(exp);
      setHasUnsavedChanges(false);
      toast.success("Berhasil mereset soal ke standar TCM awal!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mereset soal.");
    } finally {
      setIsResetting(false);
    }
  };

  // Section manipulation
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setSections(next);
    setHasUnsavedChanges(true);
  };

  const handleDeleteSection = (secId: string, title: string) => {
    if (!window.confirm(`Hapus Bagian "${title}" beserta seluruh soal di dalamnya?`)) {
      return;
    }
    const next = sections.filter((s) => s.id !== secId);
    setSections(next);
    setHasUnsavedChanges(true);
    toast.info(`Bagian "${title}" dihapus.`);
  };

  const handleSaveSectionModal = (updatedSec: TcmQuestionSection, isNew: boolean) => {
    if (isNew) {
      setSections((prev) => [...prev, updatedSec]);
      setExpandedSections((prev) => ({ ...prev, [updatedSec.id]: true }));
      toast.success(`Bagian "${updatedSec.title}" berhasil ditambahkan.`);
    } else {
      setSections((prev) => prev.map((s) => (s.id === updatedSec.id ? updatedSec : s)));
      toast.success(`Bagian "${updatedSec.title}" diperbarui.`);
    }
    setHasUnsavedChanges(true);
    setSectionDialog({ isOpen: false, section: null, isNew: true });
  };

  // Field manipulation
  const handleMoveField = (sectionId: string, fieldIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? fieldIdx - 1 : fieldIdx + 1;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const fList = [...(sec.fields || [])];
        if (targetIdx < 0 || targetIdx >= fList.length) return sec;
        const [moved] = fList.splice(fieldIdx, 1);
        fList.splice(targetIdx, 0, moved);
        return { ...sec, fields: fList };
      }),
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteField = (sectionId: string, fieldId: string, label: string) => {
    if (!window.confirm(`Hapus soal "${label}"?`)) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          fields: (sec.fields || []).filter((f) => f.id !== fieldId),
        };
      }),
    );
    setHasUnsavedChanges(true);
    toast.info(`Soal dihapus.`);
  };

  const handleSaveFieldModal = (
    targetSectionId: string,
    updatedField: TcmQuestionField,
    isNew: boolean,
  ) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== targetSectionId) {
          // If moving from another section, remove it from old section
          return {
            ...sec,
            fields: (sec.fields || []).filter((f) => f.id !== updatedField.id),
          };
        }

        const currentFields = [...(sec.fields || [])];
        const existingIdx = currentFields.findIndex((f) => f.id === updatedField.id);

        if (existingIdx >= 0) {
          currentFields[existingIdx] = updatedField;
        } else {
          currentFields.push(updatedField);
        }

        return {
          ...sec,
          fields: currentFields,
        };
      }),
    );

    setHasUnsavedChanges(true);
    setFieldDialog({ isOpen: false, sectionId: "", field: null, isNew: true });
    toast.success(`Soal "${updatedField.label}" berhasil disimpan.`);
  };

  // Compute summary stats
  const totalSections = sections.length;
  const totalFields = sections.reduce((acc, s) => acc + (s.fields?.length || 0), 0);
  const totalScales = sections.reduce(
    (acc, s) => acc + (s.fields?.filter((f) => f.type === "scale").length || 0),
    0,
  );
  const totalSelects = sections.reduce(
    (acc, s) => acc + (s.fields?.filter((f) => f.type === "select").length || 0),
    0,
  );
  const femaleOnlySections = sections.filter((s) => s.femaleOnly).length;

  // Filter sections and fields
  const filteredSections = sections.map((sec) => {
    const q = searchQuery.toLowerCase().trim();
    const matchingFields = (sec.fields || []).filter((f) => {
      const matchType = typeFilter === "all" || f.type === typeFilter;
      if (!matchType) return false;
      if (!q) return true;
      const matchLabel = f.label.toLowerCase().includes(q);
      const matchId = f.id.toLowerCase().includes(q);
      const matchPlaceholder = (f.placeholder || "").toLowerCase().includes(q);
      const matchOptions = (f.options || []).some((opt) => opt.toLowerCase().includes(q));
      return matchLabel || matchId || matchPlaceholder || matchOptions;
    });

    const matchSectionTitle = sec.title.toLowerCase().includes(q);
    const matchSectionDesc = (sec.description || "").toLowerCase().includes(q);

    return {
      ...sec,
      fields: q && (matchSectionTitle || matchSectionDesc) ? sec.fields : matchingFields,
      hasMatches: matchingFields.length > 0 || matchSectionTitle || matchSectionDesc,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Bagian
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalSections}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {femaleOnlySections > 0 ? `${femaleOnlySections} khusus wanita` : "Semua pasien"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Soal Input
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalFields}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Formulir Anamnesis</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileQuestion className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Input Skala 0-10
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalScales}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Nyeri / Intensitas</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Pilihan Dropdown
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalSelects}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Saran & Opsi Cepat</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar & Action Buttons */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pertanyaan, label, id, opsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Semua Tipe Input</option>
                <option value="text">Teks Pendek (Text)</option>
                <option value="textarea">Teks Panjang (Textarea)</option>
                <option value="select">Pilihan (Select)</option>
                <option value="scale">Skala 0–10 (Scale)</option>
                <option value="number">Angka (Number)</option>
                <option value="date">Tanggal (Date)</option>
              </select>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 gap-1.5"
                onClick={() =>
                  setSectionDialog({
                    isOpen: true,
                    section: null,
                    isNew: true,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Bagian
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 gap-1.5"
                onClick={() =>
                  setFieldDialog({
                    isOpen: true,
                    sectionId: sections[0]?.id || "identitas",
                    field: null,
                    isNew: true,
                  })
                }
              >
                <ListPlus className="h-3.5 w-3.5" />
                Tambah Soal
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 gap-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                onClick={handleResetSections}
                disabled={isResetting}
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
                Reset Standar TCM
              </Button>

              <Button
                size="sm"
                className={`text-xs h-9 gap-1.5 ${
                  hasUnsavedChanges
                    ? "bg-primary text-white hover:bg-primary/90 ring-2 ring-primary/30 animate-pulse"
                    : ""
                }`}
                onClick={() => handleSaveSections()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {hasUnsavedChanges ? "Simpan Perubahan *" : "Simpan Database"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Tampilan:</span>
              <button
                type="button"
                onClick={expandAll}
                className="underline hover:text-foreground cursor-pointer font-medium"
              >
                Buka Semua
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="underline hover:text-foreground cursor-pointer font-medium"
              >
                Tutup Semua
              </button>
            </div>
            {hasUnsavedChanges && (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Ada perubahan yang belum disimpan ke database
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      {isLoading ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          Memuat susunan soal skrining TCM...
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSections.map((sec, secIdx) => {
            const isExp = expandedSections[sec.id] ?? true;
            const fieldsCount = sec.fields?.length || 0;

            return (
              <Card
                key={sec.id}
                className="border-border/70 shadow-xs overflow-hidden transition-all"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border/50">
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                    onClick={() => toggleExpand(sec.id)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      {sec.letter || String.fromCharCode(65 + secIdx)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                          {sec.title}
                        </h4>
                        {sec.femaleOnly && (
                          <span className="rounded-full bg-pink-100 text-pink-700 px-2 py-0.5 text-[10px] font-semibold">
                            Khusus Wanita
                          </span>
                        )}
                        <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
                          {fieldsCount} Soal
                        </span>
                      </div>
                      {sec.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {sec.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Pindah Bagian Ke Atas"
                      disabled={secIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(secIdx, "up");
                      }}
                    >
                      <MoveUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Pindah Bagian Ke Bawah"
                      disabled={secIdx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(secIdx, "down");
                      }}
                    >
                      <MoveDown className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 px-2.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFieldDialog({
                          isOpen: true,
                          sectionId: sec.id,
                          field: null,
                          isNew: true,
                        });
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Soal
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit Bagian"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSectionDialog({
                          isOpen: true,
                          section: sec,
                          isNew: false,
                        });
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      title="Hapus Bagian"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(sec.id, sec.title);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground"
                      onClick={() => toggleExpand(sec.id)}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExp ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* Section Content: Questions Table/Cards */}
                {isExp && (
                  <div className="p-4 space-y-2.5">
                    {fieldsCount === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                        Belum ada soal pada bagian ini.
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs text-primary block mx-auto mt-1"
                          onClick={() =>
                            setFieldDialog({
                              isOpen: true,
                              sectionId: sec.id,
                              field: null,
                              isNew: true,
                            })
                          }
                        >
                          + Tambah Soal Pertama
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/60 rounded-lg border bg-card">
                        {(sec.fields || []).map((f, fieldIdx) => {
                          const typeBadge =
                            f.type === "scale"
                              ? { label: "Skala 0–10", color: "bg-amber-100 text-amber-800" }
                              : f.type === "textarea"
                                ? { label: "Teks Panjang", color: "bg-blue-100 text-blue-800" }
                                : f.type === "select"
                                  ? {
                                      label: "Pilihan Dropdown",
                                      color: "bg-purple-100 text-purple-800",
                                    }
                                  : f.type === "number"
                                    ? { label: "Angka", color: "bg-emerald-100 text-emerald-800" }
                                    : f.type === "date"
                                      ? { label: "Tanggal", color: "bg-cyan-100 text-cyan-800" }
                                      : {
                                          label: "Teks Pendek",
                                          color: "bg-neutral-100 text-neutral-800",
                                        };

                          return (
                            <div
                              key={f.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                  {fieldIdx + 1}
                                </span>
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-semibold text-foreground">
                                      {f.label}
                                    </p>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadge.color}`}
                                    >
                                      {typeBadge.label}
                                    </span>
                                    {f.required && (
                                      <span className="rounded-full bg-red-100 text-red-700 px-1.5 py-0.2 text-[9px] font-bold">
                                        Wajib
                                      </span>
                                    )}
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      id: {f.id}
                                    </span>
                                  </div>

                                  {f.placeholder && (
                                    <p className="text-[11px] text-muted-foreground italic">
                                      Placeholder: "{f.placeholder}"
                                    </p>
                                  )}

                                  {f.options && f.options.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                      <span className="text-[10px] text-muted-foreground font-medium">
                                        Opsi:
                                      </span>
                                      {f.options.slice(0, 5).map((opt, i) => (
                                        <span
                                          key={i}
                                          className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                        >
                                          {opt}
                                        </span>
                                      ))}
                                      {f.options.length > 5 && (
                                        <span className="text-[10px] text-muted-foreground">
                                          +{f.options.length - 5} lainnya
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Field Action Buttons */}
                              <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Geser Naik"
                                  disabled={fieldIdx === 0}
                                  onClick={() => handleMoveField(sec.id, fieldIdx, "up")}
                                >
                                  <MoveUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Geser Turun"
                                  disabled={fieldIdx === (sec.fields?.length || 0) - 1}
                                  onClick={() => handleMoveField(sec.id, fieldIdx, "down")}
                                >
                                  <MoveDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Edit Soal"
                                  onClick={() =>
                                    setFieldDialog({
                                      isOpen: true,
                                      sectionId: sec.id,
                                      field: f,
                                      isNew: false,
                                    })
                                  }
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                  title="Hapus Soal"
                                  onClick={() => handleDeleteField(sec.id, f.id, f.label)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Field Editor Dialog */}
      {fieldDialog.isOpen && (
        <QuestionFieldDialog
          isOpen={fieldDialog.isOpen}
          sections={sections}
          currentSectionId={fieldDialog.sectionId}
          field={fieldDialog.field}
          isNew={fieldDialog.isNew}
          onClose={() => setFieldDialog({ isOpen: false, sectionId: "", field: null, isNew: true })}
          onSave={handleSaveFieldModal}
        />
      )}

      {/* Section Editor Dialog */}
      {sectionDialog.isOpen && (
        <SectionDialog
          isOpen={sectionDialog.isOpen}
          section={sectionDialog.section}
          isNew={sectionDialog.isNew}
          onClose={() => setSectionDialog({ isOpen: false, section: null, isNew: true })}
          onSave={handleSaveSectionModal}
        />
      )}
    </div>
  );
}

function QuestionFieldDialog({
  isOpen,
  sections,
  currentSectionId,
  field,
  isNew,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  sections: TcmQuestionSection[];
  currentSectionId: string;
  field: TcmQuestionField | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (targetSectionId: string, field: TcmQuestionField, isNew: boolean) => void;
}) {
  const [targetSectionId, setTargetSectionId] = useState(currentSectionId || sections[0]?.id || "");
  const [fieldId, setFieldId] = useState(field?.id || "");
  const [label, setLabel] = useState(field?.label || "");
  const [type, setType] = useState<TcmQuestionField["type"]>(field?.type || "text");
  const [placeholder, setPlaceholder] = useState(field?.placeholder || "");
  const [optionsText, setOptionsText] = useState((field?.options || []).join("\n"));
  const [required, setRequired] = useState(field?.required ?? false);

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    if (isNew && (!fieldId || fieldId.startsWith("q_"))) {
      const generated =
        "q_" +
        newLabel
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .substring(0, 24);
      setFieldId(generated);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      toast.error("Label pertanyaan wajib diisi.");
      return;
    }
    const finalId =
      fieldId.trim() ||
      `q_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const parsedOptions = optionsText
      .split(/\r?\n|,/)
      .map((opt) => opt.trim())
      .filter(Boolean);

    const savedField: TcmQuestionField = {
      id: finalId,
      label: label.trim(),
      type,
      placeholder: placeholder.trim() || undefined,
      options: parsedOptions.length > 0 ? parsedOptions : undefined,
      required,
    };

    onSave(targetSectionId, savedField, isNew);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isNew ? "Tambah Soal Skrining Baru" : "Edit Soal Skrining"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Atur teks pertanyaan, jenis input jawaban pasien, dan opsi bantuan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Bagian / Kategori Soal</label>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Pertanyaan / Label Input <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Contoh: Apa keluhan yang paling mengganggu saat ini?"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              ID Field Unik <span className="text-muted-foreground font-normal">(snake_case)</span>
            </label>
            <Input
              placeholder="b1_keluhan_utama"
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tipe Input Pasien</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TcmQuestionField["type"])}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="text">Teks Pendek (Text Input)</option>
              <option value="textarea">Teks Panjang (Textarea / Keluhan Rinci)</option>
              <option value="select">Pilihan Dropdown (Select Menu)</option>
              <option value="scale">Skala 0–10 (Slider Keparahan Nyeri/Keluhan)</option>
              <option value="number">Angka (Usia, Durasi, Hari)</option>
              <option value="date">Tanggal (Tanggal Pemeriksaan)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Teks Bantuan / Placeholder
            </label>
            <Input
              placeholder="Contoh: Jelaskan keluhan Anda..."
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="text-xs"
            />
          </div>

          {(type === "select" || type === "text" || type === "textarea") && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  {type === "select" ? "Daftar Pilihan Dropdown" : "Saran Jawaban Cepat (Chips)"}
                </label>
                <span className="text-[10px] text-muted-foreground">1 opsi per baris</span>
              </div>
              <textarea
                placeholder={`Nyeri tertusuk\nBerdenyut\nTerbakar\nKaku & kebas`}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="field_required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="field_required"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
              Wajib diisi oleh pasien sebelum lanjut
            </label>
          </div>

          <DialogFooter className="pt-2 border-t gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Check className="h-4 w-4" />
              Simpan Soal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionDialog({
  isOpen,
  section,
  isNew,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  section: TcmQuestionSection | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (section: TcmQuestionSection, isNew: boolean) => void;
}) {
  const [id, setId] = useState(section?.id || "");
  const [letter, setLetter] = useState(section?.letter || "A");
  const [title, setTitle] = useState(section?.title || "");
  const [shortTitle, setShortTitle] = useState(section?.shortTitle || "");
  const [description, setDescription] = useState(section?.description || "");
  const [femaleOnly, setFemaleOnly] = useState(section?.femaleOnly ?? false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul bagian wajib diisi.");
      return;
    }
    const finalId =
      id.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .substring(0, 24);

    const savedSec: TcmQuestionSection = {
      id: finalId,
      letter: letter.trim() || "A",
      title: title.trim(),
      shortTitle: shortTitle.trim() || undefined,
      description: description.trim() || undefined,
      femaleOnly,
      fields: section?.fields || [],
    };

    onSave(savedSec, isNew);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isNew ? "Tambah Bagian Skrining Baru" : "Edit Bagian Skrining"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Atur judul, kode huruf, dan petunjuk untuk grup soal ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-foreground">Kode Huruf</label>
              <Input
                placeholder="A, B, C..."
                value={letter}
                onChange={(e) => setLetter(e.target.value.toUpperCase())}
                maxLength={4}
                className="text-xs uppercase font-bold text-center"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-foreground">ID Bagian (Key)</label>
              <Input
                placeholder="identitas_pasien"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Lengkap Bagian <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Contoh: A. IDENTITAS PASIEN"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Singkat (Navigasi / Tab)
            </label>
            <Input
              placeholder="Contoh: Identitas"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Deskripsi / Petunjuk</label>
            <textarea
              placeholder="Petunjuk pengerjaan untuk pasien..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sec_female_only"
              checked={femaleOnly}
              onChange={(e) => setFemaleOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="sec_female_only"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
              Bagian ini khusus untuk Pasien Perempuan (Kebidanan / Menstruasi)
            </label>
          </div>

          <DialogFooter className="pt-2 border-t gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Check className="h-4 w-4" />
              Simpan Bagian
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
