'use client';

import { useCallback, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
    CreateExecuteActionsForm,
    type IExecuteActionsFormData,
} from '@/modules/governance/components/createExecuteActionsForm';
import { ProposalActionsEditor } from '@/modules/governance/components/proposalActionsEditor';
import type {
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '@/modules/governance/dialogs/publishProposalDialog';
import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { SafeDialogId } from '../../constants/safeDialogId';
import type { ISafeCreateTransactionDialogParams } from '../../dialogs/safeCreateTransactionDialog';
import {
    SafeCreateTransactionWizardStep,
    safeCreateTransactionWizardId,
    safeCreateTransactionWizardSteps,
} from './safeCreateTransactionWizardDefinitions';

export interface ISafeCreateTransactionWizardProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe to create the transaction on.
     */
    safeAddress: string;
    /**
     * Called once the transaction is created and its dialog is left.
     */
    onCreated?: () => void;
}

const translationKey = 'app.safe.safeCreateTransactionWizard';

const analyticsFlow = 'safe_create_transaction';

interface ISafeCreateTransactionWizardActionsStepProps {
    /**
     * Network the actions are composed for.
     */
    network: Network;
}

/**
 * Actions step of the wizard. A component of its own, as watching the actions needs the form the wizard provides.
 */
const SafeCreateTransactionWizardActionsStep: React.FC<
    ISafeCreateTransactionWizardActionsStepProps
> = (props) => {
    const { network } = props;

    const { t } = useTranslations();
    const actions = useWatch<
        Record<string, IExecuteActionsFormData['actions']>
    >({ name: 'actions' });
    const [actionsStep] = safeCreateTransactionWizardSteps;

    return (
        <WizardPage.Step
            description={t(
                `${translationKey}.steps.${SafeCreateTransactionWizardStep.ACTIONS}.description`,
            )}
            disableNext={actions?.length ? undefined : true}
            title={t(
                `${translationKey}.steps.${SafeCreateTransactionWizardStep.ACTIONS}.title`,
            )}
            {...actionsStep}
        >
            {/* Without a DAO the composer offers the actions any account can run: contract calls and raw calldata. */}
            <ProposalActionsEditor network={network} />
        </WizardPage.Step>
    );
};

/**
 * Full-page wizard creating a transaction directly on a Safe, with no DAO involved: the owner composes actions, then
 * reviews, signs and proposes the Safe transaction they make up. Simulation is not offered before creation; the
 * created transaction is simulated from the transactions list.
 */
export const SafeCreateTransactionWizard: React.FC<
    ISafeCreateTransactionWizardProps
> = (props) => {
    const { network, safeAddress, onCreated } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

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
        const params: ISafeCreateTransactionDialogParams = {
            network,
            safeAddress,
            actions: values.actions,
            prepareActions,
            onCreated,
        };
        plausibleAnalyticsUtils.track('wizard_submit', {
            flow: analyticsFlow,
            actionCount: values.actions.length,
        });
        open(SafeDialogId.CREATE_TRANSACTION, { params });
    };

    const processedSteps = useMemo(
        () =>
            safeCreateTransactionWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                analytics={{ flow: analyticsFlow }}
                defaultValues={{ actions: [] }}
                id={safeCreateTransactionWizardId}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t(`${translationKey}.submitLabel`)}
            >
                <CreateExecuteActionsForm.Provider value={contextValues}>
                    <SafeCreateTransactionWizardActionsStep network={network} />
                </CreateExecuteActionsForm.Provider>
            </WizardPage.Container>
        </Page.Main>
    );
};
