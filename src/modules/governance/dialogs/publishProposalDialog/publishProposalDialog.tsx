import { useDao } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { TransactionType } from '@/shared/api/transactionService';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
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
import type { IPublishProposalDialogProps } from './publishProposalDialog.api';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

export enum PublishProposalStep {
    PIN_METADATA = 'PIN_METADATA',
}

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'PublishProposalDialog: user must be connected.');

    const { daoId, plugin, proposal, prepareActions } = location.params;
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

        const { actions } = proposal;

        const processedActions = await publishProposalDialogUtils.prepareActions({ actions, prepareActions });
        const processedProposal = { ...proposal, actions: processedActions };

        return publishProposalDialogUtils.buildTransaction({
            proposal: processedProposal,
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
