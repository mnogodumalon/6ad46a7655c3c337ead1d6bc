/**
 * useArbeitskontextErfassenFlow — the plumbing of the flow « Arbeitskontext erfassen », generated from the plan.
 *
 * Writes `arbeitskontexte`: asks `vorhaben`, `vorgaengerkontext`, `aktueller_zustand`, `verwendete_informationen`, `annahmen`, `erfasst_von`; sets `gueltigkeitsstatus`, `zeitpunkt` itself.
Changes `arbeitskontexte` (only when the person fills it): the record to change is picked (`flow.pick('arbeitskontexte2')`), the form is prefilled with its values; ; sets `gueltigkeitsstatus` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 6)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *   compute   REQUIRED — the plan says these values are computed in the flow
 *             but leaves the rule to you: `versionsnummer` (derived:computed:Versionsnummer des Vorgängerkontexts plus 1, beim ersten Kontext 1) *
 *   const flow = useArbeitskontextErfassenFlow({
 *     steps: { arbeitskontexte2: 1, vorhaben: 2, vorgaengerkontext: 3, erfasst_von: 4, aktueller_zustand: 5, verwendete_informationen: 5, annahmen: 5 },
 *     items: { vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *     compute: { versionsnummer: forms => null },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} />
 *     <EntitySelectStep {...flow.picks.vorgaengerkontext.select} {...flow.pick('vorgaengerkontext')} />
 *     <EntitySelectStep {...flow.picks.erfasst_von.select} {...flow.pick('erfasst_von')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.arbeitskontexte2.select} {...flow.pick('arbeitskontexte2')} />
 *     <Bound form={flow.forms.arbeitskontexte} name="aktueller_zustand" />
 *     <Bound form={flow.forms.arbeitskontexte} name="verwendete_informationen" />
 *     <Bound form={flow.forms.arbeitskontexte} name="annahmen" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type ArbeitskontextErfassenFieldKey = 'aktueller_zustand' | 'annahmen' | 'arbeitskontexte2' | 'erfasst_von' | 'verwendete_informationen' | 'vorgaengerkontext' | 'vorhaben';

export interface ArbeitskontextErfassenForms {
  arbeitskontexte: StepForm<'arbeitskontexte'>;
  arbeitskontexte2: StepForm<'arbeitskontexte'>;
}

// Alias so the option generics stay readable.
type Key = ArbeitskontextErfassenFieldKey;

export interface ArbeitskontextErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorhaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    vorgaengerkontext?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    erfasst_von?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    arbeitskontexte2?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
  /** The plan computes these in the flow but leaves the rule to the page. */
  compute: {
    versionsnummer: (forms: ArbeitskontextErfassenForms) => unknown;   // derived:computed:Versionsnummer des Vorgängerkontexts plus 1, beim ersten Kontext 1
  };
}

