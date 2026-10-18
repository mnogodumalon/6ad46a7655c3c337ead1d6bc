import type { Arbeitskontexte, Vorhaben, Nutzer, KiVorschlaege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface ArbeitskontexteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Arbeitskontexte;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „Nutzer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  nutzerList: Nutzer[];
  /** Klick auf die Nutzer-Relation → overlay.push auf dessen Detail. */
  onOpenNutzer?: (record: Nutzer) => void;
  /** N:1-Ziel „Arbeitskontexte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  arbeitskontexteList: Arbeitskontexte[];
  /** Klick auf die Arbeitskontexte-Relation → overlay.push auf dessen Detail. */
  onOpenArbeitskontexte?: (record: Arbeitskontexte) => void;
  /** 1:N „KI-Vorschläge" (arbeitskontext): VOLLE Liste — der Block filtert auf diesen Record. */
  kiVorschlaegeList: KiVorschlaege[];
  /** Zeilen-Klick → overlay.push auf das KiVorschlaege-Detail (nie der Edit-Dialog). */
  onOpenKiVorschlaege: (record: KiVorschlaege) => void;
  /** Kontextuelles „+": öffnet den KiVorschlaege-Dialog mit diesem Record vorgesetzt. */
  onAddKiVorschlaege?: () => void;
}

export function ArbeitskontexteDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  nutzerList,
  onOpenNutzer,
  arbeitskontexteList,
  onOpenArbeitskontexte,
  kiVorschlaegeList,
  onOpenKiVorschlaege,
  onAddKiVorschlaege,
}: ArbeitskontexteDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const erfasst_vonTarget = nutzerList.find(r => r.record_id === extractRecordId(record.fields.erfasst_von));
  const vorgaengerkontextTarget = arbeitskontexteList.find(r => r.record_id === extractRecordId(record.fields.vorgaengerkontext));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('arbeitskontexte', 'versionsnummer')} value={record.fields.versionsnummer} format="text" />
        <RecordField label={fieldLabel('arbeitskontexte', 'aktueller_zustand')} value={record.fields.aktueller_zustand} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('arbeitskontexte', 'verwendete_informationen')} value={record.fields.verwendete_informationen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('arbeitskontexte', 'annahmen')} value={record.fields.annahmen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('arbeitskontexte', 'gueltigkeitsstatus')} value={record.fields.gueltigkeitsstatus} format="pill" />
        <RecordField label={fieldLabel('arbeitskontexte', 'zeitpunkt')} value={record.fields.zeitpunkt} format="datetime" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('arbeitskontexte', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('arbeitskontexte', 'erfasst_von')}
          name={erfasst_vonTarget?.fields.vorname ?? '—'}
          meta={[erfasst_vonTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={erfasst_vonTarget && onOpenNutzer ? () => onOpenNutzer!(erfasst_vonTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('arbeitskontexte', 'vorgaengerkontext')}
          name={vorgaengerkontextTarget?.fields.aktueller_zustand ?? '—'}
          meta={undefined}
          onClick={vorgaengerkontextTarget && onOpenArbeitskontexte ? () => onOpenArbeitskontexte!(vorgaengerkontextTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ki_vorschlaege')}
        items={kiVorschlaegeList.filter(r => extractRecordId(r.fields.arbeitskontext) === record.record_id)}
        map={() => ({ name: appLabel('ki_vorschlaege'), meta: undefined })}
        onOpen={onOpenKiVorschlaege}
        onAdd={onAddKiVorschlaege}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ARBEITSKONTEXTE} recordId={record.record_id} readOnly={!perms.canWrite('arbeitskontexte')} />
    </>
  );
}
