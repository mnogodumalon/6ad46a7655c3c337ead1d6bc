/**
 * Arbeitskontext erfassen — 4-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Aktuell gültigen Vorgängerkontext anzeigen und übernehmen
 *        → 3) Zustand, Informationen und Annahmen eintragen → 4) Prüfen & speichern.
 * Reads: vorhaben, arbeitskontexte, nutzer. Writes: arbeitskontexte (via useArbeitskontextErfassenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, Field, StepNav, SummaryStep, SuccessStep.
 */
import { useRef, useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldNumber, fieldRef, fieldLookup, fieldDate, refFilter, combineFilters, useRecordCount } from '@/lib/journey';
import {
  useArbeitskontextErfassenFlow,
  type ArbeitskontextErfassenFlow,
} from '@/lib/journey/flows/ArbeitskontextErfassen';
import { tx } from '@/i18n';

export default function ArbeitskontextErfassenPage() {
  const [step, setStep] = useState(1);
  const flowRef = useRef<ArbeitskontextErfassenFlow | null>(null);

  // Versionsnummer des Vorgängerkontexts plus 1, beim ersten Kontext 1
  const nextVersion = (): number => {
    const flow = flowRef.current;
    if (!flow) return 1;
    const prevId = flow.forms.arbeitskontexte.get('vorgaengerkontext');
    const prev = typeof prevId === 'string' ? flow.picks.vorgaengerkontext.recordOf(prevId) : undefined;
    return (prev ? fieldNumber(prev, 'versionsnummer') ?? 0 : 0) + 1;
  };

  const flow = useArbeitskontextErfassenFlow({
    steps: {
      vorhaben: 1, vorgaengerkontext: 2, erfasst_von: 3,
      aktueller_zustand: 3, verwendete_informationen: 3, annahmen: 3,
      arbeitskontexte2: 99,
    },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'status')?.label,
      }),
      vorgaengerkontext: (r, ctx) => ({
        id: r.id,
        title: tx`Version ${fieldNumber(r, 'versionsnummer') ?? '?'} — ${fieldText(r, 'aktueller_zustand').slice(0, 80)}`,
        subtitle: [ctx.ref('vorhaben'), fieldDate(r, 'zeitpunkt')].filter(Boolean).join(' · '),
      }),
      erfasst_von: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldText(r, 'email'),
      }),
    },
    compute: { versionsnummer: () => nextVersion() },
  });
  flowRef.current = flow;

  const f = flow.forms.arbeitskontexte;
  const vorhabenId = typeof f.get('vorhaben') === 'string' ? (f.get('vorhaben') as string) : null;
  const kontextId = typeof f.get('vorgaengerkontext') === 'string' ? (f.get('vorgaengerkontext') as string) : null;
  const version = nextVersion();

  const vorgaenger = kontextId ? flow.picks.vorgaengerkontext.recordOf(kontextId) : undefined;
  const mismatch = vorgaenger && vorhabenId && fieldRef(vorgaenger, 'vorhaben') !== vorhabenId
    ? tx('Der gewählte Kontext gehört zu einem anderen Vorhaben.')
    : null;

  // Prüfung vor dem Schreiben: diese Versionsnummer darf für das Vorhaben noch nicht existieren
  const duplicates = useRecordCount(flow.port, 'arbeitskontexte', {
    filter: vorhabenId
      ? combineFilters(refFilter('vorhaben', vorhabenId), `r.v_versionsnummer == ${version}`)
      : undefined,
    where: r => fieldRef(r, 'vorhaben') === vorhabenId && fieldNumber(r, 'versionsnummer') === version,
    enabled: Boolean(vorhabenId && kontextId),
  });
  const isDuplicate = (duplicates.count ?? 0) > 0;

  return (
    <IntentWizardShell
      title={tx('Arbeitskontext erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte den neuen gültigen Zustand deines Vorhabens fest.'),
        needs: [tx('Vorhaben'), tx('Bisheriger Kontext'), tx('Aktueller Zustand')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Für welches Vorhaben hältst du einen neuen Kontext fest?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel des Vorhabens …')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Vorgängerkontext')}
        description={tx('Wähle den aktuell gültigen Kontext, auf dem der neue aufbaut.')}
        needs={['vorhaben']}
      >
        <EntitySelectStep
          {...flow.picks.vorgaengerkontext.select}
          {...flow.pick('vorgaengerkontext')}
          searchPlaceholder={tx('Zustand durchsuchen …')}
        />
        <StepNav
          onBack={() => setStep(1)}
          onNext={() => mismatch ?? flow.validateStep(2)}
          nextStepLabel={tx('Zustand erfassen')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Neuer Zustand')}
        description={tx('Beschreibe, wie es jetzt steht, worauf du dich stützt und was du annimmst.')}
        needs={['vorgaengerkontext']}
      >
        <div className="space-y-4">
          <p className="rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
            {tx`Der neue Kontext erhält die Versionsnummer ${version}; der bisherige gilt danach als überholt.`}
          </p>
          <Bound form={f} name="aktueller_zustand" rows={4} />
          <Bound form={f} name="verwendete_informationen" rows={3} />
          <Bound form={f} name="annahmen" rows={3} />
          <Field form={f} name="erfasst_von">
            <EntitySelectStep
              {...flow.picks.erfasst_von.select}
              {...flow.pick('erfasst_von')}
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

      <WizardStep label={tx('Prüfen')} description={tx('Alles richtig? Dann speichere den neuen Kontext.')}>
        {!flow.submit.done && (isDuplicate ? (
          <StepNav onBack={() => setStep(2)} nextDisabled>
            <p className="text-sm text-destructive">
              {tx('Diese Versionsnummer existiert für das Vorhaben bereits.')}
            </p>
          </StepNav>
        ) : (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'versionsnummer', label: tx('Versionsnummer'), value: String(version) }]}
            whatHappensNext={tx('Der neue Kontext gilt sofort; den bisherigen Kontext kannst du danach als überholt führen.')}
          />
        ))}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('KI-Vorschlag erfassen'), href: '#/intents/ki-vorschlag-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
