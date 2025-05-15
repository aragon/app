import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import type { TransactionReceipt } from 'viem';
import { prepareDaoContractsUpdateDialogUtils } from './prepareDaoContractsUpdateDialogUtils';

export interface IPrepareDaoContractsUpdateDialogParams {
    /**
     * ID of the DAO to update the smart contracts for.
     */
    daoId: string;
    /**
     * Plugin to create the contracts-update proposal on.
     */
    plugin: IDaoPlugin;
}

export interface IPrepareDaoContractsUpdateProps
    extends IDialogComponentProps<IPrepareDaoContractsUpdateDialogParams> {}

export const PrepareDaoContractsUpdateDialog: React.FC<IPrepareDaoContractsUpdateProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    invariant(location.params != null, 'PrepareDaoContractsUpdateDialog: required parameters must be set.');
    const { daoId, plugin } = location.params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const pluginsUpdate = daoUtils.getAvailablePluginUpdates(dao);
    const { plugins: hasPluginsUpdate, osx: hasOsxUpdate } = daoUtils.hasAvailableUpdates(dao);

    invariant(dao != null, 'PrepareDaoContractsUpdateDialog: DAO must be defined.');

    const initialActiveStep = hasPluginsUpdate ? TransactionDialogStep.PREPARE : undefined;
    const stepper = useStepper<ITransactionDialogStepMeta>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        prepareDaoContractsUpdateDialogUtils.buildPrepareUpdatePluginsTransaction({ dao, plugins: pluginsUpdate });

    const handlePublishUpdateProposal = useCallback(
        (prepareUpdateReceipt?: TransactionReceipt) => {
            const getProposalParams = { dao, plugins: pluginsUpdate, osxUpdate: hasOsxUpdate, prepareUpdateReceipt };
            const proposal = prepareDaoContractsUpdateDialogUtils.getApplyUpdateProposal(getProposalParams);

            const translationNamespace = 'app.settings.publishDaoContractsUpdateDialog';
            const transactionInfo = hasPluginsUpdate
                ? { title: t(`${translationNamespace}.transactionInfoTitle`), current: 2, total: 2 }
                : undefined;

            const dialogParams: IPublishProposalDialogParams = {
                daoId,
                plugin,
                translationNamespace,
                transactionInfo,
                proposal,
            };
            open(GovernanceDialogId.PUBLISH_PROPOSAL, { params: dialogParams });
        },
        [t, plugin, dao, daoId, hasPluginsUpdate, pluginsUpdate, hasOsxUpdate, open],
    );

    // Open the publish-proposal dialog directly if DAO does not have available plugins updates.
    useEffect(() => {
        if (!hasPluginsUpdate) {
            handlePublishUpdateProposal();
        }
    }, [hasPluginsUpdate, handlePublishUpdateProposal]);

    const transactionInfoTitle = t('app.settings.prepareDaoContractsUpdateDialog.transactionInfoTitle');

    return (
        <TransactionDialog
            title={t('app.settings.prepareDaoContractsUpdateDialog.title')}
            description={t('app.settings.prepareDaoContractsUpdateDialog.description')}
            submitLabel={t('app.settings.prepareDaoContractsUpdateDialog.button.submit')}
            onSuccess={handlePublishUpdateProposal}
            transactionInfo={{ title: transactionInfoTitle, current: 1, total: 2 }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
        />
    );
};
