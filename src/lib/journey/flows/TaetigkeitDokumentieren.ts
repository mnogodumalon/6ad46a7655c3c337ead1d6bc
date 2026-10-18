/**
 * useTaetigkeitDokumentierenFlow — the plumbing of the flow « Tätigkeit dokumentieren », generated from the plan.
 *
 * Writes `taetigkeiten`: asks `vorhaben`, `freigabe`, `ausfuehrender`, `beschreibung`, `aenderungen`, `ergebnis`, `beobachtete_wirkung`; sets `zeitpunkt` itself.
Changes `ki_vorschlaege` (only when the person fills it): the record to change is picked (`flow.pick('ki_vorschlaege')`), the form is prefilled with its values; ; sets `status` itself.
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
 *
 *   const flow = useTaetigkeitDokumentierenFlow({
 *     steps: { ki_vorschlaege: 1, vorhaben: 2, freigabe: 3, ausfuehrender: 4, beschreibung: 5, aenderungen: 5, ergebnis: 5, beobachtete_wirkung: 5 },
 *     items: { vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} />
 *     <EntitySelectStep {...flow.picks.freigabe.select} {...flow.pick('freigabe')} />
 *     <EntitySelectStep {...flow.picks.ausfuehrender.select} {...flow.pick('ausfuehrender')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.ki_vorschlaege.select} {...flow.pick('ki_vorschlaege')} />
 *     <Bound form={flow.forms.taetigkeiten} name="beschreibung" />
 *     <Bound form={flow.forms.taetigkeiten} name="aenderungen" />
 *     <Bound form={flow.forms.taetigkeiten} name="ergebnis" />
 *     <Bound form={flow.forms.taetigkeiten} name="beobachtete_wirkung" />
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
export type TaetigkeitDokumentierenFieldKey = 'aenderungen' | 'ausfuehrender' | 'beobachtete_wirkung' | 'beschreibung' | 'ergebnis' | 'freigabe' | 'ki_vorschlaege' | 'vorhaben';

export interface TaetigkeitDokumentierenForms {
  taetigkeiten: StepForm<'taetigkeiten'>;
  ki_vorschlaege: StepForm<'ki_vorschlaege'>;
}

// Alias so the option generics stay readable.
type Key = TaetigkeitDokumentierenFieldKey;

export interface TaetigkeitDokumentierenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorhaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    freigabe?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    ausfuehrender?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    ki_vorschlaege?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"aenderungen": 5, "ausfuehrender": 4, "beobachtete_wirkung": 5, "beschreibung": 5, "ergebnis": 5, "freigabe": 3, "ki_vorschlaege": 1, "vorhaben": 2};
export const TAETIGKEITDOKUMENTIEREN_REVIEW_STEP = 6;

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

export function useTaetigkeitDokumentierenFlow(options: TaetigkeitDokumentierenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [ki_vorschlaegeTargetId, setKiVorschlaegeTargetId] = useState<string | null>(null);
  const taetigkeiten = useStepForm('taetigkeiten', {
    fields: ["vorhaben", "freigabe", "ausfuehrender", "beschreibung", "aenderungen", "ergebnis", "beobachtete_wirkung"],
    steps: only(steps, ["vorhaben", "freigabe", "ausfuehrender", "beschreibung", "aenderungen", "ergebnis", "beobachtete_wirkung"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorhaben", "freigabe", "ausfuehrender", "beschreibung", "aenderungen", "ergebnis", "beobachtete_wirkung"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorhaben", "freigabe", "ausfuehrender", "beschreibung", "aenderungen", "ergebnis", "beobachtete_wirkung"]),
  });
  const ki_vorschlaege = useStepForm('ki_vorschlaege', {
    fields: [],
    steps: only(steps, []) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, []),
    messages: only(options.messages as Record<string, string> | undefined, []),
  });
  const forms: TaetigkeitDokumentierenForms = { taetigkeiten, ki_vorschlaege };
  const formList: StepForm[] = [taetigkeiten, ki_vorschlaege];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorhaben: useRecordSearch(servicePort, 'vorhaben', withPickPolicy('vorhaben', {
      searchFields: ["titel"] as never,
      filter: "r.v_status == 'in_bearbeitung'",
      where: (r: JourneyRecord) => (fieldLookup(r, "status")?.key ?? null) === "in_bearbeitung",
      toItem: options.items?.vorhaben as never,
    })),
    freigabe: useRecordSearch(servicePort, 'freigaben', withPickPolicy('freigabe', {
      searchFields: ["begruendung"] as never,
      filter: "r.v_entscheidung == 'freigegeben'",
      where: (r: JourneyRecord) => (fieldLookup(r, "entscheidung")?.key ?? null) === "freigegeben",
      toItem: options.items?.freigabe as never,
    })),
    ausfuehrender: useRecordSearch(servicePort, 'nutzer', withPickPolicy('ausfuehrender', {
      searchFields: ["vorname", "nachname"] as never,
      toItem: options.items?.ausfuehrender as never,
    })),
    ki_vorschlaege: useRecordSearch(servicePort, 'ki_vorschlaege', withPickPolicy('ki_vorschlaege', {
      searchFields: ["inhalt"] as never,
      toItem: options.items?.ki_vorschlaege as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:taetigkeit-dokumentieren:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:taetigkeit-dokumentieren:write:${entity}.${field}`,
  });
  const picks = {
    vorhaben: { ...searches.vorhaben, select: { ...searches.vorhaben.select, create: true as boolean, hint: hintFor('vorhaben', 'vorhaben', {"conditions": [{"field": "status", "op": "eq", "value": "in_bearbeitung"}], "mode": "all"} as PickWhere | null) } },
    freigabe: { ...searches.freigabe, select: { ...searches.freigabe.select, create: false as boolean, hint: hintFor('freigabe', 'freigaben', {"conditions": [{"field": "entscheidung", "op": "eq", "value": "freigegeben"}], "mode": "all"} as PickWhere | null) } },
    ausfuehrender: { ...searches.ausfuehrender, select: { ...searches.ausfuehrender.select, create: false as boolean, hint: hintFor('ausfuehrender', 'nutzer', null as PickWhere | null) } },
    ki_vorschlaege: { ...searches.ki_vorschlaege, select: { ...searches.ki_vorschlaege.select, create: false as boolean, hint: hintFor('ki_vorschlaege', 'ki_vorschlaege', null as PickWhere | null) } },
  };

  const ki_vorschlaegeFilled = hasValues(ki_vorschlaege);
  const plan: PlanStep[] = [
    {
      key: 'taetigkeiten', entity: 'taetigkeiten', form: taetigkeiten, primary: true,
      values: (): FormValues => ({
        zeitpunkt: policyFixedValue('taetigkeiten', 'zeitpunkt') ?? nowIso(),
      }),
    },
    ...(ki_vorschlaegeFilled ? [{
      key: 'ki_vorschlaege', entity: 'ki_vorschlaege', form: ki_vorschlaege,
      updates: () => ki_vorschlaegeTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => ki_vorschlaegeTargetId
        ? { key: 'target:ki_vorschlaege', label: entityLabel('ki_vorschlaege'), value: picks.ki_vorschlaege.labelOf(ki_vorschlaegeTargetId) ?? ki_vorschlaegeTargetId, step: steps.ki_vorschlaege }
        : undefined,
      values: (): FormValues => ({
        status: policyFixedValue('ki_vorschlaege', 'status') ?? "ausgefuehrt",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('ki_vorschlaege', 'status', policyFixedValue('ki_vorschlaege', 'status') ?? "ausgefuehrt")],
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'taetigkeit-dokumentieren' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    ki_vorschlaege: {
      selectedId: ki_vorschlaegeTargetId,
      onSelect: (id: string) => {
        setKiVorschlaegeTargetId(id);
        const rec = picks.ki_vorschlaege.recordOf(id);
        if (rec) ki_vorschlaege.reset({ });
      },
      get record(): JourneyRecord | undefined { return ki_vorschlaegeTargetId ? picks.ki_vorschlaege.recordOf(ki_vorschlaegeTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: TaetigkeitDokumentierenFieldKey) => {
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
  const pickMany = (field: TaetigkeitDokumentierenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setKiVorschlaegeTargetId(null); };

  return {
    slug: 'taetigkeit-dokumentieren' as const,
    draftKey: 'taetigkeit-dokumentieren' as const,
    entity: 'taetigkeiten' as const,
    form: taetigkeiten,
    forms, formList, picks, submit, steps, targets,    reviewStep: TAETIGKEITDOKUMENTIEREN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type TaetigkeitDokumentierenFlow = ReturnType<typeof useTaetigkeitDokumentierenFlow>;
