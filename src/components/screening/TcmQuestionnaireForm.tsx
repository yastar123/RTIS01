import React, { useState, useEffect } from "react";
import {
  TCM_SECTIONS,
  TcmQuestionSection,
  TcmQuestionField,
  getTotalQuestionCount,
  getAnsweredQuestionCount,
} from "@/data/tcmQuestions";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TcmQuestionnaireFormProps {
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
  onComplete: () => void;
  patientProfile?: {
    fullName?: string;
    age?: number | string;
    gender?: string;
    phone?: string;
  };
  customSections?: TcmQuestionSection[];
  isReadOnly?: boolean;
}

export function TcmQuestionnaireForm({
  answers,
  onChange,
  onComplete,
  patientProfile,
  customSections,
  isReadOnly = false,
}: TcmQuestionnaireFormProps) {
  const sectionsToUse: TcmQuestionSection[] =
    customSections && customSections.length > 0 ? customSections : TCM_SECTIONS;

  const [activeSectionKey, setActiveSectionKey] = useState<string>(
    sectionsToUse[0]?.key || "identitas",
  );
  const [isFemale, setIsFemale] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Pre-fill Section A if empty
  useEffect(() => {
    if (patientProfile && Object.keys(answers).length === 0) {
      const initial: Record<string, string> = {};
      if (patientProfile.fullName) initial["a1_nama"] = patientProfile.fullName;
      if (patientProfile.age) initial["a2_usia"] = String(patientProfile.age);
      if (patientProfile.gender) {
        const gen = patientProfile.gender.toLowerCase();
        initial["a3_gender"] =
          gen.includes("perempuan") || gen === "p" || gen.includes("wanita")
            ? "Perempuan"
            : "Laki-laki";
      }
      initial["a5_tanggal"] = new Date().toISOString().split("T")[0];
      onChange({ ...answers, ...initial });
    }
  }, [patientProfile]);

  // Determine if patient is female from answers or profile
  useEffect(() => {
    const genderAns =
      answers["a3_gender"] || answers["a3_jenis_kelamin"] || patientProfile?.gender || "";
    const lower = genderAns.toLowerCase();
    setIsFemale(lower.includes("perempuan") || lower === "p" || lower.includes("wanita"));
  }, [answers, patientProfile]);

  const handleFieldChange = (fieldId: string, value: string) => {
    if (isReadOnly) return;
    const nextAnswers = { ...answers, [fieldId]: value };
    onChange(nextAnswers);
  };

  const handleToggleMultiSelect = (fieldId: string, option: string) => {
    if (isReadOnly) return;
    const currentStr = answers[fieldId] || "";
    const current = currentStr ? currentStr.split(", ").map((s) => s.trim()) : [];
    const exists = current.includes(option);
    let nextList: string[];
    if (exists) {
      nextList = current.filter((item) => item !== option);
    } else {
      nextList = [...current, option];
    }
    handleFieldChange(fieldId, nextList.join(", "));
  };

  const visibleSections = sectionsToUse.filter((s) => !s.isFemaleOnly || isFemale);
  const activeSectionIndex = visibleSections.findIndex(
    (s) => s.key === activeSectionKey || s.code === activeSectionKey,
  );
  const currentSection =
    visibleSections[activeSectionIndex >= 0 ? activeSectionIndex : 0] || visibleSections[0];

  // Helper counts
  const totalQuestions = visibleSections.reduce((acc, sec) => acc + (sec.fields?.length || 0), 0);
  const answeredCount = visibleSections.reduce((acc, sec) => {
    return (
      acc +
      (sec.fields?.filter((f) => {
        const val = answers[f.id];
        return val !== undefined && val !== null && String(val).trim().length > 0;
      }).length || 0)
    );
  }, 0);

  const progressPct = Math.min(
    100,
    Math.round((answeredCount / Math.max(1, totalQuestions)) * 100),
  );

  const handleNextSection = () => {
    if (activeSectionIndex < visibleSections.length - 1) {
      setActiveSectionKey(visibleSections[activeSectionIndex + 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onComplete();
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionKey(visibleSections[activeSectionIndex - 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isSectionComplete = (sec: TcmQuestionSection) => {
    if (!sec.fields || sec.fields.length === 0) return true;
    return sec.fields.every((f) => {
      const val = answers[f.id];
      return val !== undefined && val !== null && String(val).trim().length > 0;
    });
  };

  const getSectionAnsweredCount = (sec: TcmQuestionSection) => {
    if (!sec.fields) return 0;
    return sec.fields.filter((f) => {
      const val = answers[f.id];
      return val !== undefined && val !== null && String(val).trim().length > 0;
    }).length;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-emerald-500/5 to-teal-500/10 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <ClipboardList className="h-4 w-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Formulir Skrening & Anamnesis Pasien Holistik
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Silakan isi pertanyaan-pertanyaan berikut dengan kondisi tubuh yang Anda rasakan. Form
              input ini dirancang untuk analisa akupunktur & herbal secara komprehensif.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-card/80 backdrop-blur-xs p-3 rounded-xl border shrink-0">
            <div className="text-right">
              <div className="text-xs font-semibold text-foreground">
                {answeredCount} dari {totalQuestions} Terisi
              </div>
              <div className="text-[11px] text-muted-foreground">Kelengkapan {progressPct}%</div>
            </div>
            <div className="h-10 w-10 relative flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/40"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-500"
                  strokeDasharray={`${progressPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold font-mono text-primary">
                {progressPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full bg-linear-to-r from-primary to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Section Navigation Pills */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-center gap-1.5 min-w-max">
          {visibleSections.map((sec) => {
            const isActive = sec.key === activeSectionKey;
            const complete = isSectionComplete(sec);
            const ansCount = getSectionAnsweredCount(sec);
            const totalFieldsCount = sec.fields?.length || 0;

            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSectionKey(sec.key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                    : complete
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-card text-muted-foreground border hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="font-bold">{sec.code}.</span>
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {sec.shortTitle || sec.title}
                </span>
                {complete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : ansCount > 0 ? (
                  <span className="text-[10px] font-mono opacity-80 shrink-0">
                    {ansCount}/{totalFieldsCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Form Card */}
      {currentSection && (
        <Card className="border shadow-sm bg-card transition-all">
          <CardHeader className="p-4 sm:p-6 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                  {currentSection.code}
                </span>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {currentSection.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {currentSection.description}
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant="secondary"
                className={`self-start sm:self-auto text-xs px-2.5 py-1 ${
                  isSectionComplete(currentSection)
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {getSectionAnsweredCount(currentSection)} / {currentSection.fields?.length || 0}{" "}
                Pertanyaan Terisi
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            {currentSection.fields &&
              currentSection.fields.map((q, qIndex) => {
                const currentValue = answers[q.id] || "";
                const isFilled = Boolean(currentValue && String(currentValue).trim().length > 0);
                const chipSuggestions = q.suggestions || q.options || [];

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isFilled
                        ? "bg-card border-border/80"
                        : "bg-muted/10 border-dashed border-border hover:border-primary/40"
                    }`}
                  >
                    {/* Question Header & Title */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <label
                        htmlFor={q.id}
                        className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed flex items-start gap-2 cursor-pointer"
                      >
                        <span className="font-mono text-primary font-bold shrink-0 mt-0.5">
                          {q.number || qIndex + 1}.
                        </span>
                        <span>
                          {q.label}
                          {q.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                        </span>
                      </label>
                      {isFilled && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Terisi
                        </span>
                      )}
                    </div>

                    {/* Render Input Based on Type */}
                    <div className="pl-0 sm:pl-5 space-y-2.5">
                      {/* TYPE: SCALE (0-10) */}
                      {q.type === "scale" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                              const active =
                                currentValue === String(num) ||
                                currentValue.startsWith(String(num));
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => handleFieldChange(q.id, String(num))}
                                  className={`h-10 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                    active
                                      ? num >= 8
                                        ? "bg-rose-600 text-white shadow-md scale-105"
                                        : num >= 5
                                          ? "bg-amber-600 text-white shadow-md scale-105"
                                          : num >= 1
                                            ? "bg-primary text-white shadow-md scale-105"
                                            : "bg-emerald-600 text-white shadow-md scale-105"
                                      : "bg-muted/40 hover:bg-muted text-foreground border border-border/80 hover:border-primary"
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>

                          {/* Pain Scale Labels */}
                          <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                            <span className="text-emerald-600 font-medium">0 = Tidak Nyeri</span>
                            <span className="text-amber-600 font-medium">1–4 = Ringan</span>
                            <span className="text-amber-700 font-medium">5–7 = Sedang</span>
                            <span className="text-rose-600 font-medium">8–10 = Sangat Berat</span>
                          </div>

                          <Input
                            id={q.id}
                            type="text"
                            disabled={isReadOnly}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(q.id, e.target.value)}
                            placeholder="Atau ketik keterangan skala di sini (cth: 7 - terasa sangat menusuk saat bergerak)"
                            className="text-xs h-9 bg-background"
                          />
                        </div>
                      )}

                      {/* TYPE: TEXTAREA */}
                      {q.type === "textarea" && (
                        <div className="space-y-2">
                          <Textarea
                            id={q.id}
                            disabled={isReadOnly}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(q.id, e.target.value)}
                            placeholder={
                              q.placeholder || "Ketikkan jawaban lengkap Anda di sini..."
                            }
                            rows={3}
                            className="text-xs sm:text-sm resize-y leading-relaxed bg-background"
                          />

                          {/* Suggested quick chips */}
                          {chipSuggestions.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Saran / Pilihan Cepat:
                              </span>
                              {chipSuggestions.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => {
                                    if (!currentValue) {
                                      handleFieldChange(q.id, opt);
                                    } else if (!currentValue.includes(opt)) {
                                      handleFieldChange(q.id, `${currentValue}, ${opt}`);
                                    }
                                  }}
                                  className="text-[10px] px-2.5 py-1 rounded-md bg-muted/70 hover:bg-primary/15 hover:text-primary border text-muted-foreground transition-colors cursor-pointer"
                                >
                                  + {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TYPE: SELECT / OPTIONS */}
                      {(q.type === "select" ||
                        (q.options &&
                          q.options.length > 0 &&
                          q.type !== "textarea" &&
                          q.type !== "scale")) && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {chipSuggestions.map((option) => {
                              const isSelected =
                                currentValue === option ||
                                currentValue
                                  .split(", ")
                                  .map((s) => s.trim())
                                  .includes(option);

                              return (
                                <button
                                  key={option}
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => {
                                    if (
                                      q.id === "e1_riwayat_penyakit" ||
                                      q.id === "c3_sifat_keluhan"
                                    ) {
                                      handleToggleMultiSelect(q.id, option);
                                    } else {
                                      handleFieldChange(q.id, option);
                                    }
                                  }}
                                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary"
                                      : "border border-border/80 bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                  }`}
                                >
                                  {isSelected ? "✓ " : ""}
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {/* Free text input alongside options */}
                          <Input
                            id={q.id}
                            type="text"
                            disabled={isReadOnly}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(q.id, e.target.value)}
                            placeholder={
                              q.placeholder || "Atau ketik keterangan Anda secara spesifik..."
                            }
                            className="text-xs h-9 bg-background mt-1.5"
                          />
                        </div>
                      )}

                      {/* TYPE: DATE */}
                      {q.type === "date" && (
                        <Input
                          id={q.id}
                          type="date"
                          disabled={isReadOnly}
                          value={currentValue}
                          onChange={(e) => handleFieldChange(q.id, e.target.value)}
                          className="text-xs h-9 max-w-xs bg-background"
                        />
                      )}

                      {/* TYPE: TEXT / NUMBER DEFAULT */}
                      {q.type !== "textarea" &&
                        q.type !== "scale" &&
                        q.type !== "date" &&
                        q.type !== "select" &&
                        (!q.options || q.options.length === 0) && (
                          <div className="space-y-2">
                            <div className="relative flex items-center">
                              <Input
                                id={q.id}
                                type={q.type === "number" ? "number" : "text"}
                                disabled={isReadOnly}
                                value={currentValue}
                                onChange={(e) => handleFieldChange(q.id, e.target.value)}
                                placeholder={
                                  q.placeholder || "Ketikkan uraian jawaban Anda di sini..."
                                }
                                className="text-xs sm:text-sm h-10 bg-background pr-8 border-border/90 focus-visible:ring-2 focus-visible:ring-primary/40"
                              />
                              {currentValue && !isReadOnly && (
                                <button
                                  type="button"
                                  title="Bersihkan isian"
                                  onClick={() => handleFieldChange(q.id, "")}
                                  className="absolute right-2.5 text-muted-foreground hover:text-foreground text-xs p-1 rounded transition-colors"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            {chipSuggestions.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  Pilihan Cepat / Contoh:
                                </span>
                                {chipSuggestions.map((sug) => (
                                  <button
                                    key={sug}
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => handleFieldChange(q.id, sug)}
                                    className="text-[10px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-primary/15 hover:text-primary text-muted-foreground transition-colors cursor-pointer border border-border/50"
                                  >
                                    + {sug}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevSection}
          disabled={activeSectionIndex <= 0}
          className="w-full sm:w-auto gap-2 text-xs sm:text-sm cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Bagian Sebelumnya
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Bagian {activeSectionIndex + 1} dari {visibleSections.length} ({currentSection?.title})
        </div>

        {activeSectionIndex < visibleSections.length - 1 ? (
          <Button
            type="button"
            onClick={handleNextSection}
            className="w-full sm:w-auto gap-2 text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Lanjut ke Bagian {visibleSections[activeSectionIndex + 1]?.code} (
            {visibleSections[activeSectionIndex + 1]?.shortTitle ||
              visibleSections[activeSectionIndex + 1]?.title}
            )
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onComplete}
            className="w-full sm:w-auto gap-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-semibold cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Selesai Isi Form & Lanjut ke Tahap 2
          </Button>
        )}
      </div>
    </div>
  );
}
