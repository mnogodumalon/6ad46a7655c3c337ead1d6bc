import type { EnrichedArbeitskontexte, EnrichedErfahrungen, EnrichedFreigaben, EnrichedKiVorschlaege, EnrichedRegeln, EnrichedTaetigkeiten, EnrichedVorhaben } from '@/types/enriched';
import type { Arbeitskontexte, Erfahrungen, Freigaben, KiModelle, KiVorschlaege, Nutzer, Regeln, Taetigkeiten, Vorhaben } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface VorhabenMaps {
  nutzerMap: Map<string, Nutzer>;
}

export function enrichVorhaben(
  vorhaben: Vorhaben[],
  maps: VorhabenMaps
): EnrichedVorhaben[] {
  return vorhaben.map(r => ({
    ...r,
    verantwortlicherName: resolveDisplay(r.fields.verantwortlicher, maps.nutzerMap, 'vorname', 'nachname'),
  }));
}

interface RegelnMaps {
  nutzerMap: Map<string, Nutzer>;
  regelnMap: Map<string, Regeln>;
}

export function enrichRegeln(
  regeln: Regeln[],
  maps: RegelnMaps
): EnrichedRegeln[] {
  return regeln.map(r => ({
    ...r,
    verantwortlicherName: resolveDisplay(r.fields.verantwortlicher, maps.nutzerMap, 'vorname', 'nachname'),
    vorgaengerregelName: resolveDisplay(r.fields.vorgaengerregel, maps.regelnMap, 'bezeichnung'),
  }));
}

interface ArbeitskontexteMaps {
  vorhabenMap: Map<string, Vorhaben>;
  nutzerMap: Map<string, Nutzer>;
  arbeitskontexteMap: Map<string, Arbeitskontexte>;
}

export function enrichArbeitskontexte(
  arbeitskontexte: Arbeitskontexte[],
  maps: ArbeitskontexteMaps
): EnrichedArbeitskontexte[] {
  return arbeitskontexte.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    erfasst_vonName: resolveDisplay(r.fields.erfasst_von, maps.nutzerMap, 'vorname', 'nachname'),
    vorgaengerkontextName: resolveDisplay(r.fields.vorgaengerkontext, maps.arbeitskontexteMap, 'aktueller_zustand'),
  }));
}

interface KiVorschlaegeMaps {
  vorhabenMap: Map<string, Vorhaben>;
  kiModelleMap: Map<string, KiModelle>;
  arbeitskontexteMap: Map<string, Arbeitskontexte>;
  regelnMap: Map<string, Regeln>;
}

export function enrichKiVorschlaege(
  kiVorschlaege: KiVorschlaege[],
  maps: KiVorschlaegeMaps
): EnrichedKiVorschlaege[] {
  return kiVorschlaege.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    modellName: resolveDisplay(r.fields.modell, maps.kiModelleMap, 'bezeichnung'),
    arbeitskontextName: resolveDisplay(r.fields.arbeitskontext, maps.arbeitskontexteMap, 'aktueller_zustand'),
    betroffene_regelName: resolveDisplay(r.fields.betroffene_regel, maps.regelnMap, 'bezeichnung'),
  }));
}

interface FreigabenMaps {
  nutzerMap: Map<string, Nutzer>;
  kiVorschlaegeMap: Map<string, KiVorschlaege>;
  regelnMap: Map<string, Regeln>;
}

export function enrichFreigaben(
  freigaben: Freigaben[],
  maps: FreigabenMaps
): EnrichedFreigaben[] {
  return freigaben.map(r => ({
    ...r,
    entscheiderName: resolveDisplay(r.fields.entscheider, maps.nutzerMap, 'vorname', 'nachname'),
    vorschlagName: resolveDisplay(r.fields.vorschlag, maps.kiVorschlaegeMap, 'inhalt'),
    angewendete_regelName: resolveDisplay(r.fields.angewendete_regel, maps.regelnMap, 'bezeichnung'),
  }));
}

interface TaetigkeitenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  nutzerMap: Map<string, Nutzer>;
  freigabenMap: Map<string, Freigaben>;
}

export function enrichTaetigkeiten(
  taetigkeiten: Taetigkeiten[],
  maps: TaetigkeitenMaps
): EnrichedTaetigkeiten[] {
  return taetigkeiten.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    ausfuehrenderName: resolveDisplay(r.fields.ausfuehrender, maps.nutzerMap, 'vorname', 'nachname'),
    freigabeName: resolveDisplay(r.fields.freigabe, maps.freigabenMap, 'begruendung'),
  }));
}

interface ErfahrungenMaps {
  taetigkeitenMap: Map<string, Taetigkeiten>;
  vorhabenMap: Map<string, Vorhaben>;
  nutzerMap: Map<string, Nutzer>;
}

export function enrichErfahrungen(
  erfahrungen: Erfahrungen[],
  maps: ErfahrungenMaps
): EnrichedErfahrungen[] {
  return erfahrungen.map(r => ({
    ...r,
    taetigkeitName: resolveDisplay(r.fields.taetigkeit, maps.taetigkeitenMap, 'beschreibung'),
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    erfasst_vonName: resolveDisplay(r.fields.erfasst_von, maps.nutzerMap, 'vorname', 'nachname'),
  }));
}
