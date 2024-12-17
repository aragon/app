import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant, ProposalDataListItem, ProposalStatus } from '@aragon/gov-ui-kit';
import { useCallback, useMemo } from 'react';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { ICreateProposalFormData, PrepareProposalActionMap } from '../../components/createProposalForm';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

export enum PublishProposalStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishProposalDialogParams {
    /**
     * Values of the create-proposal form.
     */
    values: ICreateProposalFormData;
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
    /**
     * Partial map of action-type and prepare-action functions as not all actions require an async data preparation.
     */
    prepareActions: PrepareProposalActionMap;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps<IPublishProposalDialogParams> {}

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'PublishProposalDialog: user must be connected.');

    const { daoId, pluginAddress, values, prepareActions } = location.params;
    const { title, summary } = values;

    const { t } = useTranslations();
    const { setIsBlocked } = useBlockNavigationContext();
    const daoPlugin = useDaoPlugins({ daoId, pluginAddress })![0];

    const stepper = useStepper<ITransactionDialogStepMeta, PublishProposalStep | TransactionDialogStep>({
        initialActiveStep: PublishProposalStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishProposalDialogUtils.prepareMetadata(values);
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson, values],
    );

    const handlePrepareTransaction = async () => {
        invariant(pinJsonData != null, 'PublishProposalDialog: metadata not pinned for prepare transaction step.');
        const { IpfsHash: metadataCid } = pinJsonData;
        const { actions } = values;

        const processedActions = await publishProposalDialogUtils.prepareActions({ actions, prepareActions });
        const processedValues = { ...values, actions: processedActions };

        return publishProposalDialogUtils.buildTransaction({
            values: processedValues,
            metadataCid,
            plugin: daoPlugin.meta,
        });
    };

    const getProposalLink = (txReceipt: TransactionReceipt) => {
        const { transactionHash } = txReceipt;

        setIsBlocked(false);

        const proposalId = publishProposalDialogUtils.getProposalId(txReceipt, address)!;
        const extendedProposalId = `${transactionHash}-${pluginAddress}-${proposalId}`;

        return `/dao/${daoId}/proposals/${extendedProposalId}`;
    };

    const customSteps: Array<ITransactionDialogStep<PublishProposalStep>> = useMemo(
        () => [
            {
                id: PublishProposalStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`app.governance.publishProposalDialog.step.${PublishProposalStep.PIN_METADATA}.label`),
                    errorLabel: t(
                        `app.governance.publishProposalDialog.step.${PublishProposalStep.PIN_METADATA}.errorLabel`,
                    ),
                    state: status,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ],
        [status, handlePinJson, t],
    );

    return (
        <TransactionDialog<PublishProposalStep>
            title={t('app.governance.publishProposalDialog.title')}
            description={t('app.governance.publishProposalDialog.description')}
            submitLabel={t('app.governance.publishProposalDialog.button.submit')}
            successLink={{ label: t('app.governance.publishProposalDialog.button.success'), href: getProposalLink }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
        >
            <ProposalDataListItem.Structure
                title={title}
                summary={summary}
                publisher={{ address }}
                status={ProposalStatus.DRAFT}
            />
        </TransactionDialog>
    );
};
