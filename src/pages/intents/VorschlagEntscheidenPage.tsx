/**
 * Vorschlag entscheiden — 5-Schritt-Wizard.
 * Steps: 1) Offenen Vorschlag wählen → 2) Gültige Regel wählen → 3) Entscheider & Regelprüfung →
 *        4) Entscheidung und Begründung → 5) Wirksam-ab optional setzen → Prüfen & festhalten.
 * Reads: ki_vorschlaege, regeln, nutzer. Writes: freigaben (create), ki_vorschlaege (status update).
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
import { useVorschlagEntscheidenFlow } from '@/lib/journey/flows/VorschlagEntscheiden';
import { tx } from '@/i18n';

export default function VorschlagEntscheidenPage() {
  const [step, setStep] = useState(1);
  const flow = useVorschlagEntscheidenFlow({
    steps: { ki_vorschlaege: 1, vorschlag: 1, angewendete_regel: 2, entscheider: 3, regelpruefung: 3, entscheidung: 4, begruendung: 4, wirksam_ab: 5 },
    items: {
      ki_vorschlaege: (r, ctx) => ({ id: r.id, title: fieldText(r, 'inhalt'), subtitle: [fieldLookup(r, 'art')?.label, ctx.ref('modell')].filter(Boolean).join(' · ') }),
      vorschlag: (r, ctx) => ({ id: r.id, title: fieldText(r, 'inhalt'), subtitle: [fieldLookup(r, 'art')?.label, ctx.ref('modell')].filter(Boolean).join(' · ') }),
      angewendete_regel: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: [fieldLookup(r, 'regeltyp')?.label, fieldLookup(r, 'erforderliche_stufe')?.label].filter(Boolean).join(' · '),
      }),
      entscheider: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: [fieldLookup(r, 'rolle')?.label, fieldLookup(r, 'berechtigungsstufe')?.label].filter(Boolean).join(' · '),
      }),
    },
    compute: {
      status: forms => {
        const e = forms.freigaben.get('entscheidung');
        if (e === 'freigegeben') return 'geprueft';
        if (e === 'abgelehnt') return 'abgelehnt';
        return 'vorgeschlagen';
      },
    },
  });

  const freigabe = flow.forms.freigaben;
  const entscheidung = freigabe.get('entscheidung');
  const neuerStatus =
    entscheidung === 'freigegeben' ? tx('Geprüft')
    : entscheidung === 'abgelehnt' ? tx('Abgelehnt')
    : tx('Unverändert (vorgeschlagen)');

  // One pick sets both: the proposal the decision is about and the record whose status changes.
  const pickVorschlag = flow.pick('ki_vorschlaege');
  const onPickVorschlag = (id: string) => {
    pickVorschlag.onSelect(id);
    freigabe.set('vorschlag', id, flow.picks.ki_vorschlaege.labelOf(id) ?? id);
  };

  return (
    <IntentWizardShell
      title={tx('Vorschlag entscheiden')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen KI-Vorschlag anhand einer gültigen Regel freigeben, ablehnen oder zurückstellen.'),
        needs: [tx('Offener Vorschlag'), tx('Anzuwendende Regel'), tx('Wer entscheidet')],
      }}
    >
      <WizardStep label={tx('Vorschlag')} description={tx('Welcher offene Vorschlag soll entschieden werden?')}>
        <EntitySelectStep
          {...flow.picks.ki_vorschlaege.select}
          selectedId={pickVorschlag.selectedId}
          onSelect={onPickVorschlag}
          searchPlaceholder={tx('Inhalt des Vorschlags suchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Regel')} description={tx('Anhand welcher gültigen Regel wird geprüft?')} needs={['vorschlag']}>
        <EntitySelectStep
          {...flow.picks.angewendete_regel.select}
          {...flow.pick('angewendete_regel')}
          searchPlaceholder={tx('Regel suchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Regelprüfung')} description={tx('Wer entscheidet, und ist die Regel erfüllt?')} needs={['angewendete_regel']}>
        <div className="space-y-6">
          <EntitySelectStep
            {...flow.picks.entscheider.select}
            {...flow.pick('entscheider')}
            searchPlaceholder={tx('Name suchen …')}
          />
          <Bound form={freigabe} name="regelpruefung" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Entscheidung')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Entscheidung')} description={tx('Wie wird entschieden — und warum?')} needs={['regelpruefung']}>
        <div className="space-y-6">
          <Bound form={freigabe} name="entscheidung" />
          <Bound form={freigabe} name="begruendung" rows={4} />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Wirksam ab')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Wirksam ab')} description={tx('Optional: ab wann gilt die Entscheidung?')} needs={['entscheidung']}>
        <div className="space-y-6">
          <Bound form={freigabe} name="wirksam_ab" hint={tx('Leer lassen, wenn die Entscheidung sofort gilt.')} />
          <StepNav
            onBack={() => setStep(4)}
            onNext={() => flow.validateStep(5)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'neuer_status', label: tx('Neuer Status des Vorschlags'), value: neuerStatus }]}
            whatHappensNext={tx('Die Freigabe wird mit dem heutigen Zeitpunkt festgehalten und der Status des Vorschlags angepasst.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Die ausgeführte Tätigkeit kannst du jetzt dokumentieren.')}
          next={[
            { label: tx('Tätigkeit dokumentieren'), href: '#/intents/taetigkeit-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
