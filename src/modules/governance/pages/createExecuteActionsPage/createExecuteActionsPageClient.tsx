'use client';

import { useCallback, useMemo, useState } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import type { IExecuteActionsFormData } from '../../components/createExecuteActionsForm';
import { CreateExecuteActionsForm } from '../../components/createExecuteActionsForm';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IExecuteActionsDialogParams } from '../../dialogs/executeActionsDialog';
import type {
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '../../dialogs/publishProposalDialog';
import { useExecutePermissionCheckGuard } from '../../hooks/useExecutePermissionCheckGuard';
import { CreateExecuteActionsPageClientSteps } from './createExecuteActionsPageClientSteps';
import {
    createExecuteActionsWizardId,
    createExecuteActionsWizardSteps,
} from './createExecuteActionsPageDefinitions';

export interface ICreateExecuteActionsPageClientProps {
    /**
     * ID of the DAO to execute actions on.
     */
    daoId: string;
}

export const CreateExecuteActionsPageClient: React.FC<
    ICreateExecuteActionsPageClientProps
> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    useExecutePermissionCheckGuard({ daoId });

    const [prepareActions, setPrepareActions] =
        useState<PrepareProposalActionMap>({});

    const addPrepareAction = useCallback(
        (type: string, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({
                ...current,
                [type]: prepareAction,
            })),
        [],
    );

    const contextValues = useMemo(
        () => ({ prepareActions, addPrepareAction }),
        [prepareActions, addPrepareAction],
    );

    const handleFormSubmit = (values: IExecuteActionsFormData) => {
        const params: IExecuteActionsDialogParams = {
            daoId,
            actions: values.actions,
            prepareActions,
        };
        open(GovernanceDialogId.EXECUTE_ACTIONS, { params });
    };

    const processedSteps = useMemo(
        () =>
            createExecuteActionsWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                defaultValues={{ actions: [] }}
                id={createExecuteActionsWizardId}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t(
                    'app.governance.createExecuteActionsPage.submitLabel',
                )}
            >
                <CreateExecuteActionsForm.Provider value={contextValues}>
                    <CreateExecuteActionsPageClientSteps daoId={daoId} />
                </CreateExecuteActionsForm.Provider>
            </WizardPage.Container>
        </Page.Main>
    );
};
