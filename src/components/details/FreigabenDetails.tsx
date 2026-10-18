import type { Freigaben, Nutzer, KiVorschlaege, Regeln, Taetigkeiten } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface FreigabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Freigaben;
  /** N:1-Ziel „Nutzer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  nutzerList: Nutzer[];
  /** Klick auf die Nutzer-Relation → overlay.push auf dessen Detail. */
  onOpenNutzer?: (record: Nutzer) => void;
  /** N:1-Ziel „KiVorschlaege": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  kiVorschlaegeList: KiVorschlaege[];
  /** Klick auf die KiVorschlaege-Relation → overlay.push auf dessen Detail. */
  onOpenKiVorschlaege?: (record: KiVorschlaege) => void;
  /** N:1-Ziel „Regeln": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  regelnList: Regeln[];
  /** Klick auf die Regeln-Relation → overlay.push auf dessen Detail. */
  onOpenRegeln?: (record: Regeln) => void;
  /** 1:N „Tätigkeiten" (freigabe): VOLLE Liste — der Block filtert auf diesen Record. */
  taetigkeitenList: Taetigkeiten[];
  /** Zeilen-Klick → overlay.push auf das Taetigkeiten-Detail (nie der Edit-Dialog). */
  onOpenTaetigkeiten: (record: Taetigkeiten) => void;
  /** Kontextuelles „+": öffnet den Taetigkeiten-Dialog mit diesem Record vorgesetzt. */
  onAddTaetigkeiten?: () => void;
}

export function FreigabenDetails({
  record,
  nutzerList,
  onOpenNutzer,
  kiVorschlaegeList,
  onOpenKiVorschlaege,
  regelnList,
  onOpenRegeln,
  taetigkeitenList,
  onOpenTaetigkeiten,
  onAddTaetigkeiten,
}: FreigabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const entscheiderTarget = nutzerList.find(r => r.record_id === extractRecordId(record.fields.entscheider));
  const vorschlagTarget = kiVorschlaegeList.find(r => r.record_id === extractRecordId(record.fields.vorschlag));
  const angewendete_regelTarget = regelnList.find(r => r.record_id === extractRecordId(record.fields.angewendete_regel));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('freigaben', 'regelpruefung')} value={record.fields.regelpruefung} format="pill" />
        <RecordField label={fieldLabel('freigaben', 'entscheidung')} value={record.fields.entscheidung} format="pill" />
        <RecordField label={fieldLabel('freigaben', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('freigaben', 'entscheidungszeitpunkt')} value={record.fields.entscheidungszeitpunkt} format="datetime" />
        <RecordField label={fieldLabel('freigaben', 'wirksam_ab')} value={record.fields.wirksam_ab} format="datetime" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('freigaben', 'entscheider')}
          name={entscheiderTarget?.fields.vorname ?? '—'}
          meta={[entscheiderTarget?.fields.email].filter(Boolean).join(' · ') || undefined}
          onClick={entscheiderTarget && onOpenNutzer ? () => onOpenNutzer!(entscheiderTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('freigaben', 'vorschlag')}
          name={vorschlagTarget?.fields.inhalt ?? '—'}
          meta={undefined}
          onClick={vorschlagTarget && onOpenKiVorschlaege ? () => onOpenKiVorschlaege!(vorschlagTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('freigaben', 'angewendete_regel')}
          name={angewendete_regelTarget?.fields.bezeichnung ?? '—'}
          meta={undefined}
          onClick={angewendete_regelTarget && onOpenRegeln ? () => onOpenRegeln!(angewendete_regelTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('taetigkeiten')}
        items={taetigkeitenList.filter(r => extractRecordId(r.fields.freigabe) === record.record_id)}
        map={r => ({ name: appLabel('taetigkeiten'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenTaetigkeiten}
        onAdd={onAddTaetigkeiten}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.FREIGABEN} recordId={record.record_id} readOnly={!perms.canWrite('freigaben')} />
    </>
  );
}
