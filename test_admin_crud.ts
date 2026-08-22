async function testAdminCRUD() {
  const fetch = (await import("node-fetch")).default || globalThis.fetch;
  const baseUrl = "http://localhost:3000";

  console.log("=== PENGUJIAN LENGKAP CRUD SOAL SKRINING DI ADMIN DASHBOARD ===");

  // 1. Login Admin via /api/auth/login
  console.log("\n[1] Login sebagai Admin via POST /api/auth/login...");
  const loginRes = await fetch(baseUrl + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@rumahterapy.id", password: "admin123456" }),
  });
  
  if (!loginRes.ok) {
    const txt = await loginRes.text();
    throw new Error("Gagal login admin: " + loginRes.status + " " + txt);
  }
  const loginData = (await loginRes.json()) as any;
  const token = loginData.token;
  console.log("✓ Login admin berhasil sebagai: " + loginData.user.email + " (Role: " + loginData.user.role + ").");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };

  // Reset database to default before testing
  await fetch(baseUrl + "/api/admin/screening/sections/reset", {
    method: "POST",
    headers: authHeaders,
  });

  // 2. READ: Read existing sections & questions
  console.log("\n[2] Membaca daftar bagian dan soal skrining (READ)...");
  const getRes = await fetch(baseUrl + "/api/screening/sections");
  if (!getRes.ok) throw new Error("Gagal get sections: " + getRes.status);
  let sections = (await getRes.json()) as any[];
  console.log("✓ Berhasil memuat " + sections.length + " bagian.");
  const initialFieldCount = sections.reduce((acc, s) => acc + (s.fields?.length || 0), 0);
  console.log("✓ Total parameter soal awal: " + initialFieldCount + " soal.");

  // 3. CREATE: Tambah Soal Baru ke Bagian B
  console.log("\n[3] CREATE: Menambahkan Soal Baru ke Bagian B...");
  const uniqueId = "test_q_crud_" + Date.now();
  const newQuestion = {
    id: uniqueId,
    number: 99,
    label: "Pertanyaan Uji Coba: Apakah ada rasa baal di ujung jari?",
    type: "text",
    placeholder: "Contoh: Terasa baal di jempol kanan...",
    options: ["Ya, di jari tangan", "Ya, di jari kaki", "Tidak ada"],
    required: false
  };

  const updatedSections = JSON.parse(JSON.stringify(sections));
  const targetSec = updatedSections.find((s: any) => s.code === "B" || s.letter === "B");
  if (!targetSec) throw new Error("Bagian B tidak ditemukan!");
  targetSec.fields.push(newQuestion);

  // Simpan ke Database via Admin API
  const saveRes1 = await fetch(baseUrl + "/api/admin/screening/sections", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ sections: updatedSections }),
  });
  if (!saveRes1.ok) throw new Error("Gagal simpan tambah soal: " + saveRes1.status);
  const save1Data = (await saveRes1.json()) as any;
  console.log("✓ Berhasil simpan tambah soal:", save1Data.message);

  // Verifikasi Data Tersimpan di Server
  const getRes2 = await fetch(baseUrl + "/api/screening/sections");
  const sectionsAfterAdd = (await getRes2.json()) as any[];
  console.log("sectionsAfterAdd length:", sectionsAfterAdd.length);
  const targetSecAfter = sectionsAfterAdd.find((s: any) => s.code === "B" || s.key === "keluhan_utama");
  console.log("Target Sec B fields count:", targetSecAfter?.fields?.length);
  console.log("Target Sec B fields IDs:", targetSecAfter?.fields?.map((f: any) => f.id));
  const foundNewQ = sectionsAfterAdd.find((s: any) => s.fields?.some((f: any) => f.id === uniqueId));
  if (!foundNewQ) throw new Error("Soal baru tidak ditemukan setelah disimpan!");
  console.log("✓ Verifikasi CREATE sukses: Soal baru '" + uniqueId + "' berhasil masuk ke database.");

  // 4. UPDATE: Edit teks, tipe, dan options soal
  console.log("\n[4] UPDATE: Mengedit teks, tipe dan opsi soal...");
  const sectionsToUpdate = JSON.parse(JSON.stringify(sectionsAfterAdd));
  for (const s of sectionsToUpdate) {
    const f = s.fields?.find((f: any) => f.id === uniqueId);
    if (f) {
      f.label = "Pertanyaan Uji Coba (UPDATED): Seberapa sering rasa baal muncul?";
      f.type = "select";
      f.options = ["Jarang", "Sering", "Setiap Hari"];
      f.placeholder = "Pilih frekuensi";
    }
  }

  const saveRes2 = await fetch(baseUrl + "/api/admin/screening/sections", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ sections: sectionsToUpdate }),
  });
  if (!saveRes2.ok) throw new Error("Gagal simpan update soal: " + saveRes2.status);
  console.log("✓ Berhasil simpan update soal.");

  // Verifikasi Hasil Update
  const getRes3 = await fetch(baseUrl + "/api/screening/sections");
  const sectionsAfterUpdate = (await getRes3.json()) as any[];
  let updatedFieldFound: any = null;
  for (const s of sectionsAfterUpdate) {
    const f = s.fields?.find((f: any) => f.id === uniqueId);
    if (f) updatedFieldFound = f;
  }
  console.log("Updated field found:", JSON.stringify(updatedFieldFound));
  if (!updatedFieldFound || !updatedFieldFound.label.includes("UPDATED") || updatedFieldFound.type !== "select") {
    throw new Error("Gagal verifikasi update soal!");
  }
  console.log("✓ Verifikasi UPDATE sukses: Label = '" + updatedFieldFound.label + "' (Type: " + updatedFieldFound.type + ", Options: " + (updatedFieldFound.options?.join(", ")) + ").");

  // 5. CREATE SECTION: Tambah Kategori / Bagian Baru M
  console.log("\n[5] CREATE SECTION: Menambahkan Kategori / Bagian Baru (Bagian M)...");
  const uniqueSecId = "sec_test_custom_" + Date.now();
  const newSection = {
    id: uniqueSecId,
    key: uniqueSecId,
    code: "M",
    letter: "M",
    title: "M. KUESIONER TAMBAHAN KHUSUS KLINIK",
    shortTitle: "Tambahan",
    description: "Bagian tambahan untuk uji coba admin",
    femaleOnly: false,
    fields: [
      {
        id: "m1_pertanyaan_tambahan",
        number: 1,
        label: "Apakah ada keluhan lain yang belum tercakup?",
        type: "textarea",
        placeholder: "Tuliskan keluhan tambahan..."
      }
    ]
  };

  const sectionsWithNewSec = [...sectionsAfterUpdate, newSection];
  const saveRes3 = await fetch(baseUrl + "/api/admin/screening/sections", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ sections: sectionsWithNewSec }),
  });
  if (!saveRes3.ok) throw new Error("Gagal simpan section baru: " + saveRes3.status);
  console.log("✓ Berhasil simpan bagian baru M.");

  // Verifikasi Bagian Baru
  const getRes4 = await fetch(baseUrl + "/api/screening/sections");
  const sectionsAfterSecAdd = (await getRes4.json()) as any[];
  const foundSecM = sectionsAfterSecAdd.find((s: any) => s.id === uniqueSecId || s.code === "M");
  if (!foundSecM) throw new Error("Bagian baru M tidak ditemukan!");
  console.log("✓ Verifikasi CREATE SECTION sukses: Bagian M tersimpan (Total bagian sekarang: " + sectionsAfterSecAdd.length + ").");

  // 6. DELETE: Hapus Soal Uji Coba & Hapus Bagian Uji Coba
  console.log("\n[6] DELETE: Menghapus soal uji coba dan bagian M...");
  const sectionsCleaned = sectionsAfterSecAdd
    .filter((s: any) => s.id !== uniqueSecId && s.code !== "M")
    .map((s: any) => ({
      ...s,
      fields: (s.fields || []).filter((f: any) => f.id !== uniqueId)
    }));

  const saveRes4 = await fetch(baseUrl + "/api/admin/screening/sections", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ sections: sectionsCleaned }),
  });
  if (!saveRes4.ok) throw new Error("Gagal simpan delete: " + saveRes4.status);
  console.log("✓ Berhasil simpan penghapusan item.");

  // Verifikasi DELETE
  const getRes5 = await fetch(baseUrl + "/api/screening/sections");
  const sectionsAfterDelete = (await getRes5.json()) as any[];
  const stillHasTestQ = sectionsAfterDelete.some((s: any) => s.fields?.some((f: any) => f.id === uniqueId));
  const stillHasSecM = sectionsAfterDelete.some((s: any) => s.id === uniqueSecId);
  if (stillHasTestQ || stillHasSecM) {
    throw new Error("Item yang dihapus masih ada di database!");
  }
  console.log("✓ Verifikasi DELETE sukses: Soal dan Bagian uji coba berhasil terhapus bersih dari database.");

  // 7. RESET: Uji Reset Standar TCM
  console.log("\n[7] RESET: Menguji Reset Standar TCM (POST /api/admin/screening/sections/reset)...");
  const resetRes = await fetch(baseUrl + "/api/admin/screening/sections/reset", {
    method: "POST",
    headers: authHeaders,
  });
  if (!resetRes.ok) throw new Error("Gagal reset sections: " + resetRes.status);
  const resetData = (await resetRes.json()) as any;
  console.log("✓ Reset endpoint berhasil:", resetData.message);

  const getResFinal = await fetch(baseUrl + "/api/screening/sections");
  const sectionsFinal = (await getResFinal.json()) as any[];
  console.log("✓ Final total sections: " + sectionsFinal.length + " bagian.");
  const finalFieldCount = sectionsFinal.reduce((acc, s) => acc + (s.fields?.length || 0), 0);
  console.log("✓ Final total questions: " + finalFieldCount + " parameter klinis.");

  console.log("\n=== SEMUA OPERASI CRUD SOAL SKRINING DI ADMIN DASHBOARD SUKSES 100% ===");
}

testAdminCRUD().catch(e => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
