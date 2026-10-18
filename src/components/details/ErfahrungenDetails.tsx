import type { Erfahrungen, Taetigkeiten, Vorhaben, Nutzer } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface ErfahrungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Erfahrungen;
  /** N:1-Ziel „Taetigkeiten": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  taetigkeitenList: Taetigkeiten[];
  /** Klick auf die Taetigkeiten-Relation → overlay.push auf dessen Detail. */
  onOpenTaetigkeiten?: (record: Taetigkeiten) => void;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „Nutzer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  nutzerList: Nutzer[];
  /** Klick auf die Nutzer-Relation → overlay.push auf dessen Detail. */
  onOpenNutzer?: (record: Nutzer) => void;
}

export function ErfahrungenDetails({
  record,
  taetigkeitenList,
  onOpenTaetigkeiten,
  vorhabenList,
  onOpenVorhaben,
  nutzerList,
  onOpenNutzer,
}: ErfahrungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const taetigkeitTarget = taetigkeitenList.find(r => r.record_id === extractRecordId(record.fields.taetigkeit));
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const erfasst_vonTarget = nutzerList.find(r => r.record_id === extractRecordId(record.fields.erfasst_von));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('erfahrungen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('erfahrungen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erfahrungen', 'kategorie')} value={record.fields.kategorie} format="pill" />
        <RecordField label={fieldLabel('erfahrungen', 'wirkung')} value={record.fields.wirkung} format="pill" />
        <RecordField label={fieldLabel('erfahrungen', 'wiederverwendbar')} value={record.fields.wiederverwendbar} format="bool" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('erfahrungen', 'taetigkeit')}
          name={taetigkeitTarget?.fields.beschreibung ?? '—'}
          meta={undefined}
          onClick={taetigkeitTarget && onOpenTaetigkeiten ? () => onOpenTaetigkeiten!(taetigkeitTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erfahrungen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erfahrungen', 'erfasst_von')}
          name={erfasst_vonTarget?.fields.vorname ?? '—'}
          meta={[erfasst_vonTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={erfasst_vonTarget && onOpenNutzer ? () => onOpenNutzer!(erfasst_vonTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ERFAHRUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('erfahrungen')} />
    </>
  );
}
