/**
 * useRegelAendernFlow — the plumbing of the flow « Regel ändern », generated from the plan.
 *
 * Writes `regeln`: asks `vorgaengerregel`, `bezeichnung`, `beschreibung`, `bedingung`, `wirkung`, `erforderliche_stufe`, `verantwortlicher`, `regeltyp`; sets `status` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 4)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useRegelAendernFlow({
 *     steps: { vorgaengerregel: 1, verantwortlicher: 2, bezeichnung: 3, beschreibung: 3, bedingung: 3, wirkung: 3, erforderliche_stufe: 3, regeltyp: 3 },
 *     items: { vorgaengerregel: r => ({ id: r.id, title: fieldText(r, 'bezeichnung') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorgaengerregel.select} {...flow.pick('vorgaengerregel')} />
 *     <EntitySelectStep {...flow.picks.verantwortlicher.select} {...flow.pick('verantwortlicher')} />
 *     <Bound form={flow.forms.regeln} name="bezeichnung" />
 *     <Bound form={flow.forms.regeln} name="beschreibung" />
 *     <Bound form={flow.forms.regeln} name="bedingung" />
 *     <Bound form={flow.forms.regeln} name="wirkung" />
 *     <Bound form={flow.forms.regeln} name="erforderliche_stufe" />
 *     <Bound form={flow.forms.regeln} name="regeltyp" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type RegelAendernFieldKey = 'bedingung' | 'beschreibung' | 'bezeichnung' | 'erforderliche_stufe' | 'regeltyp' | 'verantwortlicher' | 'vorgaengerregel' | 'wirkung';

export interface RegelAendernForms {
  regeln: StepForm<'regeln'>;
}

// Alias so the option generics stay readable.
type Key = RegelAendernFieldKey;

export interface RegelAendernFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorgaengerregel?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    verantwortlicher?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"bedingung": 3, "beschreibung": 3, "bezeichnung": 3, "erforderliche_stufe": 3, "regeltyp": 3, "verantwortlicher": 2, "vorgaengerregel": 1, "wirkung": 3};
export const REGELAENDERN_REVIEW_STEP = 4;

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

export function useRegelAendernFlow(options: RegelAendernFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const regeln = useStepForm('regeln', {
    fields: ["vorgaengerregel", "bezeichnung", "beschreibung", "bedingung", "wirkung", "erforderliche_stufe", "verantwortlicher", "regeltyp"],
    steps: only(steps, ["vorgaengerregel", "bezeichnung", "beschreibung", "bedingung", "wirkung", "erforderliche_stufe", "verantwortlicher", "regeltyp"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorgaengerregel", "bezeichnung", "beschreibung", "bedingung", "wirkung", "erforderliche_stufe", "verantwortlicher", "regeltyp"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorgaengerregel", "bezeichnung", "beschreibung", "bedingung", "wirkung", "erforderliche_stufe", "verantwortlicher", "regeltyp"]),
  });
  const forms: RegelAendernForms = { regeln };
  const formList: StepForm[] = [regeln];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorgaengerregel: useRecordSearch(servicePort, 'regeln', withPickPolicy('vorgaengerregel', {
      searchFields: ["bezeichnung", "bedingung", "wirkung"] as never,
      filter: "r.v_status == 'gueltig'",
      where: (r: JourneyRecord) => (fieldLookup(r, "status")?.key ?? null) === "gueltig",
      toItem: options.items?.vorgaengerregel as never,
    })),
    verantwortlicher: useRecordSearch(servicePort, 'nutzer', withPickPolicy('verantwortlicher', {
      searchFields: ["vorname", "nachname"] as never,
      toItem: options.items?.verantwortlicher as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:regel-aendern:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:regel-aendern:write:${entity}.${field}`,
  });
  const picks = {
    vorgaengerregel: { ...searches.vorgaengerregel, select: { ...searches.vorgaengerregel.select, create: false as boolean, hint: hintFor('vorgaengerregel', 'regeln', {"conditions": [{"field": "status", "op": "eq", "value": "gueltig"}], "mode": "all"} as PickWhere | null) } },
    verantwortlicher: { ...searches.verantwortlicher, select: { ...searches.verantwortlicher.select, create: false as boolean, hint: hintFor('verantwortlicher', 'nutzer', null as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'regeln', entity: 'regeln', form: regeln, primary: true,
      values: (): FormValues => ({
        status: policyFixedValue('regeln', 'status') ?? "entwurf",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('regeln', 'status', policyFixedValue('regeln', 'status') ?? "entwurf")],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'regel-aendern' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: RegelAendernFieldKey) => {
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
  const pickMany = (field: RegelAendernFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'regel-aendern' as const,
    draftKey: 'regel-aendern' as const,
    entity: 'regeln' as const,
    form: regeln,
    forms, formList, picks, submit, steps,    reviewStep: REGELAENDERN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type RegelAendernFlow = ReturnType<typeof useRegelAendernFlow>;
