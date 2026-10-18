// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "arbeitskontext-erfassen": [
    "Legt an: arbeitskontexte",
    "Ändert: arbeitskontexte",
    "Automatisch: versionsnummer (Versionsnummer des Vorgängerkontexts plus 1, beim ersten Kontext 1), gueltigkeitsstatus (fester Wert „aktuell_gueltig“), zeitpunkt (aktueller Zeitpunkt, automatisch), gueltigkeitsstatus (fester Wert „ueberholt“)"
  ],
  "ki-vorschlag-erfassen": [
    "Legt an: ki_vorschlaege",
    "Automatisch: status (fester Wert „vorgeschlagen“)"
  ],
  "vorschlag-entscheiden": [
    "Legt an: freigaben",
    "Ändert: ki_vorschlaege",
    "Automatisch: entscheidungszeitpunkt (aktueller Zeitpunkt, automatisch), status (Bei Entscheidung freigegeben Status geprüft, bei abgelehnt Status abgelehnt, bei zurück …)"
  ],
  "regel-aendern": [
    "Legt an: regeln",
    "Automatisch: status (fester Wert „entwurf“)"
  ],
  "taetigkeit-dokumentieren": [
    "Legt an: taetigkeiten",
    "Ändert: ki_vorschlaege",
    "Automatisch: zeitpunkt (aktueller Zeitpunkt, automatisch), status (fester Wert „ausgefuehrt“)"
  ],
  "erfahrung-festhalten": [
    "Legt an: erfahrungen"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung stellt KI im Unternehmen kontrolliert bereit. KI-Modelle machen Vorschläge (Ebene A). Explizite Regeln, Berechtigungen und Freigaben entscheiden, was wirksam wird (Ebene B). Arbeitskontexte, Tätigkeiten und Erfahrungen halten fest, was getan wurde und was daraus gelernt wurde (Ebene C).";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "arbeitskontext-erfassen": [
    "arbeitskontexte"
  ],
  "ki-vorschlag-erfassen": [
    "ki_vorschlaege"
  ],
  "vorschlag-entscheiden": [
    "freigaben",
    "ki_vorschlaege"
  ],
  "regel-aendern": [
    "regeln"
  ],
  "taetigkeit-dokumentieren": [
    "ki_vorschlaege",
    "taetigkeiten"
  ],
  "erfahrung-festhalten": [
    "erfahrungen"
  ]
};
