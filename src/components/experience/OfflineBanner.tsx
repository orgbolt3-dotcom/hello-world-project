import { useEffect, useState } from "react";
import { StatusBanner } from "@/components/app/StatusBanner";
import { useNetworkStatus } from "@/lib/platform/useNetworkStatus";
import { useI18n } from "@/lib/i18n/useI18n";

/**
 * OfflineBanner — generic offline awareness ribbon.
 * Hides cleanly when online; never shown during SSR to avoid hydration mismatch.
 */
export function OfflineBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const net = useNetworkStatus();
  const { t } = useI18n();

  if (!mounted || net.online) return null;
  return (
    <div className="px-4 pt-3">
      <StatusBanner
        status="warning"
        title={t("offline.banner.title")}
        description={t("offline.banner.desc")}
      />
    </div>
  );
}
