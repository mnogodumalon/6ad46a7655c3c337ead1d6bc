import type { Regeln, Nutzer, KiVorschlaege, Freigaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface RegelnDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Regeln;
  /** N:1-Ziel „Nutzer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  nutzerList: Nutzer[];
  /** Klick auf die Nutzer-Relation → overlay.push auf dessen Detail. */
  onOpenNutzer?: (record: Nutzer) => void;
  /** N:1-Ziel „Regeln": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  regelnList: Regeln[];
  /** Klick auf die Regeln-Relation → overlay.push auf dessen Detail. */
  onOpenRegeln?: (record: Regeln) => void;
  /** 1:N „KI-Vorschläge" (betroffene_regel): VOLLE Liste — der Block filtert auf diesen Record. */
  kiVorschlaegeList: KiVorschlaege[];
  /** Zeilen-Klick → overlay.push auf das KiVorschlaege-Detail (nie der Edit-Dialog). */
  onOpenKiVorschlaege: (record: KiVorschlaege) => void;
  /** Kontextuelles „+": öffnet den KiVorschlaege-Dialog mit diesem Record vorgesetzt. */
  onAddKiVorschlaege?: () => void;
  /** 1:N „Freigaben" (angewendete_regel): VOLLE Liste — der Block filtert auf diesen Record. */
  freigabenList: Freigaben[];
  /** Zeilen-Klick → overlay.push auf das Freigaben-Detail (nie der Edit-Dialog). */
  onOpenFreigaben: (record: Freigaben) => void;
  /** Kontextuelles „+": öffnet den Freigaben-Dialog mit diesem Record vorgesetzt. */
  onAddFreigaben?: () => void;
}

export function RegelnDetails({
  record,
  nutzerList,
  onOpenNutzer,
  regelnList,
  onOpenRegeln,
  kiVorschlaegeList,
  onOpenKiVorschlaege,
  onAddKiVorschlaege,
  freigabenList,
  onOpenFreigaben,
  onAddFreigaben,
}: RegelnDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const verantwortlicherTarget = nutzerList.find(r => r.record_id === extractRecordId(record.fields.verantwortlicher));
  const vorgaengerregelTarget = regelnList.find(r => r.record_id === extractRecordId(record.fields.vorgaengerregel));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('regeln', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('regeln', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'regeltyp')} value={record.fields.regeltyp} format="pill" />
        <RecordField label={fieldLabel('regeln', 'bedingung')} value={record.fields.bedingung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'wirkung')} value={record.fields.wirkung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'erforderliche_stufe')} value={record.fields.erforderliche_stufe} format="pill" />
        <RecordField label={fieldLabel('regeln', 'gueltig_ab')} value={record.fields.gueltig_ab} format="date" />
        <RecordField label={fieldLabel('regeln', 'status')} value={record.fields.status} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('regeln', 'verantwortlicher')}
          name={verantwortlicherTarget?.fields.vorname ?? '—'}
          meta={[verantwortlicherTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={verantwortlicherTarget && onOpenNutzer ? () => onOpenNutzer!(verantwortlicherTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('regeln', 'vorgaengerregel')}
          name={vorgaengerregelTarget?.fields.bezeichnung ?? '—'}
          meta={undefined}
          onClick={vorgaengerregelTarget && onOpenRegeln ? () => onOpenRegeln!(vorgaengerregelTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ki_vorschlaege')}
        items={kiVorschlaegeList.filter(r => extractRecordId(r.fields.betroffene_regel) === record.record_id)}
        map={() => ({ name: appLabel('ki_vorschlaege'), meta: undefined })}
        onOpen={onOpenKiVorschlaege}
        onAdd={onAddKiVorschlaege}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('freigaben')}
        items={freigabenList.filter(r => extractRecordId(r.fields.angewendete_regel) === record.record_id)}
        map={r => ({ name: appLabel('freigaben'), meta: r.fields.entscheidungszeitpunkt })}
        onOpen={onOpenFreigaben}
        onAdd={onAddFreigaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.REGELN} recordId={record.record_id} readOnly={!perms.canWrite('regeln')} />
    </>
  );
}
