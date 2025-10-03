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
import { type IPluginUninstallSetupData, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { invariant } from '@aragon/gov-ui-kit';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { IUninstallPluginAlertDialogParams } from '../uninstallPluginAlertDialog';
import { preparePluginUninstallationDialogUtils } from './preparePluginUninstallationDialogUtils';

export interface IPreparePluginUninstallationDialogParams extends IUninstallPluginAlertDialogParams {
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
    const { daoId, uninstallPlugin, proposalPlugin, uninstallationPreparedEventLog } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'PreparePluginUninstallationDialog: user must be connected.');

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const initialStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep: initialStep });

    const handlePrepareTransaction = async () => {
        invariant(dao != null, 'PreparePluginUninstallationDialog: DAO not found.');

        if (uninstallationPreparedEventLog) {
            const { pluginAddress, pluginSetupRepo, permissions, build, release } = uninstallationPreparedEventLog;
            const setupData: IPluginUninstallSetupData = {
                pluginSetupRepo,
                pluginAddress,
                permissions,
                versionTag: {
                    build: Number(build),
                    release: Number(release),
                },
            };
            console.log('setupDatasetupData', setupData, uninstallationPreparedEventLog);
            openProposalPublishDialog(setupData);
            return;
        }

        const transaction = await preparePluginUninstallationDialogUtils.buildPrepareUninstallationTransaction(
            dao,
            uninstallPlugin,
        );

        return transaction;
    };

    const handlePrepareUninstallationSuccess = (txReceipt: TransactionReceipt) => {
        const setupData = pluginTransactionUtils.getPluginUninstallSetupData(txReceipt);
        console.log('setupData', setupData, txReceipt);
        openProposalPublishDialog(setupData);
    };

    const openProposalPublishDialog = (setupData: IPluginUninstallSetupData) => {
        invariant(dao != null, 'PreparePluginUninstallationDialog: DAO not found.');

        const proposalActions = pluginTransactionUtils.buildApplyPluginUninstallationAction({ dao, setupData });

        const proposalMetadata = preparePluginUninstallationDialogUtils.prepareApplyUninstallationProposalMetadata(
            uninstallPlugin,
            proposalPlugin,
        );
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
