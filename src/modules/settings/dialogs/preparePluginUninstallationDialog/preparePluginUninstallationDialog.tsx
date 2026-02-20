import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useRef } from 'react';
import type { TransactionReceipt } from 'viem';
import { useConnection } from 'wagmi';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import {
    type IPluginUninstallSetupData,
    pluginTransactionUtils,
} from '@/shared/utils/pluginTransactionUtils';
import type { IUninstallPluginAlertDialogParams } from '../uninstallPluginAlertDialog';
import { preparePluginUninstallationDialogUtils } from './preparePluginUninstallationDialogUtils';

export interface IPreparePluginUninstallationDialogParams
    extends IUninstallPluginAlertDialogParams {
    /**
     * Plugin for creating the uninstall proposal.
     */
    proposalPlugin: IDaoPlugin;
}

export interface IPreparePluginUninstallationDialogProps
    extends IDialogComponentProps<IPreparePluginUninstallationDialogParams> {}

export const PreparePluginUninstallationDialog: React.FC<
    IPreparePluginUninstallationDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'PreparePluginUninstallationDialog: required parameters must be set.',
    );
    const {
        daoId,
        uninstallPlugin,
        proposalPlugin,
        uninstallationPreparedEventLog,
    } = location.params;

    const { address } = useConnection();
    invariant(
        address != null,
        'PreparePluginUninstallationDialog: user must be connected.',
    );

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const hasProposalDialogBeenOpened = useRef(false);

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const initialStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: initialStep });

    const handlePrepareTransaction = async () => {
        invariant(
            dao != null,
            'PreparePluginUninstallationDialog: DAO not found.',
        );

        const transaction =
            await preparePluginUninstallationDialogUtils.buildPrepareUninstallationTransaction(
                dao,
                uninstallPlugin,
            );

        return transaction;
    };

    const handlePrepareUninstallationSuccess = (
        txReceipt: TransactionReceipt,
    ) => {
        const setupData =
            pluginTransactionUtils.getPluginUninstallSetupData(txReceipt);
        openProposalPublishDialog(setupData);
    };

    const openProposalPublishDialog = useCallback(
        (setupData: IPluginUninstallSetupData) => {
            invariant(
                dao != null,
                'PreparePluginUninstallationDialog: DAO not found.',
            );

            const proposalActions =
                pluginTransactionUtils.buildApplyPluginUninstallationAction({
                    dao,
                    setupData,
                });

            const proposalMetadata =
                preparePluginUninstallationDialogUtils.prepareApplyUninstallationProposalMetadata(
                    uninstallPlugin,
                    proposalPlugin,
                );
            const translationNamespace =
                'app.settings.preparePluginUninstallationDialog.publishUninstallProposal';

            const txInfo = {
                title: t(`${translationNamespace}.transactionInfoTitle`),
                current: 2,
                total: 2,
            };
            const params: IPublishProposalDialogParams = {
                proposal: {
                    ...proposalMetadata,
                    resources: [],
                    actions: proposalActions,
                },
                daoId,
                plugin: proposalPlugin,
                translationNamespace,
                transactionInfo: txInfo,
            };

            open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
            hasProposalDialogBeenOpened.current = true;
        },
        [dao, daoId, open, proposalPlugin, t, uninstallPlugin],
    );

    useEffect(() => {
        if (
            uninstallationPreparedEventLog &&
            !hasProposalDialogBeenOpened.current
        ) {
            const {
                pluginAddress,
                pluginSetupRepo,
                permissions,
                build,
                release,
            } = uninstallationPreparedEventLog;
            const setupPayload = { plugin: pluginAddress };
            const setupData: IPluginUninstallSetupData = {
                pluginSetupRepo,
                pluginAddress,
                permissions,
                setupPayload,
                versionTag: {
                    build: Number(build),
                    release: Number(release),
                },
            };
            openProposalPublishDialog(setupData);
        }
    }, [openProposalPublishDialog, uninstallationPreparedEventLog]);

    if (uninstallationPreparedEventLog) {
        return null;
    }

    return (
        <TransactionDialog
            description={t(
                'app.settings.preparePluginUninstallationDialog.description',
            )}
            network={dao?.network}
            onSuccess={handlePrepareUninstallationSuccess}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.settings.preparePluginUninstallationDialog.button.submit',
            )}
            title={t('app.settings.preparePluginUninstallationDialog.title')}
            transactionInfo={{
                title: t(
                    'app.settings.preparePluginUninstallationDialog.transactionInfoTitle',
                ),
                current: 1,
                total: 2,
            }}
        />
    );
};
