import type { KiModelle, KiVorschlaege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface KiModelleDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: KiModelle;
  /** 1:N „KI-Vorschläge" (modell): VOLLE Liste — der Block filtert auf diesen Record. */
  kiVorschlaegeList: KiVorschlaege[];
  /** Zeilen-Klick → overlay.push auf das KiVorschlaege-Detail (nie der Edit-Dialog). */
  onOpenKiVorschlaege: (record: KiVorschlaege) => void;
  /** Kontextuelles „+": öffnet den KiVorschlaege-Dialog mit diesem Record vorgesetzt. */
  onAddKiVorschlaege?: () => void;
}

export function KiModelleDetails({
  record,
  kiVorschlaegeList,
  onOpenKiVorschlaege,
  onAddKiVorschlaege,
}: KiModelleDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ki_modelle', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('ki_modelle', 'anbieter')} value={record.fields.anbieter} format="text" />
        <RecordField label={fieldLabel('ki_modelle', 'version')} value={record.fields.version} format="text" />
        <RecordField label={fieldLabel('ki_modelle', 'einsatzzweck')} value={record.fields.einsatzzweck} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_modelle', 'faehigkeiten_einschraenkungen')} value={record.fields.faehigkeiten_einschraenkungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_modelle', 'zuverlaessigkeit')} value={record.fields.zuverlaessigkeit} format="pill" />
        <RecordField label={fieldLabel('ki_modelle', 'status')} value={record.fields.status} format="pill" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ki_vorschlaege')}
        items={kiVorschlaegeList.filter(r => extractRecordId(r.fields.modell) === record.record_id)}
        map={() => ({ name: appLabel('ki_vorschlaege'), meta: undefined })}
        onOpen={onOpenKiVorschlaege}
        onAdd={onAddKiVorschlaege}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.KI_MODELLE} recordId={record.record_id} readOnly={!perms.canWrite('ki_modelle')} />
    </>
  );
}
