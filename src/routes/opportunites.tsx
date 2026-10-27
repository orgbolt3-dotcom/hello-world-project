import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/opportunites")({
  head: () => ({
    meta: [
      { title: "Opportunités sur mesure — Vitala" },
      { name: "description", content: "Décrivez vos compétences et objectifs, recevez des opportunités adaptées." },
      { property: "og:title", content: "Opportunités sur mesure — Vitala" },
      { property: "og:description", content: "Des pistes professionnelles proposées selon votre profil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpportunitiesPage,
});

function renderLine(line: string, i: number) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p,
  );
  if (/^#{1,4}\s/.test(line)) return <h3 key={i} className="mt-4 font-semibold">{line.replace(/^#+\s/, "")}</h3>;
  if (/^\s*[-*]\s/.test(line)) return <li key={i} className="ml-5 list-disc">{parts.slice(0)}</li>;
  return line.trim() ? <p key={i} className="mt-2">{parts}</p> : null;
}

function OpportunitiesPage() {
  const [skills, setSkills] = useState("");
  const [goals, setGoals] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOutput("");
    setError("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/public/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, goals }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const idx = text.indexOf("[[ERREUR]]");
        if (idx >= 0) {
          setOutput(text.slice(0, idx).trim());
          setError(text.slice(idx + 10).trim());
        } else setOutput(text);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">Orientation</p>
      <h1 className="mt-1 text-3xl font-bold text-foreground">Trouvez vos opportunités</h1>
      <p className="mt-2 text-muted-foreground">
        Décrivez ce que vous savez faire et où vous voulez aller : nous vous proposons des pistes adaptées.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Vos compétences</span>
          <Textarea value={skills} onChange={(e) => setSkills(e.target.value)} maxLength={2000} rows={4}
            placeholder="Ex. : couture, gestion de stock, Excel, anglais courant…" className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Vos objectifs professionnels</span>
          <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} maxLength={2000} rows={4}
            placeholder="Ex. : ouvrir mon atelier d'ici un an, trouver un emploi stable…" className="mt-1" />
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading || skills.trim().length < 3 || goals.trim().length < 3}>
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Recherche…" : "Suggérer des opportunités"}
          </Button>
          {loading && (
            <Button type="button" variant="outline" onClick={() => abortRef.current?.abort()}>
              <Square className="mr-2 h-4 w-4" /> Arrêter
            </Button>
          )}
        </div>
      </form>

      {error && <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">{error}</p>}
      {(output || loading) && (
        <section className="mt-6 rounded-lg border border-border bg-card p-5 text-card-foreground">
          {output ? output.split("\n").map(renderLine) : <p className="text-muted-foreground">Analyse de votre profil…</p>}
        </section>
      )}
    </main>
  );
}
