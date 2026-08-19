'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
    useMpcAcknowledgeRecovery,
    useMpcUpdatePolicy,
} from '@/modules/mpc/api/mpcService';
import { MpcAuthGate } from '@/modules/mpc/components/mpcAuthGate';
import {
    type IMpcCeremonyState,
    type IMpcCreateSystemFormData,
    MpcCreateSystemForm,
} from '@/modules/mpc/components/mpcCreateSystemForm';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import {
    defaultMpcPolicyFormData,
    formDataToPolicy,
} from '@/modules/mpc/components/mpcPolicyForm';
import {
    MPC_CREATE_PATH,
    MPC_SEPOLIA_CHAIN_ID,
    mpcSystemPath,
} from '@/modules/mpc/constants/mpcConstants';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import {
    MpcCreateWizardStep,
    mpcCreateWizardSteps,
} from './mpcCreatePageDefinitions';
import { useMpcKeyCeremony } from './useMpcKeyCeremony';

export interface IMpcCreatePageClientProps {}

const parseChainIds = (value: string) =>
    value
        .split(/[\s,;]+/)
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);

interface IMpcCreateCeremonyContentProps {
    /**
     * State of the ceremony.
     */
    state: IMpcCeremonyState;
    /**
     * Starts the ceremony with the current form values.
     */
    onStart: (values: IMpcCreateSystemFormData) => void;
}

// Rendered inside the wizard FormProvider: reads the collected values (name, passphrase, ...) to start the ceremony.
const MpcCreateCeremonyContent: React.FC<IMpcCreateCeremonyContentProps> = (
    props,
) => {
    const { state, onStart } = props;
    const { getValues } = useFormContext<IMpcCreateSystemFormData>();
    const handleStart = useCallback(
        () => onStart(getValues()),
        [onStart, getValues],
    );

    return <MpcCreateSystemForm.Ceremony onStart={handleStart} state={state} />;
};

const MpcCreateWizard: React.FC = () => {
    const { t } = useTranslations();
    const router = useRouter();

    const { state: ceremonyState, run: runCeremony } = useMpcKeyCeremony();
    const [submitError, setSubmitError] = useState<unknown>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutateAsync: updatePolicy } = useMpcUpdatePolicy();
    const { mutateAsync: acknowledgeRecovery } = useMpcAcknowledgeRecovery();

    const startCeremony = useCallback(
        (values: IMpcCreateSystemFormData) =>
            void runCeremony({
                name: values.name,
                description:
                    values.description.trim().length > 0
                        ? values.description.trim()
                        : undefined,
                chainIds: parseChainIds(values.chainIds),
                passphrase: values.passphrase,
            }),
        [runCeremony],
    );

    const handleFormSubmit = async (values: IMpcCreateSystemFormData) => {
        const systemId = ceremonyState.systemId;
        if (systemId == null || ceremonyState.status !== 'done') {
            return;
        }
        setIsSubmitting(true);
        setSubmitError(undefined);
        try {
            const urlParams = { systemId };
            await updatePolicy({
                urlParams,
                body: formDataToPolicy(values.policy),
            });
            // Nothing to acknowledge when the key was registered by a previous attempt (no share displayed).
            if (ceremonyState.recoveryShareText != null) {
                await acknowledgeRecovery({ urlParams });
            }
            router.push(mpcSystemPath(systemId));
        } catch (error: unknown) {
            setSubmitError(error);
            setIsSubmitting(false);
        }
    };

    const processedSteps = useMemo(
        () =>
            mpcCreateWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    const [detailsStep, passphraseStep, ceremonyStep, policyStep] =
        mpcCreateWizardSteps;
    const isCeremonyDone = ceremonyState.status === 'done';
    // Details are sent to the co-signer when the ceremony starts: lock them afterwards.
    const isCeremonyStarted = ceremonyState.systemId != null;

    const stepTexts = (step: MpcCreateWizardStep) => ({
        title: t(`app.mpc.mpcCreatePage.steps.${step}.title`),
        description: t(`app.mpc.mpcCreatePage.steps.${step}.description`),
    });

    return (
        <WizardPage.Container<IMpcCreateSystemFormData>
            defaultValues={{
                name: '',
                description: '',
                chainIds: MPC_SEPOLIA_CHAIN_ID.toString(),
                passphrase: '',
                confirmPassphrase: '',
                recoveryAcknowledged: false,
                policy: defaultMpcPolicyFormData(),
            }}
            finalStep={t('app.mpc.mpcCreatePage.finalStep')}
            initialSteps={processedSteps}
            onSubmit={handleFormSubmit}
            submitHelpText={t('app.mpc.mpcCreatePage.submitHelpText')}
            submitLabel={t('app.mpc.mpcCreatePage.submitLabel')}
        >
            <WizardPage.Step
                {...stepTexts(MpcCreateWizardStep.DETAILS)}
                {...detailsStep}
            >
                <MpcCreateSystemForm.Details disabled={isCeremonyStarted} />
            </WizardPage.Step>
            <WizardPage.Step
                {...stepTexts(MpcCreateWizardStep.PASSPHRASE)}
                {...passphraseStep}
            >
                <MpcCreateSystemForm.Passphrase disabled={isCeremonyDone} />
            </WizardPage.Step>
            <WizardPage.Step
                {...stepTexts(MpcCreateWizardStep.CEREMONY)}
                {...ceremonyStep}
                disableNext={!isCeremonyDone}
            >
                <MpcCreateCeremonyContent
                    onStart={startCeremony}
                    state={ceremonyState}
                />
            </WizardPage.Step>
            <WizardPage.Step
                {...stepTexts(MpcCreateWizardStep.POLICY)}
                {...policyStep}
                disableNext={isSubmitting}
            >
                <MpcCreateSystemForm.Policy />
                <MpcErrorAlert error={submitError} />
            </WizardPage.Step>
        </WizardPage.Container>
    );
};

export const MpcCreatePageClient: React.FC<IMpcCreatePageClientProps> = () => (
    <Page.Main fullWidth={true}>
        <MpcAuthGate redirectTo={MPC_CREATE_PATH}>
            <MpcCreateWizard />
        </MpcAuthGate>
    </Page.Main>
);
