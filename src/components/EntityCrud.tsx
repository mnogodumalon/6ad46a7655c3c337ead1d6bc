/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'nutzer'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.nutzer.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.nutzer.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.nutzer.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.nutzer              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   nutzer: vorname, nachname, email, rolle, berechtigungsstufe, aktiv  ·  ← vorhaben (list + contextual +) · ← regeln (list + contextual +) · ← arbeitskontexte (list + contextual +) · ← freigaben (list + contextual +) · ← taetigkeiten (list + contextual +) · ← erfahrungen (list + contextual +)
 *   ki_modelle: bezeichnung, anbieter, version, einsatzzweck, faehigkeiten_einschraenkungen, zuverlaessigkeit, status  ·  ← ki_vorschlaege (list + contextual +)
 *   vorhaben: titel, ausgangssituation, ziel, kontext, verantwortlicher, status, startdatum, enddatum  ·  → nutzer · ← arbeitskontexte (list + contextual +) · ← ki_vorschlaege (list + contextual +) · ← taetigkeiten (list + contextual +) · ← erfahrungen (list + contextual +)
 *   regeln: bezeichnung, beschreibung, regeltyp, bedingung, wirkung, erforderliche_stufe, gueltig_ab, status, …  ·  → nutzer · → regeln · ← ki_vorschlaege (list + contextual +) · ← freigaben (list + contextual +)
 *   arbeitskontexte: vorhaben, versionsnummer, aktueller_zustand, verwendete_informationen, annahmen, gueltigkeitsstatus, erfasst_von, zeitpunkt, …  ·  → vorhaben · → nutzer · → arbeitskontexte · ← ki_vorschlaege (list + contextual +)
 *   ki_vorschlaege: vorhaben, modell, art, inhalt, begruendung, status, arbeitskontext, betroffene_regel  ·  → vorhaben · → ki_modelle · → arbeitskontexte · → regeln · ← freigaben (list + contextual +)
 *   freigaben: entscheider, regelpruefung, entscheidung, begruendung, entscheidungszeitpunkt, wirksam_ab, vorschlag, angewendete_regel  ·  → nutzer · → ki_vorschlaege · → regeln · ← taetigkeiten (list + contextual +)
 *   taetigkeiten: vorhaben, beschreibung, ausfuehrender, zeitpunkt, aenderungen, ergebnis, beobachtete_wirkung, freigabe  ·  → vorhaben · → nutzer · → freigaben · ← erfahrungen (list + contextual +)
 *   erfahrungen: taetigkeit, titel, vorhaben, beschreibung, kategorie, wirkung, wiederverwendbar, erfasst_von  ·  → taetigkeiten · → vorhaben · → nutzer
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Nutzer, KiModelle, Vorhaben, Regeln, Arbeitskontexte, KiVorschlaege, Freigaben, Taetigkeiten, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichVorhaben, enrichRegeln, enrichArbeitskontexte, enrichKiVorschlaege, enrichFreigaben, enrichTaetigkeiten, enrichErfahrungen } from '@/lib/enrich';
import type { EnrichedVorhaben, EnrichedRegeln, EnrichedArbeitskontexte, EnrichedKiVorschlaege, EnrichedFreigaben, EnrichedTaetigkeiten, EnrichedErfahrungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { NutzerDialog, type NutzerDialogDefaults } from '@/components/dialogs/NutzerDialog';
import { NutzerDetails } from '@/components/details/NutzerDetails';
import { KiModelleDialog, type KiModelleDialogDefaults } from '@/components/dialogs/KiModelleDialog';
import { KiModelleDetails } from '@/components/details/KiModelleDetails';
import { VorhabenDialog, type VorhabenDialogDefaults } from '@/components/dialogs/VorhabenDialog';
import { VorhabenDetails } from '@/components/details/VorhabenDetails';
import { RegelnDialog, type RegelnDialogDefaults } from '@/components/dialogs/RegelnDialog';
import { RegelnDetails } from '@/components/details/RegelnDetails';
import { ArbeitskontexteDialog, type ArbeitskontexteDialogDefaults } from '@/components/dialogs/ArbeitskontexteDialog';
import { ArbeitskontexteDetails } from '@/components/details/ArbeitskontexteDetails';
import { KiVorschlaegeDialog, type KiVorschlaegeDialogDefaults } from '@/components/dialogs/KiVorschlaegeDialog';
import { KiVorschlaegeDetails } from '@/components/details/KiVorschlaegeDetails';
import { FreigabenDialog, type FreigabenDialogDefaults } from '@/components/dialogs/FreigabenDialog';
import { FreigabenDetails } from '@/components/details/FreigabenDetails';
import { TaetigkeitenDialog, type TaetigkeitenDialogDefaults } from '@/components/dialogs/TaetigkeitenDialog';
import { TaetigkeitenDetails } from '@/components/details/TaetigkeitenDetails';
import { ErfahrungenDialog, type ErfahrungenDialogDefaults } from '@/components/dialogs/ErfahrungenDialog';
import { ErfahrungenDetails } from '@/components/details/ErfahrungenDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'nutzer'; record: Nutzer }
  | { type: 'kiModelle'; record: KiModelle }
  | { type: 'vorhaben'; record: EnrichedVorhaben }
  | { type: 'regeln'; record: EnrichedRegeln }
  | { type: 'arbeitskontexte'; record: EnrichedArbeitskontexte }
  | { type: 'kiVorschlaege'; record: EnrichedKiVorschlaege }
  | { type: 'freigaben'; record: EnrichedFreigaben }
  | { type: 'taetigkeiten'; record: EnrichedTaetigkeiten }
  | { type: 'erfahrungen'; record: EnrichedErfahrungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  nutzer: EntityCrudApi<Nutzer, NutzerDialogDefaults>;
  kiModelle: EntityCrudApi<KiModelle, KiModelleDialogDefaults>;
  vorhaben: EntityCrudApi<Vorhaben, VorhabenDialogDefaults>;
  regeln: EntityCrudApi<Regeln, RegelnDialogDefaults>;
  arbeitskontexte: EntityCrudApi<Arbeitskontexte, ArbeitskontexteDialogDefaults>;
  kiVorschlaege: EntityCrudApi<KiVorschlaege, KiVorschlaegeDialogDefaults>;
  freigaben: EntityCrudApi<Freigaben, FreigabenDialogDefaults>;
  taetigkeiten: EntityCrudApi<Taetigkeiten, TaetigkeitenDialogDefaults>;
  erfahrungen: EntityCrudApi<Erfahrungen, ErfahrungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { nutzer: Nutzer[]; kiModelle: KiModelle[]; vorhaben: EnrichedVorhaben[]; regeln: EnrichedRegeln[]; arbeitskontexte: EnrichedArbeitskontexte[]; kiVorschlaege: EnrichedKiVorschlaege[]; freigaben: EnrichedFreigaben[]; taetigkeiten: EnrichedTaetigkeiten[]; erfahrungen: EnrichedErfahrungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [nutzerDialog, setNutzerDialog] = useState<{ defaults?: NutzerDialogDefaults; editing?: Nutzer } | null>(null);
  const [kiModelleDialog, setKiModelleDialog] = useState<{ defaults?: KiModelleDialogDefaults; editing?: KiModelle } | null>(null);
  const [vorhabenDialog, setVorhabenDialog] = useState<{ defaults?: VorhabenDialogDefaults; editing?: Vorhaben } | null>(null);
  const [regelnDialog, setRegelnDialog] = useState<{ defaults?: RegelnDialogDefaults; editing?: Regeln } | null>(null);
  const [arbeitskontexteDialog, setArbeitskontexteDialog] = useState<{ defaults?: ArbeitskontexteDialogDefaults; editing?: Arbeitskontexte } | null>(null);
  const [kiVorschlaegeDialog, setKiVorschlaegeDialog] = useState<{ defaults?: KiVorschlaegeDialogDefaults; editing?: KiVorschlaege } | null>(null);
  const [freigabenDialog, setFreigabenDialog] = useState<{ defaults?: FreigabenDialogDefaults; editing?: Freigaben } | null>(null);
  const [taetigkeitenDialog, setTaetigkeitenDialog] = useState<{ defaults?: TaetigkeitenDialogDefaults; editing?: Taetigkeiten } | null>(null);
  const [erfahrungenDialog, setErfahrungenDialog] = useState<{ defaults?: ErfahrungenDialogDefaults; editing?: Erfahrungen } | null>(null);
  const enrichedVorhaben = useMemo(() => enrichVorhaben(data.vorhaben, { nutzerMap: data.nutzerMap }), [data.vorhaben, data.nutzerMap]);
  const enrichedRegeln = useMemo(() => enrichRegeln(data.regeln, { nutzerMap: data.nutzerMap, regelnMap: data.regelnMap }), [data.regeln, data.nutzerMap, data.regelnMap]);
  const enrichedArbeitskontexte = useMemo(() => enrichArbeitskontexte(data.arbeitskontexte, { vorhabenMap: data.vorhabenMap, nutzerMap: data.nutzerMap, arbeitskontexteMap: data.arbeitskontexteMap }), [data.arbeitskontexte, data.vorhabenMap, data.nutzerMap, data.arbeitskontexteMap]);
  const enrichedKiVorschlaege = useMemo(() => enrichKiVorschlaege(data.kiVorschlaege, { vorhabenMap: data.vorhabenMap, kiModelleMap: data.kiModelleMap, arbeitskontexteMap: data.arbeitskontexteMap, regelnMap: data.regelnMap }), [data.kiVorschlaege, data.vorhabenMap, data.kiModelleMap, data.arbeitskontexteMap, data.regelnMap]);
  const enrichedFreigaben = useMemo(() => enrichFreigaben(data.freigaben, { nutzerMap: data.nutzerMap, kiVorschlaegeMap: data.kiVorschlaegeMap, regelnMap: data.regelnMap }), [data.freigaben, data.nutzerMap, data.kiVorschlaegeMap, data.regelnMap]);
  const enrichedTaetigkeiten = useMemo(() => enrichTaetigkeiten(data.taetigkeiten, { vorhabenMap: data.vorhabenMap, nutzerMap: data.nutzerMap, freigabenMap: data.freigabenMap }), [data.taetigkeiten, data.vorhabenMap, data.nutzerMap, data.freigabenMap]);
  const enrichedErfahrungen = useMemo(() => enrichErfahrungen(data.erfahrungen, { taetigkeitenMap: data.taetigkeitenMap, vorhabenMap: data.vorhabenMap, nutzerMap: data.nutzerMap }), [data.erfahrungen, data.taetigkeitenMap, data.vorhabenMap, data.nutzerMap]);

  function detailNutzer(record: Nutzer, push = false) {
    const item: OverlayItem = { type: 'nutzer', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitNutzer(fields: Nutzer['fields']) {
    const editing = nutzerDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setNutzer(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateNutzerEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('nutzer')} — ${t('crud_updated')}`, async () => {
        data.setNutzer(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateNutzerEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createNutzerEntry(fields);
      undoToast(`${appLabel('nutzer')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailKiModelle(record: KiModelle, push = false) {
    const item: OverlayItem = { type: 'kiModelle', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitKiModelle(fields: KiModelle['fields']) {
    const editing = kiModelleDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setKiModelle(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateKiModelleEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ki_modelle')} — ${t('crud_updated')}`, async () => {
        data.setKiModelle(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateKiModelleEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createKiModelleEntry(fields);
      undoToast(`${appLabel('ki_modelle')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailVorhaben(record: Vorhaben, push = false) {
    const rec = enrichedVorhaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'vorhaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorhaben(fields: Vorhaben['fields']) {
    const editing = vorhabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorhaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorhabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorhaben')} — ${t('crud_updated')}`, async () => {
        data.setVorhaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorhabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVorhabenEntry(fields);
      undoToast(`${appLabel('vorhaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRegeln(record: Regeln, push = false) {
    const rec = enrichedRegeln.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'regeln', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRegeln(fields: Regeln['fields']) {
    const editing = regelnDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRegeln(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRegelnEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('regeln')} — ${t('crud_updated')}`, async () => {
        data.setRegeln(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRegelnEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRegelnEntry(fields);
      undoToast(`${appLabel('regeln')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailArbeitskontexte(record: Arbeitskontexte, push = false) {
    const rec = enrichedArbeitskontexte.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'arbeitskontexte', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitArbeitskontexte(fields: Arbeitskontexte['fields']) {
    const editing = arbeitskontexteDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setArbeitskontexte(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateArbeitskontexteEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('arbeitskontexte')} — ${t('crud_updated')}`, async () => {
        data.setArbeitskontexte(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateArbeitskontexteEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createArbeitskontexteEntry(fields);
      undoToast(`${appLabel('arbeitskontexte')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailKiVorschlaege(record: KiVorschlaege, push = false) {
    const rec = enrichedKiVorschlaege.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'kiVorschlaege', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitKiVorschlaege(fields: KiVorschlaege['fields']) {
    const editing = kiVorschlaegeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setKiVorschlaege(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateKiVorschlaegeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ki_vorschlaege')} — ${t('crud_updated')}`, async () => {
        data.setKiVorschlaege(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateKiVorschlaegeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createKiVorschlaegeEntry(fields);
      undoToast(`${appLabel('ki_vorschlaege')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailFreigaben(record: Freigaben, push = false) {
    const rec = enrichedFreigaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'freigaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitFreigaben(fields: Freigaben['fields']) {
    const editing = freigabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setFreigaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateFreigabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('freigaben')} — ${t('crud_updated')}`, async () => {
        data.setFreigaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateFreigabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createFreigabenEntry(fields);
      undoToast(`${appLabel('freigaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailTaetigkeiten(record: Taetigkeiten, push = false) {
    const rec = enrichedTaetigkeiten.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'taetigkeiten', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTaetigkeiten(fields: Taetigkeiten['fields']) {
    const editing = taetigkeitenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTaetigkeiten(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTaetigkeitenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('taetigkeiten')} — ${t('crud_updated')}`, async () => {
        data.setTaetigkeiten(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTaetigkeitenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTaetigkeitenEntry(fields);
      undoToast(`${appLabel('taetigkeiten')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErfahrungen(record: Erfahrungen, push = false) {
    const rec = enrichedErfahrungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erfahrungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErfahrungen(fields: Erfahrungen['fields']) {
    const editing = erfahrungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErfahrungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErfahrungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erfahrungen')} — ${t('crud_updated')}`, async () => {
        data.setErfahrungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErfahrungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErfahrungenEntry(fields);
      undoToast(`${appLabel('erfahrungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <NutzerDialog
        open={nutzerDialog !== null}
        onClose={() => setNutzerDialog(null)}
        onSubmit={submitNutzer}
        defaultValues={nutzerDialog?.defaults}
        recordId={nutzerDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Nutzer']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Nutzer']}
      />
      <KiModelleDialog
        open={kiModelleDialog !== null}
        onClose={() => setKiModelleDialog(null)}
        onSubmit={submitKiModelle}
        defaultValues={kiModelleDialog?.defaults}
        recordId={kiModelleDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['KiModelle']}
        enablePhotoLocation={AI_PHOTO_LOCATION['KiModelle']}
      />
      <VorhabenDialog
        open={vorhabenDialog !== null}
        onClose={() => setVorhabenDialog(null)}
        onSubmit={submitVorhaben}
        defaultValues={vorhabenDialog?.defaults}
        recordId={vorhabenDialog?.editing?.record_id}
        nutzerList={data.nutzer}
        enablePhotoScan={AI_PHOTO_SCAN['Vorhaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorhaben']}
      />
      <RegelnDialog
        open={regelnDialog !== null}
        onClose={() => setRegelnDialog(null)}
        onSubmit={submitRegeln}
        defaultValues={regelnDialog?.defaults}
        recordId={regelnDialog?.editing?.record_id}
        nutzerList={data.nutzer}
        regelnList={data.regeln}
        enablePhotoScan={AI_PHOTO_SCAN['Regeln']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Regeln']}
      />
      <ArbeitskontexteDialog
        open={arbeitskontexteDialog !== null}
        onClose={() => setArbeitskontexteDialog(null)}
        onSubmit={submitArbeitskontexte}
        defaultValues={arbeitskontexteDialog?.defaults}
        recordId={arbeitskontexteDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        nutzerList={data.nutzer}
        arbeitskontexteList={data.arbeitskontexte}
        enablePhotoScan={AI_PHOTO_SCAN['Arbeitskontexte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Arbeitskontexte']}
      />
      <KiVorschlaegeDialog
        open={kiVorschlaegeDialog !== null}
        onClose={() => setKiVorschlaegeDialog(null)}
        onSubmit={submitKiVorschlaege}
        defaultValues={kiVorschlaegeDialog?.defaults}
        recordId={kiVorschlaegeDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        kiModelleList={data.kiModelle}
        arbeitskontexteList={data.arbeitskontexte}
        regelnList={data.regeln}
        enablePhotoScan={AI_PHOTO_SCAN['KiVorschlaege']}
        enablePhotoLocation={AI_PHOTO_LOCATION['KiVorschlaege']}
      />
      <FreigabenDialog
        open={freigabenDialog !== null}
        onClose={() => setFreigabenDialog(null)}
        onSubmit={submitFreigaben}
        defaultValues={freigabenDialog?.defaults}
        recordId={freigabenDialog?.editing?.record_id}
        nutzerList={data.nutzer}
        kiVorschlaegeList={data.kiVorschlaege}
        regelnList={data.regeln}
        enablePhotoScan={AI_PHOTO_SCAN['Freigaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Freigaben']}
      />
      <TaetigkeitenDialog
        open={taetigkeitenDialog !== null}
        onClose={() => setTaetigkeitenDialog(null)}
        onSubmit={submitTaetigkeiten}
        defaultValues={taetigkeitenDialog?.defaults}
        recordId={taetigkeitenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        nutzerList={data.nutzer}
        freigabenList={data.freigaben}
        enablePhotoScan={AI_PHOTO_SCAN['Taetigkeiten']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Taetigkeiten']}
      />
      <ErfahrungenDialog
        open={erfahrungenDialog !== null}
        onClose={() => setErfahrungenDialog(null)}
        onSubmit={submitErfahrungen}
        defaultValues={erfahrungenDialog?.defaults}
        recordId={erfahrungenDialog?.editing?.record_id}
        taetigkeitenList={data.taetigkeiten}
        vorhabenList={data.vorhaben}
        nutzerList={data.nutzer}
        enablePhotoScan={AI_PHOTO_SCAN['Erfahrungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erfahrungen']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'nutzer') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('nutzer')} subtitle={undefined} />
                <NutzerDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  onAddVorhaben={perms.canWrite('vorhaben') ? () => setVorhabenDialog({ defaults: { verantwortlicher: createRecordUrl(APP_IDS.NUTZER, top.record.record_id) } }) : undefined}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { verantwortlicher: createRecordUrl(APP_IDS.NUTZER, top.record.record_id) } }) : undefined}
                  arbeitskontexteList={data.arbeitskontexte}
                  onOpenArbeitskontexte={(r) => detailArbeitskontexte(r, true)}
                  onAddArbeitskontexte={perms.canWrite('arbeitskontexte') ? () => setArbeitskontexteDialog({ defaults: { erfasst_von: createRecordUrl(APP_IDS.NUTZER, top.record.record_id) } }) : undefined}
                  freigabenList={data.freigaben}
                  onOpenFreigaben={(r) => detailFreigaben(r, true)}
                  onAddFreigaben={perms.canWrite('freigaben') ? () => setFreigabenDialog({ defaults: { entscheider: createRecordUrl(APP_IDS.NUTZER, top.record.record_id) } }) : undefined}
                  taetigkeitenList={data.taetigkeiten}
                  onOpenTaetigkeiten={(r) => detailTaetigkeiten(r, true)}
                  onAddTaetigkeiten={perms.canWrite('taetigkeiten') ? () => setTaetigkeitenDialog({ defaults: { ausfuehrender: createRecordUrl(APP_IDS.NUTZER, top.record.record_id) } }) : undefined}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { erfasst_von: createRecordUrl(APP_IDS.NUTZER, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'kiModelle') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('ki_modelle')} subtitle={undefined} />
                <KiModelleDetails
                  record={top.record}
                  kiVorschlaegeList={data.kiVorschlaege}
                  onOpenKiVorschlaege={(r) => detailKiVorschlaege(r, true)}
                  onAddKiVorschlaege={perms.canWrite('ki_vorschlaege') ? () => setKiVorschlaegeDialog({ defaults: { modell: createRecordUrl(APP_IDS.KI_MODELLE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'vorhaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('vorhaben')} subtitle={top.record.fields.startdatum ? formatDate(top.record.fields.startdatum) : undefined} />
                <VorhabenDetails
                  record={top.record}
                  nutzerList={data.nutzer}
                  onOpenNutzer={(r) => detailNutzer(r, true)}
                  arbeitskontexteList={data.arbeitskontexte}
                  onOpenArbeitskontexte={(r) => detailArbeitskontexte(r, true)}
                  onAddArbeitskontexte={perms.canWrite('arbeitskontexte') ? () => setArbeitskontexteDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  kiVorschlaegeList={data.kiVorschlaege}
                  onOpenKiVorschlaege={(r) => detailKiVorschlaege(r, true)}
                  onAddKiVorschlaege={perms.canWrite('ki_vorschlaege') ? () => setKiVorschlaegeDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  taetigkeitenList={data.taetigkeiten}
                  onOpenTaetigkeiten={(r) => detailTaetigkeiten(r, true)}
                  onAddTaetigkeiten={perms.canWrite('taetigkeiten') ? () => setTaetigkeitenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'regeln') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('regeln')} subtitle={top.record.fields.gueltig_ab ? formatDate(top.record.fields.gueltig_ab) : undefined} />
                <RegelnDetails
                  record={top.record}
                  nutzerList={data.nutzer}
                  onOpenNutzer={(r) => detailNutzer(r, true)}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  kiVorschlaegeList={data.kiVorschlaege}
                  onOpenKiVorschlaege={(r) => detailKiVorschlaege(r, true)}
                  onAddKiVorschlaege={perms.canWrite('ki_vorschlaege') ? () => setKiVorschlaegeDialog({ defaults: { betroffene_regel: createRecordUrl(APP_IDS.REGELN, top.record.record_id) } }) : undefined}
                  freigabenList={data.freigaben}
                  onOpenFreigaben={(r) => detailFreigaben(r, true)}
                  onAddFreigaben={perms.canWrite('freigaben') ? () => setFreigabenDialog({ defaults: { angewendete_regel: createRecordUrl(APP_IDS.REGELN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'arbeitskontexte') {
            return (
              <>
                <RecordHeader title={appLabel('arbeitskontexte')} subtitle={top.record.fields.zeitpunkt ? formatDate(top.record.fields.zeitpunkt) : undefined} />
                <ArbeitskontexteDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  nutzerList={data.nutzer}
                  onOpenNutzer={(r) => detailNutzer(r, true)}
                  arbeitskontexteList={data.arbeitskontexte}
                  onOpenArbeitskontexte={(r) => detailArbeitskontexte(r, true)}
                  kiVorschlaegeList={data.kiVorschlaege}
                  onOpenKiVorschlaege={(r) => detailKiVorschlaege(r, true)}
                  onAddKiVorschlaege={perms.canWrite('ki_vorschlaege') ? () => setKiVorschlaegeDialog({ defaults: { arbeitskontext: createRecordUrl(APP_IDS.ARBEITSKONTEXTE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'kiVorschlaege') {
            return (
              <>
                <RecordHeader title={appLabel('ki_vorschlaege')} subtitle={undefined} />
                <KiVorschlaegeDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  kiModelleList={data.kiModelle}
                  onOpenKiModelle={(r) => detailKiModelle(r, true)}
                  arbeitskontexteList={data.arbeitskontexte}
                  onOpenArbeitskontexte={(r) => detailArbeitskontexte(r, true)}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  freigabenList={data.freigaben}
                  onOpenFreigaben={(r) => detailFreigaben(r, true)}
                  onAddFreigaben={perms.canWrite('freigaben') ? () => setFreigabenDialog({ defaults: { vorschlag: createRecordUrl(APP_IDS.KI_VORSCHLAEGE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'freigaben') {
            return (
              <>
                <RecordHeader title={appLabel('freigaben')} subtitle={top.record.fields.entscheidungszeitpunkt ? formatDate(top.record.fields.entscheidungszeitpunkt) : undefined} />
                <FreigabenDetails
                  record={top.record}
                  nutzerList={data.nutzer}
                  onOpenNutzer={(r) => detailNutzer(r, true)}
                  kiVorschlaegeList={data.kiVorschlaege}
                  onOpenKiVorschlaege={(r) => detailKiVorschlaege(r, true)}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  taetigkeitenList={data.taetigkeiten}
                  onOpenTaetigkeiten={(r) => detailTaetigkeiten(r, true)}
                  onAddTaetigkeiten={perms.canWrite('taetigkeiten') ? () => setTaetigkeitenDialog({ defaults: { freigabe: createRecordUrl(APP_IDS.FREIGABEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'taetigkeiten') {
            return (
              <>
                <RecordHeader title={appLabel('taetigkeiten')} subtitle={top.record.fields.zeitpunkt ? formatDate(top.record.fields.zeitpunkt) : undefined} />
                <TaetigkeitenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  nutzerList={data.nutzer}
                  onOpenNutzer={(r) => detailNutzer(r, true)}
                  freigabenList={data.freigaben}
                  onOpenFreigaben={(r) => detailFreigaben(r, true)}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { taetigkeit: createRecordUrl(APP_IDS.TAETIGKEITEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'erfahrungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('erfahrungen')} subtitle={undefined} />
                <ErfahrungenDetails
                  record={top.record}
                  taetigkeitenList={data.taetigkeiten}
                  onOpenTaetigkeiten={(r) => detailTaetigkeiten(r, true)}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  nutzerList={data.nutzer}
                  onOpenNutzer={(r) => detailNutzer(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'nutzer') return perms.canWrite('nutzer');
          if (top.type === 'kiModelle') return perms.canWrite('ki_modelle');
          if (top.type === 'vorhaben') return perms.canWrite('vorhaben');
          if (top.type === 'regeln') return perms.canWrite('regeln');
          if (top.type === 'arbeitskontexte') return perms.canWrite('arbeitskontexte');
          if (top.type === 'kiVorschlaege') return perms.canWrite('ki_vorschlaege');
          if (top.type === 'freigaben') return perms.canWrite('freigaben');
          if (top.type === 'taetigkeiten') return perms.canWrite('taetigkeiten');
          if (top.type === 'erfahrungen') return perms.canWrite('erfahrungen');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'nutzer') setNutzerDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'kiModelle') setKiModelleDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'vorhaben') setVorhabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'regeln') setRegelnDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'arbeitskontexte') setArbeitskontexteDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'kiVorschlaege') setKiVorschlaegeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'freigaben') setFreigabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'taetigkeiten') setTaetigkeitenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erfahrungen') setErfahrungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    nutzer: {
      openCreate: (defaults?: NutzerDialogDefaults) => (perms.canWrite('nutzer') ? setNutzerDialog({ defaults }) : refuse()),
      openEdit: (record: Nutzer) => (perms.canWrite('nutzer') ? setNutzerDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Nutzer) => detailNutzer(record, false),
      canWrite: perms.canWrite('nutzer'),
    },
    kiModelle: {
      openCreate: (defaults?: KiModelleDialogDefaults) => (perms.canWrite('ki_modelle') ? setKiModelleDialog({ defaults }) : refuse()),
      openEdit: (record: KiModelle) => (perms.canWrite('ki_modelle') ? setKiModelleDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: KiModelle) => detailKiModelle(record, false),
      canWrite: perms.canWrite('ki_modelle'),
    },
    vorhaben: {
      openCreate: (defaults?: VorhabenDialogDefaults) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ defaults }) : refuse()),
      openEdit: (record: Vorhaben) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorhaben) => detailVorhaben(record, false),
      canWrite: perms.canWrite('vorhaben'),
    },
    regeln: {
      openCreate: (defaults?: RegelnDialogDefaults) => (perms.canWrite('regeln') ? setRegelnDialog({ defaults }) : refuse()),
      openEdit: (record: Regeln) => (perms.canWrite('regeln') ? setRegelnDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Regeln) => detailRegeln(record, false),
      canWrite: perms.canWrite('regeln'),
    },
    arbeitskontexte: {
      openCreate: (defaults?: ArbeitskontexteDialogDefaults) => (perms.canWrite('arbeitskontexte') ? setArbeitskontexteDialog({ defaults }) : refuse()),
      openEdit: (record: Arbeitskontexte) => (perms.canWrite('arbeitskontexte') ? setArbeitskontexteDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Arbeitskontexte) => detailArbeitskontexte(record, false),
      canWrite: perms.canWrite('arbeitskontexte'),
    },
    kiVorschlaege: {
      openCreate: (defaults?: KiVorschlaegeDialogDefaults) => (perms.canWrite('ki_vorschlaege') ? setKiVorschlaegeDialog({ defaults }) : refuse()),
      openEdit: (record: KiVorschlaege) => (perms.canWrite('ki_vorschlaege') ? setKiVorschlaegeDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: KiVorschlaege) => detailKiVorschlaege(record, false),
      canWrite: perms.canWrite('ki_vorschlaege'),
    },
    freigaben: {
      openCreate: (defaults?: FreigabenDialogDefaults) => (perms.canWrite('freigaben') ? setFreigabenDialog({ defaults }) : refuse()),
      openEdit: (record: Freigaben) => (perms.canWrite('freigaben') ? setFreigabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Freigaben) => detailFreigaben(record, false),
      canWrite: perms.canWrite('freigaben'),
    },
    taetigkeiten: {
      openCreate: (defaults?: TaetigkeitenDialogDefaults) => (perms.canWrite('taetigkeiten') ? setTaetigkeitenDialog({ defaults }) : refuse()),
      openEdit: (record: Taetigkeiten) => (perms.canWrite('taetigkeiten') ? setTaetigkeitenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Taetigkeiten) => detailTaetigkeiten(record, false),
      canWrite: perms.canWrite('taetigkeiten'),
    },
    erfahrungen: {
      openCreate: (defaults?: ErfahrungenDialogDefaults) => (perms.canWrite('erfahrungen') ? setErfahrungenDialog({ defaults }) : refuse()),
      openEdit: (record: Erfahrungen) => (perms.canWrite('erfahrungen') ? setErfahrungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erfahrungen) => detailErfahrungen(record, false),
      canWrite: perms.canWrite('erfahrungen'),
    },
    enriched: { nutzer: data.nutzer, kiModelle: data.kiModelle, vorhaben: enrichedVorhaben, regeln: enrichedRegeln, arbeitskontexte: enrichedArbeitskontexte, kiVorschlaege: enrichedKiVorschlaege, freigaben: enrichedFreigaben, taetigkeiten: enrichedTaetigkeiten, erfahrungen: enrichedErfahrungen },
  };
}
