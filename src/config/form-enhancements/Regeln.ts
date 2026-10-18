// Auto-generated. Per-entity form-enhancements config for "Regeln".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["bezeichnung", {"row": ["regeltyp", "status"], "cols": "1fr 1fr"}, "erforderliche_stufe", {"row": ["gueltig_ab", "verantwortlicher"], "cols": "1fr 1fr"}, "vorgaengerregel", "beschreibung", "bedingung", "wirkung"],
  defaults: {
    'status': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
    'gueltig_ab': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
