// Auto-generated. Per-entity form-enhancements config for "Arbeitskontexte".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorhaben", {"row": ["versionsnummer", "gueltigkeitsstatus"], "cols": "1fr 1fr"}, {"row": ["erfasst_von", "zeitpunkt"], "cols": "1fr 1fr"}, "vorgaengerkontext", "aktueller_zustand", "verwendete_informationen", "annahmen"],
  defaults: {
    'zeitpunkt': { kind: 'today', withTime: true },
    'gueltigkeitsstatus': { kind: 'lookup', key: 'aktuell_gueltig', label: 'Aktuell gültig' },
  },
  computed: {
    'versionsnummer': { op: 'add', left: { kind: 'applookup', ownKey: 'vorgaengerkontext', lookupKey: 'versionsnummer' }, right: { kind: 'literal', value: 1 } },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
