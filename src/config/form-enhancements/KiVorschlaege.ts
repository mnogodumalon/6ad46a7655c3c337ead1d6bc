// Auto-generated. Per-entity form-enhancements config for "KI-Vorschläge".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["vorhaben", "modell"], "cols": "1fr 1fr"}, {"row": ["art", "status"], "cols": "1fr 1fr"}, "arbeitskontext", "betroffene_regel", "inhalt", "begruendung"],
  defaults: {
    'status': { kind: 'lookup', key: 'vorgeschlagen', label: 'Vorgeschlagen' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
