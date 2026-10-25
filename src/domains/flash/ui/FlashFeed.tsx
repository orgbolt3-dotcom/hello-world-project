import { FlashCard } from "@/components/app/FlashCard";
import { useFlashFeed } from "../hooks/useFlashFeed";

export function FlashFeed() {
  const { rows, source, loading, error } = useFlashFeed();

  if (loading && rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Chargement des Flash…
      </p>
    );
  }
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun Flash actif autour de vous.</p>;
  }

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground" role="status">
        {source === "remote" ? "Flash publics actualisés" : "Mode hors ligne"}
      </p>
      {error ? (
        <p className="text-xs text-warning" role="alert">
          {error}
        </p>
      ) : null}
      {rows.map((flash) => (
        <FlashCard
          key={flash.id}
          title={flash.title}
          description={`${flash.category} · ${flash.timeSlot}`}
          ttl={flash.areaLabel}
        />
      ))}
    </div>
  );
}
