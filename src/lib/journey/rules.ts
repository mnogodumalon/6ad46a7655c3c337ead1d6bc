/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'nutzer' | 'ki_modelle' | 'vorhaben' | 'regeln' | 'arbeitskontexte' | 'ki_vorschlaege' | 'freigaben' | 'taetigkeiten' | 'erfahrungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "nutzer": "vorname" | "nachname" | "email";
  "ki_modelle": "bezeichnung" | "anbieter" | "version" | "einsatzzweck" | "faehigkeiten_einschraenkungen";
  "vorhaben": "titel" | "ausgangssituation" | "ziel" | "kontext";
  "regeln": "bezeichnung" | "beschreibung" | "bedingung" | "wirkung";
  "arbeitskontexte": "aktueller_zustand" | "verwendete_informationen" | "annahmen";
  "ki_vorschlaege": "inhalt" | "begruendung";
  "freigaben": "begruendung";
  "taetigkeiten": "beschreibung" | "aenderungen" | "ergebnis" | "beobachtete_wirkung";
  "erfahrungen": "titel" | "beschreibung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "nutzer": never;
  "ki_modelle": never;
  "vorhaben": "verantwortlicher";
  "regeln": "verantwortlicher" | "vorgaengerregel";
  "arbeitskontexte": "vorhaben" | "erfasst_von" | "vorgaengerkontext";
  "ki_vorschlaege": "vorhaben" | "modell" | "arbeitskontext" | "betroffene_regel";
  "freigaben": "entscheider" | "vorschlag" | "angewendete_regel";
  "taetigkeiten": "vorhaben" | "ausfuehrender" | "freigabe";
  "erfahrungen": "taetigkeit" | "vorhaben" | "erfasst_von";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "nutzer": {
    "key": "nutzer",
    "appId": "6ad46a36c850c7898a0a8333",
    "label": "Nutzer",
    "pascal": "Nutzer",
    "single": "NutzerEntry"
  },
  "ki_modelle": {
    "key": "ki_modelle",
    "appId": "6ad46a3d7361ef02a4331895",
    "label": "KI-Modelle",
    "pascal": "KiModelle",
    "single": "KiModelleEntry"
  },
  "vorhaben": {
    "key": "vorhaben",
    "appId": "6ad46a3f190edcba778818ee",
    "label": "Vorhaben",
    "pascal": "Vorhaben",
    "single": "VorhabenEntry"
  },
  "regeln": {
    "key": "regeln",
    "appId": "6ad46a40bd412c2559d0d8ea",
    "label": "Regeln",
    "pascal": "Regeln",
    "single": "RegelnEntry"
  },
  "arbeitskontexte": {
    "key": "arbeitskontexte",
    "appId": "6ad46a403c317a30877378d1",
    "label": "Arbeitskontexte",
    "pascal": "Arbeitskontexte",
    "single": "ArbeitskontexteEntry"
  },
  "ki_vorschlaege": {
    "key": "ki_vorschlaege",
    "appId": "6ad46a41829d6f541fbb980c",
    "label": "KI-Vorschläge",
    "pascal": "KiVorschlaege",
    "single": "KiVorschlaegeEntry"
  },
  "freigaben": {
    "key": "freigaben",
    "appId": "6ad46a420ae6547b6f4f38ab",
    "label": "Freigaben",
    "pascal": "Freigaben",
    "single": "FreigabenEntry"
  },
  "taetigkeiten": {
    "key": "taetigkeiten",
    "appId": "6ad46a425b823400977f1848",
    "label": "Tätigkeiten",
    "pascal": "Taetigkeiten",
    "single": "TaetigkeitenEntry"
  },
  "erfahrungen": {
    "key": "erfahrungen",
    "appId": "6ad46a43c3c4102bbc5aaff2",
    "label": "Erfahrungen",
    "pascal": "Erfahrungen",
    "single": "ErfahrungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "nutzer": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": true,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "rolle": {
      "key": "rolle",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Rolle",
      "writable": true,
      "options": [
        "administrator",
        "projektverantwortlicher",
        "bearbeiter",
        "entscheider",
        "ausfuehrender"
      ]
    },
    "berechtigungsstufe": {
      "key": "berechtigungsstufe",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Berechtigungsstufe",
      "writable": true,
      "options": [
        "stufe_1",
        "stufe_2",
        "stufe_3",
        "stufe_4"
      ]
    },
    "aktiv": {
      "key": "aktiv",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Aktiv",
      "writable": true
    }
  },
  "ki_modelle": {
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "anbieter": {
      "key": "anbieter",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Anbieter",
      "writable": true,
      "maxLength": 4000
    },
    "version": {
      "key": "version",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Version",
      "writable": true,
      "maxLength": 4000
    },
    "einsatzzweck": {
      "key": "einsatzzweck",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Einsatzzweck",
      "writable": true
    },
    "faehigkeiten_einschraenkungen": {
      "key": "faehigkeiten_einschraenkungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Fähigkeiten und bekannte Einschränkungen",
      "writable": true
    },
    "zuverlaessigkeit": {
      "key": "zuverlaessigkeit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Zuverlässigkeitseinschätzung",
      "writable": true,
      "options": [
        "niedrig",
        "mittel",
        "hoch"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "in_erprobung",
        "im_einsatz",
        "gesperrt",
        "abgeloest"
      ]
    }
  },
  "vorhaben": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "ausgangssituation": {
      "key": "ausgangssituation",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Ausgangssituation",
      "writable": true
    },
    "ziel": {
      "key": "ziel",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Ziel",
      "writable": true
    },
    "kontext": {
      "key": "kontext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Kontext",
      "writable": true
    },
    "verantwortlicher": {
      "key": "verantwortlicher",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Verantwortlicher",
      "writable": true,
      "targetAppId": "6ad46a36c850c7898a0a8333",
      "targetEntity": "nutzer"
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "geplant",
        "in_bearbeitung",
        "abgeschlossen",
        "abgebrochen"
      ]
    },
    "startdatum": {
      "key": "startdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Start",
      "writable": true
    },
    "enddatum": {
      "key": "enddatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Ende",
      "writable": true
    }
  },
  "regeln": {
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "regeltyp": {
      "key": "regeltyp",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Regeltyp",
      "writable": true,
      "options": [
        "datenmodell",
        "zustandsuebergang",
        "geschaeftsregel",
        "berechtigung",
        "freigabe",
        "abhaengigkeit",
        "validierung",
        "prozessbedingung"
      ]
    },
    "bedingung": {
      "key": "bedingung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bedingung",
      "writable": true
    },
    "wirkung": {
      "key": "wirkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Wirkung",
      "writable": true
    },
    "erforderliche_stufe": {
      "key": "erforderliche_stufe",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Erforderliche Berechtigungsstufe",
      "writable": true,
      "options": [
        "stufe_1",
        "stufe_2",
        "stufe_3",
        "stufe_4"
      ]
    },
    "gueltig_ab": {
      "key": "gueltig_ab",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gültig ab",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "entwurf",
        "gueltig",
        "abgeloest",
        "ausser_kraft"
      ]
    },
    "verantwortlicher": {
      "key": "verantwortlicher",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Verantwortlicher",
      "writable": true,
      "targetAppId": "6ad46a36c850c7898a0a8333",
      "targetEntity": "nutzer"
    },
    "vorgaengerregel": {
      "key": "vorgaengerregel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Vorgängerregel",
      "writable": true,
      "targetAppId": "6ad46a40bd412c2559d0d8ea",
      "targetEntity": "regeln"
    }
  },
  "arbeitskontexte": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad46a3f190edcba778818ee",
      "targetEntity": "vorhaben"
    },
    "versionsnummer": {
      "key": "versionsnummer",
      "fulltype": "number",
      "kind": "number",
      "required": true,
      "label": "Versionsnummer",
      "writable": true
    },
    "aktueller_zustand": {
      "key": "aktueller_zustand",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Aktueller Zustand",
      "writable": true
    },
    "verwendete_informationen": {
      "key": "verwendete_informationen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verwendete Informationen",
      "writable": true
    },
    "annahmen": {
      "key": "annahmen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Annahmen",
      "writable": true
    },
    "gueltigkeitsstatus": {
      "key": "gueltigkeitsstatus",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Gültigkeitsstatus",
      "writable": true,
      "options": [
        "aktuell_gueltig",
        "ueberholt"
      ]
    },
    "erfasst_von": {
      "key": "erfasst_von",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Erfasst von",
      "writable": true,
      "targetAppId": "6ad46a36c850c7898a0a8333",
      "targetEntity": "nutzer"
    },
    "zeitpunkt": {
      "key": "zeitpunkt",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Zeitpunkt",
      "writable": true
    },
    "vorgaengerkontext": {
      "key": "vorgaengerkontext",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Vorgängerkontext",
      "writable": true,
      "targetAppId": "6ad46a403c317a30877378d1",
      "targetEntity": "arbeitskontexte"
    }
  },
  "ki_vorschlaege": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad46a3f190edcba778818ee",
      "targetEntity": "vorhaben"
    },
    "modell": {
      "key": "modell",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "KI-Modell",
      "writable": true,
      "targetAppId": "6ad46a3d7361ef02a4331895",
      "targetEntity": "ki_modelle"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Art des Vorschlags",
      "writable": true,
      "options": [
        "hypothese",
        "loesungsvorschlag",
        "text",
        "code",
        "mustererkennung",
        "entscheidungsvorbereitung",
        "fehlersuche",
        "regelaenderung"
      ]
    },
    "inhalt": {
      "key": "inhalt",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Inhalt",
      "writable": true
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "vorgeschlagen",
        "geprueft",
        "abgelehnt",
        "ausgefuehrt"
      ]
    },
    "arbeitskontext": {
      "key": "arbeitskontext",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Arbeitskontext",
      "writable": true,
      "targetAppId": "6ad46a403c317a30877378d1",
      "targetEntity": "arbeitskontexte"
    },
    "betroffene_regel": {
      "key": "betroffene_regel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Betroffene Regel",
      "writable": true,
      "targetAppId": "6ad46a40bd412c2559d0d8ea",
      "targetEntity": "regeln"
    }
  },
  "freigaben": {
    "entscheider": {
      "key": "entscheider",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Entscheider",
      "writable": true,
      "targetAppId": "6ad46a36c850c7898a0a8333",
      "targetEntity": "nutzer"
    },
    "regelpruefung": {
      "key": "regelpruefung",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Ergebnis der Regelprüfung",
      "writable": true,
      "options": [
        "erfuellt",
        "nicht_erfuellt",
        "berechtigung_fehlt"
      ]
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Entscheidung",
      "writable": true,
      "options": [
        "freigegeben",
        "abgelehnt",
        "zurueckgestellt"
      ]
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "entscheidungszeitpunkt": {
      "key": "entscheidungszeitpunkt",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Zeitpunkt der Entscheidung",
      "writable": true
    },
    "wirksam_ab": {
      "key": "wirksam_ab",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": false,
      "label": "Wirksam ab",
      "writable": true
    },
    "vorschlag": {
      "key": "vorschlag",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorschlag",
      "writable": true,
      "targetAppId": "6ad46a41829d6f541fbb980c",
      "targetEntity": "ki_vorschlaege"
    },
    "angewendete_regel": {
      "key": "angewendete_regel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Angewendete Regel",
      "writable": true,
      "targetAppId": "6ad46a40bd412c2559d0d8ea",
      "targetEntity": "regeln"
    }
  },
  "taetigkeiten": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad46a3f190edcba778818ee",
      "targetEntity": "vorhaben"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Beschreibung",
      "writable": true
    },
    "ausfuehrender": {
      "key": "ausfuehrender",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Ausführender",
      "writable": true,
      "targetAppId": "6ad46a36c850c7898a0a8333",
      "targetEntity": "nutzer"
    },
    "zeitpunkt": {
      "key": "zeitpunkt",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Zeitpunkt der Ausführung",
      "writable": true
    },
    "aenderungen": {
      "key": "aenderungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Änderungen",
      "writable": true
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ergebnis",
      "writable": true
    },
    "beobachtete_wirkung": {
      "key": "beobachtete_wirkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beobachtete Wirkung",
      "writable": true
    },
    "freigabe": {
      "key": "freigabe",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Freigabe",
      "writable": true,
      "targetAppId": "6ad46a420ae6547b6f4f38ab",
      "targetEntity": "freigaben"
    }
  },
  "erfahrungen": {
    "taetigkeit": {
      "key": "taetigkeit",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Tätigkeit",
      "writable": true,
      "targetAppId": "6ad46a425b823400977f1848",
      "targetEntity": "taetigkeiten"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad46a3f190edcba778818ee",
      "targetEntity": "vorhaben"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Beschreibung",
      "writable": true
    },
    "kategorie": {
      "key": "kategorie",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Kategorie",
      "writable": true,
      "options": [
        "prozess",
        "technik",
        "ki_einsatz",
        "regeln_freigaben",
        "zusammenarbeit"
      ]
    },
    "wirkung": {
      "key": "wirkung",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Wirkung",
      "writable": true,
      "options": [
        "positiv",
        "neutral",
        "negativ"
      ]
    },
    "wiederverwendbar": {
      "key": "wiederverwendbar",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Wiederverwendbar",
      "writable": true
    },
    "erfasst_von": {
      "key": "erfasst_von",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Erfasst von",
      "writable": true,
      "targetAppId": "6ad46a36c850c7898a0a8333",
      "targetEntity": "nutzer"
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "nutzer": [
    {
      "kind": "choice",
      "field": "rolle",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "berechtigungsstufe",
      "count": 4
    }
  ],
  "ki_modelle": [
    {
      "kind": "choice",
      "field": "zuverlaessigkeit",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    }
  ],
  "vorhaben": [
    {
      "kind": "range",
      "from": "startdatum",
      "to": "enddatum"
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "verantwortlicher",
      "targetEntity": "nutzer"
    }
  ],
  "regeln": [
    {
      "kind": "choice",
      "field": "erforderliche_stufe",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "verantwortlicher",
      "targetEntity": "nutzer"
    },
    {
      "kind": "record",
      "field": "vorgaengerregel",
      "targetEntity": "regeln"
    }
  ],
  "arbeitskontexte": [
    {
      "kind": "choice",
      "field": "gueltigkeitsstatus",
      "count": 2
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "erfasst_von",
      "targetEntity": "nutzer"
    },
    {
      "kind": "record",
      "field": "vorgaengerkontext",
      "targetEntity": "arbeitskontexte"
    }
  ],
  "ki_vorschlaege": [
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "modell",
      "targetEntity": "ki_modelle"
    },
    {
      "kind": "record",
      "field": "arbeitskontext",
      "targetEntity": "arbeitskontexte"
    },
    {
      "kind": "record",
      "field": "betroffene_regel",
      "targetEntity": "regeln"
    }
  ],
  "freigaben": [
    {
      "kind": "choice",
      "field": "regelpruefung",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "entscheidung",
      "count": 3
    },
    {
      "kind": "record",
      "field": "entscheider",
      "targetEntity": "nutzer"
    },
    {
      "kind": "record",
      "field": "vorschlag",
      "targetEntity": "ki_vorschlaege"
    },
    {
      "kind": "record",
      "field": "angewendete_regel",
      "targetEntity": "regeln"
    }
  ],
  "taetigkeiten": [
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "ausfuehrender",
      "targetEntity": "nutzer"
    },
    {
      "kind": "record",
      "field": "freigabe",
      "targetEntity": "freigaben"
    }
  ],
  "erfahrungen": [
    {
      "kind": "choice",
      "field": "kategorie",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "wirkung",
      "count": 3
    },
    {
      "kind": "record",
      "field": "taetigkeit",
      "targetEntity": "taetigkeiten"
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "erfasst_von",
      "targetEntity": "nutzer"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "nutzer": [
    "vorname",
    "nachname"
  ],
  "ki_modelle": [
    "bezeichnung"
  ],
  "vorhaben": [
    "titel"
  ],
  "regeln": [
    "bezeichnung"
  ],
  "arbeitskontexte": [
    "aktueller_zustand"
  ],
  "ki_vorschlaege": [
    "inhalt"
  ],
  "freigaben": [
    "begruendung"
  ],
  "taetigkeiten": [
    "beschreibung"
  ],
  "erfahrungen": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
