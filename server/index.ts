import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { desc, eq, or } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import {
  articles,
  cmsContent,
  profiles,
  reservations,
  screeningQuestions,
  screeningResults,
  services,
  sessions,
  users,
} from "./db/schema";
import { generateOpenRouterTcmAnalysis } from "./geminiTcm";

const app = express();
app.use(express.json({ limit: "2mb" }));

function sessionUser(req: express.Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  return { token };
}

async function requireUser(req: express.Request, res: express.Response) {
  const session = sessionUser(req);
  if (!session) {
    res.status(401).json({ message: "Silakan masuk terlebih dahulu." });
    return null;
  }
  const db = getDb();
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, session.token))
    .limit(1);
  if (!result[0] || result[0].session.expiresAt < new Date()) {
    res.status(401).json({ message: "Sesi telah berakhir." });
    return null;
  }
  return result[0].user;
}

async function requireAdmin(req: express.Request, res: express.Response) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    res.status(403).json({ message: "Akses admin diperlukan." });
    return null;
  }
  return user;
}

function validateProfile(input: Record<string, unknown>) {
  const required = ["full_name", "gender", "phone", "address"];
  if (required.some((key) => typeof input[key] !== "string" || !String(input[key]).trim()))
    return false;
  return Number(input.age) > 0 && Number(input.height) > 0 && Number(input.weight) > 0;
}

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, database: Boolean(process.env.DATABASE_URL) }),
);

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, profile } = req.body as {
      email?: string;
      password?: string;
      profile?: Record<string, unknown>;
    };
    if (!email || !password || password.length < 8 || !profile || !validateProfile(profile))
      return res.status(400).json({ message: "Data pendaftaran belum lengkap." });
    const db = getDb();
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ email: email.toLowerCase(), passwordHash })
      .returning();
    if (!user) return res.status(400).json({ message: "Gagal membuat akun." });
    await db.insert(profiles).values({
      userId: user.id,
      fullName: String(profile.full_name),
      gender: String(profile.gender),
      age: Number(profile.age),
      height: Number(profile.height),
      weight: Number(profile.weight),
      phone: String(profile.phone),
      address: String(profile.address),
      referralCode: profile.referral_code ? String(profile.referral_code) : null,
      tonguePhotoUrl: null,
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error && error.message.includes("unique")
          ? "Email sudah terdaftar."
          : "Gagal membuat akun.",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, String(req.body.email).toLowerCase()))
      .limit(1);
    if (!user || !(await bcrypt.compare(String(req.body.password), user.passwordHash)))
      return res.status(401).json({ message: "Email atau password salah." });
    const token = randomBytes(32).toString("hex");
    await db.insert(sessions).values({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Gagal masuk." });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  const token = sessionUser(req)?.token;
  if (token) await getDb().delete(sessions).where(eq(sessions.token, token));
  res.json({ ok: true });
});

app.get("/api/auth/me", async (req, res) => {
  try {
    if (!sessionUser(req)) return res.json({ user: null });
    const user = await requireUser(req, res);
    if (user) res.json({ user });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Database belum siap." });
  }
});

app.get("/api/profile", async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const [profile] = await getDb()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    if (!profile) return res.json(null);
    res.json({
      ...profile,
      full_name: profile.fullName,
      referral_code: profile.referralCode,
      tongue_photo_url: profile.tonguePhotoUrl,
    });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat profil." });
  }
});

app.put("/api/profile", async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const {
      full_name,
      fullName,
      gender,
      age,
      height,
      weight,
      phone,
      address,
      referral_code,
      referralCode,
      tongue_photo_url,
      tonguePhotoUrl,
    } = req.body;

    const nameToSave = String(full_name || fullName || "").trim();
    if (!nameToSave) return res.status(400).json({ message: "Nama lengkap harus diisi." });

    const updateData = {
      fullName: nameToSave,
      gender: String(gender ?? "Laki-laki"),
      age: Number(age ?? 25),
      height: Number(height ?? 165),
      weight: Number(weight ?? 60),
      phone: String(phone ?? ""),
      address: String(address ?? ""),
      referralCode: referral_code || referralCode ? String(referral_code || referralCode) : null,
      tonguePhotoUrl:
        tongue_photo_url || tonguePhotoUrl ? String(tongue_photo_url || tonguePhotoUrl) : null,
      updatedAt: new Date(),
    };

    const db = getDb();
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    let updated;
    if (existing) {
      [updated] = await db
        .update(profiles)
        .set(updateData)
        .where(eq(profiles.userId, user.id))
        .returning();
    } else {
      [updated] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          ...updateData,
        })
        .returning();
    }

    res.json({
      ...updated,
      full_name: updated.fullName,
      referral_code: updated.referralCode,
      tongue_photo_url: updated.tonguePhotoUrl,
    });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memperbarui profil." });
  }
});

