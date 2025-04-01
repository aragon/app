import { useDao } from '@/shared/api/daoService';
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
import { GovernanceType, type ICreateProcessFormData } from '../../components/createProcessForm';
import type { IPublishProcessDialogParams } from '../publishProcessDialog';
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';
import type { IPrepareProcessMetadata } from './prepareProcessDialogUtils.api';

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
}

export interface IPrepareProcessDialogProps extends IDialogComponentProps<IPrepareProcessDialogParams> {}

export const PrepareProcessDialog: React.FC<IPrepareProcessDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PrepareProcessDialog: required parameters must be set.');
    const { daoId, values } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'PrepareProcessDialog: user must be connected.');

    const { t } = useTranslations();
    const { status, mutateAsync: pinJson } = usePinJson();
    const { open } = useDialogContext();

    const [processMetadata, setProcessMetadata] = useState<IPrepareProcessMetadata>();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' }) ?? [];

    const stepper = useStepper<ITransactionDialogStepMeta, PrepareProcessStep | TransactionDialogStep>({
        initialActiveStep: PrepareProcessStep.PIN_METADATA,
    });
    const { nextStep } = stepper;

    const handlePrepareTransaction = async () => {
        invariant(processMetadata != null, 'PrepareProcessDialog: metadata not pinned');
        invariant(dao != null, 'PrepareProcessDialog: DAO cannot be fetched');

        const params = { values, processMetadata, plugin: adminPlugin.meta, dao };
        const transaction = await prepareProcessDialogUtils.buildTransaction(params);

        return transaction;
    };

    const handlePinJson = useCallback(
        async (params: ITransactionDialogActionParams) => {
            const proposalMetadata = prepareProcessDialogUtils.prepareProposalMetadata();
            const isAdvancedGovernance = values.governanceType === GovernanceType.ADVANCED;
            const { IpfsHash: proposalMetadataHash } = await pinJson({ body: proposalMetadata }, params);

            const pinPluginsMetadataPromises = values.bodies.map((plugin) => {
                const pluginMetadata = isAdvancedGovernance
                    ? prepareProcessDialogUtils.preparePluginMetadata(plugin)
                    : prepareProcessDialogUtils.prepareProcessorMetadata(values);

                return pinJson({ body: pluginMetadata }, params);
            });

            const pluginMetadata = (await Promise.all(pinPluginsMetadataPromises)).map(({ IpfsHash }) => IpfsHash);
            const metadata: IPrepareProcessMetadata = { proposal: proposalMetadataHash, plugins: pluginMetadata };

            if (isAdvancedGovernance) {
                const processorMetadata = prepareProcessDialogUtils.prepareProcessorMetadata(values);
                const { IpfsHash: processorMetadataHash } = await pinJson({ body: processorMetadata }, params);
                metadata.processor = processorMetadataHash;
            }

            setProcessMetadata(metadata);
            nextStep();
        },
        [pinJson, nextStep, values],
    );

    const handlePrepareInstallationSuccess = (txReceipt: TransactionReceipt) => {
        const setupData = pluginTransactionUtils.getPluginSetupData(txReceipt);
        const params: IPublishProcessDialogParams = { values, daoId, setupData };
        open('PUBLISH_PROCESS', { params });
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
            successLink={{
                label: t('app.createDao.prepareProcessDialog.button.success'),
                onClick: handlePrepareInstallationSuccess,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao?.network}
        />
    );
};
