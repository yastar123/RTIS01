import { createFileRoute } from "@/lib/route";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/tutorial")({
  component: TutorialPage,
});

function TutorialPage() {
  const [tutorials, setTutorials] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tutorials")
      .then((res) => res.json())
      .then(setTutorials);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5">
      <PageHeader title="Tutorial" description="Panduan kesehatan dan penggunaan layanan kami" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              {t.mediaType === "image" ? (
                <img src={t.mediaUrl} alt={t.title} className="w-full h-48 object-cover rounded" />
              ) : (
                <video src={t.mediaUrl} className="w-full h-48 object-cover rounded" controls />
              )}
              <h2 className="text-lg font-semibold mt-3">{t.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