app.get("/api/profile/:userId/screening", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    if (!profile) {
      return res.status(404).json({ message: "Profil tidak ditemukan." });
    }
    res.json({
      fullName: profile.fullName,
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      phone: profile.phone,
      address: profile.address,
      tonguePhotoUrl: profile.tonguePhotoUrl,
      screeningAnswers: profile.screeningAnswers,
      screeningCompletedAt: profile.screeningCompletedAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat hasil skrining." });
  }
});

app.put("/api/profile/screening", async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const {
      fullName,
      gender,
      age,
      height,
      weight,
      phone,
      address,
      tonguePhotoUrl,
      screeningAnswers,
    } = req.body;

    const db = getDb();
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    const updateData = {
      fullName: fullName ?? existing?.fullName ?? "",
      gender: gender ?? existing?.gender ?? "Laki-laki",
      age: age ? Number(age) : (existing?.age ?? 25),
      height: height ? Number(height) : (existing?.height ?? 165),
      weight: weight ? Number(weight) : (existing?.weight ?? 60),
      phone: phone ?? existing?.phone ?? "",
      address: address ?? existing?.address ?? "",
      tonguePhotoUrl: tonguePhotoUrl ?? existing?.tonguePhotoUrl ?? null,
      screeningAnswers:
        typeof screeningAnswers === "string" ? screeningAnswers : JSON.stringify(screeningAnswers),
      screeningCompletedAt: new Date(),
      updatedAt: new Date(),
    };

    let updated;
    if (existing) {
      [updated] = await db
        .update(profiles)
        .set(updateData)
        .where(eq(profiles.userId, user.id))
        .returning();
    } else {
      [updated] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          ...updateData,
        })
        .returning();
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Gagal menyimpan hasil skrining.",
    });
  }
});

app.post("/api/profile/screening-results", async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    const { answers, score, maxScore, level, advice } = req.body;
    if (
      answers === undefined ||
      score === undefined ||
      maxScore === undefined ||
      !level ||
      !advice
    ) {
      return res.status(400).json({ message: "Data hasil skrining tidak lengkap." });
    }

    const db = getDb();
    const answersStr = typeof answers === "string" ? answers : JSON.stringify(answers);

    // Save to screening_results table
    const [inserted] = await db
      .insert(screeningResults)
      .values({
        userId: user.id,
        answers: answersStr,
        score: Number(score),
        maxScore: Number(maxScore),
        level,
        advice,
        createdAt: new Date(),
      })
      .returning();

    // Also update profiles table so legacy/other pages can see the latest
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (existingProfile) {
      await db
        .update(profiles)
        .set({
          screeningAnswers: answersStr,
          screeningCompletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id));
    } else {
      // Create a profile fallback if somehow not present
      await db.insert(profiles).values({
        userId: user.id,
        fullName: user.email.split("@")[0],
        gender: "Laki-laki",
        age: 25,
        height: 165,
        weight: 60,
        phone: "",
        address: "",
        screeningAnswers: answersStr,
        screeningCompletedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json(inserted);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Gagal menyimpan hasil skrining.",
    });
  }
});

app.get("/api/profile/screening-results", async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    const db = getDb();
    const results = await db
      .select()
      .from(screeningResults)
      .where(eq(screeningResults.userId, user.id))
      .orderBy(desc(screeningResults.createdAt));

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Gagal mengambil riwayat skrining.",
    });
  }
});

app.post("/api/screening/generate-ai-analysis", async (req, res) => {
  try {
    const { answers, questions, patientProfile, basicResults } = req.body;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Data jawaban kuesioner diperlukan." });
    }

    const aiReport = await generateOpenRouterTcmAnalysis({
      answers,
      questions,
      patientProfile,
      basicResults,
    });

    res.json(aiReport);
  } catch (error) {
    console.error("[API] Gagal generate analisa TCM AI:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Gagal melakukan analisa TCM berbasis AI.",
    });
  }
});

app.post("/api/reservations", async (req, res) => {
  try {
    const { name, phone, service, date, time, note } = req.body;
    if (![name, phone, service, date, time].every((value) => String(value ?? "").trim()))
      return res.status(400).json({ message: "Data reservasi belum lengkap." });
    const code = `RIS-${randomBytes(3).toString("hex").toUpperCase()}`;
    const [reservation] = await getDb()
      .insert(reservations)
      .values({ code, name, phone, service, date, time, note: note || null })
      .returning();
    res.status(201).json({ ...reservation, createdAt: reservation?.createdAt.toISOString() });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Database belum siap." });
  }
});

