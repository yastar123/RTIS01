import { createFileRoute } from "@/lib/route";
import { useEffect, useState } from "react";

import aboutImg from "@/assets/about-herbs.jpg";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — Rumah Terapy Ikhtiar Sehat" },
      {
        name: "description",
        content:
          "Filosofi, pendekatan, dan perjalanan Rumah Terapy Ikhtiar Sehat sebagai rumah sehat tradisional Chinese medicine.",
      },
      { property: "og:title", content: "Tentang Kami — Rumah Terapy Ikhtiar Sehat" },
      {
        property: "og:description",
        content: "Filosofi dan pendekatan klinik TCM Rumah Terapy Ikhtiar Sehat.",
      },
    ],
  }),
  component: About,
});

const values = [
  ["Keseimbangan", "Tubuh dipandang sebagai satu sistem. Kami mencari akar, bukan menutup gejala."],
  ["Ketenangan", "Ruang terapi dirancang hening agar tubuh masuk ke mode pemulihan."],
  ["Kejujuran", "Kami menyampaikan ekspektasi terapi apa adanya, termasuk batasannya."],
  ["Pendampingan", "Setiap pasien dievaluasi tiap sesi, bukan sekadar diberi resep."],
];

const timeline = [
  ["2013", "Praktik pertama akupunktur dan herbal dalam skala rumahan."],
  ["2017", "Menambahkan Tuina dan konseling sebagai bagian dari protokol terapi."],
  ["2021", "Mengadopsi pendekatan BSM untuk kasus kronis dan degeneratif."],
  ["2024", "Membuka layanan audioterapi dan sistem reservasi terjadwal."],
];

function About() {
  const [cmsHeroTitle, setCmsHeroTitle] = useState("Rumah sehat yang merawat dengan sabar");
  const [cmsHeroSub, setCmsHeroSub] = useState(
    "Rumah Terapy Ikhtiar Sehat lahir dari keyakinan sederhana: tubuh punya kemampuan memulihkan diri bila hambatannya dibuka satu per satu.",
  );
  const [valuesList, setValuesList] = useState(values);
  const [timelineList, setTimelineList] = useState(timeline);

  useEffect(() => {
    fetch("/api/cms/about")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.heroTitle) {
          setCmsHeroTitle(data.heroTitle);
          setCmsHeroSub(data.heroSubtitle);
          try {
            const parsed = JSON.parse(data.contentJson ?? "{}");
            if (parsed.values) setValuesList(parsed.values);
            if (parsed.timeline) setTimelineList(parsed.timeline);
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHeader eyebrow="Tentang Kami" title={cmsHeroTitle} description={cmsHeroSub} />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-5 sm:py-20 md:grid-cols-2 md:items-center md:gap-12">
        <img
          src={aboutImg}
          alt="Jarum akupunktur dan herbal Tiongkok"
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-4/3 w-full rounded-sm object-cover"
        />
        <div>
          <p className="eyebrow">Filosofi</p>
          <h2 className="mt-4 text-2xl leading-tight sm:text-3xl md:text-4xl">
            Klasik dalam prinsip, tertib dalam praktik
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Kami berpegang pada diagnosa sindrom TCM — pengamatan lidah, palpasi nadi, dan wawancara
            mendalam — lalu menerjemahkannya menjadi rencana terapi yang terukur. Setiap racikan
            herbal ditakar ulang mengikuti perkembangan pasien.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Terapi TCM bersifat komplementer. Kami terbuka bekerja berdampingan dengan penanganan
            medis yang sedang Anda jalani.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          {valuesList.map(([title, text]) => (
            <div key={title}>
              <h3 className="text-lg">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
        <p className="eyebrow">Perjalanan</p>
        <div className="mt-8 border-t border-border">
          {timelineList.map(([year, text]) => (
            <div
              key={year}
              className="grid gap-2 border-b border-border py-6 md:grid-cols-[8rem_1fr]"
            >
              <span className="font-display text-xl text-primary">{year}</span>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