const DEFAULT_STEPS: Record<string, number> = {"aktueller_zustand": 5, "annahmen": 5, "arbeitskontexte2": 1, "erfasst_von": 4, "verwendete_informationen": 5, "vorgaengerkontext": 3, "vorhaben": 2};
export const ARBEITSKONTEXTERFASSEN_REVIEW_STEP = 6;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useArbeitskontextErfassenFlow(options: ArbeitskontextErfassenFlowOptions) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [arbeitskontexte2TargetId, setArbeitskontexte2TargetId] = useState<string | null>(null);
  const arbeitskontexte = useStepForm('arbeitskontexte', {
    fields: ["vorhaben", "vorgaengerkontext", "aktueller_zustand", "verwendete_informationen", "annahmen", "erfasst_von"],
    steps: only(steps, ["vorhaben", "vorgaengerkontext", "aktueller_zustand", "verwendete_informationen", "annahmen", "erfasst_von"]) as Record<string, number>,
    // the plan builds a value from these — required here, whatever the app's base view says
    required: { vorgaengerkontext: true, vorhaben: true },
    initial: only(options.initial as FormValues | undefined, ["vorhaben", "vorgaengerkontext", "aktueller_zustand", "verwendete_informationen", "annahmen", "erfasst_von"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorhaben", "vorgaengerkontext", "aktueller_zustand", "verwendete_informationen", "annahmen", "erfasst_von"]),
  });
  const arbeitskontexte2 = useStepForm('arbeitskontexte', {
    fields: [],
    steps: only(steps, []) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, []),
    messages: only(options.messages as Record<string, string> | undefined, []),
  });
  const forms: ArbeitskontextErfassenForms = { arbeitskontexte, arbeitskontexte2 };
  const formList: StepForm[] = [arbeitskontexte, arbeitskontexte2];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorhaben: useRecordSearch(servicePort, 'vorhaben', withPickPolicy('vorhaben', {
      searchFields: ["titel"] as never,
      filter: "r.v_status in ['geplant', 'in_bearbeitung']",
      where: (r: JourneyRecord) => ["geplant", "in_bearbeitung"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.vorhaben as never,
    })),
    vorgaengerkontext: useRecordSearch(servicePort, 'arbeitskontexte', withPickPolicy('vorgaengerkontext', {
      searchFields: ["aktueller_zustand"] as never,
      filter: "r.v_gueltigkeitsstatus == 'aktuell_gueltig'",
      where: (r: JourneyRecord) => (fieldLookup(r, "gueltigkeitsstatus")?.key ?? null) === "aktuell_gueltig",
      toItem: options.items?.vorgaengerkontext as never,
    })),
    erfasst_von: useRecordSearch(servicePort, 'nutzer', withPickPolicy('erfasst_von', {
      searchFields: ["vorname", "nachname"] as never,
      toItem: options.items?.erfasst_von as never,
    })),
    arbeitskontexte2: useRecordSearch(servicePort, 'arbeitskontexte', withPickPolicy('arbeitskontexte2', {
      searchFields: ["aktueller_zustand"] as never,
      filter: "r.v_gueltigkeitsstatus == 'aktuell_gueltig'",
      where: (r: JourneyRecord) => (fieldLookup(r, "gueltigkeitsstatus")?.key ?? null) === "aktuell_gueltig",
      toItem: options.items?.arbeitskontexte2 as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:arbeitskontext-erfassen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:arbeitskontext-erfassen:write:${entity}.${field}`,
  });
  const picks = {
    vorhaben: { ...searches.vorhaben, select: { ...searches.vorhaben.select, create: true as boolean, hint: hintFor('vorhaben', 'vorhaben', {"conditions": [{"field": "status", "op": "in", "value": ["geplant", "in_bearbeitung"]}], "mode": "all"} as PickWhere | null) } },
    vorgaengerkontext: { ...searches.vorgaengerkontext, select: { ...searches.vorgaengerkontext.select, create: false as boolean, hint: hintFor('vorgaengerkontext', 'arbeitskontexte', {"conditions": [{"field": "gueltigkeitsstatus", "op": "eq", "value": "aktuell_gueltig"}], "mode": "all"} as PickWhere | null) } },
    erfasst_von: { ...searches.erfasst_von, select: { ...searches.erfasst_von.select, create: false as boolean, hint: hintFor('erfasst_von', 'nutzer', null as PickWhere | null) } },
    arbeitskontexte2: { ...searches.arbeitskontexte2, select: { ...searches.arbeitskontexte2.select, create: false as boolean, hint: hintFor('arbeitskontexte2', 'arbeitskontexte', {"conditions": [{"field": "gueltigkeitsstatus", "op": "eq", "value": "aktuell_gueltig"}], "mode": "all"} as PickWhere | null) } },
  };

  const arbeitskontexte2Filled = hasValues(arbeitskontexte2);
  const plan: PlanStep[] = [
    {
      key: 'arbeitskontexte', entity: 'arbeitskontexte', form: arbeitskontexte, primary: true,
      values: (): FormValues => ({
        gueltigkeitsstatus: policyFixedValue('arbeitskontexte', 'gueltigkeitsstatus') ?? "aktuell_gueltig",
        zeitpunkt: policyFixedValue('arbeitskontexte', 'zeitpunkt') ?? nowIso(),
        versionsnummer: options.compute.versionsnummer(forms),
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('arbeitskontexte', 'gueltigkeitsstatus', policyFixedValue('arbeitskontexte', 'gueltigkeitsstatus') ?? "aktuell_gueltig")],

      // the planner's assumptions that first act here — shown once with „Passt“ / „ändern“
      notices: () => [{"assumed": "je Vorhaben ab 1", "id": "versionsnummer-format", "question": "Wie wird die Versionsnummer gez\u00e4hlt?"}],
    },
    ...(arbeitskontexte2Filled ? [{
      key: 'arbeitskontexte2', entity: 'arbeitskontexte', form: arbeitskontexte2,
      updates: () => arbeitskontexte2TargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => arbeitskontexte2TargetId
        ? { key: 'target:arbeitskontexte2', label: entityLabel('arbeitskontexte'), value: picks.arbeitskontexte2.labelOf(arbeitskontexte2TargetId) ?? arbeitskontexte2TargetId, step: steps.arbeitskontexte2 }
        : undefined,
      values: (): FormValues => ({
        gueltigkeitsstatus: policyFixedValue('arbeitskontexte', 'gueltigkeitsstatus') ?? "ueberholt",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('arbeitskontexte', 'gueltigkeitsstatus', policyFixedValue('arbeitskontexte', 'gueltigkeitsstatus') ?? "ueberholt")],
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'arbeitskontext-erfassen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    arbeitskontexte2: {
      selectedId: arbeitskontexte2TargetId,
      onSelect: (id: string) => {
        setArbeitskontexte2TargetId(id);
        const rec = picks.arbeitskontexte2.recordOf(id);
        if (rec) arbeitskontexte2.reset({ });
      },
      get record(): JourneyRecord | undefined { return arbeitskontexte2TargetId ? picks.arbeitskontexte2.recordOf(arbeitskontexte2TargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: ArbeitskontextErfassenFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: ArbeitskontextErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setArbeitskontexte2TargetId(null); };

  return {
    slug: 'arbeitskontext-erfassen' as const,
    draftKey: 'arbeitskontext-erfassen' as const,
    entity: 'arbeitskontexte' as const,
    form: arbeitskontexte,
    forms, formList, picks, submit, steps, targets,    reviewStep: ARBEITSKONTEXTERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type ArbeitskontextErfassenFlow = ReturnType<typeof useArbeitskontextErfassenFlow>;
