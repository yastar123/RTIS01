/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const { Pool } = pg;
let pool: pg.Pool | undefined;
let realDb: any;
let isRealDbWorking = false;
let realDbChecked = false;

const mockArticles: any[] = [
  {
    id: "art-1",
    category: "Akupunktur",
    title: "Apa yang sebenarnya terjadi saat jarum masuk?",
    excerpt:
      "Penjelasan sederhana tentang titik meridian, respons saraf, dan mengapa sensasi 'de qi' itu penting.",
    content:
      "Akupunktur bekerja dengan menstimulasi titik-titik tertentu pada tubuh. Dalam pendekatan TCM, titik ini berada di sepanjang meridian dan dipilih sesuai pola ketidakseimbangan pasien. Sensasi de qi merupakan respons ringan yang dapat membantu praktisi memastikan stimulasi berada di area yang tepat.",
    readTime: "5 menit",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "art-2",
    category: "Herbal",
    title: "Mengapa racikan herbal Anda berbeda dari orang lain",
    excerpt:
      "Formula TCM disusun mengikuti sindrom, bukan nama penyakit. Ini alasan takarannya sering berubah.",
    content:
      "Dalam TCM, dua orang dengan keluhan yang sama belum tentu memiliki pola tubuh yang sama. Karena itu, racikan herbal disusun setelah konsultasi dan dapat disesuaikan mengikuti respons tubuh dari waktu ke waktu.",
    readTime: "4 menit",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "art-3",
    category: "Pola Hidup",
    title: "Ritme harian organ dan jam tidur yang ideal",
    excerpt: "Jam organ dalam TCM dan bagaimana menyesuaikan rutinitas agar pemulihan lebih cepat.",
    content:
      "Tidur yang cukup, waktu makan yang teratur, dan jeda dari layar membantu tubuh menjaga ritmenya. Jadikan perubahan kecil dan konsisten sebagai bagian dari proses pemulihan.",
    readTime: "6 menit",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "art-4",
    category: "Tuina",
    title: "Kaku leher berulang: bukan hanya soal otot",
    excerpt: "Pola stagnasi qi yang sering menyertai keluhan leher dan bahu pada pekerja layar.",
    content:
      "Keluhan leher dapat dipengaruhi postur, stres, kualitas tidur, dan kebiasaan kerja. Tuina menggunakan pijatan dan tekanan terarah sebagai bagian dari pendekatan menyeluruh.",
    readTime: "5 menit",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "art-5",
    category: "BSM",
    title: "Mengenal Body Space Medicine untuk kasus kronis",
    excerpt: "Bagaimana konsep ruang tubuh membantu membuka aliran pada keluhan yang lama menetap.",
    content:
      "Body Space Medicine melihat hubungan antarbagi tubuh dan ruang gerak yang terbentuk dari kebiasaan sehari-hari. Pemeriksaan dilakukan untuk membantu menemukan area yang membutuhkan perhatian.",
    readTime: "7 menit",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "art-6",
    category: "Audioterapi",
    title: "Frekuensi, napas, dan kualitas tidur",
    excerpt: "Peran terapi suara sebagai penunjang relaksasi sistem saraf parasimpatis.",
    content:
      "Suara yang menenangkan dapat menjadi bagian dari rutinitas relaksasi. Padukan dengan napas perlahan, cahaya redup, dan waktu tidur yang konsisten untuk menciptakan suasana istirahat.",
    readTime: "4 menit",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const demoAdminPasswordHash = bcrypt.hashSync("admin123456", 10);
const mockUsers: any[] = [
  {
    id: "usr-admin-demo",
    email: "admin@rumahterapy.id",
    passwordHash: demoAdminPasswordHash,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
const mockProfiles: any[] = [];
const mockSessions: any[] = [];
const mockReservations: any[] = [];
const mockScreeningQuestions: any[] = [
  {
    id: "sq-1",
    questionText: "Saya sering merasa lelah atau kehilangan energi meski sudah cukup tidur.",
    sortOrder: 1,
    createdAt: new Date(),
  },
  {
    id: "sq-2",
    questionText: "Saya sulit tidur atau sering terbangun di tengah malam.",
    sortOrder: 2,
    createdAt: new Date(),
  },
  {
    id: "sq-3",
    questionText: "Saya sering merasa cemas, gelisah, atau sulit berkonsentrasi.",
    sortOrder: 3,
    createdAt: new Date(),
  },
  {
    id: "sq-4",
    questionText: "Saya mengalami nyeri atau ketegangan otot secara berulang.",
    sortOrder: 4,
    createdAt: new Date(),
  },
  {
    id: "sq-5",
    questionText: "Pencernaan saya tidak stabil (kembung, nyeri lambung, atau BAB tidak teratur).",
    sortOrder: 5,
    createdAt: new Date(),
  },
  {
    id: "sq-6",
    questionText:
      "Saya sering merasakan ketidakseimbangan emosi (mudah marah, sedih, atau murung).",
    sortOrder: 6,
    createdAt: new Date(),
  },
  {
    id: "sq-7",
    questionText: "Saya merasakan tubuh saya mudah dingin atau sebaliknya mudah panas.",
    sortOrder: 7,
    createdAt: new Date(),
  },
  {
    id: "sq-8",
    questionText: "Saya merasa kualitas hidup saya menurun akibat keluhan di atas.",
    sortOrder: 8,
    createdAt: new Date(),
  },
];

const mockServices: any[] = [
  {
    id: "srv-1",
    name: "Akupunktur",
    price: 150000,
    duration: "± 60 menit",
    description: "Penusukan titik meridian untuk meredakan nyeri dan menyeimbangkan energi tubuh.",
    createdAt: new Date(),
  },
  {
    id: "srv-2",
    name: "Herbal Formula",
    price: 120000,
    duration: "± 30 menit",
    description: "Konsultasi dan peresepan formula herbal sesuai pola tubuh Anda.",
    createdAt: new Date(),
  },
  {
    id: "srv-3",
    name: "Tuina",
    price: 130000,
    duration: "± 60 menit",
    description: "Terapi pijat tekan TCM untuk otot kaku, pegal, dan gangguan sendi.",
    createdAt: new Date(),
  },
  {
    id: "srv-4",
    name: "BSM (Body Space Medicine)",
    price: 175000,
    duration: "± 45 menit",
    description: "Pendekatan pergerakan energi antar organ untuk keluhan kronis.",
    createdAt: new Date(),
  },
  {
    id: "srv-5",
    name: "Konseling",
    price: 100000,
    duration: "± 45 menit",
    description: "Sesi bicara terarah untuk stres, kecemasan, dan pemulihan emosi.",
    createdAt: new Date(),
  },
  {
    id: "srv-6",
    name: "Audioterapi",
    price: 90000,
    duration: "± 30 menit",
    description: "Terapi frekuensi suara untuk relaksasi dan kualitas tidur.",
    createdAt: new Date(),
  },
];

const mockCmsContent: any[] = [
  {
    id: "cms-home",
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
    updatedAt: new Date(),
  },
  {
    id: "cms-about",
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
    updatedAt: new Date(),
  },
];

function extractValuesFromCond(c: any): string[] {
  if (!c) return [];
  if (typeof c === "string" || typeof c === "number") {
    const s = String(c).trim();
    return s && !["=", "AND", "OR", "LIKE", "ILIKE", "IS", "NOT", "NULL"].includes(s.toUpperCase())
      ? [s]
      : [];
  }
  if (Array.isArray(c)) return c.flatMap(extractValuesFromCond);
  if (typeof c === "object") {
    const res: string[] = [];
    if (c.value !== undefined && c.value !== null) {
      const v = String(c.value).trim();
      if (v) res.push(v);
    }
    if (c.queryChunks) {
      res.push(...extractValuesFromCond(c.queryChunks));
    }
    return res;
  }
  return [];
}

function createMockDb() {
  const getTableData = (table: any) => {
    if (table === schema.articles) return mockArticles;
    if (table === schema.reservations) return mockReservations;
    if (table === schema.users) return mockUsers;
    if (table === schema.profiles) return mockProfiles;
    if (table === schema.sessions) return mockSessions;
    if (table === schema.screeningQuestions) return mockScreeningQuestions;
    if (table === schema.services) return mockServices;
    if (table === schema.cmsContent) return mockCmsContent;
    return [];
  };

  return {
    select: (fields?: any) => ({
      from: (table: any) => ({
        innerJoin: (joinTable: any, condition: any) => ({
          where: (cond: any) => ({
            limit: (n: number) => {
              const targets = extractValuesFromCond(cond);
              if (targets.length > 0) {
                const session = mockSessions.find((s) => targets.includes(s.token));
                if (session) {
                  const user = mockUsers.find((u) => u.id === session.userId);
                  if (user) return Promise.resolve([{ user, session }]);
                }
              }
              return Promise.resolve([]);
            },
          }),
        }),
        where: (cond: any) => {
          const filterData = () => {
            const data = getTableData(table);
            const targets = extractValuesFromCond(cond).map((t) => t.toLowerCase());
            if (targets.length === 0) return data;
            return data.filter((item) => {
              const fields = Object.values(item).map((v) => String(v ?? "").toLowerCase());
              return targets.some((t) => fields.includes(t) || fields.some((f) => f.includes(t)));
            });
          };

          return {
            limit: (n: number) => Promise.resolve(filterData().slice(0, n)),
            orderBy: (...args: any[]) => Promise.resolve(filterData()),
            then: (resolve: any) => resolve(filterData()),
          };
        },
        orderBy: (...args: any[]) => {
          const data = getTableData(table);
          return {
            then: (resolve: any) => resolve(data),
            limit: (n: number) => Promise.resolve(data.slice(0, n)),
          };
        },
        limit: (n: number) => Promise.resolve(getTableData(table).slice(0, n)),
        then: (resolve: any) => resolve(getTableData(table)),
      }),
    }),
    insert: (table: any) => ({
      values: (val: any) => {
        const data = Array.isArray(val) ? val : [val];
        const inserted = data.map((d: any) => ({
          id: d.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...d,
        }));
        getTableData(table).push(...inserted);
        return {
          returning: () => Promise.resolve(inserted),
          then: (resolve: any) => resolve(inserted),
        };
      },
    }),
    update: (table: any) => ({
      set: (values: any) => ({
        where: (cond: any) => {
          const targets = extractValuesFromCond(cond);
          const data = getTableData(table);
          const idx = data.findIndex(
            (item) => targets.includes(item.id) || targets.includes(item.code),
          );
          if (idx !== -1) {
            data[idx] = { ...data[idx], ...values, updatedAt: new Date() };
            return {
              returning: () => Promise.resolve([data[idx]]),
              then: (resolve: any) => resolve([data[idx]]),
            };
          }
          return {
            returning: () => Promise.resolve([]),
            then: (resolve: any) => resolve([]),
          };
        },
      }),
    }),
    delete: (table: any) => ({
      where: (cond: any) => {
        const targets = extractValuesFromCond(cond);
        const data = getTableData(table);
        const idx = data.findIndex(
          (item) => targets.includes(item.id) || targets.includes(item.token),
        );
        if (idx !== -1) {
          const [removed] = data.splice(idx, 1);
          return {
            returning: (fields?: any) => Promise.resolve([removed]),
            then: (resolve: any) => resolve([removed]),
          };
        }
        return {
          returning: (fields?: any) => Promise.resolve([]),
          then: (resolve: any) => resolve([]),
        };
      },
    }),
  } as any;
}

let mockDbInstance: any;

async function initRealDatabaseTables(pgPool: pg.Pool) {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      gender TEXT NOT NULL,
      age INTEGER NOT NULL,
      height INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      referral_code TEXT,
      tongue_photo_url TEXT,
      screening_answers TEXT,
      screening_completed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      read_time TEXT NOT NULL DEFAULT '5 menit',
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS screening_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      price INTEGER NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cms_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      hero_title TEXT NOT NULL,
      hero_subtitle TEXT NOT NULL,
      content_json TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await pgPool.query(sql);
  try {
    await pgPool.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS screening_answers TEXT;");
    await pgPool.query(
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS screening_completed_at TIMESTAMPTZ;",
    );
  } catch (alterErr) {
    console.warn("[AI Studio] Error altering profiles table:", alterErr);
  }
}

export function getDb(): any {
  const dbUrl = process.env.DATABASE_URL;
  const isPlaceholderUrl =
    !dbUrl ||
    dbUrl.includes("user:password@host") ||
    dbUrl.includes("localhost") ||
    dbUrl.trim() === "";

  if (!isPlaceholderUrl) {
    if (!realDbChecked) {
      realDbChecked = true;
      try {
        pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 3000 });
        realDb = drizzle(pool, { schema });
        isRealDbWorking = true;
        initRealDatabaseTables(pool).catch((err) => {
          console.warn("[AI Studio] Error initializing PostgreSQL tables:", err.message);
        });
      } catch (err) {
        console.warn("[AI Studio] Error initializing PostgreSQL pool:", err);
        isRealDbWorking = false;
      }
    }
    if (isRealDbWorking && realDb) {
      return realDb;
    }
  }

  mockDbInstance ??= createMockDb();
  return mockDbInstance;
}
