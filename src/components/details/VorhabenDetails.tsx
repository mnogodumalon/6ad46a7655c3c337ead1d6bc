import type { Vorhaben, Nutzer, Arbeitskontexte, KiVorschlaege, Taetigkeiten, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VorhabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorhaben;
  /** N:1-Ziel „Nutzer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  nutzerList: Nutzer[];
  /** Klick auf die Nutzer-Relation → overlay.push auf dessen Detail. */
  onOpenNutzer?: (record: Nutzer) => void;
  /** 1:N „Arbeitskontexte" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  arbeitskontexteList: Arbeitskontexte[];
  /** Zeilen-Klick → overlay.push auf das Arbeitskontexte-Detail (nie der Edit-Dialog). */
  onOpenArbeitskontexte: (record: Arbeitskontexte) => void;
  /** Kontextuelles „+": öffnet den Arbeitskontexte-Dialog mit diesem Record vorgesetzt. */
  onAddArbeitskontexte?: () => void;
  /** 1:N „KI-Vorschläge" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  kiVorschlaegeList: KiVorschlaege[];
  /** Zeilen-Klick → overlay.push auf das KiVorschlaege-Detail (nie der Edit-Dialog). */
  onOpenKiVorschlaege: (record: KiVorschlaege) => void;
  /** Kontextuelles „+": öffnet den KiVorschlaege-Dialog mit diesem Record vorgesetzt. */
  onAddKiVorschlaege?: () => void;
  /** 1:N „Tätigkeiten" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  taetigkeitenList: Taetigkeiten[];
  /** Zeilen-Klick → overlay.push auf das Taetigkeiten-Detail (nie der Edit-Dialog). */
  onOpenTaetigkeiten: (record: Taetigkeiten) => void;
  /** Kontextuelles „+": öffnet den Taetigkeiten-Dialog mit diesem Record vorgesetzt. */
  onAddTaetigkeiten?: () => void;
  /** 1:N „Erfahrungen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function VorhabenDetails({
  record,
  nutzerList,
  onOpenNutzer,
  arbeitskontexteList,
  onOpenArbeitskontexte,
  onAddArbeitskontexte,
  kiVorschlaegeList,
  onOpenKiVorschlaege,
  onAddKiVorschlaege,
  taetigkeitenList,
  onOpenTaetigkeiten,
  onAddTaetigkeiten,
  erfahrungenList,
  onOpenErfahrungen,
  onAddErfahrungen,
}: VorhabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const verantwortlicherTarget = nutzerList.find(r => r.record_id === extractRecordId(record.fields.verantwortlicher));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorhaben', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'ausgangssituation')} value={record.fields.ausgangssituation} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'ziel')} value={record.fields.ziel} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'kontext')} value={record.fields.kontext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('vorhaben', 'startdatum')} value={record.fields.startdatum} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'enddatum')} value={record.fields.enddatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('vorhaben', 'verantwortlicher')}
          name={verantwortlicherTarget?.fields.vorname ?? '—'}
          meta={[verantwortlicherTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={verantwortlicherTarget && onOpenNutzer ? () => onOpenNutzer!(verantwortlicherTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('arbeitskontexte')}
        items={arbeitskontexteList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: appLabel('arbeitskontexte'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenArbeitskontexte}
        onAdd={onAddArbeitskontexte}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('ki_vorschlaege')}
        items={kiVorschlaegeList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={() => ({ name: appLabel('ki_vorschlaege'), meta: undefined })}
        onOpen={onOpenKiVorschlaege}
        onAdd={onAddKiVorschlaege}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('taetigkeiten')}
        items={taetigkeitenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: appLabel('taetigkeiten'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenTaetigkeiten}
        onAdd={onAddTaetigkeiten}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erfahrungen'), meta: undefined })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORHABEN} recordId={record.record_id} readOnly={!perms.canWrite('vorhaben')} />
    </>
  );
}
