/**
 * Occupancy semantics — DECIDED BY THE BUILD AGENT, never by a heuristic.
 *
 * The Phase-2 orchestrator writes its decision to `.intents-staging/occupancy.json`
 * (stay pair, booked resource, statuses that do not occupy); the integration
 * step validates it against the app metadata and renders it into the block
 * below. Scaffold updates keep the block. Do not edit outside the markers.
 *
 * Both doors read this and nothing else: `occupancyFor` (internal flows AND
 * public pages) and the owner service (the public grant's occupancy read).
 * No rule for an entity = no availability calendar, no occupancy claim —
 * a plain date field pair is shown instead.
 *
 * Facts from the metadata — candidates, NOT decisions:
 *   - nutzer: lookups rolle[administrator|projektverantwortlicher|bearbeiter|entscheider|ausfuehrender], berechtigungsstufe[stufe_1|stufe_2|stufe_3|stufe_4]
 *   - ki_modelle: lookups zuverlaessigkeit[niedrig|mittel|hoch], status[in_erprobung|im_einsatz|gesperrt|abgeloest]
 *   - vorhaben: date pairs startdatum+enddatum · applookups verantwortlicher→nutzer · lookups status[geplant|in_bearbeitung|abgeschlossen|abgebrochen]
 *   - regeln: applookups verantwortlicher→nutzer, vorgaengerregel→regeln · lookups regeltyp[datenmodell|zustandsuebergang|geschaeftsregel|berechtigung|freigabe|abhaengigkeit|validierung|prozessbedingung], erforderliche_stufe[stufe_1|stufe_2|stufe_3|stufe_4], status[entwurf|gueltig|abgeloest|ausser_kraft]
 *   - arbeitskontexte: applookups vorhaben→vorhaben, erfasst_von→nutzer, vorgaengerkontext→arbeitskontexte · lookups gueltigkeitsstatus[aktuell_gueltig|ueberholt]
 *   - ki_vorschlaege: applookups vorhaben→vorhaben, modell→ki_modelle, arbeitskontext→arbeitskontexte, betroffene_regel→regeln · lookups art[hypothese|loesungsvorschlag|text|code|mustererkennung|entscheidungsvorbereitung|fehlersuche|regelaenderung], status[vorgeschlagen|geprueft|abgelehnt|ausgefuehrt]
 *   - freigaben: applookups entscheider→nutzer, vorschlag→ki_vorschlaege, angewendete_regel→regeln · lookups regelpruefung[erfuellt|nicht_erfuellt|berechtigung_fehlt], entscheidung[freigegeben|abgelehnt|zurueckgestellt]
 *   - taetigkeiten: applookups vorhaben→vorhaben, ausfuehrender→nutzer, freigabe→freigaben
 *   - erfahrungen: applookups taetigkeit→taetigkeiten, vorhaben→vorhaben, erfasst_von→nutzer · lookups kategorie[prozess|technik|ki_einsatz|regeln_freigaben|zusammenarbeit], wirkung[positiv|neutral|negativ]
 */
import type { EntityKey } from '@/lib/journey/rules';

export interface OccupancyRule {
  /** Arrival / departure fields (the departure day is exclusive). */
  from: string;
  to: string;
  /** applookup field naming the booked RESOURCE (room, vehicle, court).
   *  Omit when the entity itself is the one resource (a single holiday flat). */
  resource?: string;
  /** lookup field + the keys that mean "does NOT occupy" (cancelled, no-show). */
  statusField?: string;
  freeKeys?: string[];
}

export const OCCUPANCY: Partial<Record<EntityKey, OccupancyRule>> = {
  // <custom:occupancy>
  // </custom:occupancy>
};

/**
 * A record of the KEY entity is TAKEN while a record of `entity` points at it
 * through `field` — a slot with a booking, a seat with a ticket. Generated
 * from the plan's blocking `unique` check on that reference (05.10.2026:
 * the salon's public page offered booked slots again). Pickers on both
 * doors leave taken records out (useRecordSearch); a public page reads only
 * `field` of `entity` — never who booked. Generator-owned: no markers.
 */
export interface TakenRule {
  entity: EntityKey;
  field: string;
}

export const TAKEN_BY: Partial<Record<EntityKey, TakenRule>> = {
};
