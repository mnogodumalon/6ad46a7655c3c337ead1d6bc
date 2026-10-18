/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - nutzer: vorname (Vorname), nachname (Nachname), email (E-Mail), rolle (Rolle), berechtigungsstufe (Berechtigungsstufe)
 *   - ki_modelle: bezeichnung (Bezeichnung), status (Status)
 *   - vorhaben: titel (Titel), ausgangssituation (Ausgangssituation), ziel (Ziel), verantwortlicher (Verantwortlicher), status (Status)
 *   - regeln: bezeichnung (Bezeichnung), regeltyp (Regeltyp), erforderliche_stufe (Erforderliche Berechtigungsstufe), status (Status)
 *   - arbeitskontexte: vorhaben (Vorhaben), versionsnummer (Versionsnummer), aktueller_zustand (Aktueller Zustand), gueltigkeitsstatus (Gültigkeitsstatus), erfasst_von (Erfasst von), zeitpunkt (Zeitpunkt)
 *   - ki_vorschlaege: vorhaben (Vorhaben), modell (KI-Modell), art (Art des Vorschlags), inhalt (Inhalt), status (Status), arbeitskontext (Arbeitskontext)
 *   - freigaben: entscheider (Entscheider), regelpruefung (Ergebnis der Regelprüfung), entscheidung (Entscheidung), entscheidungszeitpunkt (Zeitpunkt der Entscheidung), vorschlag (Vorschlag), angewendete_regel (Angewendete Regel)
 *   - taetigkeiten: vorhaben (Vorhaben), beschreibung (Beschreibung), ausfuehrender (Ausführender), zeitpunkt (Zeitpunkt der Ausführung)
 *   - erfahrungen: titel (Titel), beschreibung (Beschreibung), erfasst_von (Erfasst von)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "nutzer": "vorname" | "nachname" | "email" | "rolle" | "berechtigungsstufe" | "aktiv";
  "ki_modelle": "bezeichnung" | "anbieter" | "version" | "einsatzzweck" | "faehigkeiten_einschraenkungen" | "zuverlaessigkeit" | "status";
  "vorhaben": "titel" | "ausgangssituation" | "ziel" | "kontext" | "verantwortlicher" | "status" | "startdatum" | "enddatum";
  "regeln": "bezeichnung" | "beschreibung" | "regeltyp" | "bedingung" | "wirkung" | "erforderliche_stufe" | "gueltig_ab" | "status" | "verantwortlicher" | "vorgaengerregel";
  "arbeitskontexte": "vorhaben" | "versionsnummer" | "aktueller_zustand" | "verwendete_informationen" | "annahmen" | "gueltigkeitsstatus" | "erfasst_von" | "zeitpunkt" | "vorgaengerkontext";
  "ki_vorschlaege": "vorhaben" | "modell" | "art" | "inhalt" | "begruendung" | "status" | "arbeitskontext" | "betroffene_regel";
  "freigaben": "entscheider" | "regelpruefung" | "entscheidung" | "begruendung" | "entscheidungszeitpunkt" | "wirksam_ab" | "vorschlag" | "angewendete_regel";
  "taetigkeiten": "vorhaben" | "beschreibung" | "ausfuehrender" | "zeitpunkt" | "aenderungen" | "ergebnis" | "beobachtete_wirkung" | "freigabe";
  "erfahrungen": "taetigkeit" | "titel" | "vorhaben" | "beschreibung" | "kategorie" | "wirkung" | "wiederverwendbar" | "erfasst_von";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
