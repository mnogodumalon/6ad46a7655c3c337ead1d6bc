/**
 * Erfahrung festhalten — 3-Schritt-Wizard + Prüfen.
 * Steps: 1) Tätigkeit wählen → 2) Titel, Beschreibung, Kategorie, Wirkung → 3) Wiederverwendbarkeit & Erfasser → 4) Prüfen & anlegen.
 * Reads: taetigkeiten (Beschreibung, Ergebnis, beobachtete Wirkung), nutzer. Writes: erfahrungen (via useErfahrungFesthaltenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useErfahrungFesthaltenFlow } from '@/lib/journey/flows/ErfahrungFesthalten';
import { tx } from '@/i18n';

export default function ErfahrungFesthaltenPage() {
  const [step, setStep] = useState(1);
  const flow = useErfahrungFesthaltenFlow({
    steps: { taetigkeit: 1, titel: 2, beschreibung: 2, kategorie: 2, wirkung: 2, erfasst_von: 3, wiederverwendbar: 3 },
    items: {
      taetigkeit: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'beschreibung') || tx('Ohne Beschreibung'),
        subtitle: ctx.ref('vorhaben'),
      }),
    },
  });

  const form = flow.forms.erfahrungen;
  const taetigkeitId = form.get('taetigkeit') as string | undefined;
  const taetigkeit = taetigkeitId ? flow.picks.taetigkeit.recordOf(taetigkeitId) : undefined;
  const ergebnis = taetigkeit ? fieldText(taetigkeit, 'ergebnis') : '';
  const wirkung = taetigkeit ? fieldText(taetigkeit, 'beobachtete_wirkung') : '';

  return (
    <IntentWizardShell
      title={tx('Erfahrung festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte fest, was du aus einer Tätigkeit gelernt hast.'),
        needs: [tx('Eine dokumentierte Tätigkeit'), tx('Ein kurzer Titel und deine Beschreibung')],
      }}
    >
      <WizardStep label={tx('Tätigkeit')} description={tx('Aus welcher Tätigkeit stammt die Erfahrung?')}>
        <EntitySelectStep
          {...flow.picks.taetigkeit.select}
          {...flow.pick('taetigkeit')}
          searchPlaceholder={tx('Tätigkeit suchen …')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Erfahrung')}
        description={tx('Beschreibe, was du gelernt hast, und ordne es ein.')}
        needs={['taetigkeit']}
      >
        <div className="space-y-4">
          {(ergebnis || wirkung) && (
            <div className="rounded-2xl bg-secondary p-4 text-sm space-y-2 overflow-hidden">
              {ergebnis && (
                <p className="min-w-0">
                  <span className="font-medium">{tx('Ergebnis der Tätigkeit')}: </span>
                  <span className="text-muted-foreground line-clamp-3">{ergebnis}</span>
                </p>
              )}
              {wirkung && (
                <p className="min-w-0">
                  <span className="font-medium">{tx('Beobachtete Wirkung')}: </span>
                  <span className="text-muted-foreground line-clamp-3">{wirkung}</span>
                </p>
              )}
            </div>
          )}
          <Bound form={form} name="titel" />
          <Bound form={form} name="beschreibung" rows={4} />
          <Bound form={form} name="kategorie" allowClear />
          <Bound form={form} name="wirkung" allowClear />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Wiederverwendbarkeit')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Wiederverwendbarkeit')}
        description={tx('Lässt sich die Erfahrung auch anderswo nutzen? Wer hält sie fest?')}
      >
        <div className="space-y-4">
          <Bound form={form} name="wiederverwendbar" />
          <Field form={form} name="erfasst_von">
            <EntitySelectStep
              {...flow.picks.erfasst_von.select}
              {...flow.pick('erfasst_von')}
              avatar="initials"
              searchPlaceholder={tx('Name suchen …')}
            />
          </Field>
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Erfahrung wird mit Tätigkeit und Erfasser verknüpft gespeichert.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Tätigkeit dokumentieren'), href: '#/intents/taetigkeit-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
