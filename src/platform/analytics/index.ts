/**
 * Analytics foundation — event-bus interface, no provider wired yet.
 */
export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean | null>;
  at?: number;
}

export interface AnalyticsSink {
  track: (event: AnalyticsEvent) => void;
}

export const noopAnalytics: AnalyticsSink = {
  track: () => {},
};
