/**
 * Regel ändern — 3-Schritt-Wizard.
 * Steps: 1) Bestehende Regel wählen → 2) Bedingung, Wirkung und Stufe anpassen → 3) Als Entwurf speichern.
 * Reads: regeln (Vorgängerregel), nutzer (Verantwortlicher). Writes: regeln (neue Fassung, Status „Entwurf“, via useRegelAendernFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useRegelAendernFlow } from '@/lib/journey/flows/RegelAendern';
import { tx } from '@/i18n';

export default function RegelAendernPage() {
  const [step, setStep] = useState(1);
  const flow = useRegelAendernFlow({
    steps: {
      vorgaengerregel: 1,
      verantwortlicher: 2,
      bezeichnung: 2,
      beschreibung: 2,
      bedingung: 2,
      wirkung: 2,
      erforderliche_stufe: 2,
      regeltyp: 2,
    },
    items: {
      vorgaengerregel: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: [fieldLookup(r, 'regeltyp')?.label, fieldLookup(r, 'status')?.label].filter(Boolean).join(' · '),
      }),
      verantwortlicher: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldLookup(r, 'rolle')?.label,
      }),
    },
  });
  const f = flow.forms.regeln;
  const vorgaenger = flow.picks.vorgaengerregel;
  const vorgaengerPick = flow.pick('vorgaengerregel');

  // Neue Fassung startet mit den Werten der Vorgängerregel — nur leere Felder werden vorbelegt.
  const pickVorgaenger = (id: string) => {
    vorgaengerPick.onSelect(id);
    const rec = vorgaenger.recordOf(id);
    if (!rec) return;
    const text = ['bezeichnung', 'beschreibung', 'bedingung', 'wirkung'] as const;
    for (const k of text) {
      if (!f.get(k)) f.set(k, fieldText(rec, k));
    }
    const stufe = fieldLookup(rec, 'erforderliche_stufe')?.key;
    if (stufe && !f.get('erforderliche_stufe')) f.set('erforderliche_stufe', stufe);
    const typ = fieldLookup(rec, 'regeltyp')?.key;
    if (typ && !f.get('regeltyp')) f.set('regeltyp', typ);
  };

  return (
    <IntentWizardShell
      title={tx('Regel ändern')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Lege eine neue Fassung einer Regel als Entwurf an.'),
        needs: [tx('Die bestehende Regel'), tx('Die geänderte Bedingung und Wirkung')],
      }}
    >
      <WizardStep label={tx('Regel wählen')} description={tx('Welche bestehende Regel soll eine neue Fassung bekommen?')}>
        <EntitySelectStep
          {...vorgaenger.select}
          {...vorgaengerPick}
          onSelect={pickVorgaenger}
          searchPlaceholder={tx('Regel suchen …')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Anpassen')}
        description={tx('Bedingung, Wirkung und erforderliche Stufe der neuen Fassung festlegen.')}
        needs={['vorgaengerregel']}
      >
        <div className="space-y-4">
          <Bound form={f} name="bezeichnung" />
          <Bound form={f} name="regeltyp" />
          <Bound form={f} name="beschreibung" rows={3} />
          <Bound form={f} name="bedingung" rows={3} />
          <Bound form={f} name="wirkung" rows={3} />
          <Bound form={f} name="erforderliche_stufe" />
          <EntitySelectStep
            {...flow.picks.verantwortlicher.select}
            {...flow.pick('verantwortlicher')}
            searchPlaceholder={tx('Person suchen …')}
          />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Speichern')} description={tx('Prüfe die neue Fassung und lege sie als Entwurf an.')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Entwurf') }]}
            whatHappensNext={tx('Die neue Fassung bleibt Entwurf, bis eine Freigabe sie wirksam setzt.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Die Wirksamkeit entscheidet erst die Freigabe.')}
          next={[
            { label: tx('KI-Vorschlag erfassen'), href: '#/intents/ki-vorschlag-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
