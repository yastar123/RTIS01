import "dotenv/config";
import path from "node:path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { desc, eq, or } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { articles, profiles, reservations, screeningQuestions, sessions, users } from "./db/schema";

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

async function ensureAdminAccount() {
  try {
    const db = getDb();
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@rumahterapy.id").trim().toLowerCase();
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: "admin",
      });
      console.log(`[AI Studio] Akun admin demo diatur: ${adminEmail}`);
    }
  } catch (err) {
    console.error("[AI Studio] Gagal menyiapkan akun admin:", err);
  }
}

async function start() {
  await ensureAdminAccount();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist", "client");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, "0.0.0.0", () => console.log(`Express server berjalan di port ${port}`));
}
start().catch((error) => {
  console.error(error);
  process.exit(1);
});
