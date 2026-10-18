/**
 * KI-Vorschlag erfassen — 5-Schritt-Wizard + Prüfen.
 * Steps: 1) Vorhaben wählen → 2) Arbeitskontext wählen → 3) KI-Modell wählen → 4) Art, Inhalt, Begründung → 5) Betroffene Regel (optional) → Prüfen & anlegen.
 * Reads: vorhaben, arbeitskontexte, ki_modelle, regeln. Writes: ki_vorschlaege (Status fix „vorgeschlagen“, vom Hook gesetzt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldNumber } from '@/lib/journey';
import { useKiVorschlagErfassenFlow } from '@/lib/journey/flows/KiVorschlagErfassen';
import { tx } from '@/i18n';

export default function KiVorschlagErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useKiVorschlagErfassenFlow({
    steps: { vorhaben: 1, arbeitskontext: 2, modell: 3, art: 4, inhalt: 4, begruendung: 4, betroffene_regel: 5 },
    items: {
      vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel') }),
      arbeitskontext: (r, ctx) => ({
        id: r.id,
        title: tx`Version ${fieldNumber(r, 'versionsnummer') ?? '?'}`,
        subtitle: fieldText(r, 'aktueller_zustand') || ctx.ref('vorhaben'),
      }),
      modell: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: [fieldText(r, 'version'), fieldLookup(r, 'zuverlaessigkeit')?.label].filter(Boolean).join(' · '),
      }),
      betroffene_regel: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: fieldLookup(r, 'regeltyp')?.label,
      }),
    },
  });
  const f = flow.forms.ki_vorschlaege;

  return (
    <IntentWizardShell
      title={tx('KI-Vorschlag erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte einen KI-Vorschlag fest, ohne ihn auszuführen.'),
        needs: [tx('Vorhaben mit gültigem Arbeitskontext'), tx('KI-Modell im Einsatz'), tx('Inhalt des Vorschlags')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört der Vorschlag?')}>
        <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} searchPlaceholder={tx('Titel suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Arbeitskontext')} description={tx('Welcher aktuell gültige Arbeitskontext liegt zugrunde?')} needs={['vorhaben']}>
        <EntitySelectStep {...flow.picks.arbeitskontext.select} {...flow.pick('arbeitskontext')} />
      </WizardStep>
      <WizardStep label={tx('KI-Modell')} description={tx('Welches im Einsatz befindliche Modell hat den Vorschlag gemacht?')}>
        <EntitySelectStep {...flow.picks.modell.select} {...flow.pick('modell')} searchPlaceholder={tx('Modell suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Vorschlag')} description={tx('Art, Inhalt und Begründung des Vorschlags eintragen.')}>
        <div className="space-y-4">
          <Bound form={f} name="art" />
          <Bound form={f} name="inhalt" rows={5} />
          <Bound form={f} name="begruendung" rows={3} />
          <StepNav onNext={() => flow.validateStep(4)} onBack={() => setStep(3)} nextStepLabel={tx('Betroffene Regel')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Regel')} description={tx('Betrifft der Vorschlag eine Regel? Das ist optional.')}>
        <div className="space-y-4">
          <EntitySelectStep {...flow.picks.betroffene_regel.select} {...flow.pick('betroffene_regel')} searchPlaceholder={tx('Regel suchen …')} />
          <StepNav onNext={() => flow.validateStep(5)} onBack={() => setStep(4)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Vorgeschlagen') }]}
            whatHappensNext={tx('Der Vorschlag wird nur festgehalten. Ausgeführt wird er erst nach einer Entscheidung.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Als Nächstes kann der Vorschlag entschieden werden.')}
          next={[
            { label: tx('Vorschlag entscheiden'), href: '#/intents/vorschlag-entscheiden' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
