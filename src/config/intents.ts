/**
 * intents.ts — registry of intent workflow pages (Phase 2).
 *
 * The intents orchestrator REGISTERS every page it creates here; the sidebar
 * section (IntentsNav) renders automatically from this list — no Layout edit
 * needed. Keep `path` identical to the route added in App.tsx's
 * `<custom:routes>` block.
 *
 * ONLY write inside the marker blocks — everything outside is scaffold and is
 * overwritten on the next /build/update.
 *
 *   <custom:intent-imports>
 *   import { IconCalendarPlus } from '@tabler/icons-react';
 *   </custom:intent-imports>
 *   …
 *   <custom:intents>
 *   { path: '/intents/neue-buchung', label: { de: 'Neue Buchung', en: 'New booking' }, icon: IconCalendarPlus, description: { de: 'Buchung in 3 Schritten anlegen', en: 'Create a booking in 3 steps' } },
 *   </custom:intents>
 */
import type { ComponentType } from 'react';

// <custom:intent-imports>
import { IconFileDescription, IconBulb, IconGavel, IconRuler2, IconClipboardCheck, IconSchool } from '@tabler/icons-react';
// </custom:intent-imports>

export interface IntentLink {
  /** Route path as wired in App.tsx (HashRouter), e.g. '/intents/neue-buchung'. */
  path: string;
  /**
   * Short sidebar label (1–3 words). Preferred: both UI languages
   * ({ de, en } — the runtime switcher picks the active one; cs stays
   * readable for legacy entries). A plain string stays valid and renders as-is.
   */
  label: string | { de?: string; en?: string; cs?: string };
  /** Tabler icon COMPONENT reference (not rendered JSX), e.g. IconCalendarPlus. */
  icon?: ComponentType<{ size?: number | string; className?: string; stroke?: number | string }>;
  /**
   * One-line purpose. Same shape as `label`: prefer both UI languages so a
   * language switch reaches it; a plain string stays valid.
   */
  description?: string | { de?: string; en?: string; cs?: string };
}

export const INTENTS: IntentLink[] = [
  // <custom:intents>
  { path: '/intents/arbeitskontext-erfassen', label: { de: 'Arbeitskontext erfassen', en: 'Record work context' }, icon: IconFileDescription, description: 'Neuen gültigen Zustand eines Vorhabens festhalten und den bisherigen Kontext als überholt markieren.' },
  { path: '/intents/ki-vorschlag-erfassen', label: { de: 'KI-Vorschlag erfassen', en: 'Record AI proposal' }, icon: IconBulb, description: 'Vorschlag eines KI-Modells zu einem Vorhaben mit gültigem Arbeitskontext festhalten; er ist nur vorgeschlagen, nicht ausgeführt.' },
  { path: '/intents/vorschlag-entscheiden', label: { de: 'Vorschlag entscheiden', en: 'Decide on proposal' }, icon: IconGavel, description: 'Vorschlag anhand einer gültigen Regel prüfen, Freigabe festhalten und Vorschlagsstatus setzen.' },
  { path: '/intents/regel-aendern', label: { de: 'Regel ändern', en: 'Change rule' }, icon: IconRuler2, description: 'Neue Fassung einer Regel als Entwurf anlegen, mit Verweis auf die Vorgängerregel; die Wirksamkeit entscheidet erst die Freigabe.' },
  { path: '/intents/taetigkeit-dokumentieren', label: { de: 'Tätigkeit dokumentieren', en: 'Document activity' }, icon: IconClipboardCheck, description: 'Ausgeführte Tätigkeit zu einem Vorhaben und einer erteilten Freigabe mit Ergebnis und Wirkung festhalten und den Vorschlag als ausgeführt markieren.' },
  { path: '/intents/erfahrung-festhalten', label: { de: 'Erfahrung festhalten', en: 'Capture experience' }, icon: IconSchool, description: 'Aus einer Tätigkeit gewonnene Erfahrung mit Bezug zu Tätigkeit und Vorhaben erfassen.' },
  // </custom:intents>
];

/**
 * True only in the Phase-1 deploy bundle (the service flips it): the sidebar
 * then shows ghost rows ("werden erstellt…") until Phase 2 registers the real
 * pages and sets this back to false. Lives OUTSIDE the custom markers on
 * purpose — a scaffold update resets it to false (self-healing if Phase 2
 * never ran).
 */
export const INTENTS_PENDING = false;

/**
 * When the Phase-1 bundle was deployed (ISO, set by the service together with
 * INTENTS_PENDING). The sidebar stops showing the ghost row PENDING_MAX_MINUTES
 * later on its own: a Phase 2 that ended red (or never ran) used to leave a
 * pulsing "werden erstellt …" in every deployed Phase-1 bundle forever — no
 * code path redeploys Phase 1 without the flag (live 03.09.2026).
 */
export const INTENTS_PENDING_SINCE: string | null = '2026-10-18T06:44:41+00:00';
export const PENDING_MAX_MINUTES = 30;