app.get("/api/reservations", async (req, res) => {
  try {
    const query = String(req.query.query ?? "").trim();
    if (!query) return res.json(null);
    const normalized = query.replace(/\s/g, "");
    const result = await getDb()
      .select()
      .from(reservations)
      .where(or(eq(reservations.code, query.toUpperCase()), eq(reservations.phone, normalized)))
      .limit(1);
    res.json(result[0] ?? null);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Database belum siap." });
  }
});

app.get("/api/articles", async (_req, res) => {
  try {
    const result = await getDb()
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt), desc(articles.createdAt));
    res.json(result);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat artikel." });
  }
});

app.get("/api/admin/reservations", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const query = String(req.query.query ?? "")
      .trim()
      .toLowerCase();
    const result = await getDb().select().from(reservations).orderBy(desc(reservations.createdAt));
    res.json(
      query
        ? result.filter((item) =>
            [item.code, item.name, item.phone, item.service, item.status].some((value) =>
              value.toLowerCase().includes(query),
            ),
          )
        : result,
    );
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat reservasi." });
  }
});

app.post("/api/admin/reservations", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { name, phone, service, date, time, note, status } = req.body as Record<string, unknown>;
    if (![name, phone, service, date, time].every((value) => String(value ?? "").trim())) {
      return res
        .status(400)
        .json({ message: "Nama, nomor telepon, layanan, tanggal, dan waktu wajib diisi." });
    }
    const [reservation] = await getDb()
      .insert(reservations)
      .values({
        code: `RIS-${randomBytes(3).toString("hex").toUpperCase()}`,
        name: String(name).trim(),
        phone: String(phone).trim(),
        service: String(service).trim(),
        date: String(date),
        time: String(time),
        note: note ? String(note).trim() : null,
        status: status ? String(status) : "Menunggu Konfirmasi",
      })
      .returning();
    res.status(201).json(reservation);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal membuat reservasi." });
  }
});

app.patch("/api/admin/reservations/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { name, phone, service, date, time, note, status } = req.body as Record<string, unknown>;
    if (![name, phone, service, date, time].every((value) => String(value ?? "").trim())) {
      return res
        .status(400)
        .json({ message: "Nama, nomor telepon, layanan, tanggal, dan waktu wajib diisi." });
    }
    const [reservation] = await getDb()
      .update(reservations)
      .set({
        name: String(name).trim(),
        phone: String(phone).trim(),
        service: String(service).trim(),
        date: String(date),
        time: String(time),
        note: note ? String(note).trim() : null,
        status: status ? String(status) : "Menunggu Konfirmasi",
      })
      .where(eq(reservations.id, req.params.id))
      .returning();
    if (!reservation) return res.status(404).json({ message: "Reservasi tidak ditemukan." });
    res.json(reservation);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memperbarui reservasi." });
  }
});

app.delete("/api/admin/reservations/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const [reservation] = await getDb()
      .delete(reservations)
      .where(eq(reservations.id, req.params.id))
      .returning({ id: reservations.id });
    if (!reservation) return res.status(404).json({ message: "Reservasi tidak ditemukan." });
    res.json({ ok: true });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menghapus reservasi." });
  }
});

/* User Management APIs */
app.get("/api/admin/users", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const db = getDb();
    const list = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullName: profiles.fullName,
        gender: profiles.gender,
        age: profiles.age,
        height: profiles.height,
        weight: profiles.weight,
        phone: profiles.phone,
        address: profiles.address,
        referralCode: profiles.referralCode,
        tonguePhotoUrl: profiles.tonguePhotoUrl,
        screeningAnswers: profiles.screeningAnswers,
        screeningCompletedAt: profiles.screeningCompletedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(users.createdAt));
    res.json(list);
  } catch (error) {
    res.status(503).json({
      message: error instanceof Error ? error.message : "Gagal memuat daftar pengguna.",
    });
  }
});

