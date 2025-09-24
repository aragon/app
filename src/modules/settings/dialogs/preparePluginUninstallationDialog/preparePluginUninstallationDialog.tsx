import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import { preparePluginUninstallationDialogUtils } from './preparePluginUninstallationDialogUtils';

export interface IPreparePluginUninstallationDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin to be uninstalled.
     */
    uninstallPlugin: IDaoPlugin;
    /**
     * Plugin for creating the uninstall proposal.
     */
    proposalPlugin: IDaoPlugin;
}

export interface IPreparePluginUninstallationDialogProps
    extends IDialogComponentProps<IPreparePluginUninstallationDialogParams> {}

export const PreparePluginUninstallationDialog: React.FC<IPreparePluginUninstallationDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PreparePluginUninstallationDialog: required parameters must be set.');
    const { daoId, proposalPlugin } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'PreparePluginUninstallationDialog: user must be connected.');

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const initialStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep: initialStep });

    const handlePrepareTransaction = async () => {
        invariant(dao != null, 'PreparePluginUninstallationDialog: DAO not found.');
        const transaction = await preparePluginUninstallationDialogUtils.buildPrepareUninstallationTransaction();

        return transaction;
    };

    const handlePrepareUninstallationSuccess = (txReceipt: TransactionReceipt) => {
        invariant(dao != null, 'PreparePluginUninstallationDialog: DAO not found.');

        const setupData = preparePluginUninstallationDialogUtils.getPluginUninstallationSetupData(txReceipt);
        const proposalActions =
            preparePluginUninstallationDialogUtils.buildApplyUninstallationProposalActions(setupData);

        const proposalMetadata = preparePluginUninstallationDialogUtils.prepareApplyUninstallationProposalMetadata();
        const translationNamespace = 'app.settings.preparePluginUninstallationDialog.publishUninstallProposal';

        const txInfo = { title: t(`${translationNamespace}.transactionInfoTitle`), current: 2, total: 2 };
        const params: IPublishProposalDialogParams = {
            proposal: { ...proposalMetadata, resources: [], actions: proposalActions },
            daoId,
            plugin: proposalPlugin,
            translationNamespace,
            transactionInfo: txInfo,
        };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
    };

    return (
        <TransactionDialog
            title={t('app.settings.preparePluginUninstallationDialog.title')}
            description={t('app.settings.preparePluginUninstallationDialog.description')}
            submitLabel={t('app.settings.preparePluginUninstallationDialog.button.submit')}
            onSuccess={handlePrepareUninstallationSuccess}
            transactionInfo={{
                title: t('app.settings.preparePluginUninstallationDialog.transactionInfoTitle'),
                current: 1,
                total: 2,
            }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={dao?.network}
        />
    );
};
