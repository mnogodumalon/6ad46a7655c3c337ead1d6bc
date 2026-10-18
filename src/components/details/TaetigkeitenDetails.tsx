import type { Taetigkeiten, Vorhaben, Nutzer, Freigaben, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface TaetigkeitenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Taetigkeiten;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „Nutzer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  nutzerList: Nutzer[];
  /** Klick auf die Nutzer-Relation → overlay.push auf dessen Detail. */
  onOpenNutzer?: (record: Nutzer) => void;
  /** N:1-Ziel „Freigaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  freigabenList: Freigaben[];
  /** Klick auf die Freigaben-Relation → overlay.push auf dessen Detail. */
  onOpenFreigaben?: (record: Freigaben) => void;
  /** 1:N „Erfahrungen" (taetigkeit): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function TaetigkeitenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  nutzerList,
  onOpenNutzer,
  freigabenList,
  onOpenFreigaben,
  erfahrungenList,
  onOpenErfahrungen,
  onAddErfahrungen,
}: TaetigkeitenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const ausfuehrenderTarget = nutzerList.find(r => r.record_id === extractRecordId(record.fields.ausfuehrender));
  const freigabeTarget = freigabenList.find(r => r.record_id === extractRecordId(record.fields.freigabe));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('taetigkeiten', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('taetigkeiten', 'zeitpunkt')} value={record.fields.zeitpunkt} format="datetime" />
        <RecordField label={fieldLabel('taetigkeiten', 'aenderungen')} value={record.fields.aenderungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('taetigkeiten', 'ergebnis')} value={record.fields.ergebnis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('taetigkeiten', 'beobachtete_wirkung')} value={record.fields.beobachtete_wirkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('taetigkeiten', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('taetigkeiten', 'ausfuehrender')}
          name={ausfuehrenderTarget?.fields.vorname ?? '—'}
          meta={[ausfuehrenderTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={ausfuehrenderTarget && onOpenNutzer ? () => onOpenNutzer!(ausfuehrenderTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('taetigkeiten', 'freigabe')}
          name={freigabeTarget?.fields.begruendung ?? '—'}
          meta={undefined}
          onClick={freigabeTarget && onOpenFreigaben ? () => onOpenFreigaben!(freigabeTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.taetigkeit) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erfahrungen'), meta: undefined })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.TAETIGKEITEN} recordId={record.record_id} readOnly={!perms.canWrite('taetigkeiten')} />
    </>
  );
}
