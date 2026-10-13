'use client';

import { type ReactNode, useMemo } from 'react';
import type { UseFormProps } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import {
    CreateWorkspaceForm,
    type ICreateWorkspaceFormData,
} from '../createWorkspaceForm';
import {
    buildWorkspaceWizardSteps,
    WorkspaceWizardStep,
} from './workspaceWizardDefinitions';

export interface IWorkspaceWizardProps {
    /**
     * Namespace of the wizard translations, holding `steps.{step}.{name,title,description}` and `submitLabel`, e.g.
     * `app.workspace.createWorkspacePage`.
     */
    translationNamespace: string;
    /**
     * Default values of the form, read once on mount.
     */
    defaultValues?: UseFormProps<ICreateWorkspaceFormData>['defaultValues'];
    /**
     * Step the wizard opens on, the first one when not set.
     */
    initialActiveStep?: WorkspaceWizardStep;
    /**
     * Product flow reported by the wizard analytics, e.g. `create_workspace`.
     */
    analyticsFlow: string;
    /**
     * Callback called with the form values when the last step is submitted.
     */
    onSubmit: (values: ICreateWorkspaceFormData) => void;
}

const stepContent: Record<WorkspaceWizardStep, ReactNode> = {
    [WorkspaceWizardStep.METADATA]: <CreateWorkspaceForm.Metadata />,
    [WorkspaceWizardStep.TARGETS]: <CreateWorkspaceForm.Targets />,
    [WorkspaceWizardStep.ACCOUNTS]: <CreateWorkspaceForm.Accounts />,
};

/**
 * Wizard of the workspace form, shared by the create and the edit flows, which only differ in their copy, default
 * values and submit action.
 */
export const WorkspaceWizard: React.FC<IWorkspaceWizardProps> = (props) => {
    const {
        translationNamespace,
        defaultValues,
        initialActiveStep,
        analyticsFlow,
        onSubmit,
    } = props;

    const { t } = useTranslations();

    const steps = useMemo(
        () =>
            buildWorkspaceWizardSteps(translationNamespace).map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [translationNamespace, t],
    );

    // The final step is named after the submit action.
    const submitLabel = t(`${translationNamespace}.submitLabel`);

    const handleSubmit = (values: ICreateWorkspaceFormData) => {
        plausibleAnalyticsUtils.track('wizard_submit', {
            flow: analyticsFlow,
            accounts: values.accounts.length,
            targets: values.targets.length,
            hasAvatar: values.avatar != null,
        });
        onSubmit(values);
    };

    return (
        <WizardPage.Container
            analytics={{ flow: analyticsFlow }}
            defaultValues={defaultValues}
            finalStep={submitLabel}
            initialActiveStep={initialActiveStep}
            initialSteps={steps}
            onSubmit={handleSubmit}
            submitLabel={submitLabel}
        >
            {steps.map((step) => (
                <WizardPage.Step
                    description={t(
                        `${translationNamespace}.steps.${step.id}.description`,
                    )}
                    key={step.id}
                    title={t(`${translationNamespace}.steps.${step.id}.title`)}
                    {...step}
                >
                    {stepContent[step.id]}
                </WizardPage.Step>
            ))}
        </WizardPage.Container>
    );
};
