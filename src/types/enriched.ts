import type { Arbeitskontexte, Erfahrungen, Freigaben, KiVorschlaege, Regeln, Taetigkeiten, Vorhaben } from './app';

export type EnrichedVorhaben = Vorhaben & {
  verantwortlicherName: string;
};

export type EnrichedRegeln = Regeln & {
  verantwortlicherName: string;
  vorgaengerregelName: string;
};

export type EnrichedArbeitskontexte = Arbeitskontexte & {
  vorhabenName: string;
  erfasst_vonName: string;
  vorgaengerkontextName: string;
};

export type EnrichedKiVorschlaege = KiVorschlaege & {
  vorhabenName: string;
  modellName: string;
  arbeitskontextName: string;
  betroffene_regelName: string;
};

export type EnrichedFreigaben = Freigaben & {
  entscheiderName: string;
  vorschlagName: string;
  angewendete_regelName: string;
};

export type EnrichedTaetigkeiten = Taetigkeiten & {
  vorhabenName: string;
  ausfuehrenderName: string;
  freigabeName: string;
};

export type EnrichedErfahrungen = Erfahrungen & {
  taetigkeitName: string;
  vorhabenName: string;
  erfasst_vonName: string;
};
