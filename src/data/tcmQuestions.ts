export interface TcmQuestionField {
  id: string;
  number: number;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "date" | "scale";
  placeholder?: string;
  options?: string[];
  suggestions?: string[];
  required?: boolean;
}

export interface TcmQuestionSection {
  key: string;
  code: string; // "A", "B", "C", ...
  title: string; // "A. IDENTITAS PASIEN"
  shortTitle: string;
  description: string;
  iconName: string;
  fields: TcmQuestionField[];
  isFemaleOnly?: boolean;
}

export type TcmSection = TcmQuestionSection;

export const TCM_SECTIONS: TcmQuestionSection[] = [
  {
    key: "identitas",
    code: "A",
    title: "A. IDENTITAS PASIEN",
    shortTitle: "Identitas",
    description: "Data diri lengkap pasien untuk registrasi dan rekam medis",
    iconName: "User",
    fields: [
      {
        id: "a1_nama",
        number: 1,
        label: "Nama",
        type: "text",
        placeholder: "Nama lengkap pasien...",
        required: true,
      },
      {
        id: "a2_usia",
        number: 2,
        label: "Usia",
        type: "number",
        placeholder: "Contoh: 35 (tahun)",
        required: true,
      },
      {
        id: "a3_gender",
        number: 3,
        label: "Jenis kelamin",
        type: "select",
        options: ["Laki-laki", "Perempuan"],
        suggestions: ["Laki-laki", "Perempuan"],
        required: true,
      },
      {
        id: "a4_pekerjaan",
        number: 4,
        label: "Pekerjaan",
        type: "text",
        placeholder: "Contoh: Karyawan swasta, Wiraswasta, Ibu Rumah Tangga, dll.",
        suggestions: [
          "Karyawan Swasta",
          "PNS",
          "Wiraswasta",
          "Ibu Rumah Tangga",
          "Pelajar/Mahasiswa",
        ],
      },
      {
        id: "a5_tanggal",
        number: 5,
        label: "Tanggal pemeriksaan",
        type: "date",
        required: true,
      },
    ],
  },
  {
    key: "keluhan_utama",
    code: "B",
    title: "B. KELUHAN UTAMA",
    shortTitle: "Keluhan Utama",
    description: "Gejala paling mengganggu yang dirasakan saat ini",
    iconName: "Activity",
    fields: [
      {
        id: "b1_keluhan_mengganggu",
        number: 1,
        label: "Apa keluhan yang paling mengganggu saat ini?",
        type: "textarea",
        placeholder: "Jelaskan keluhan utama Anda secara terperinci...",
        required: true,
        suggestions: [
          "Nyeri pinggang dan lutut",
          "Lambung sering perih dan kembung",
          "Sakit kepala berdenyut & leher kaku",
          "Mudah lelah dan lemas sepanjang hari",
          "Insomnia dan sering gelisah",
        ],
      },
      {
        id: "b2_sejak_kapan",
        number: 2,
        label: "Sejak kapan keluhan mulai dirasakan?",
        type: "text",
        placeholder: "Contoh: 2 minggu lalu, 3 bulan terakhir, 1 tahun...",
        suggestions: ["Beberapa hari lalu", "1-2 minggu", "1 bulan terakhir", "> 6 bulan (kronis)"],
      },
      {
        id: "b3_muncul_tiba_atau_bertahap",
        number: 3,
        label: "Apakah keluhan muncul tiba-tiba atau bertahap?",
        type: "text",
        placeholder: "Contoh: Muncul bertahap perlahan sejak 2 minggu lalu...",
        suggestions: [
          "Muncul tiba-tiba",
          "Muncul bertahap perlahan",
          "Keduanya / kadang kambuh mendadak",
        ],
      },
      {
        id: "b4_terus_menerus_atau_hilang_timbul",
        number: 4,
        label: "Apakah keluhan terus-menerus atau hilang timbul?",
        type: "text",
        placeholder: "Contoh: Hilang timbul terutama saat lelah atau kedinginan...",
        suggestions: ["Terus-menerus sepanjang hari", "Hilang timbul", "Hanya pada waktu tertentu"],
      },
      {
        id: "b5_skala_nyeri",
        number: 5,
        label: "Seberapa berat keluhan, skala 0–10?",
        type: "scale",
        placeholder: "Contoh: 6 - Sedang, cukup mengganggu aktivitas...",
        suggestions: [
          "Skala 3 (Ringan)",
          "Skala 5 (Sedang)",
          "Skala 7 (Berat)",
          "Skala 9 (Sangat Berat)",
        ],
      },
      {
        id: "b6_bagian_tubuh",
        number: 6,
        label: "Bagian tubuh mana yang paling terasa?",
        type: "text",
        placeholder: "Contoh: Pinggang bawah, ulu hati, leher & pundak, kepala sisi kanan...",
        suggestions: [
          "Pinggang & Punggung",
          "Ulu Hati / Lambung",
          "Kepala & Leher",
          "Lutut & Kaki",
          "Dada",
        ],
      },
    ],
  },
  {
    key: "lokasi_karakter",
    code: "C",
    title: "C. LOKASI DAN KARAKTER KELUHAN",
    shortTitle: "Karakter Nyeri",
    description: "Sifat, penjalaran, dan faktor yang memengaruhi keluhan",
    iconName: "MapPin",
    fields: [
      {
        id: "c1_lokasi_tepat",
        number: 1,
        label: "Di mana lokasi keluhan secara tepat?",
        type: "text",
        placeholder: "Sebutkan titik lokasi yang spesifik...",
      },
      {
        id: "c2_nyeri_menjalar",
        number: 2,
        label: "Apakah nyeri menjalar ke bagian tubuh lain?",
        type: "text",
        placeholder:
          "Contoh: Menjalar ke bokong hingga betis, menjalar ke belikat, tidak menjalar...",
        suggestions: [
          "Tidak menjalar",
          "Menjalar ke kaki/paha",
          "Menjalar ke lengan/tangan",
          "Menjalar ke kepala",
        ],
      },
      {
        id: "c3_sifat_keluhan",
        number: 3,
        label:
          "Bagaimana sifat keluhannya: nyeri, tertusuk, berdenyut, terbakar, berat, kaku, kebas, atau kesemutan?",
        type: "text",
        placeholder: "Pilih atau ketik sifat keluhan Anda...",
        suggestions: [
          "Nyeri tumpul & berat",
          "Nyeri tajam / tertusuk",
          "Berdenyut-denyut",
          "Sensasi panas terbakar",
          "Kaku dan tegang",
          "Kebas dan kesemutan",
        ],
      },
      {
        id: "c4_kelemahan_anggota_tubuh",
        number: 4,
        label: "Apakah terdapat kelemahan pada anggota tubuh?",
        type: "text",
        placeholder:
          "Contoh: Tangan kanan lemas saat menggenggam, kaki terasa lemas saat melangkah, tidak ada...",
        suggestions: [
          "Tidak ada kelemahan",
          "Ada kelemahan pada tangan",
          "Ada kelemahan pada kaki",
        ],
      },
      {
        id: "c5_memperberat_keluhan",
        number: 5,
        label: "Apa yang memperberat keluhan?",
        type: "text",
        placeholder: "Contoh: Duduk lama, berdiri lama, udara dingin, stres, terlambat makan...",
        suggestions: [
          "Kedinginan / Ruang AC",
          "Beban kerja & Stres",
          "Aktivitas fisik berat",
          "Duduk / Berdiri lama",
          "Makanan pedas/asam",
        ],
      },
      {
        id: "c6_membuat_berkurang",
        number: 6,
        label: "Apa yang membuat keluhan berkurang?",
        type: "text",
        placeholder:
          "Contoh: Diberi kompres hangat, istirahat berbaring, dipijat perlahan, minum air hangat...",
        suggestions: [
          "Istirahat / Berbaring",
          "Kompres air hangat",
          "Minum ramuan hangat",
          "Dipijat lembut",
          "Setelah makan",
        ],
      },
      {
        id: "c7_pengaruh_faktor_luar",
        number: 7,
        label:
          "Apakah keluhan dipengaruhi aktivitas, istirahat, posisi tubuh, makanan, cuaca, panas, atau dingin?",
        type: "text",
        placeholder: "Jelaskan faktor pemicu yang paling berpengaruh...",
        suggestions: [
          "Memburuk saat dingin",
          "Memburuk saat lelah/stres",
          "Memburuk setelah makan",
          "Dipengaruhi posisi tubuh",
        ],
      },
      {
        id: "c8_waktu_lebih_berat",
        number: 8,
        label: "Apakah keluhan lebih berat pada pagi, siang, sore, atau malam?",
        type: "text",
        placeholder: "Contoh: Lebih berat pada pagi hari saat bangun tidur...",
        suggestions: [
          "Pagi hari",
          "Malam hari",
          "Sore hari",
          "Siang hari",
          "Sama saja sepanjang hari",
        ],
      },
    ],
  },
  {
    key: "gejala_penyerta",
    code: "D",
    title: "D. GEJALA PENYERTA",
    shortTitle: "Gejala Penyerta",
    description: "Tanda-tanda klinis lain yang menyertai keluhan utama",
    iconName: "Stethoscope",
    fields: [
      {
        id: "d1_demam",
        number: 1,
        label: "Apakah disertai demam?",
        type: "text",
        placeholder: "Contoh: Tidak ada demam, kadang sumeng/meriang, demam saat malam...",
        suggestions: ["Tidak ada", "Kadang sumeng / meriang", "Demam tinggi"],
      },
      {
        id: "d2_pusing_sakit_kepala",
        number: 2,
        label: "Apakah sering pusing atau sakit kepala?",
        type: "text",
        placeholder:
          "Contoh: Sering pusing berputar, sakit kepala sebelah (migrain), kepala terasa berat diikat...",
        suggestions: [
          "Tidak pernah",
          "Sakit kepala tegang",
          "Pusing berputar (vertigo)",
          "Kepala terasa berat",
        ],
      },
      {
        id: "d3_mual_muntah",
        number: 3,
        label: "Apakah mual atau muntah?",
        type: "text",
        placeholder: "Contoh: Mual di pagi hari, mual setelah makan, tidak ada mual...",
        suggestions: ["Tidak ada", "Sering mual", "Pernah muntah cairan asam"],
      },
      {
        id: "d4_sesak_nyeri_dada",
        number: 4,
        label: "Apakah sesak napas atau nyeri dada?",
        type: "text",
        placeholder:
          "Contoh: Dada terasa sesak saat capek, nafas pendek, dada seperti tertekan, tidak ada...",
        suggestions: [
          "Tidak ada",
          "Nafas pendek saat lelah",
          "Dada terasa sesak tertekan",
          "Jantung berdebar",
        ],
      },
      {
        id: "d5_sering_lelah",
        number: 5,
        label: "Apakah sering lelah atau lemas?",
        type: "text",
        placeholder:
          "Contoh: Sangat mudah lelah meski tidak beraktivitas berat, bangun tidur badan masih lemas...",
        suggestions: ["Sangat mudah lelah", "Lelah wajar setelah kerja", "Tidak merasa lemas"],
      },
      {
        id: "d6_kebas_kesemutan",
        number: 6,
        label: "Apakah terdapat kebas, kesemutan, atau kelemahan anggota tubuh?",
        type: "text",
        placeholder: "Contoh: Kesemutan di ujung jari tangan, telapak kaki kebas, tidak ada...",
        suggestions: ["Tidak ada", "Kesemutan pada jari tangan", "Kebas pada kaki / telapak kaki"],
      },
      {
        id: "d7_gangguan_bab_bak",
        number: 7,
        label: "Apakah terdapat gangguan BAB atau BAK?",
        type: "text",
        placeholder: "Contoh: Sering sembelit, diare, sering buang air kecil malam hari...",
        suggestions: [
          "Normal lancar",
          "Sering kembung & sembelit",
          "BAB lembek / basah",
          "Sering BAK malam hari",
        ],
      },
      {
        id: "d8_turun_bb_nafsu_makan",
        number: 8,
        label: "Apakah terjadi penurunan berat badan atau nafsu makan?",
        type: "text",
        placeholder:
          "Contoh: Nafsu makan turun drastis, berat badan stabil, nafsu makan berlebih...",
        suggestions: [
          "Nafsu makan normal",
          "Nafsu makan menurun",
          "Ada penurunan berat badan",
          "Berat badan stabil",
        ],
      },
    ],
  },
  {
    key: "riwayat_penyakit",
    code: "E",
    title: "E. RIWAYAT PENYAKIT",
    shortTitle: "Riwayat Medis",
    description: "Riwayat medis masa lalu, penyakit kronis, dan riwayat alergi",
    iconName: "History",
    fields: [
      {
        id: "e1_keluhan_serupa",
        number: 1,
        label: "Apakah pernah mengalami keluhan atau penyakit yang sama sebelumnya?",
        type: "text",
        placeholder: "Contoh: Pernah sekitar 1 tahun lalu dan sembuh, ini pertama kali...",
        suggestions: ["Pertama kali", "Pernah sebelumnya kambuh-kambuhan"],
      },
      {
        id: "e2_hipertensi",
        number: 2,
        label: "Apakah pernah didiagnosis hipertensi?",
        type: "text",
        placeholder: "Contoh: Ya, tensi rata-rata 140/90, tidak ada, tensi normal/rendah...",
        suggestions: [
          "Tidak ada (Normal)",
          "Ya, hipertensi terkontrol",
          "Tensi cenderung rendah (Hipotensi)",
        ],
      },
      {
        id: "e3_diabetes",
        number: 3,
        label: "Apakah mempunyai diabetes atau gula darah tinggi?",
        type: "text",
        placeholder: "Contoh: Tidak ada, ada riwayat DM tipe 2 gula puasa 130...",
        suggestions: ["Tidak ada", "Ada diabetes", "Ada riwayat keluarga"],
      },
      {
        id: "e4_kolesterol",
        number: 4,
        label: "Apakah mempunyai kolesterol tinggi?",
        type: "text",
        placeholder: "Contoh: Ya kolesterol 240, asam urat tinggi, tidak ada...",
        suggestions: ["Tidak ada", "Kolesterol tinggi", "Asam urat tinggi"],
      },
      {
        id: "e5_jantung_stroke",
        number: 5,
        label: "Apakah mempunyai penyakit jantung atau pernah mengalami stroke?",
        type: "text",
        placeholder: "Contoh: Tidak ada, ada riwayat stroke ringan (TIA) 2 tahun lalu...",
        suggestions: ["Tidak ada", "Ada penyakit jantung", "Riwayat stroke"],
      },
      {
        id: "e6_organ_kronis",
        number: 6,
        label: "Apakah mempunyai penyakit ginjal, hati, lambung, atau penyakit kronis lainnya?",
        type: "text",
        placeholder: "Contoh: Maag / GERD kronis, fatty liver, batu ginjal, asma...",
        suggestions: ["Maag / GERD / Gastritis", "Tidak ada", "Asma", "Batu Ginjal"],
      },
      {
        id: "e7_operasi",
        number: 7,
        label: "Apakah pernah menjalani operasi?",
        type: "text",
        placeholder: "Contoh: Operasi usus buntu tahun 2018, operasi caesar, belum pernah...",
        suggestions: [
          "Belum pernah",
          "Operasi Caesar",
          "Operasi Usus Buntu",
          "Operasi Tulang/Sendi",
        ],
      },
      {
        id: "e8_kecelakaan_cedera",
        number: 8,
        label: "Apakah pernah mengalami kecelakaan atau cedera?",
        type: "text",
        placeholder:
          "Contoh: Pernah jatuh terkilir di pinggang, cedera lutut saat olahraga, tidak pernah...",
        suggestions: ["Tidak pernah", "Cedera pinggang/tulang belakang", "Cedera lutut/engkel"],
      },
      {
        id: "e9_hamil_menyusui",
        number: 9,
        label: "Apakah sedang hamil atau menyusui?",
        type: "text",
        placeholder:
          "Contoh: Sedang menyusui anak 6 bulan, hamil 12 minggu, tidak / bukan wanita...",
        suggestions: ["Tidak", "Sedang Hamil", "Sedang Menyusui", "Tidak Relevan (Laki-laki)"],
      },
      {
        id: "e10_alergi",
        number: 10,
        label: "Apakah memiliki alergi terhadap obat, makanan, atau herbal?",
        type: "text",
        placeholder:
          "Contoh: Alergi antibiotik amoxicillin, alergi udang/seafood, tidak ada alergi...",
        suggestions: [
          "Tidak ada alergi",
          "Alergi Seafood",
          "Alergi Obat Antibiotik/NSAID",
          "Alergi Dingin / Debu",
        ],
      },
    ],
  },
  {
    key: "obat_herbal",
    code: "F",
    title: "F. OBAT, HERBAL, DAN SUPLEMEN",
    shortTitle: "Obat & Herbal",
    description: "Daftar konsumsi obat medis, jamu, vitamin, dan suplemen saat ini",
    iconName: "Pill",
    fields: [
      {
        id: "f1_pengobatan_dokter",
        number: 1,
        label: "Apakah sedang menjalani pengobatan dari dokter?",
        type: "text",
        placeholder: "Contoh: Ya, rutin kontrol penyakit dalam, tidak sedang pengobatan...",
        suggestions: ["Tidak sedang pengobatan dokter", "Ya, sedang dalam resep dokter"],
      },
      {
        id: "f2_nama_obat",
        number: 2,
        label: "Obat apa saja yang sedang dikonsumsi?",
        type: "textarea",
        placeholder: "Tuliskan nama obat-obatan medis yang diminum...",
        suggestions: [
          "Tidak ada obat yang dikonsumsi",
          "Obat lambung (Omeprazole/Antasida)",
          "Obat penurun tensi (Amlodipine)",
          "Obat pereda nyeri (Paracetamol/Ibuprofen)",
        ],
      },
      {
        id: "f3_dosis_frekuensi",
        number: 3,
        label: "Berapa dosis dan berapa kali sehari?",
        type: "text",
        placeholder: "Contoh: 1 tablet 1x sehari pagi, 2x sehari setelah makan...",
      },
      {
        id: "f4_konsumsi_herbal_jamu",
        number: 4,
        label: "Apakah sedang mengonsumsi herbal atau jamu?",
        type: "text",
        placeholder: "Contoh: Rebusan jahe & kunyit setiap pagi, madu propolis, tidak ada...",
        suggestions: [
          "Tidak mengonsumsi herbal",
          "Rebusan Jahe / Kunyit / Temulawak",
          "Madu Murni & Habbatussauda",
        ],
      },
      {
        id: "f5_vitamin_suplemen",
        number: 5,
        label: "Apakah mengonsumsi vitamin atau suplemen?",
        type: "text",
        placeholder: "Contoh: Vitamin D3 5000 IU, Vitamin C, minyak ikan Omega-3, tidak ada...",
        suggestions: [
          "Tidak ada",
          "Vitamin C & Zinc",
          "Vitamin D3",
          "Minyak Ikan / Omega 3",
          "Kalsium / Multivitamin",
        ],
      },
      {
        id: "f6_efek_samping",
        number: 6,
        label: "Apakah pernah mengalami efek samping setelah mengonsumsi obat atau herbal?",
        type: "text",
        placeholder:
          "Contoh: Perut perih setelah minum obat pereda nyeri, berdebar, tidak ada efek samping...",
        suggestions: [
          "Tidak pernah ada efek samping",
          "Lambung perih / mual",
          "Pusing / mengantuk berat",
          "Gatal-gatal",
        ],
      },
    ],
  },
  {
    key: "kondisi_umum",
    code: "G",
    title: "G. KONDISI UMUM",
    shortTitle: "Kondisi Umum",
    description: "Kualitas istirahat, termoregulasi panas/dingin, dan stamina tubuh",
    iconName: "Heart",
    fields: [
      {
        id: "g1_nafsu_makan",
        number: 1,
        label: "Bagaimana nafsu makan?",
        type: "text",
        placeholder: "Contoh: Nafsu makan baik, cepat kenyang, makan sedikit perut terasa penuh...",
        suggestions: [
          "Nafsu makan baik/normal",
          "Cepat merasa kenyang",
          "Nafsu makan berkurang",
          "Nafsu makan berlebih tapi badan lemas",
        ],
      },
      {
        id: "g2_kualitas_tidur",
        number: 2,
        label: "Bagaimana kualitas tidur?",
        type: "text",
        placeholder:
          "Contoh: Tidur nyenyak 7 jam, tidur sering gelisah dan banyak mimpi, sulit memulai tidur...",
        suggestions: [
          "Tidur nyenyak & pulas",
          "Sering terbangun di malam hari",
          "Banyak mimpi & tidur gelisah",
          "Sulit memulai tidur (Insomnia)",
        ],
      },
      {
        id: "g3_sulit_tidur_terbangun",
        number: 3,
        label: "Apakah sering sulit tidur atau terbangun pada malam hari?",
        type: "text",
        placeholder: "Contoh: Sering terbangun jam 2-3 pagi lalu sulit tidur lagi, tidak...",
        suggestions: [
          "Tidak sering",
          "Terbangun jam 1-3 dini hari",
          "Terbangun karena buang air kecil",
        ],
      },
      {
        id: "g4_mudah_lelah",
        number: 4,
        label: "Apakah mudah lelah atau lemas?",
        type: "text",
        placeholder: "Contoh: Sangat mudah lelah setelah bicara lama atau jalan sebentar...",
        suggestions: ["Sangat mudah lelah (Kurang Qi)", "Lelah wajar", "Stamina cukup bugar"],
      },
      {
        id: "g5_panas_atau_dingin",
        number: 5,
        label: "Apakah tubuh lebih sering terasa panas atau dingin?",
        type: "text",
        placeholder: "Contoh: Lebih sering terasa dingin terutama di telapak kaki dan tangan...",
        suggestions: [
          "Lebih sering terasa dingin",
          "Lebih sering terasa panas / mudah gerah",
          "Normal seimbang",
          "Atas panas bawah dingin",
        ],
      },
      {
        id: "g6_tangan_kaki_dingin",
        number: 6,
        label: "Apakah tangan dan kaki terasa dingin?",
        type: "text",
        placeholder:
          "Contoh: Telapak kaki selalu dingin terutama malam hari, tangan dingin saat AC...",
        suggestions: [
          "Ya, tangan & kaki sering dingin",
          "Hanya kaki yang dingin",
          "Tidak dingin (hangat/normal)",
        ],
      },
      {
        id: "g7_wajah_panas_memerah",
        number: 7,
        label: "Apakah wajah atau tubuh mudah terasa panas atau memerah?",
        type: "text",
        placeholder: "Contoh: Wajah mudah terasa panas saat sore/malam, dada terasa panas...",
        suggestions: [
          "Tidak pernah",
          "Wajah terasa panas saat sore/malam",
          "Sensasi panas di telapak tangan",
        ],
      },
      {
        id: "g8_mudah_berkeringat",
        number: 8,
        label: "Apakah mudah berkeringat?",
        type: "text",
        placeholder:
          "Contoh: Mudah berkeringat dingin tanpa aktivitas berat, berkeringat saat tidur malam, jarang berkeringat...",
        suggestions: [
          "Mudah berkeringat spontan",
          "Keringat malam saat tidur",
          "Jarang berkeringat",
          "Berkeringat wajar saat aktivitas",
        ],
      },
      {
        id: "g9_sering_haus",
        number: 9,
        label: "Apakah sering haus?",
        type: "text",
        placeholder: "Contoh: Tenggorokan sering kering dan banyak minum, jarang merasa haus...",
        suggestions: [
          "Sering haus tenggorokan kering",
          "Jarang haus / minum sedikit",
          "Haus tapi hanya ingin minum sedikit-sedikit",
        ],
      },
      {
        id: "g10_minuman_hangat_dingin",
        number: 10,
        label: "Lebih menyukai minuman hangat atau dingin?",
        type: "text",
        placeholder: "Contoh: Lebih menyukai air hangat atau suhu ruangan...",
        suggestions: ["Minuman hangat", "Minuman dingin / es", "Suhu ruangan biasa"],
      },
      {
        id: "g11_badan_berat_bengkak",
        number: 11,
        label: "Apakah tubuh mudah terasa berat atau mengalami bengkak?",
        type: "text",
        placeholder:
          "Contoh: Kaki bengkak sore hari, kepala terasa berat seperti dibebani, badan terasa berat saat bangun pagi...",
        suggestions: [
          "Badan terasa berat & pegal",
          "Kaki bengkak saat sore",
          "Tidak ada bengkak/berat",
        ],
      },
    ],
  },
  {
    key: "pencernaan",
    code: "H",
    title: "H. PENCERNAAN",
    shortTitle: "Pencernaan",
    description: "Kesehatan lambung, pola buang air besar, dan metabolisme limpa",
    iconName: "Utensils",
    fields: [
      {
        id: "h1_sering_kembung",
        number: 1,
        label: "Apakah sering kembung?",
        type: "text",
        placeholder:
          "Contoh: Perut begah setelah makan, kembung terutama sore hari, tidak sering...",
        suggestions: ["Sering kembung & begah", "Kembung setelah makan tertentu", "Jarang kembung"],
      },
      {
        id: "h2_sering_sendawa",
        number: 2,
        label: "Apakah sering sendawa?",
        type: "text",
        placeholder: "Contoh: Sering sendawa berulang setelah makan atau saat cemas...",
        suggestions: ["Sering sendawa", "Sendawa berbau asam", "Jarang sendawa"],
      },
      {
        id: "h3_mual_muntah_cerna",
        number: 3,
        label: "Apakah sering mual atau muntah?",
        type: "text",
        placeholder:
          "Contoh: Mual saat perut kosong, mual saat melihat makanan berminyak, tidak...",
        suggestions: ["Tidak pernah", "Mual saat perut kosong", "Mual setelah makan"],
      },
      {
        id: "h4_panas_perih_lambung",
        number: 4,
        label: "Apakah ada rasa panas, perih, atau nyeri di lambung?",
        type: "text",
        placeholder:
          "Contoh: Rasa perih di ulu hati sebelum makan, panas seperti terbakar (heartburn)...",
        suggestions: [
          "Tidak ada perih",
          "Perih di ulu hati",
          "Sensasi panas terbakar (Heartburn)",
          "Nyeri tumpul di lambung",
        ],
      },
      {
        id: "h5_cairan_asam_naik",
        number: 5,
        label: "Apakah sering merasa asam atau cairan naik ke tenggorokan?",
        type: "text",
        placeholder: "Contoh: Sering reflux asam terutama saat berbaring setelah makan...",
        suggestions: [
          "Sering refluks asam (GERD)",
          "Kadang-kadang saat telat makan",
          "Tidak pernah",
        ],
      },
      {
        id: "h6_nafsu_setelah_makan",
        number: 6,
        label: "Bagaimana nafsu makan setelah makan?",
        type: "text",
        placeholder:
          "Contoh: Cepat merasa ngantuk berat setelah makan, perut terasa kencang/penuh...",
        suggestions: [
          "Ngantuk berat setelah makan",
          "Perut terasa kencang & begah",
          "Nyaman bertenaga",
        ],
      },
      {
        id: "h7_pola_bab",
        number: 7,
        label: "Bagaimana BAB: berapa kali sehari dan apakah lancar?",
        type: "text",
        placeholder: "Contoh: 1x sehari lancar setiap pagi, 2-3 hari sekali sulit...",
        suggestions: [
          "1x sehari lancar setiap pagi",
          "2-3 hari sekali (Sembelit)",
          "2-3x sehari (Cenderung cair)",
        ],
      },
      {
        id: "h8_konsistensi_feses",
        number: 8,
        label: "Apakah feses keras, lembek, atau cair?",
        type: "text",
        placeholder: "Contoh: Lembek tidak berbentuk, kadang keras saat kurang minum...",
        suggestions: [
          "Normal padat berbentuk",
          "Lembek / tidak berbentuk",
          "Keras (Sembelit)",
          "Cair / diare",
          "Lengket dan basah pada kloset",
        ],
      },
      {
        id: "h9_bab_mengejan",
        number: 9,
        label: "Apakah BAB sulit atau harus mengejan?",
        type: "text",
        placeholder: "Contoh: Harus mengejan kuat, BAB tuntas dengan mudah, rasa belum tuntas...",
        suggestions: [
          "Mudah tuntas tanpa mengejan",
          "Harus mengejan keras",
          "Rasa BAB tidak tuntas",
        ],
      },
      {
        id: "h10_lendir_darah_feses",
        number: 10,
        label: "Apakah terdapat lendir atau darah pada feses?",
        type: "text",
        placeholder:
          "Contoh: Kadang ada lendir bening/putih, ada darah segar karena wasir, tidak ada...",
        suggestions: [
          "Tidak ada lendir/darah",
          "Terdapat lendir",
          "Ada darah segar (Wasir/Ambeien)",
        ],
      },
    ],
  },
  {
    key: "bak_kemih",
    code: "I",
    title: "I. BAK DAN SALURAN KEMIH",
    shortTitle: "BAK & Kemih",
    description: "Frekuensi berkemih, warna urine, dan fungsi cairan ginjal",
    iconName: "Droplets",
    fields: [
      {
        id: "i1_frekuensi_bak",
        number: 1,
        label: "Berapa kali BAK dalam sehari?",
        type: "text",
        placeholder: "Contoh: 4-6 kali sehari, lebih dari 10 kali sehari...",
        suggestions: [
          "4-6 kali sehari (Normal)",
          "7-10 kali sehari",
          "> 10 kali (Sangat sering)",
          "Sering terbangun BAK 2-4x di malam hari",
        ],
      },
      {
        id: "i2_warna_urine",
        number: 2,
        label: "Bagaimana warna urine?",
        type: "text",
        placeholder: "Contoh: Kuning cerah normal, kuning pekat di pagi hari...",
        suggestions: [
          "Jernih bening",
          "Kuning normal cerah",
          "Kuning pekat / gelap",
          "Keruh / kemerahan",
        ],
      },
      {
        id: "i3_jumlah_urine",
        number: 3,
        label: "Apakah jumlah urine normal?",
        type: "text",
        placeholder: "Contoh: Jumlah banyak dan lancar, sedikit-sedikit tapi sering...",
        suggestions: ["Jumlah normal lancar", "Jumlah sedikit tapi sering", "Jumlah sangat banyak"],
      },
      {
        id: "i4_sering_bak",
        number: 4,
        label: "Apakah sering BAK?",
        type: "text",
        placeholder: "Contoh: Sering BAK saat dingin atau cemas, tidak sering...",
        suggestions: ["Sering BAK terutama saat dingin", "Sering BAK di malam hari", "Normal"],
      },
      {
        id: "i5_bak_sulit_tidak_tuntas",
        number: 5,
        label: "Apakah BAK terasa sulit atau tidak tuntas?",
        type: "text",
        placeholder: "Contoh: Pancaran urin lemah, menetes di akhir, terasa belum tuntas...",
        suggestions: [
          "Lancar dan tuntas",
          "Terasa tidak tuntas / menetes",
          "Pancaran lemah / harus mengejan",
        ],
      },
      {
        id: "i6_nyeri_terbakar_bak",
        number: 6,
        label: "Apakah terdapat nyeri atau rasa terbakar saat BAK?",
        type: "text",
        placeholder: "Contoh: Terasa perih di ujung saluran saat BAK, tidak ada nyeri...",
        suggestions: ["Tidak ada nyeri", "Terasa perih / panas saat BAK", "Nyeri di perut bawah"],
      },
      {
        id: "i7_riwayat_batu_ginjal",
        number: 7,
        label: "Apakah pernah mengalami batu ginjal?",
        type: "text",
        placeholder: "Contoh: Pernah keluar pasir/batu ginjal tahun 2021, tidak pernah...",
        suggestions: [
          "Tidak pernah",
          "Pernah ada batu ginjal/saluran kemih",
          "Sering pegal di area pinggang belakang",
        ],
      },
      {
        id: "i8_infeksi_kemih",
        number: 8,
        label: "Apakah pernah mengalami infeksi saluran kemih?",
        type: "text",
        placeholder: "Contoh: Pernah ISK dan minum antibiotik, tidak pernah...",
        suggestions: ["Tidak pernah", "Pernah mengalami ISK / Anyang-anyangan"],
      },
    ],
  },
  {
    key: "pemeriksaan_tcm",
    code: "J",
    title: "J. PEMERIKSAAN KHUSUS TCM",
    shortTitle: "Pemeriksaan TCM",
    description: "Keseimbangan Yin-Yang, patogen Luar/Dalam, dan diferensiasi Zang-Fu",
    iconName: "Sparkles",
    fields: [
      {
        id: "j1_nyaman_panas_dingin",
        number: 1,
        label: "Apakah tubuh lebih nyaman dengan panas atau dingin?",
        type: "text",
        placeholder: "Contoh: Lebih nyaman dengan suhu hangat dan memakai selimut...",
        suggestions: [
          "Lebih nyaman suhu hangat / pakaian tebal",
          "Lebih nyaman suhu dingin / AC",
          "Suhu ruangan netral",
        ],
      },
      {
        id: "j2_tangan_kaki_dingin_tcm",
        number: 2,
        label: "Apakah tangan dan kaki dingin?",
        type: "text",
        placeholder: "Contoh: Tangan dan kaki sering sedingin es terutama musim hujan...",
        suggestions: ["Ya, tangan & kaki sering dingin", "Hanya kaki yang dingin", "Hangat normal"],
      },
      {
        id: "j3_mudah_panas",
        number: 3,
        label: "Apakah tubuh mudah merasa panas?",
        type: "text",
        placeholder: "Contoh: Telapak tangan/kaki panas saat malam (5 Heart Heat), mudah gerah...",
        suggestions: [
          "Mudah gerah & berkeringat",
          "Telapak tangan/kaki terasa panas saat malam",
          "Tidak mudah panas",
        ],
      },
      {
        id: "j4_haus_dan_suhu_minum",
        number: 4,
        label: "Apakah sering haus? Lebih menyukai minuman hangat atau dingin?",
        type: "text",
        placeholder: "Contoh: Sering haus dan ingin es dingin, haus tapi ingin air hangat...",
        suggestions: [
          "Sering haus & suka es dingin (Panas internal)",
          "Jarang haus & suka air hangat (Dingin/Lembap)",
          "Haus sedang air hangat",
        ],
      },
      {
        id: "j5_keringat_tanpa_aktivitas",
        number: 5,
        label: "Apakah mudah berkeringat tanpa aktivitas?",
        type: "text",
        placeholder:
          "Contoh: Duduk diam berkeringat di dahi & dada (Defisiensi Qi / Wei Qi lemah)...",
        suggestions: [
          "Ya, sering berkeringat spontan (Defisiensi Qi)",
          "Keringat saat malam tidur (Defisiensi Yin)",
          "Tidak berkeringat tanpa aktivitas",
        ],
      },
      {
        id: "j6_mudah_bengkak_tubuh_berat",
        number: 6,
        label: "Apakah mudah mengalami bengkak atau tubuh terasa berat?",
        type: "text",
        placeholder: "Contoh: Kelopak mata sembab saat bangun tidur, betis berat di sore hari...",
        suggestions: [
          "Badan terasa berat & kaku (Lembap)",
          "Kelopak mata sembab pagi hari",
          "Tungkai bawah sembab",
          "Tidak ada bengkak",
        ],
      },
      {
        id: "j7_dahak_lendir",
        number: 7,
        label: "Apakah sering terdapat dahak atau lendir?",
        type: "text",
        placeholder:
          "Contoh: Sering berdahak di pagi hari, sensasi dahak di tenggorokan yang susah keluar...",
        suggestions: [
          "Sering ada dahak di tenggorokan",
          "Tenggorokan terasa ada yang mengganjal",
          "Tidak ada dahak/lendir",
        ],
      },
      {
        id: "j8_warna_kekentalan_dahak",
        number: 8,
        label: "Bagaimana warna dan kekentalan dahak?",
        type: "text",
        placeholder:
          "Contoh: Dahak bening encer (Dingin), dahak kuning kental (Panas), tidak berdahak...",
        suggestions: [
          "Bening / putih encer (Dingin)",
          "Kuning / kehijauan kental (Panas)",
          "Putih berbusa (Lembap)",
          "Tidak ada dahak",
        ],
      },
      {
        id: "j9_keluhan_memburuk_cuaca",
        number: 9,
        label: "Apakah keluhan memburuk pada cuaca dingin, panas, atau lembap?",
        type: "text",
        placeholder: "Contoh: Nyeri sendi memburuk saat musim hujan / cuaca lembap...",
        suggestions: [
          "Memburuk saat cuaca dingin/hujan",
          "Memburuk saat cuaca lembap mendung",
          "Memburuk saat cuaca terik panas",
          "Tidak terpengaruh cuaca",
        ],
      },
      {
        id: "j10_waktu_keluhan_berat",
        number: 10,
        label: "Apakah keluhan lebih berat pada pagi, siang, sore, atau malam?",
        type: "text",
        placeholder:
          "Contoh: Pagi hari saat bangun tidur badan kaku, malam hari menjelang tidur...",
        suggestions: [
          "Pagi hari saat bangun tidur",
          "Malam hari menjelang tidur",
          "Sore hari setelah beraktivitas",
          "Subuh dini hari",
        ],
      },
      {
        id: "j11_kondisi_emosi",
        number: 11,
        label:
          "Bagaimana kondisi emosi: mudah marah, cemas, sedih, banyak pikiran, atau mudah tertekan?",
        type: "text",
        placeholder: "Contoh: Sering cemas dan overthinking, mudah tersinggung/marah saat lelah...",
        suggestions: [
          "Banyak pikiran & overthinking (Limpa)",
          "Mudah cemas & gelisah (Jantung)",
          "Mudah marah / tersinggung (Hati)",
          "Sering murung & sedih (Paru)",
          "Tenang & stabil",
        ],
      },
      {
        id: "j12_takut_gelisah_tanpa_sebab",
        number: 12,
        label: "Apakah sering merasa takut atau gelisah tanpa sebab yang jelas?",
        type: "text",
        placeholder: "Contoh: Sering kaget dan ada rasa was-was di dada, tidak pernah...",
        suggestions: [
          "Sering merasa was-was & gelisah",
          "Mudah terkejut / kaget",
          "Tidak ada ketakutan tanpa sebab",
        ],
      },
    ],
  },
  {
    key: "gaya_hidup",
    code: "K",
    title: "K. GAYA HIDUP",
    shortTitle: "Gaya Hidup",
    description: "Pola makan, kafein, kebiasaan tidur, stres, dan ergonomi kerja",
    iconName: "Coffee",
    fields: [
      {
        id: "k1_merokok",
        number: 1,
        label: "Apakah merokok? Berapa batang per hari?",
        type: "text",
        placeholder: "Contoh: Tidak merokok, ya merokok 6-10 batang/hari, vape...",
        suggestions: [
          "Tidak merokok",
          "Merokok < 5 batang/hari",
          "Merokok 1 bungkus/hari",
          "Menggunakan Vape / Rokok Elektrik",
        ],
      },
      {
        id: "k2_kopi_kafein",
        number: 2,
        label: "Berapa banyak kopi atau minuman berkafein yang dikonsumsi per hari?",
        type: "text",
        placeholder:
          "Contoh: 1 cangkir kopi hitam pagi hari, 2-3 gelas teh/kopi sehari, tidak minum...",
        suggestions: [
          "Tidak minum kopi/kafein",
          "1 cangkir kopi sehari",
          "2-3 cangkir kopi/teh sehari",
          "> 3 cangkir per hari",
        ],
      },
      {
        id: "k3_pola_makan",
        number: 3,
        label: "Bagaimana pola makan sehari-hari?",
        type: "text",
        placeholder:
          "Contoh: Teratur 3x sehari, sering telat makan karena kerja, makan malam larut...",
        suggestions: [
          "Teratur 3 kali sehari",
          "Sering telat makan / skip sarapan",
          "Sering makan malam larut (> jam 20.00)",
          "Porsi makan berlebih",
        ],
      },
      {
        id: "k4_makanan_pedas_berminyak_dingin",
        number: 4,
        label:
          "Apakah sering mengonsumsi makanan pedas, berminyak, manis, atau makanan/minuman dingin?",
        type: "text",
        placeholder: "Contoh: Suka gorengan dan sambal pedas, sering minum es teh manis...",
        suggestions: [
          "Sering makanan pedas & gorengan",
          "Sering minuman manis & es",
          "Sering makanan olahan / tepung",
          "Jarang / pola makan sehat seimbang",
        ],
      },
      {
        id: "k5_sering_begadang",
        number: 5,
        label: "Apakah sering begadang?",
        type: "text",
        placeholder: "Contoh: Tidur di atas jam 24.00 karena kerjaan, tidur teratur jam 22.00...",
        suggestions: [
          "Sering tidur di atas jam 24.00 (Begadang)",
          "Tidur teratur sebelum jam 23.00",
          "Bekerja shift malam",
        ],
      },
      {
        id: "k6_aktivitas_fisik",
        number: 6,
        label: "Bagaimana aktivitas fisik sehari-hari?",
        type: "text",
        placeholder:
          "Contoh: Jarang olahraga dan banyak duduk, jalan santai 3x seminggu, olahraga rutin...",
        suggestions: [
          "Kurang olahraga & banyak duduk (Sedentary)",
          "Jalan kaki / olahraga ringan 2-3x seminggu",
          "Olahraga rutin intensitas sedang-berat",
        ],
      },
      {
        id: "k7_ergonomi_pekerjaan",
        number: 7,
        label:
          "Apakah pekerjaan banyak duduk, berdiri, mengangkat beban, atau melakukan gerakan berulang?",
        type: "text",
        placeholder:
          "Contoh: Duduk depan laptop 8 jam sehari, berdiri lama saat mengajar, sering angkat beban...",
        suggestions: [
          "Banyak duduk depan komputer (> 7 jam)",
          "Banyak berdiri lama",
          "Sering mengangkat beban berat",
          "Gerakan tangan berulang",
        ],
      },
      {
        id: "k8_stres_banyak_pikiran",
        number: 8,
        label: "Apakah sedang mengalami stres atau banyak pikiran?",
        type: "text",
        placeholder:
          "Contoh: Beban kerja tinggi dan tekanan keluarga, tingkat stres sedang, santai...",
        suggestions: [
          "Tingkat stres tinggi & banyak pikiran",
          "Stres sedang terkait pekerjaan",
          "Pikiran relatif tenang",
        ],
      },
    ],
  },
  {
    key: "khusus_wanita",
    code: "L",
    title: "L. KHUSUS PASIEN WANITA",
    shortTitle: "Khusus Wanita",
    description: "Siklus haid, karakteristik darah menstruasi, keputihan, dan reproduksi",
    iconName: "Venus",
    isFemaleOnly: true,
    fields: [
      {
        id: "l1_siklus_menstruasi",
        number: 1,
        label: "Bagaimana siklus menstruasi?",
        type: "text",
        placeholder: "Contoh: Siklus 28-30 hari, siklus memanjang 40 hari, sudah menopause...",
        suggestions: [
          "Siklus normal (28-30 hari)",
          "Siklus pendek (< 21 hari)",
          "Siklus panjang (> 35 hari)",
          "Sudah Menopause",
          "Tidak Relevan (Laki-laki)",
        ],
      },
      {
        id: "l2_lama_menstruasi",
        number: 2,
        label: "Berapa hari lama menstruasi?",
        type: "text",
        placeholder: "Contoh: 5-7 hari, kurang dari 3 hari, lebih dari 10 hari...",
        suggestions: [
          "5-7 hari (Normal)",
          "< 3 hari (Sedikit/pendek)",
          "> 8 hari (Panjang/menetes)",
        ],
      },
      {
        id: "l3_siklus_teratur",
        number: 3,
        label: "Apakah siklus teratur?",
        type: "text",
        placeholder: "Contoh: Teratur setiap bulan, kadang maju atau mundur 1-2 minggu...",
        suggestions: ["Teratur setiap bulan", "Tidak teratur / sering telat", "Sering maju"],
      },
      {
        id: "l4_jumlah_darah_menstruasi",
        number: 4,
        label: "Bagaimana jumlah darah menstruasi: sedikit, sedang, atau banyak?",
        type: "text",
        placeholder: "Contoh: Jumlah sedang, ganti pembalut 2-3 kali sehari...",
        suggestions: [
          "Sedang (ganti pembalut 2-3x sehari)",
          "Banyak (ganti pembalut > 5x sehari)",
          "Sedikit (hanya bercak / spotting)",
          "Tidak relevan",
        ],
      },
      {
        id: "l5_warna_darah_menstruasi",
        number: 5,
        label: "Bagaimana warna darah menstruasi?",
        type: "text",
        placeholder: "Contoh: Merah segar, merah gelap kehitaman, merah pucat encer...",
        suggestions: [
          "Merah segar normal",
          "Merah gelap kehitaman (Stasis darah)",
          "Merah pucat encer (Defisiensi darah)",
        ],
      },
      {
        id: "l6_gumpalan_darah",
        number: 6,
        label: "Apakah terdapat gumpalan darah?",
        type: "text",
        placeholder: "Contoh: Terdapat gumpalan kehitaman di hari 1-2, tidak ada gumpalan...",
        suggestions: ["Tidak ada gumpalan", "Ada gumpalan hitam besar", "Sedikit gumpalan kecil"],
      },
      {
        id: "l7_nyeri_menstruasi",
        number: 7,
        label: "Apakah mengalami nyeri saat menstruasi?",
        type: "text",
        placeholder:
          "Contoh: Kram perut hebat di hari pertama (Dismenore), nyeri pinggang, tidak nyeri...",
        suggestions: [
          "Tidak ada nyeri",
          "Kram perut hebat hari 1-2 (Dismenore)",
          "Nyeri pinggang & pegal",
          "Nyeri berkurang bila dikompres hangat",
        ],
      },
      {
        id: "l8_keputihan",
        number: 8,
        label: "Apakah terdapat keputihan? Jika ada, bagaimana warna, jumlah, dan baunya?",
        type: "text",
        placeholder:
          "Contoh: Keputihan bening tidak berbau, keputihan putih susu kental agak gatal, tidak ada...",
        suggestions: [
          "Tidak ada keputihan",
          "Bening encer tidak berbau (Normal)",
          "Putih kental / gatal",
          "Kuning kehijauan berbau",
        ],
      },
      {
        id: "l9_hamil_rencana_menyusui",
        number: 9,
        label: "Apakah sedang hamil, merencanakan kehamilan, atau menyusui?",
        type: "text",
        placeholder: "Contoh: Sedang merencanakan program hamil (promil), menyusui, tidak...",
        suggestions: ["Tidak", "Sedang Program Hamil (Promil)", "Sedang Hamil", "Sedang Menyusui"],
      },
    ],
  },
];