app.post("/api/admin/users", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { email, password, fullName, gender, age, height, weight, phone, address, role } =
      req.body;
    if (!email || !password || password.length < 8 || !fullName || !gender || !phone || !address) {
      return res.status(400).json({
        message: "Lengkapi semua data bertanda bintang (*), password minimal 8 karakter.",
      });
    }
    const db = getDb();
    const passwordHash = await bcrypt.hash(password, 12);
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role ?? "user",
      })
      .returning();
    if (!newUser) return res.status(400).json({ message: "Gagal membuat akun user baru." });

    await db.insert(profiles).values({
      userId: newUser.id,
      fullName: String(fullName).trim(),
      gender: String(gender).trim(),
      age: Number(age || 0),
      height: Number(height || 0),
      weight: Number(weight || 0),
      phone: String(phone).trim(),
      address: String(address).trim(),
    });

    res.status(201).json({ ok: true, id: newUser.id });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error && error.message.includes("unique")
          ? "Email sudah terdaftar."
          : error instanceof Error
            ? error.message
            : "Gagal membuat pengguna.",
    });
  }
});

app.patch("/api/admin/users/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { email, password, fullName, gender, age, height, weight, phone, address, role } =
      req.body;
    if (!email || !fullName || !gender || !phone || !address) {
      return res.status(400).json({ message: "Lengkapi semua data bertanda bintang (*)." });
    }
    const db = getDb();
    const updateData: { email: string; role: string; passwordHash?: string } = {
      email: email.toLowerCase().trim(),
      role: role ?? "user",
    };
    if (password && password.trim().length >= 8) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    await db.update(users).set(updateData).where(eq(users.id, req.params.id));

    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, req.params.id))
      .limit(1);
    if (existingProfile.length > 0) {
      await db
        .update(profiles)
        .set({
          fullName: String(fullName).trim(),
          gender: String(gender).trim(),
          age: Number(age || 0),
          height: Number(height || 0),
          weight: Number(weight || 0),
          phone: String(phone).trim(),
          address: String(address).trim(),
        })
        .where(eq(profiles.userId, req.params.id));
    } else {
      await db.insert(profiles).values({
        userId: req.params.id,
        fullName: String(fullName).trim(),
        gender: String(gender).trim(),
        age: Number(age || 0),
        height: Number(height || 0),
        weight: Number(weight || 0),
        phone: String(phone).trim(),
        address: String(address).trim(),
      });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error && error.message.includes("unique")
          ? "Email sudah terdaftar."
          : error instanceof Error
            ? error.message
            : "Gagal mengupdate pengguna.",
    });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const db = getDb();
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({
      message: error instanceof Error ? error.message : "Gagal menghapus pengguna.",
    });
  }
});

function validateArticle(input: Record<string, unknown>) {
  return ["category", "title", "excerpt", "content", "readTime"].every(
    (key) => typeof input[key] === "string" && String(input[key]).trim(),
  );
}

app.post("/api/admin/articles", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    if (!validateArticle(req.body))
      return res
        .status(400)
        .json({ message: "Lengkapi kategori, judul, ringkasan, isi, dan waktu baca." });
    const input = req.body as Record<string, unknown>;
    const [article] = await getDb()
      .insert(articles)
      .values({
        category: String(input.category).trim(),
        title: String(input.title).trim(),
        excerpt: String(input.excerpt).trim(),
        content: String(input.content).trim(),
        readTime: String(input.readTime).trim(),
        publishedAt: input.publishedAt ? new Date(String(input.publishedAt)) : new Date(),
        updatedAt: new Date(),
      })
      .returning();
    res.status(201).json(article);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal membuat artikel." });
  }
});

app.patch("/api/admin/articles/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    if (!validateArticle(req.body))
      return res
        .status(400)
        .json({ message: "Lengkapi kategori, judul, ringkasan, isi, dan waktu baca." });
    const input = req.body as Record<string, unknown>;
    const [article] = await getDb()
      .update(articles)
      .set({
        category: String(input.category).trim(),
        title: String(input.title).trim(),
        excerpt: String(input.excerpt).trim(),
        content: String(input.content).trim(),
        readTime: String(input.readTime).trim(),
        publishedAt: input.publishedAt ? new Date(String(input.publishedAt)) : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(articles.id, req.params.id))
      .returning();
    if (!article) return res.status(404).json({ message: "Artikel tidak ditemukan." });
    res.json(article);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memperbarui artikel." });
  }
});

app.delete("/api/admin/articles/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const [article] = await getDb()
      .delete(articles)
      .where(eq(articles.id, req.params.id))
      .returning({ id: articles.id });
    if (!article) return res.status(404).json({ message: "Artikel tidak ditemukan." });
    res.json({ ok: true });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menghapus artikel." });
  }
});

