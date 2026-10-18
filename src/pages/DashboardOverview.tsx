import { useMemo } from 'react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { lookupKey, formatDate } from '@/lib/formatters';
import { tx } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { KanbanWidget, type KanbanCard } from '@/components/widgets/KanbanWidget';
import { Button } from '@/components/ui/button';
import {
  IconAlertTriangle, IconBulb, IconGavel, IconPlus, IconScale, IconSparkles,
} from '@tabler/icons-react';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { vorhaben, kiModelle, regeln, arbeitskontexte, kiVorschlaege, freigaben, setVorhaben, setKiVorschlaege, fetchAll } = data;
  const clock = useClock();

  // ONE write path: Vorschlag vorgeschlagen -> geprüft (a proposal is never an execution)
  const advanceVorschlag = (id: string, label: string) => {
    const rec = kiVorschlaege.find(v => v.record_id === id);
    if (!rec) return;
    const prev = rec.fields.status;
    const set = (key: string) =>
      setKiVorschlaege(list => list.map(v => v.record_id === id ? { ...v, fields: { ...v.fields, status: lookupOption('ki_vorschlaege', 'status', key) } } : v));
    set('geprueft');
    LivingAppsService.updateKiVorschlaegeEntry(id, { status: 'geprueft' }).catch(() => fetchAll());
    undoToast(tx`${label} — als geprüft markiert`, () => {
      if (prev) set(prev.key);
      LivingAppsService.updateKiVorschlaegeEntry(id, { status: prev?.key ?? 'vorgeschlagen' }).catch(() => fetchAll());
    });
  };

  const rejectVorschlag = (id: string, label: string) => {
    const rec = kiVorschlaege.find(v => v.record_id === id);
    if (!rec) return;
    const prev = rec.fields.status;
    const set = (key: string) =>
      setKiVorschlaege(list => list.map(v => v.record_id === id ? { ...v, fields: { ...v.fields, status: lookupOption('ki_vorschlaege', 'status', key) } } : v));
    set('abgelehnt');
    LivingAppsService.updateKiVorschlaegeEntry(id, { status: 'abgelehnt' }).catch(() => fetchAll());
    undoToast(tx`${label} — abgelehnt`, () => {
      if (prev) set(prev.key);
      LivingAppsService.updateKiVorschlaegeEntry(id, { status: prev?.key ?? 'vorgeschlagen' }).catch(() => fetchAll());
    });
  };

  const crud = useEntityCrud(data, {
    footer: (top) =>
      top.type === 'kiVorschlaege' && lookupKey(top.record.fields.status) === 'vorgeschlagen'
        ? { label: tx('Als geprüft markieren'), onClick: () => advanceVorschlag(top.record.record_id, top.record.fields.art?.label ?? tx('Vorschlag')) }
        : undefined,
  });
  const enrichedVorhaben = crud.enriched.vorhaben;
  const enrichedRegeln = crud.enriched.regeln;
  const enrichedVorschlaege = crud.enriched.kiVorschlaege;
  const enrichedErfahrungen = crud.enriched.erfahrungen;

  const gesperrteModelle = useMemo(
    () => new Set(kiModelle.filter(m => lookupKey(m.fields.status) === 'gesperrt').map(m => m.record_id)),
    [kiModelle],
  );
  const modelOf = (v: { fields: { modell?: string } }) => extractRecordId(v.fields.modell);

  const offene = enrichedVorschlaege.filter(v => lookupKey(v.fields.status) === 'vorgeschlagen');
  const geprueft = enrichedVorschlaege.filter(v => lookupKey(v.fields.status) === 'geprueft');
  const freigabeVorschlagIds = new Set(freigaben.map(f => extractRecordId(f.fields.vorschlag)).filter(Boolean));
  const anstehend = geprueft.filter(v => !freigabeVorschlagIds.has(v.record_id));
  const gesperrtOffen = [...offene, ...geprueft].filter(v => {
    const m = modelOf(v);
    return !!m && gesperrteModelle.has(m);
  });
  const entwuerfe = enrichedRegeln.filter(r => lookupKey(r.fields.status) === 'entwurf');
  const gueltigeRegeln = regeln.filter(r => lookupKey(r.fields.status) === 'gueltig');
  const inBearbeitung = vorhaben.filter(v => lookupKey(v.fields.status) === 'in_bearbeitung');
  const aktuelleKontexte = arbeitskontexte.filter(k => lookupKey(k.fields.gueltigkeitsstatus) === 'aktuell_gueltig');
  const neueste = [...enrichedErfahrungen].sort((a, b) => String(b.createdat ?? '').localeCompare(String(a.createdat ?? '')));

  const columns = (LOOKUP_OPTIONS['vorhaben']?.['status'] ?? []).map(o => ({ key: o.key, label: o.label }));
  const cards: KanbanCard[] = [...enrichedVorhaben]
    .sort((a, b) => (a.fields.enddatum ?? '9999').localeCompare(b.fields.enddatum ?? '9999'))
    .map(v => ({
      id: `vorhaben:${v.record_id}`,
      column: lookupKey(v.fields.status) ?? '',
      title: v.fields.titel ?? '',
      subtitle: [v.verantwortlicherName, v.fields.enddatum ? formatDate(v.fields.enddatum) : ''].filter(Boolean).join(' · '),
    }));

  const onCardMove = (cardId: string, newColumn: string): string | void => {
    const id = cardId.split(':')[1];
    const rec = vorhaben.find(v => v.record_id === id);
    if (!rec) return;
    if (newColumn === 'abgeschlossen') {
      const offenFuer = offene.filter(v => extractRecordId(v.fields.vorhaben) === id).length;
      if (offenFuer > 0) return tx`Noch ${offenFuer} offene KI-Vorschläge — erst prüfen oder ablehnen.`;
    }
    const prev = rec.fields.status;
    const set = (key: string) =>
      setVorhaben(list => list.map(v => v.record_id === id ? { ...v, fields: { ...v.fields, status: lookupOption('vorhaben', 'status', key) } } : v));
    set(newColumn);
    LivingAppsService.updateVorhabenEntry(id, { status: newColumn }).catch(() => fetchAll());
    undoToast(tx`${rec.fields.titel ?? ''} verschoben`, () => {
      if (prev) set(prev.key);
      LivingAppsService.updateVorhabenEntry(id, { status: prev?.key ?? 'geplant' }).catch(() => fetchAll());
    });
  };

  const vorschlagTitle = (v: { fields: { art?: { label: string } }; vorhabenName: string }) =>
    `${v.fields.art?.label ?? tx('Vorschlag')} · ${v.vorhabenName}`;

  // context line — names in every branch
  const kontext = anstehend.length > 0
    ? tx`${namen(anstehend.map(v => v.vorhabenName))} wartet auf eine Freigabe.`
    : offene.length > 0
      ? tx`${namen(offene.map(v => v.vorhabenName))} hat neue KI-Vorschläge zur Prüfung.`
      : inBearbeitung.length > 0
        ? tx`Aktuell in Bearbeitung: ${namen(inBearbeitung.map(v => v.fields.titel ?? ''))}.`
        : tx`Keine offenen Vorschläge oder Freigaben — die Regeln gelten.`;

  const hero = gesperrtOffen.length > 0 ? (
    <HeroBanner
      icon={<IconAlertTriangle size={18} />}
      action={{ label: tx('Ablehnen'), onClick: () => gesperrtOffen.forEach(v => rejectVorschlag(v.record_id, vorschlagTitle(v))) }}
    >
      <b>{namen(gesperrtOffen.map(v => v.modellName))}</b> {tx('ist gesperrt, hat aber noch offene Vorschläge:')} {namen(gesperrtOffen.map(v => v.vorhabenName))}.
    </HeroBanner>
  ) : false;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{kontext}</p>
        </div>
        {crud.vorhaben.canWrite && (
          <Button onClick={() => crud.vorhaben.openCreate({ status: 'geplant' })}>
            <IconPlus size={16} className="shrink-0" />
            <span>{tx('Neues Vorhaben')}</span>
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={hero}
        kpis={
          <StatStrip>
            <StatStripItem title={tx('Offene Vorschläge')} value={offene.length} icon={<IconBulb size={16} />} tone={offene.length > 0 ? 'primary' : 'default'} />
            <StatStripItem title={tx('Anstehende Freigaben')} value={anstehend.length} icon={<IconGavel size={16} />} tone={anstehend.length > 0 ? 'warning' : 'default'} />
            <StatStripItem title={tx('Gültige Regeln')} value={`${gueltigeRegeln.length} / ${entwuerfe.length} ${tx('Entwurf')}`} icon={<IconScale size={16} />} />
            <StatStripItem title={tx('Aktuelle Kontexte')} value={aktuelleKontexte.length} icon={<IconSparkles size={16} />} />
          </StatStrip>
        }
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['abgebrochen']}
            onCardClick={c => {
              const rec = vorhaben.find(v => v.record_id === c.id.split(':')[1]);
              if (rec) crud.vorhaben.openDetail(rec);
            }}
            onCardMove={onCardMove}
            onAddCard={crud.vorhaben.canWrite ? col => crud.vorhaben.openCreate({ status: col }) : undefined}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Offene KI-Vorschläge')}
              icon={<IconBulb size={14} />}
              items={offene.map(v => {
                const gesperrt = gesperrteModelle.has(modelOf(v) ?? '');
                return {
                  id: v.record_id,
                  title: vorschlagTitle(v),
                  secondLine: (
                    <>
                      <span className={gesperrt ? 'font-medium text-destructive' : 'font-medium text-primary'}>
                        {gesperrt ? tx('Modell gesperrt') : tx('Vorgeschlagen')}
                      </span>
                      <span className="text-muted-foreground"> · {v.modellName}</span>
                    </>
                  ),
                  action: { label: tx('✓ Prüfen'), onClick: () => advanceVorschlag(v.record_id, vorschlagTitle(v)) },
                };
              })}
              onItemClick={id => { const r = kiVorschlaege.find(v => v.record_id === id); if (r) crud.kiVorschlaege.openDetail(r); }}
              empty={{ text: tx('Keine offenen Vorschläge.'), action: crud.kiVorschlaege.canWrite ? { label: tx('Vorschlag erfassen'), onClick: () => crud.kiVorschlaege.openCreate({ status: 'vorgeschlagen' }) } : undefined }}
            />
            <WorkList
              title={tx('Anstehende Freigaben')}
              icon={<IconGavel size={14} />}
              items={anstehend.map(v => ({
                id: v.record_id,
                title: vorschlagTitle(v),
                secondLine: (
                  <>
                    <span className="font-medium text-amber-600">{tx('Geprüft — noch nicht entschieden')}</span>
                    <span className="text-muted-foreground"> · {v.modellName}</span>
                  </>
                ),
                action: { label: tx('Entscheiden'), onClick: () => crud.freigaben.openCreate({ vorschlag: v.record_id }) },
              }))}
              onItemClick={id => { const r = kiVorschlaege.find(v => v.record_id === id); if (r) crud.kiVorschlaege.openDetail(r); }}
              empty={{ text: tx('Nichts wartet auf eine Entscheidung.') }}
            />
            <WorkList
              title={tx('Regeln im Entwurf')}
              icon={<IconScale size={14} />}
              items={entwuerfe.map(r => ({
                id: r.record_id,
                title: r.fields.bezeichnung ?? '',
                secondLine: (
                  <>
                    <span className="font-medium text-amber-600">{tx('Entwurf')}</span>
                    <span className="text-muted-foreground"> · {r.fields.erforderliche_stufe?.label ?? ''}</span>
                  </>
                ),
              }))}
              onItemClick={id => { const r = regeln.find(x => x.record_id === id); if (r) crud.regeln.openDetail(r); }}
              empty={{ text: tx('Keine Entwürfe — alle Regeln sind entschieden.') }}
            />
            <WorkList
              title={tx('Neueste Erfahrungen')}
              items={neueste.map(e => ({
                id: e.record_id,
                title: e.fields.titel ?? '',
                secondLine: (
                  <>
                    <span className="font-medium">{e.fields.wirkung?.label ?? ''}</span>
                    <span className="text-muted-foreground"> · {e.vorhabenName}</span>
                  </>
                ),
              }))}
              max={4}
              onItemClick={id => { const r = enrichedErfahrungen.find(x => x.record_id === id); if (r) crud.erfahrungen.openDetail(r); }}
              empty={{ text: tx('Noch keine Erfahrungen festgehalten.'), action: crud.erfahrungen.canWrite ? { label: tx('Erfahrung erfassen'), onClick: () => crud.erfahrungen.openCreate({}) } : undefined }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
