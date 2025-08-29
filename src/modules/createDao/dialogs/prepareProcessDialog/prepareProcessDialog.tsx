import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
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
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo, useState } from 'react';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';
import type {
    IBuildProcessProposalActionsParams,
    IBuildTransactionParams,
    IPrepareProcessMetadata,
} from './prepareProcessDialogUtils.api';

export enum PrepareProcessStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPrepareProcessDialogParams {
    /**
     * Values of the create-process form.
     */
    values: ICreateProcessFormData;
    /**
     * ID of the DAO to prepare the process for.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal for adding a new process.
     */
    pluginAddress: string;
}

export interface IPrepareProcessDialogProps extends IDialogComponentProps<IPrepareProcessDialogParams> {}

export const PrepareProcessDialog: React.FC<IPrepareProcessDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PrepareProcessDialog: required parameters must be set.');
    const { daoId, values, pluginAddress } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'PrepareProcessDialog: user must be connected.');

    const { t } = useTranslations();
    const { status, mutateAsync: pinJson } = usePinJson();
    const { open } = useDialogContext();

    const [processMetadata, setProcessMetadata] = useState<IPrepareProcessMetadata>();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const [plugin] = useDaoPlugins({ daoId, pluginAddress }) ?? [];
    invariant(!!plugin, `PrepareProcessDialog: plugin with address "${pluginAddress}" not found.`);

    const isAdmin = plugin.meta.interfaceType === PluginInterfaceType.ADMIN;

    const stepper = useStepper<ITransactionDialogStepMeta, PrepareProcessStep | TransactionDialogStep>({
        initialActiveStep: PrepareProcessStep.PIN_METADATA,
    });
    const { nextStep } = stepper;

    const handlePrepareTransaction = async () => {
        invariant(processMetadata != null, 'PrepareProcessDialog: metadata not pinned');
        invariant(dao != null, 'PrepareProcessDialog: DAO cannot be fetched');

        const params: IBuildTransactionParams = { values, processMetadata, dao };
        const transaction = await prepareProcessDialogUtils.buildPrepareProcessTransaction(params);

        return transaction;
    };

    const handlePinJson = useCallback(
        async (params: ITransactionDialogActionParams) => {
            const { pluginsMetadata, processorMetadata } = prepareProcessDialogUtils.preparePluginsMetadata(values);

            const pinMetadataPromises = pluginsMetadata.map((body) => pinJson({ body }, params));
            const pluginMetadata = (await Promise.all(pinMetadataPromises)).map(({ IpfsHash }) => IpfsHash);

            const metadata: IPrepareProcessMetadata = { plugins: pluginMetadata };

            if (processorMetadata) {
                const { IpfsHash: processorMetadataHash } = await pinJson({ body: processorMetadata }, params);
                metadata.processor = processorMetadataHash;
            }

            setProcessMetadata(metadata);
            nextStep();
        },
        [pinJson, nextStep, values],
    );

    const handlePrepareInstallationSuccess = (txReceipt: TransactionReceipt) => {
        invariant(dao != null, 'PrepareProcessDialog: DAO cannot be fetched');

        const executeConditionAddress = prepareProcessDialogUtils.getExecuteSelectorConditionAddress(txReceipt);
        const setupData = pluginTransactionUtils.getPluginInstallationSetupData(txReceipt);

        const proposalActionParams: IBuildProcessProposalActionsParams = {
            values,
            dao,
            setupData,
            executeConditionAddress,
        };
        const proposalActions = prepareProcessDialogUtils.buildPublishProcessProposalActions(proposalActionParams);

        const proposalMetadata = prepareProcessDialogUtils.preparePublishProcessProposalMetadata();
        const translationNamespace = `app.createDao.publishProcessDialog.${isAdmin ? 'admin' : 'default'}`;

        const txInfo = { title: t(`${translationNamespace}.transactionInfoTitle`), current: 2, total: 2 };
        const params: IPublishProposalDialogParams = {
            proposal: { ...proposalMetadata, resources: [], actions: proposalActions },
            daoId,
            plugin: plugin.meta,
            translationNamespace,
            transactionInfo: txInfo,
        };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
    };

    const pinMetadataNamespace = `app.createDao.prepareProcessDialog.step.${PrepareProcessStep.PIN_METADATA}`;
    const customSteps: Array<ITransactionDialogStep<PrepareProcessStep>> = useMemo(
        () => [
            {
                id: PrepareProcessStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`${pinMetadataNamespace}.label`),
                    errorLabel: t(`${pinMetadataNamespace}.errorLabel`),
                    state: status,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ],
        [status, handlePinJson, pinMetadataNamespace, t],
    );

    return (
        <TransactionDialog<PrepareProcessStep>
            title={t('app.createDao.prepareProcessDialog.title')}
            description={t('app.createDao.prepareProcessDialog.description')}
            submitLabel={t('app.createDao.prepareProcessDialog.button.submit')}
            onSuccess={handlePrepareInstallationSuccess}
            transactionInfo={{
                title: t('app.createDao.prepareProcessDialog.transactionInfoTitle'),
                current: 1,
                total: 2,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao?.network}
        />
    );
};