/* Screening Questions APIs */
app.get("/api/screening/questions", async (_req, res) => {
  try {
    const questionsList = await getDb()
      .select()
      .from(screeningQuestions)
      .orderBy(screeningQuestions.sortOrder, screeningQuestions.createdAt);

    if (!questionsList || questionsList.length === 0) {
      const defaultQuestions = [
        "Saya sering merasa lelah atau kehilangan energi meski sudah cukup tidur.",
        "Saya sulit tidur atau sering terbangun di tengah malam.",
        "Saya sering merasa cemas, gelisah, atau sulit berkonsentrasi.",
        "Saya mengalami nyeri atau ketegangan otot secara berulang.",
        "Pencernaan saya tidak stabil (kembung, nyeri lambung, atau BAB tidak teratur).",
        "Saya sering merasakan ketidakseimbangan emosi (mudah marah, sedih, atau murung).",
        "Saya merasakan tubuh saya mudah dingin atau sebaliknya mudah panas.",
        "Saya merasa kualitas hidup saya menurun akibat keluhan di atas.",
      ];
      const inserted = [];
      for (let i = 0; i < defaultQuestions.length; i++) {
        const [q] = await getDb()
          .insert(screeningQuestions)
          .values({ questionText: defaultQuestions[i], sortOrder: i + 1 })
          .returning();
        if (q) inserted.push(q);
      }
      return res.json(
        inserted.length > 0
          ? inserted
          : defaultQuestions.map((text, idx) => ({
              id: `default-${idx}`,
              questionText: text,
              sortOrder: idx + 1,
            })),
      );
    }

    res.json(questionsList);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat soal skrining." });
  }
});

app.get("/api/admin/screenings", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const db = getDb();
    const results = await db
      .select({
        id: screeningResults.id,
        userId: screeningResults.userId,
        answers: screeningResults.answers,
        score: screeningResults.score,
        maxScore: screeningResults.maxScore,
        level: screeningResults.level,
        advice: screeningResults.advice,
        createdAt: screeningResults.createdAt,
        userEmail: users.email,
        fullName: profiles.fullName,
        phone: profiles.phone,
        gender: profiles.gender,
        age: profiles.age,
        tonguePhotoUrl: profiles.tonguePhotoUrl,
        complaints: profiles.address,
      })
      .from(screeningResults)
      .leftJoin(users, eq(screeningResults.userId, users.id))
      .leftJoin(profiles, eq(screeningResults.userId, profiles.userId))
      .orderBy(desc(screeningResults.createdAt));

    res.json(results);
  } catch (error) {
    res.status(503).json({
      message: error instanceof Error ? error.message : "Gagal memuat daftar hasil skrining.",
    });
  }
});

app.delete("/api/admin/screenings/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const db = getDb();
    await db.delete(screeningResults).where(eq(screeningResults.id, req.params.id));
    res.json({ message: "Hasil skrining berhasil dihapus." });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Gagal menghapus hasil skrining.",
    });
  }
});

app.post("/api/admin/screening/questions", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { questionText, sortOrder } = req.body as { questionText?: string; sortOrder?: number };
    if (!questionText || !questionText.trim()) {
      return res.status(400).json({ message: "Teks pertanyaan tidak boleh kosong." });
    }
    const [q] = await getDb()
      .insert(screeningQuestions)
      .values({
        questionText: questionText.trim(),
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      })
      .returning();
    res.status(201).json(q);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menambah soal skrining." });
  }
});

app.patch("/api/admin/screening/questions/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { questionText, sortOrder } = req.body as { questionText?: string; sortOrder?: number };
    if (!questionText || !questionText.trim()) {
      return res.status(400).json({ message: "Teks pertanyaan tidak boleh kosong." });
    }
    const [q] = await getDb()
      .update(screeningQuestions)
      .set({
        questionText: questionText.trim(),
        ...(typeof sortOrder === "number" ? { sortOrder } : {}),
      })
      .where(eq(screeningQuestions.id, req.params.id))
      .returning();
    if (!q) return res.status(404).json({ message: "Soal tidak ditemukan." });
    res.json(q);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal mengedit soal skrining." });
  }
});

app.delete("/api/admin/screening/questions/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const [q] = await getDb()
      .delete(screeningQuestions)
      .where(eq(screeningQuestions.id, req.params.id))
      .returning();
    if (!q) return res.status(404).json({ message: "Soal tidak ditemukan." });
    res.json({ ok: true });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menghapus soal skrining." });
  }
});

