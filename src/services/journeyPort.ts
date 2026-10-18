/**
 * The INTERNAL door of the journey port — authenticated, via LivingAppsService.
 * GENERATED: one lister and one creator per entity. Do not edit.
 *
 *   import { servicePort } from '@/services/journeyPort';
 *
 * Intent pages hand this to `useJourneySubmit` and to shared step blocks. It
 * exposes only list · create · ref — the public subset — so a step written
 * against it also runs on a public page. Undo, edit and delete stay on the
 * page itself (LivingAppsService), never inside a shared step.
 */
import { LivingAppsService, createRecordUrl, type RecordQuery } from '@/services/livingAppsService';
import { toWirePayload, type InternalJourneyPort, type JourneyRecord } from '@/lib/journey/port';
import { buildSearchFilter, byIdFilter, combineFilters } from '@/lib/journey/search';
import type { EntityKey } from '@/lib/journey/rules';

type RawRecord = { record_id: string; fields: Record<string, unknown>; createdat?: string | null };
type RawMutation = { record_id: string; fields?: Record<string, unknown>; created_at?: string | null };

const listers: Record<EntityKey, () => Promise<RawRecord[]>> = {
  'nutzer': () => LivingAppsService.getNutzer() as Promise<RawRecord[]>,
  'ki_modelle': () => LivingAppsService.getKiModelle() as Promise<RawRecord[]>,
  'vorhaben': () => LivingAppsService.getVorhaben() as Promise<RawRecord[]>,
  'regeln': () => LivingAppsService.getRegeln() as Promise<RawRecord[]>,
  'arbeitskontexte': () => LivingAppsService.getArbeitskontexte() as Promise<RawRecord[]>,
  'ki_vorschlaege': () => LivingAppsService.getKiVorschlaege() as Promise<RawRecord[]>,
  'freigaben': () => LivingAppsService.getFreigaben() as Promise<RawRecord[]>,
  'taetigkeiten': () => LivingAppsService.getTaetigkeiten() as Promise<RawRecord[]>,
  'erfahrungen': () => LivingAppsService.getErfahrungen() as Promise<RawRecord[]>,
};

/** The query/count half — the REST parameters the plain listers never send. */
const queriers: Record<EntityKey, (q: RecordQuery) => Promise<RawRecord[]>> = {
  'nutzer': q => LivingAppsService.queryNutzer(q) as Promise<RawRecord[]>,
  'ki_modelle': q => LivingAppsService.queryKiModelle(q) as Promise<RawRecord[]>,
  'vorhaben': q => LivingAppsService.queryVorhaben(q) as Promise<RawRecord[]>,
  'regeln': q => LivingAppsService.queryRegeln(q) as Promise<RawRecord[]>,
  'arbeitskontexte': q => LivingAppsService.queryArbeitskontexte(q) as Promise<RawRecord[]>,
  'ki_vorschlaege': q => LivingAppsService.queryKiVorschlaege(q) as Promise<RawRecord[]>,
  'freigaben': q => LivingAppsService.queryFreigaben(q) as Promise<RawRecord[]>,
  'taetigkeiten': q => LivingAppsService.queryTaetigkeiten(q) as Promise<RawRecord[]>,
  'erfahrungen': q => LivingAppsService.queryErfahrungen(q) as Promise<RawRecord[]>,
};

const counters: Record<EntityKey, (filter?: string, signal?: AbortSignal) => Promise<number>> = {
  'nutzer': (filter, signal) => LivingAppsService.countNutzer(filter, signal),
  'ki_modelle': (filter, signal) => LivingAppsService.countKiModelle(filter, signal),
  'vorhaben': (filter, signal) => LivingAppsService.countVorhaben(filter, signal),
  'regeln': (filter, signal) => LivingAppsService.countRegeln(filter, signal),
  'arbeitskontexte': (filter, signal) => LivingAppsService.countArbeitskontexte(filter, signal),
  'ki_vorschlaege': (filter, signal) => LivingAppsService.countKiVorschlaege(filter, signal),
  'freigaben': (filter, signal) => LivingAppsService.countFreigaben(filter, signal),
  'taetigkeiten': (filter, signal) => LivingAppsService.countTaetigkeiten(filter, signal),
  'erfahrungen': (filter, signal) => LivingAppsService.countErfahrungen(filter, signal),
};

