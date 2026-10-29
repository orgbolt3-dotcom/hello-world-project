import { useEffect, useRef, useState, type FormEvent } from "react";
import { FLASH_CATEGORIES, type FlashCategory, type PublicFlash } from "@eco/core-contracts";
import { ArrowUpRight, LocateFixed, LoaderCircle, MapPin, RotateCcw, ScanLine, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/useI18n";
import { hasClientConnection } from "@/config/env.public";
import { useLocalScopeRevision } from "@/platform/offline/local-scope";
import { useVoluntaryScan } from "../hooks/useVoluntaryScan";

export function ScanView() {
  const { t, locale } = useI18n();
  const { snapshot, busy, error, execute, reset } = useVoluntaryScan();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<FlashCategory | null>(null);
  const [area, setArea] = useState("");
  const [nearby, setNearby] = useState(false);
  const [radius, setRadius] = useState(10);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState<PublicFlash | null>(null);
  const locationToken = useRef(0);
  const scopeRevision = useLocalScopeRevision();
  const connected = hasClientConnection();
  const canNearby = connected && online;
  const modified = snapshot && (snapshot.criteria.text !== text || snapshot.criteria.category !== category ||
    snapshot.criteria.area !== (nearby ? "" : area) || (snapshot.source === "nearby") !== nearby);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    locationToken.current += 1;
    setPosition(null); setSelected(null); setLocating(false); setLocationError(false);
    setText(""); setArea(""); setCategory(null); setNearby(false);
    return () => { locationToken.current += 1; };
  }, [scopeRevision]);

  function locate() {
    if (locating || !canNearby) return;
    const request = ++locationToken.current;
    setLocationError(false);
    if (!navigator.geolocation) { setLocationError(true); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (locationToken.current !== request) return;
      setPosition({ latitude: coords.latitude, longitude: coords.longitude }); setLocating(false);
    }, () => {
      if (locationToken.current !== request) return;
      setPosition(null); setLocationError(true); setLocating(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    setSelected(null);
    if (nearby && (!position || !canNearby)) return;
    void execute({ text, category, area: nearby ? "" : area }, nearby && position ? { ...position, radiusKm: radius } : undefined);
  }
  function clear() {
    reset(); setText(""); setArea(""); setCategory(null); setSelected(null);
    setPosition(null); setNearby(false); setRadius(10); setLocationError(false); setLocating(false);
    locationToken.current += 1;
  }

  return (
    <div className="page-shell space-y-8">
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-sm text-trust"><ScanLine className="size-4" aria-hidden />{t("scan.eyebrow")}</p>
        <h1 className="text-3xl font-medium tracking-normal">{t("scan.pageTitle")}</h1>
      </header>

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="scan-text">{t("scan.query")}</Label>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden />
            <Input id="scan-text" value={text} maxLength={160} onChange={(e) => setText(e.target.value)}
              placeholder={t("scan.placeholder")} className="h-12 pl-10" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scan-category">{t("scan.category")}</Label>
            <select id="scan-category" value={category ?? ""} onChange={(e) => {
              const value = FLASH_CATEGORIES.find((item) => item === e.target.value);
              setCategory(value ?? null);
            }} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="">{t("scan.all")}</option>
              {FLASH_CATEGORIES.map((item) => <option key={item} value={item}>{t(`scan.category.${item}`)}</option>)}
            </select>
          </div>
          {!nearby && <div className="space-y-2"><Label htmlFor="scan-area">{t("scan.area")}</Label>
            <Input id="scan-area" value={area} maxLength={160} onChange={(e) => setArea(e.target.value)}
              placeholder={t("scan.areaPlaceholder")} className="h-11" />
          </div>}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("scan.area")}>
          <Button type="button" variant={!nearby ? "secondary" : "ghost"} aria-pressed={!nearby} onClick={() => {
            setNearby(false); setPosition(null); setLocating(false); locationToken.current += 1;
          }}>{t("scan.saved")}</Button>
          <Button type="button" variant={nearby ? "secondary" : "ghost"} aria-pressed={nearby} disabled={!canNearby}
            onClick={() => { setNearby(true); reset(); }}><LocateFixed />{t("scan.nearby")}</Button>
        </div>
        {nearby && <div className="space-y-4 border-l-2 border-trust pl-4">
          <Button type="button" variant="outline" onClick={locate} disabled={locating}>
            {locating ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <LocateFixed />}
            {t(locating ? "scan.locating" : position ? "scan.locationReady" : "scan.location")}
          </Button>
          <div className="space-y-2"><Label htmlFor="scan-radius">{t("scan.radius")} · {radius} km</Label>
            <input id="scan-radius" type="range" min={1} max={50} value={radius} onChange={(e) => {
              setRadius(Number(e.target.value)); reset();
            }} className="block w-full accent-primary" />
          </div>
          <p className="text-xs text-muted-foreground">{t("scan.privacy")}</p>
          {locationError && <p role="alert" className="text-sm text-destructive">{t("scan.locationError")}</p>}
        </div>}
        {(!connected || !online) && <p className="text-sm text-muted-foreground">{t(!connected ? "scan.cloudMissing" : "scan.offline")}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" className="h-11 flex-1 sm:flex-none" disabled={busy || locating || (nearby && (!position || !canNearby))}>
            {busy ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <ScanLine />}{t(busy ? "scan.running" : "scan.launch")}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-11" onClick={clear} title={t("scan.reset")} aria-label={t("scan.reset")}><RotateCcw /></Button>
        </div>
      </form>

      <section aria-live="polite" aria-busy={busy} className="space-y-4 border-t border-border pt-6">
        {modified && <p className="text-sm text-warning">{t("scan.changed")}</p>}
        {busy ? <div className="flex min-h-36 items-center justify-center gap-2 text-muted-foreground"><LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />{t("scan.running")}</div>
          : error ? <div className="space-y-2 py-6"><h2 className="text-lg tracking-normal">{t("scan.unavailable")}</h2><p className="text-sm text-muted-foreground">{t("scan.unavailableDesc")}</p></div>
          : !snapshot ? <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-muted-foreground"><ScanLine className="size-8 text-trust" aria-hidden /><p>{t("scan.initial")}</p></div>
          : <>
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg tracking-normal">{t("scan.results")} · {snapshot.rows.length}</h2>
              <time className="text-xs text-muted-foreground" dateTime={new Date(snapshot.executedAt).toISOString()}>{new Date(snapshot.executedAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</time>
            </div>
            <p className="text-xs text-muted-foreground">{t(snapshot.source === "saved" ? "scan.saved" : "scan.nearby")}</p>
            {snapshot.rows.length === 0 ? <div className="space-y-2 py-6"><h3 className="text-base tracking-normal">{t("scan.noResults")}</h3><p className="text-sm text-muted-foreground">{t("scan.noResultsDesc")}</p></div>
              : <ul className="space-y-3">{snapshot.rows.map((row) => <li key={row.id} className="space-y-3 rounded-md border border-border bg-surface p-4">
                <div className="flex flex-wrap gap-2 text-xs text-trust"><span>{t(row.kind === "offer" ? "scan.offer" : "scan.need")}</span><span>·</span><span>{t(`scan.category.${row.category}`)}</span></div>
                <h3 className="break-words text-lg tracking-normal">{row.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><MapPin className="size-3.5" aria-hidden /><span>{row.areaLabel}</span>
                  {row.distanceKm !== undefined && <span>· {row.distanceKm.toLocaleString(locale, { maximumFractionDigits: 1 })} km</span>}
                  <span>· {t(`scan.${row.timeSlot}`)}</span>
                </div>
                <Button type="button" variant="ghost" onClick={() => setSelected(row)}>{t("scan.open")}<ArrowUpRight /></Button>
              </li>)}</ul>}
          </>}
      </section>
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="tracking-normal">{selected?.title ?? t("scan.preview")}</DialogTitle>
          <DialogDescription>{t("scan.preview")}</DialogDescription></DialogHeader>
          {selected && <div className="space-y-3 text-sm"><p>{t(`scan.category.${selected.category}`)} · {t(`scan.${selected.timeSlot}`)}</p><p className="flex items-center gap-2"><MapPin className="size-4" />{selected.areaLabel}</p>
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0" />{t("scan.previewLimit")}</p></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}