app.get("/api/services", async (_req, res) => {
  try {
    const db = getDb();
    const list = await db.select().from(services);
    if (!list || list.length === 0) {
      const defaultSrvs = [
        {
          name: "Akupunktur",
          price: 150000,
          duration: "± 60 menit",
          description:
            "Penusukan titik meridian untuk meredakan nyeri dan menyeimbangkan energi tubuh.",
        },
        {
          name: "Herbal Formula",
          price: 120000,
          duration: "± 30 menit",
          description: "Konsultasi dan peresepan formula herbal sesuai pola tubuh Anda.",
        },
        {
          name: "Tuina",
          price: 130000,
          duration: "± 60 menit",
          description: "Terapi pijat tekan TCM untuk otot kaku, pegal, dan gangguan sendi.",
        },
        {
          name: "BSM (Body Space Medicine)",
          price: 175000,
          duration: "± 45 menit",
          description: "Pendekatan pergerakan energi antar organ untuk keluhan kronis.",
        },
        {
          name: "Konseling",
          price: 100000,
          duration: "± 45 menit",
          description: "Sesi bicara terarah untuk stres, kecemasan, dan pemulihan emosi.",
        },
        {
          name: "Audioterapi",
          price: 90000,
          duration: "± 30 menit",
          description: "Terapi frekuensi suara untuk relaksasi dan kualitas tidur.",
        },
      ];
      const inserted = [];
      for (const s of defaultSrvs) {
        const [row] = await db.insert(services).values(s).returning();
        if (row) inserted.push(row);
      }
      return res.json(inserted.length > 0 ? inserted : defaultSrvs);
    }
    res.json(list);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat layanan." });
  }
});

app.post("/api/admin/services", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { name, price, duration, description } = req.body;
    if (!name || typeof price !== "number" || !duration || !description) {
      return res
        .status(400)
        .json({ message: "Lengkapi nama, harga, durasi, dan deskripsi layanan." });
    }
    const db = getDb();
    const [row] = await db
      .insert(services)
      .values({
        name: String(name).trim(),
        price: Number(price),
        duration: String(duration).trim(),
        description: String(description).trim(),
      })
      .returning();
    res.status(201).json(row);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menambah layanan." });
  }
});

app.patch("/api/admin/services/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { name, price, duration, description } = req.body;
    const db = getDb();
    const [row] = await db
      .update(services)
      .set({
        name: String(name).trim(),
        price: Number(price),
        duration: String(duration).trim(),
        description: String(description).trim(),
      })
      .where(eq(services.id, req.params.id))
      .returning();
    if (!row) return res.status(404).json({ message: "Layanan tidak ditemukan." });
    res.json(row);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memperbarui layanan." });
  }
});

app.delete("/api/admin/services/:id", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const db = getDb();
    const [row] = await db
      .delete(services)
      .where(eq(services.id, req.params.id))
      .returning({ id: services.id });
    if (!row) return res.status(404).json({ message: "Layanan tidak ditemukan." });
    res.json({ ok: true });
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menghapus layanan." });
  }
});

app.get("/api/cms/:pageKey", async (req, res) => {
  try {
    const { pageKey } = req.params;
    if (pageKey !== "home" && pageKey !== "about") {
      return res.status(404).json({ message: "Halaman CMS tidak ditemukan." });
    }
    const db = getDb();
    const rows = await db.select().from(cmsContent).where(eq(cmsContent.pageKey, pageKey));
    if (rows && rows.length > 0) {
      return res.json(rows[0]);
    }

    const defaults: Record<string, Record<string, unknown>> = {
      home: {
        pageKey: "home",
        title: "Rumah Terapy Ikhtiar Sehat — Klinik TCM Holistik Surabaya",
        description:
          "Layanan Pengobatan Tradisional Tiongkok profesional: akupunktur, herbal formula, Tuina, BSM, konseling, dan audioterapi bersama terapis bersertifikat.",
        heroTitle: "Pendekatan Holistik untuk Keseimbangan Tubuh & Jiwa",
        heroSubtitle:
          "Klinik Pengobatan Tradisional Tiongkok (TCM) terpadu di Surabaya. Membantu memulihkan vitalitas secara alami melalui akupunktur, herbal, dan terapi manual.",
        contentJson: JSON.stringify({
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
        }),
      },
      about: {
        pageKey: "about",
        title: "Tentang Kami — Rumah Terapy Ikhtiar Sehat",
        description:
          "Filosofi, pendekatan, dan perjalanan Rumah Terapy Ikhtiar Sehat sebagai rumah sehat tradisional Chinese medicine.",
        heroTitle: "Rumah sehat yang merawat dengan sabar",
        heroSubtitle:
          "Rumah Terapy Ikhtiar Sehat lahir dari keyakinan sederhana: tubuh punya kemampuan memulihkan diri bila hambatannya dibuka satu per satu.",
        contentJson: JSON.stringify({
          philosophyText:
            "Kami berpegang pada diagnosa sindrom TCM — pengamatan lidah, palpasi nadi, dan wawancara mendalam — lalu menerjemahkannya menjadi rencana terapi yang terukur.",
          values: [
            [
              "Keseimbangan",
              "Tubuh dipandang sebagai satu sistem. Kami mencari akar, bukan menutup gejala.",
            ],
            ["Ketenangan", "Ruang terapi dirancang hening agar tubuh masuk ke mode pemulihan."],
            ["Kejujuran", "Kami menyampaikan ekspektasi terapi apa adanya, termasuk batasannya."],
            ["Pendampingan", "Setiap pasien dievaluasi tiap sesi, bukan sekadar diberi resep."],
          ],
          timeline: [
            ["2013", "Praktik pertama akupunktur dan herbal dalam skala rumahan."],
            ["2017", "Menambahkan Tuina dan konseling sebagai bagian dari protokol terapi."],
            ["2021", "Mengadopsi pendekatan BSM untuk kasus kronis dan degeneratif."],
            ["2024", "Membuka layanan audioterapi dan sistem reservasi terjadwal."],
          ],
        }),
      },
    };

    const defaultData = defaults[pageKey];
    const [inserted] = await db.insert(cmsContent).values(defaultData).returning();
    res.json(inserted || defaultData);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat data CMS." });
  }
});

