import type { Nutzer, Vorhaben, Regeln, Arbeitskontexte, Freigaben, Taetigkeiten, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface NutzerDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Nutzer;
  /** 1:N „Vorhaben" (verantwortlicher): VOLLE Liste — der Block filtert auf diesen Record. */
  vorhabenList: Vorhaben[];
  /** Zeilen-Klick → overlay.push auf das Vorhaben-Detail (nie der Edit-Dialog). */
  onOpenVorhaben: (record: Vorhaben) => void;
  /** Kontextuelles „+": öffnet den Vorhaben-Dialog mit diesem Record vorgesetzt. */
  onAddVorhaben?: () => void;
  /** 1:N „Regeln" (verantwortlicher): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
  /** 1:N „Arbeitskontexte" (erfasst_von): VOLLE Liste — der Block filtert auf diesen Record. */
  arbeitskontexteList: Arbeitskontexte[];
  /** Zeilen-Klick → overlay.push auf das Arbeitskontexte-Detail (nie der Edit-Dialog). */
  onOpenArbeitskontexte: (record: Arbeitskontexte) => void;
  /** Kontextuelles „+": öffnet den Arbeitskontexte-Dialog mit diesem Record vorgesetzt. */
  onAddArbeitskontexte?: () => void;
  /** 1:N „Freigaben" (entscheider): VOLLE Liste — der Block filtert auf diesen Record. */
  freigabenList: Freigaben[];
  /** Zeilen-Klick → overlay.push auf das Freigaben-Detail (nie der Edit-Dialog). */
  onOpenFreigaben: (record: Freigaben) => void;
  /** Kontextuelles „+": öffnet den Freigaben-Dialog mit diesem Record vorgesetzt. */
  onAddFreigaben?: () => void;
  /** 1:N „Tätigkeiten" (ausfuehrender): VOLLE Liste — der Block filtert auf diesen Record. */
  taetigkeitenList: Taetigkeiten[];
  /** Zeilen-Klick → overlay.push auf das Taetigkeiten-Detail (nie der Edit-Dialog). */
  onOpenTaetigkeiten: (record: Taetigkeiten) => void;
  /** Kontextuelles „+": öffnet den Taetigkeiten-Dialog mit diesem Record vorgesetzt. */
  onAddTaetigkeiten?: () => void;
  /** 1:N „Erfahrungen" (erfasst_von): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function NutzerDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  onAddVorhaben,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
  arbeitskontexteList,
  onOpenArbeitskontexte,
  onAddArbeitskontexte,
  freigabenList,
  onOpenFreigaben,
  onAddFreigaben,
  taetigkeitenList,
  onOpenTaetigkeiten,
  onAddTaetigkeiten,
  erfahrungenList,
  onOpenErfahrungen,
  onAddErfahrungen,
}: NutzerDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('nutzer', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('nutzer', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('nutzer', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('nutzer', 'rolle')} value={record.fields.rolle} format="pill" />
        <RecordField label={fieldLabel('nutzer', 'berechtigungsstufe')} value={record.fields.berechtigungsstufe} format="pill" />
        <RecordField label={fieldLabel('nutzer', 'aktiv')} value={record.fields.aktiv} format="bool" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('vorhaben')}
        items={vorhabenList.filter(r => extractRecordId(r.fields.verantwortlicher) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('vorhaben'), meta: r.fields.startdatum })}
        onOpen={onOpenVorhaben}
        onAdd={onAddVorhaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.verantwortlicher) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('regeln'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('arbeitskontexte')}
        items={arbeitskontexteList.filter(r => extractRecordId(r.fields.erfasst_von) === record.record_id)}
        map={r => ({ name: appLabel('arbeitskontexte'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenArbeitskontexte}
        onAdd={onAddArbeitskontexte}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('freigaben')}
        items={freigabenList.filter(r => extractRecordId(r.fields.entscheider) === record.record_id)}
        map={r => ({ name: appLabel('freigaben'), meta: r.fields.entscheidungszeitpunkt })}
        onOpen={onOpenFreigaben}
        onAdd={onAddFreigaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('taetigkeiten')}
        items={taetigkeitenList.filter(r => extractRecordId(r.fields.ausfuehrender) === record.record_id)}
        map={r => ({ name: appLabel('taetigkeiten'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenTaetigkeiten}
        onAdd={onAddTaetigkeiten}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.erfasst_von) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erfahrungen'), meta: undefined })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.NUTZER} recordId={record.record_id} readOnly={!perms.canWrite('nutzer')} />
    </>
  );
}