const creators: Record<EntityKey, (fields: Record<string, unknown>) => Promise<RawMutation>> = {
  'nutzer': fields => LivingAppsService.createNutzerEntry(fields as never),
  'ki_modelle': fields => LivingAppsService.createKiModelleEntry(fields as never),
  'vorhaben': fields => LivingAppsService.createVorhabenEntry(fields as never),
  'regeln': fields => LivingAppsService.createRegelnEntry(fields as never),
  'arbeitskontexte': fields => LivingAppsService.createArbeitskontexteEntry(fields as never),
  'ki_vorschlaege': fields => LivingAppsService.createKiVorschlaegeEntry(fields as never),
  'freigaben': fields => LivingAppsService.createFreigabenEntry(fields as never),
  'taetigkeiten': fields => LivingAppsService.createTaetigkeitenEntry(fields as never),
  'erfahrungen': fields => LivingAppsService.createErfahrungenEntry(fields as never),
};

const updaters: Record<EntityKey, (id: string, fields: Record<string, unknown>) => Promise<RawMutation>> = {
  'nutzer': (id, fields) => LivingAppsService.updateNutzerEntry(id, fields as never),
  'ki_modelle': (id, fields) => LivingAppsService.updateKiModelleEntry(id, fields as never),
  'vorhaben': (id, fields) => LivingAppsService.updateVorhabenEntry(id, fields as never),
  'regeln': (id, fields) => LivingAppsService.updateRegelnEntry(id, fields as never),
  'arbeitskontexte': (id, fields) => LivingAppsService.updateArbeitskontexteEntry(id, fields as never),
  'ki_vorschlaege': (id, fields) => LivingAppsService.updateKiVorschlaegeEntry(id, fields as never),
  'freigaben': (id, fields) => LivingAppsService.updateFreigabenEntry(id, fields as never),
  'taetigkeiten': (id, fields) => LivingAppsService.updateTaetigkeitenEntry(id, fields as never),
  'erfahrungen': (id, fields) => LivingAppsService.updateErfahrungenEntry(id, fields as never),
};

function toJourneyRecord(r: RawRecord): JourneyRecord {
  return { id: r.record_id, fields: r.fields ?? {}, createdAt: r.createdat ?? null };
}

export const servicePort: InternalJourneyPort = {
  door: 'internal',
  async list(entity, opts) {
    // Only a bare list(entity) (or an empty options object) takes the historic
    // load-everything path. ANY explicit option — `limit` included — goes to the
    // server: useRecordSearch's first page of a big entity must not pull the
    // whole table (live 2026-09-02: all 263 employees travelled for a limit-50
    // first page because `limit` alone did not count as a query).
    const usesQuery = !!opts && (opts.search !== undefined || opts.offset !== undefined
      || opts.orderby !== undefined || opts.fields !== undefined || opts.signal !== undefined
      || opts.limit !== undefined || opts.filter !== undefined);
    if (!usesQuery) {
      const rows = await listers[entity]();
      const limited = opts?.limit ? rows.slice(0, opts.limit) : rows;
      return limited.map(toJourneyRecord);
    }
    const filter = combineFilters(opts.filter, opts.search ? buildSearchFilter(opts.search.query, opts.search.fields) : undefined);
    const rows = await queriers[entity]({
      filter, orderby: opts.orderby, limit: opts.limit, offset: opts.offset, fields: opts.fields, signal: opts.signal,
    });
    return rows.map(toJourneyRecord);
  },
  async count(entity, opts) {
    const filter = combineFilters(opts?.filter, opts?.search ? buildSearchFilter(opts.search.query, opts.search.fields) : undefined);
    return counters[entity](filter, opts?.signal);
  },
  async get(entity, id) {
    // One query on the server, not the whole table: `r.id` is the vSQL name
    // of the record id (a live page wrote `r.record_id` and got a 400).
    const rows = await queriers[entity]({ filter: byIdFilter(id), limit: 1 });
    return rows[0] ? toJourneyRecord(rows[0]) : null;
  },
  async create(entity, values) {
    const r = await creators[entity](toWirePayload(entity, values, servicePort));
    return { id: r.record_id, fields: r.fields ?? {}, createdAt: r.created_at ?? null };
  },
  // The same payload rules as create — plain ids in, references shaped here.
  async update(entity, id, values) {
    const r = await updaters[entity](id, toWirePayload(entity, values, servicePort));
    return { id: r.record_id || id, fields: r.fields ?? {}, createdAt: r.created_at ?? null };
  },
  ref: (appId, recordId) => createRecordUrl(appId, recordId),
};