/**
 * Returns total count of all question fields across all sections
 */
export function getTotalQuestionCount(isFemale = true): number {
  return TCM_SECTIONS.reduce((acc, sec) => {
    if (sec.isFemaleOnly && !isFemale) return acc;
    return acc + sec.fields.length;
  }, 0);
}

/**
 * Returns answered count based on non-empty string answers
 */
export function getAnsweredQuestionCount(
  answers: Record<string, string | number>,
  isFemale = true,
): number {
  let count = 0;
  for (const sec of TCM_SECTIONS) {
    if (sec.isFemaleOnly && !isFemale) continue;
    for (const field of sec.fields) {
      const val = answers[field.id];
      if (val !== undefined && val !== null && String(val).trim().length > 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Converts patient questionnaire text answers into structured summary lines for Gemini AI prompt & reports
 */
export function formatAnswersForPrompt(
  answers: Record<string, string | number>,
  isFemale = true,
): string {
  const lines: string[] = [];

  for (const sec of TCM_SECTIONS) {
    if (sec.isFemaleOnly && !isFemale) continue;
    lines.push(`\n=== ${sec.title} ===`);
    for (const field of sec.fields) {
      const val = answers[field.id];
      const ansText =
        val !== undefined && val !== null && String(val).trim().length > 0
          ? String(val).trim()
          : "-(Belum diisi)-";
      lines.push(`${field.number}. ${field.label}\n   Jawaban: ${ansText}`);
    }
  }

  return lines.join("\n");
}
