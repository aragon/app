import { type ICreateProcessFormData } from '@/modules/governance/components/createProcessForm';
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
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo, useState } from 'react';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { IPublishProcessDialogParams } from '../publishProcessDialog';
import { type IPrepareProcessMetadata, prepareProcessDialogUtils } from './prepareProcessDialogUtils';

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
        const transaction = prepareProcessDialogUtils.buildTransaction(params);

        return transaction;
    };

    const handlePinJson = useCallback(
        async (params: ITransactionDialogActionParams) => {
            const proposalMetadata = prepareProcessDialogUtils.prepareProposalMetadata();
            const { IpfsHash: proposalMetadataHash } = await pinJson({ body: proposalMetadata }, params);

            const sppMetadata = prepareProcessDialogUtils.prepareSppMetadata(values);
            const { IpfsHash: sppMetadataHash } = await pinJson({ body: sppMetadata }, params);

            const pinPluginsMetadataPromises = values.stages
                .flatMap((stage) => stage.bodies)
                .map((plugin) => {
                    const pluginMetadata = prepareProcessDialogUtils.preparePluginMetadata(plugin);

                    return pinJson({ body: pluginMetadata }, params);
                });

            const pluginMetadataResults = (await Promise.all(pinPluginsMetadataPromises)).map(
                (result) => result.IpfsHash,
            );

            setProcessMetadata({
                proposal: proposalMetadataHash,
                spp: sppMetadataHash,
                plugins: pluginMetadataResults,
            });

            nextStep();
        },
        [pinJson, nextStep, values],
    );

    const handlePrepareInstallationSuccess = (txReceipt: TransactionReceipt) => {
        const setupData = prepareProcessDialogUtils.getPluginSetupData(txReceipt);
        const params: IPublishProcessDialogParams = { values, daoId, setupData };
        open('PUBLISH_PROCESS', { params });
    };

    const pinMetadataNamespace = `app.governance.prepareProcessDialog.step.${PrepareProcessStep.PIN_METADATA}`;
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
            title={t('app.governance.prepareProcessDialog.title')}
            description={t('app.governance.prepareProcessDialog.description')}
            submitLabel={t('app.governance.prepareProcessDialog.button.submit')}
            successLink={{
                label: t('app.governance.prepareProcessDialog.button.success'),
                onClick: handlePrepareInstallationSuccess,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
        />
    );
};
