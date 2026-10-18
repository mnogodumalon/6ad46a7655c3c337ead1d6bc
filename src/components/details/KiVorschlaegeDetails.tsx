import type { KiVorschlaege, Vorhaben, KiModelle, Arbeitskontexte, Regeln, Freigaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface KiVorschlaegeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: KiVorschlaege;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „KiModelle": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  kiModelleList: KiModelle[];
  /** Klick auf die KiModelle-Relation → overlay.push auf dessen Detail. */
  onOpenKiModelle?: (record: KiModelle) => void;
  /** N:1-Ziel „Arbeitskontexte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  arbeitskontexteList: Arbeitskontexte[];
  /** Klick auf die Arbeitskontexte-Relation → overlay.push auf dessen Detail. */
  onOpenArbeitskontexte?: (record: Arbeitskontexte) => void;
  /** N:1-Ziel „Regeln": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  regelnList: Regeln[];
  /** Klick auf die Regeln-Relation → overlay.push auf dessen Detail. */
  onOpenRegeln?: (record: Regeln) => void;
  /** 1:N „Freigaben" (vorschlag): VOLLE Liste — der Block filtert auf diesen Record. */
  freigabenList: Freigaben[];
  /** Zeilen-Klick → overlay.push auf das Freigaben-Detail (nie der Edit-Dialog). */
  onOpenFreigaben: (record: Freigaben) => void;
  /** Kontextuelles „+": öffnet den Freigaben-Dialog mit diesem Record vorgesetzt. */
  onAddFreigaben?: () => void;
}

export function KiVorschlaegeDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  kiModelleList,
  onOpenKiModelle,
  arbeitskontexteList,
  onOpenArbeitskontexte,
  regelnList,
  onOpenRegeln,
  freigabenList,
  onOpenFreigaben,
  onAddFreigaben,
}: KiVorschlaegeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const modellTarget = kiModelleList.find(r => r.record_id === extractRecordId(record.fields.modell));
  const arbeitskontextTarget = arbeitskontexteList.find(r => r.record_id === extractRecordId(record.fields.arbeitskontext));
  const betroffene_regelTarget = regelnList.find(r => r.record_id === extractRecordId(record.fields.betroffene_regel));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ki_vorschlaege', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('ki_vorschlaege', 'inhalt')} value={record.fields.inhalt} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_vorschlaege', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_vorschlaege', 'status')} value={record.fields.status} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('ki_vorschlaege', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ki_vorschlaege', 'modell')}
          name={modellTarget?.fields.bezeichnung ?? '—'}
          meta={[modellTarget?.fields.anbieter, modellTarget?.fields.version].filter(Boolean).join(' · ') || undefined}
          onClick={modellTarget && onOpenKiModelle ? () => onOpenKiModelle!(modellTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ki_vorschlaege', 'arbeitskontext')}
          name={arbeitskontextTarget?.fields.aktueller_zustand ?? '—'}
          meta={undefined}
          onClick={arbeitskontextTarget && onOpenArbeitskontexte ? () => onOpenArbeitskontexte!(arbeitskontextTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ki_vorschlaege', 'betroffene_regel')}
          name={betroffene_regelTarget?.fields.bezeichnung ?? '—'}
          meta={undefined}
          onClick={betroffene_regelTarget && onOpenRegeln ? () => onOpenRegeln!(betroffene_regelTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('freigaben')}
        items={freigabenList.filter(r => extractRecordId(r.fields.vorschlag) === record.record_id)}
        map={r => ({ name: appLabel('freigaben'), meta: r.fields.entscheidungszeitpunkt })}
        onOpen={onOpenFreigaben}
        onAdd={onAddFreigaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.KI_VORSCHLAEGE} recordId={record.record_id} readOnly={!perms.canWrite('ki_vorschlaege')} />
    </>
  );
}