app.put("/api/admin/cms/:pageKey", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { pageKey } = req.params;
    if (pageKey !== "home" && pageKey !== "about") {
      return res.status(404).json({ message: "Halaman CMS tidak ditemukan." });
    }
    const { title, description, heroTitle, heroSubtitle, contentJson } = req.body;
    const db = getDb();

    const existing = await db.select().from(cmsContent).where(eq(cmsContent.pageKey, pageKey));
    if (existing && existing.length > 0) {
      const [updated] = await db
        .update(cmsContent)
        .set({
          title: title ?? existing[0].title,
          description: description ?? existing[0].description,
          heroTitle: heroTitle ?? existing[0].heroTitle,
          heroSubtitle: heroSubtitle ?? existing[0].heroSubtitle,
          contentJson: contentJson ?? existing[0].contentJson,
          updatedAt: new Date(),
        })
        .where(eq(cmsContent.pageKey, pageKey))
        .returning();
      return res.json(updated);
    } else {
      const [inserted] = await db
        .insert(cmsContent)
        .values({
          pageKey,
          title: title ?? "",
          description: description ?? "",
          heroTitle: heroTitle ?? "",
          heroSubtitle: heroSubtitle ?? "",
          contentJson: contentJson ?? "{}",
        })
        .returning();
      return res.json(inserted);
    }
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memperbarui data CMS." });
  }
});

