'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useMemo } from 'react';
import { CreatePolicyWizardStep, createPolicyWizardSteps } from './createPolicyPageDefinitions';

export interface ICreatePolicyPageClientProps {}

export const CreatePolicyPageClient: React.FC<ICreatePolicyPageClientProps> = () => {
    const props = {};
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const handleFormSubmit = (values: any) => {
        // TODO: Implement form submission logic
        checkWalletConnection({
            onSuccess: () => {
                // TODO: Open appropriate dialog
                console.log('Form submitted:', values);
            },
        });
    };

    const [networkStep, metadataStep] = createPolicyWizardSteps;

    const processedSteps = useMemo(
        () =>
            createPolicyWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                finalStep={t('app.capitalFlow.createPolicyPage.finalStep')}
                submitLabel={t('app.capitalFlow.createPolicyPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
            >
                <WizardPage.Step
                    title={t(`app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.NETWORK}.title`)}
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.NETWORK}.description`,
                    )}
                    {...networkStep}
                >
                    {/* TODO: Add Network form component */}
                    <div>Network Step Content</div>
                </WizardPage.Step>
                <WizardPage.Step
                    title={t(`app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.title`)}
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.description`,
                    )}
                    {...metadataStep}
                >
                    {/* TODO: Add Metadata form component */}
                    <div>Metadata Step Content</div>
                </WizardPage.Step>
            </WizardPage.Container>
        </Page.Main>
    );
};
