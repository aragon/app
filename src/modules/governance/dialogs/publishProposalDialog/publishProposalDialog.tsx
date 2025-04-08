import { IDaoPlugin, useDao } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { TransactionType } from '@/shared/api/transactionService';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type IBuildTransactionDialogSuccessLinkHref,
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
import { useAccount } from 'wagmi';
//import type { PrepareProposalActionMap } from '../../components/createProposalForm';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

export enum PublishProposalStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IProposalData {
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Short description of the proposal.
     */
    summary: string;
    /**
     * Long description of the proposal supporting HTML tags.
     */
    body?: string;
    /**
     * Defines if the user wants to add actions to the proposal or not.
     */
    addActions: boolean;
    /**
     * Resources of the proposal.
     */
    resources: IResourcesInputResource[];
    /**
     * List of actions to be executed if the proposal succeeds.
     */
    actions: ITransactionRequest[];
}

export interface IPublishProposalDialogParams {
    /**
     * data for publishing the proposal.
     */
    proposal: IProposalData;
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     *  Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    // /**
    //  * Partial map of action-type and prepare-action functions as not all actions require an async data preparation.
    //  */
    // prepareActions: PrepareProposalActionMap;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps<IPublishProposalDialogParams> {}

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'PublishProposalDialog: user must be connected.');

    const { daoId, plugin, proposal } = location.params;
    const { address: pluginAddress } = plugin;
    const { title, summary } = proposal;

    const { t } = useTranslations();
    const { setIsBlocked } = useBlockNavigationContext();

    const daoPlugin = useDaoPlugins({ daoId, pluginAddress })![0];
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const stepper = useStepper<ITransactionDialogStepMeta, PublishProposalStep | TransactionDialogStep>({
        initialActiveStep: PublishProposalStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishProposalDialogUtils.prepareMetadata(proposal);
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson, proposal],
    );

    const handlePrepareTransaction = async () => {
        invariant(pinJsonData != null, 'PublishProposalDialog: metadata not pinned for prepare transaction step.');
        const { IpfsHash: metadataCid } = pinJsonData;
        const { actions, addActions } = proposal;

        // We are always saving actions on the form so that user doesn't lose them if they navigate around the form.
        // So we use the addActions flag to determine if we should add actions to the proposal or not.
        const processedActions = addActions ? actions : [];
        const processedValues = { ...proposal, actions: processedActions };

        return publishProposalDialogUtils.buildTransaction({
            proposal: processedValues,
            metadataCid,
            plugin: daoPlugin.meta,
        });
    };

    // Handler function to disable the navigation block when the transaction is needed.
    // We can't simply just pass the href to the TransactionDialog
    const getProposalsLink = ({ slug }: IBuildTransactionDialogSuccessLinkHref) => {
        setIsBlocked(false);

        return `/dao/${daoId}/proposals/${slug!}`;
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
            successLink={{ label: t('app.governance.publishProposalDialog.button.success'), href: getProposalsLink }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao?.network}
            transactionType={TransactionType.PROPOSAL_CREATE}
            indexingFallbackUrl={`/dao/${daoId}/proposals`}
        >
            {plugin.subdomain !== 'admin' && (
                <ProposalDataListItem.Structure
                    title={title}
                    summary={summary}
                    publisher={{ address }}
                    status={ProposalStatus.DRAFT}
                />
            )}
        </TransactionDialog>
    );
};
