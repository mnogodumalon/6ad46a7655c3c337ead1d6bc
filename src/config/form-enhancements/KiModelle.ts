// Auto-generated. Per-entity form-enhancements config for "KI-Modelle".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["bezeichnung", "status", {"row": ["anbieter", "version"], "cols": "2fr 1fr"}, "zuverlaessigkeit", "einsatzzweck", "faehigkeiten_einschraenkungen"],
  defaults: {
    'status': { kind: 'lookup', key: 'in_erprobung', label: 'In Erprobung' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
