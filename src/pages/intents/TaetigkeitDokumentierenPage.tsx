/**
 * Tätigkeit dokumentieren — 6-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Erteilte Freigabe wählen → 3) KI-Vorschlag wählen → 4) Ausführenden wählen
 *        → 5) Beschreibung, Änderungen, Ergebnis und Wirkung eintragen → 6) Prüfen & speichern.
 * Reads: vorhaben, freigaben, ki_vorschlaege, nutzer. Writes: taetigkeiten (create), ki_vorschlaege (status → ausgefuehrt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldDate } from '@/lib/journey';
import { useTaetigkeitDokumentierenFlow } from '@/lib/journey/flows/TaetigkeitDokumentieren';
import { tx } from '@/i18n';

export default function TaetigkeitDokumentierenPage() {
  const [step, setStep] = useState(1);
  const flow = useTaetigkeitDokumentierenFlow({
    steps: { vorhaben: 1, freigabe: 2, ki_vorschlaege: 3, ausfuehrender: 4, beschreibung: 5, aenderungen: 5, ergebnis: 5, beobachtete_wirkung: 5 },
    items: {
      vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel') }),
      freigabe: (r, ctx) => ({
        id: r.id,
        title: ctx.ref('vorschlag') ?? tx('Freigabe'),
        subtitle: [ctx.ref('angewendete_regel'), fieldDate(r, 'entscheidungszeitpunkt')].filter(Boolean).join(' · '),
      }),
      ausfuehrender: r => ({ id: r.id, title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(), subtitle: fieldText(r, 'email') }),
      ki_vorschlaege: r => ({ id: r.id, title: fieldText(r, 'inhalt'), subtitle: fieldText(r, 'begruendung') }),
    },
  });

  return (
    <IntentWizardShell
      title={tx('Tätigkeit dokumentieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte fest, was du zu einer erteilten Freigabe getan hast.'),
        needs: [tx('Vorhaben und Freigabe'), tx('Ergebnis der Tätigkeit')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört die Tätigkeit?')}>
        <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} searchPlaceholder={tx('Titel suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Freigabe')} description={tx('Welche erteilte Freigabe hast du umgesetzt?')} needs={['vorhaben']}>
        <EntitySelectStep {...flow.picks.freigabe.select} {...flow.pick('freigabe')} />
      </WizardStep>
      <WizardStep label={tx('Vorschlag')} description={tx('Welcher KI-Vorschlag wurde ausgeführt? Er wird als ausgeführt markiert.')}>
        <EntitySelectStep {...flow.picks.ki_vorschlaege.select} {...flow.pick('ki_vorschlaege')} searchPlaceholder={tx('Inhalt suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Ausführender')} description={tx('Wer hat die Tätigkeit ausgeführt?')}>
        <EntitySelectStep {...flow.picks.ausfuehrender.select} {...flow.pick('ausfuehrender')} avatar="initials" searchPlaceholder={tx('Name suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Details')} description={tx('Beschreibe die Tätigkeit, ihre Änderungen, das Ergebnis und die Wirkung.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.taetigkeiten} name="beschreibung" rows={4} />
          <Bound form={flow.forms.taetigkeiten} name="aenderungen" rows={3} />
          <Bound form={flow.forms.taetigkeiten} name="ergebnis" rows={3} />
          <Bound form={flow.forms.taetigkeiten} name="beobachtete_wirkung" rows={3} />
          <StepNav onBack={() => setStep(4)} onNext={() => flow.validateStep(5)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'zeitpunkt', label: tx('Zeitpunkt'), value: tx('Jetzt') },
              { key: 'status', label: tx('Status des Vorschlags'), value: tx('Ausgeführt') },
            ]}
            whatHappensNext={tx('Die Tätigkeit wird gespeichert und der Vorschlag als ausgeführt markiert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Erfahrung festhalten'), href: '#/intents/erfahrung-festhalten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Halte als Nächstes fest, was du aus der Tätigkeit gelernt hast.')}
        />
      )}
    </IntentWizardShell>
  );
}
