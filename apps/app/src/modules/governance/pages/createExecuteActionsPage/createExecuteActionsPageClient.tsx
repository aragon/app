'use client';

import { useCallback, useMemo, useState } from 'react';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
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
    /**
     * Safe process context for submitting a DAO.execute transaction through Safe.
     */
    safeProcess?: {
        network: Network;
        safeAddress: string;
        daoAddress: string;
    };
}

export const CreateExecuteActionsPageClient: React.FC<
    ICreateExecuteActionsPageClientProps
> = (props) => {
    const { daoId, safeProcess } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    useExecutePermissionCheckGuard({
        checkWalletConnection: safeProcess != null,
        daoId,
        enabled: safeProcess == null,
    });

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
        plausibleAnalyticsUtils.track('wizard_submit', {
            flow: 'direct_execute_actions',
            actionCount: values.actions.length,
        });
        if (safeProcess != null) {
            open(SafeDialogId.NATIVE_TRANSACTION, {
                params: {
                    actions: values.actions,
                    daoAddress: safeProcess.daoAddress,
                    network: safeProcess.network,
                    prepareActions,
                    safeAddress: safeProcess.safeAddress,
                },
            });
            return;
        }

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
                analytics={{ flow: 'direct_execute_actions' }}
                defaultValues={{ actions: [] }}
                id={createExecuteActionsWizardId}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t(
                    safeProcess != null
                        ? 'app.governance.createExecuteActionsPage.safeSubmitLabel'
                        : 'app.governance.createExecuteActionsPage.submitLabel',
                )}
            >
                <CreateExecuteActionsForm.Provider value={contextValues}>
                    <CreateExecuteActionsPageClientSteps
                        daoId={daoId}
                        isSafeProcess={safeProcess != null}
                    />
                </CreateExecuteActionsForm.Provider>
            </WizardPage.Container>
        </Page.Main>
    );
};