app.get("/api/settings", async (req, res) => {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.pageKey, "settings"))
      .limit(1);
    if (row) {
      const parsed = JSON.parse(row.contentJson);
      if (!parsed.whatsappMessageTemplate) {
        parsed.whatsappMessageTemplate =
          "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat";
      }
      if (!parsed.whatsappFreeConsultationTemplate) {
        parsed.whatsappFreeConsultationTemplate =
          "Halo [nama],\n\nKabar gembira! Rumah Terapy Ikhtiar Sehat sedang membuka layanan Konsultasi Kesehatan TCM Gratis secara online. Silakan klik link berikut untuk memulai konsultasi gratis Anda dengan praktisi kami:\n\n[link]\n\nYuk, jaga kesehatan tubuh Anda secara alami!\nSalam sehat,\nRumah Terapy Ikhtiar Sehat";
      }
      return res.json(parsed);
    }

    const defaultSettings = {
      whatsappNumber: "6281369729617",
      whatsappMessageTemplate:
        "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat",
      whatsappFreeConsultationTemplate:
        "Halo [nama],\n\nKabar gembira! Rumah Terapy Ikhtiar Sehat sedang membuka layanan Konsultasi Kesehatan TCM Gratis secara online. Silakan klik link berikut untuk memulai konsultasi gratis Anda dengan praktisi kami:\n\n[link]\n\nYuk, jaga kesehatan tubuh Anda secara alami!\nSalam sehat,\nRumah Terapy Ikhtiar Sehat",
    };
    await db.insert(cmsContent).values({
      pageKey: "settings",
      title: "Settings",
      description: "Application configurations",
      heroTitle: "Configurations",
      heroSubtitle: "Global settings of the system",
      contentJson: JSON.stringify(defaultSettings),
    });
    res.json(defaultSettings);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal memuat pengaturan." });
  }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { whatsappNumber, whatsappMessageTemplate, whatsappFreeConsultationTemplate } = req.body;
    if (!whatsappNumber) {
      return res.status(400).json({ message: "Nomor WhatsApp wajib diisi." });
    }
    let cleanedNum = whatsappNumber.replace(/[^0-9]/g, "");
    if (cleanedNum.startsWith("0")) {
      cleanedNum = "62" + cleanedNum.substring(1);
    } else if (cleanedNum.startsWith("8")) {
      cleanedNum = "62" + cleanedNum;
    }

    const db = getDb();
    const [existing] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.pageKey, "settings"))
      .limit(1);

    const newSettings = {
      whatsappNumber: cleanedNum,
      whatsappMessageTemplate:
        whatsappMessageTemplate ??
        "Halo [nama],\n\nBerikut adalah hasil skrining TCM Anda. Silakan klik link berikut untuk melihat detail analisis holistik Anda:\n\n[link]\n\nTerima kasih,\nRumah Terapy Ikhtiar Sehat",
      whatsappFreeConsultationTemplate:
        whatsappFreeConsultationTemplate ??
        "Halo [nama],\n\nKabar gembira! Rumah Terapy Ikhtiar Sehat sedang membuka layanan Konsultasi Kesehatan TCM Gratis secara online. Silakan klik link berikut untuk memulai konsultasi gratis Anda dengan praktisi kami:\n\n[link]\n\nYuk, jaga kesehatan tubuh Anda secara alami!\nSalam sehat,\nRumah Terapy Ikhtiar Sehat",
    };

    if (existing) {
      await db
        .update(cmsContent)
        .set({
          contentJson: JSON.stringify(newSettings),
          updatedAt: new Date(),
        })
        .where(eq(cmsContent.pageKey, "settings"));
    } else {
      await db.insert(cmsContent).values({
        pageKey: "settings",
        title: "Settings",
        description: "Application configurations",
        heroTitle: "Configurations",
        heroSubtitle: "Global settings of the system",
        contentJson: JSON.stringify(newSettings),
      });
    }
    res.json(newSettings);
  } catch (error) {
    res
      .status(503)
      .json({ message: error instanceof Error ? error.message : "Gagal menyimpan pengaturan." });
  }
});

async function ensureAdminAccount() {
  try {
    const db = getDb();
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@rumahterapy.id").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin) {
      await db
        .update(users)
        .set({ passwordHash, role: "admin" })
        .where(eq(users.id, existingAdmin.id));
      console.log(`[AI Studio] Akun admin disinkronkan & diperbarui: ${adminEmail}`);
    } else {
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: "admin",
      });
      console.log(`[AI Studio] Akun admin dibuat: ${adminEmail}`);
    }
  } catch (err) {
    console.error("[AI Studio] Gagal menyiapkan akun admin:", err);
  }
}

async function ensurePatientAccount() {
  try {
    const db = getDb();
    const patientEmail = "pasien@rumahterapy.id";
    const [existingPatient] = await db
      .select()
      .from(users)
      .where(eq(users.email, patientEmail))
      .limit(1);
    if (!existingPatient) {
      const passwordHash = await bcrypt.hash("pasien123456", 10);
      const [newPatient] = await db
        .insert(users)
        .values({
          email: patientEmail,
          passwordHash,
          role: "user",
        })
        .returning();

      if (newPatient) {
        await db.insert(profiles).values({
          userId: newPatient.id,
          fullName: "Budi Setiawan (Demo Pasien)",
          gender: "Laki-laki",
          age: 38,
          height: 172,
          weight: 68,
          phone: "081234567890",
          address: "Jl. Darmo No. 45, Wonokromo, Kota Surabaya, Jawa Timur",
          referralCode: "SEHATKEMBALI",
          tonguePhotoUrl: null,
        });
        console.log(`[AI Studio] Akun demo pasien diatur: ${patientEmail}`);
      }
    }
  } catch (err) {
    console.error("[AI Studio] Gagal menyiapkan akun demo pasien:", err);
  }
}

async function start() {
  await ensureAdminAccount();
  await ensurePatientAccount();
  const isProduction =
    process.env.NODE_ENV === "production" ||
    fs.existsSync(path.join(process.cwd(), "dist", "client", "index.html")) ||
    fs.existsSync(path.join(process.cwd(), "dist", "index.html"));

  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const clientDist = path.join(process.cwd(), "dist", "client");
    const rootDist = path.join(process.cwd(), "dist");
    const distPath = fs.existsSync(path.join(clientDist, "index.html")) ? clientDist : rootDist;
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, "0.0.0.0", () => console.log(`Express server berjalan di port ${port}`));
}
start().catch((error) => {
  console.error(error);
  process.exit(1);
});
