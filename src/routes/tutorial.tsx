import { createFileRoute } from "@/lib/route";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tutorial</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              {t.mediaType === "image" ? (
                <img src={t.mediaUrl} alt={t.title} className="w-full h-40 object-cover rounded" />
              ) : (
                <video src={t.mediaUrl} className="w-full h-40 object-cover rounded" controls />
              )}
              <h2 className="text-lg font-semibold mt-2">{t.title}</h2>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
