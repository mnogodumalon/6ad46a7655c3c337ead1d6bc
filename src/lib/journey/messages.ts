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
  nutzer: { vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben.", email: "Bitte die E-Mail-Adresse eingeben.", rolle: "Bitte eine Rolle wählen.", berechtigungsstufe: "Bitte eine Berechtigungsstufe wählen." },
  ki_modelle: { bezeichnung: "Bitte die Bezeichnung des Modells eingeben.", status: "Bitte den Status des Modells wählen." },
  vorhaben: { titel: "Bitte einen Titel eingeben.", ausgangssituation: "Bitte die Ausgangssituation beschreiben.", ziel: "Bitte das Ziel beschreiben.", verantwortlicher: "Bitte einen Verantwortlichen wählen.", status: "Bitte den Status des Vorhabens wählen." },
  regeln: { bezeichnung: "Bitte eine Bezeichnung eingeben.", regeltyp: "Bitte einen Regeltyp wählen.", erforderliche_stufe: "Bitte die erforderliche Stufe wählen.", status: "Bitte den Status der Regel wählen." },
  arbeitskontexte: { vorhaben: "Bitte ein Vorhaben wählen.", versionsnummer: "Bitte die Versionsnummer eingeben.", aktueller_zustand: "Bitte den aktuellen Zustand beschreiben.", gueltigkeitsstatus: "Bitte die Gültigkeit wählen.", erfasst_von: "Bitte den Erfasser wählen.", zeitpunkt: "Bitte den Zeitpunkt wählen." },
  ki_vorschlaege: { vorhaben: "Bitte ein Vorhaben wählen.", modell: "Bitte ein KI-Modell wählen.", art: "Bitte die Art des Vorschlags wählen.", inhalt: "Bitte den Inhalt des Vorschlags eingeben.", status: "Bitte den Status des Vorschlags wählen.", arbeitskontext: "Bitte einen Arbeitskontext wählen." },
  freigaben: { entscheider: "Bitte einen Entscheider wählen.", regelpruefung: "Bitte das Ergebnis der Regelprüfung wählen.", entscheidung: "Bitte die Entscheidung wählen.", entscheidungszeitpunkt: "Bitte den Zeitpunkt der Entscheidung wählen.", vorschlag: "Bitte einen Vorschlag wählen.", angewendete_regel: "Bitte die angewendete Regel wählen." },
  taetigkeiten: { vorhaben: "Bitte ein Vorhaben wählen.", beschreibung: "Bitte die Tätigkeit beschreiben.", ausfuehrender: "Bitte den Ausführenden wählen.", zeitpunkt: "Bitte den Zeitpunkt der Ausführung wählen." },
  erfahrungen: { titel: "Bitte einen Titel eingeben.", beschreibung: "Bitte die Erfahrung beschreiben.", erfasst_von: "Bitte den Erfasser wählen." },
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
