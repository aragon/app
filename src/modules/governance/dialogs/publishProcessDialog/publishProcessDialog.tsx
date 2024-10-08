import { generateTransaction } from '@/modules/finance/testUtils';
import { type ICreateProcessFormData } from '@/modules/governance/components/createProcessForm';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useSetIsBlocked } from '@/shared/components/navigationBlockerProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { Card, Heading, invariant } from '@aragon/ods';
import { useCallback, useMemo } from 'react';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { PrepareProposalActionMap } from '../../components/createProposalForm';
import { publishProcessDialogUtils } from './publishProcessDialogUtils';

export enum PublishProcessStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishProcessDialogParams {
    /**
     * Values of the create-proposal form.
     */
    values: ICreateProcessFormData;
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

export interface IPublishProcessDialogProps extends IDialogComponentProps<IPublishProcessDialogParams> {}

export const PublishProcessDialog: React.FC<IPublishProcessDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'PublishProposalDialog: user must be connected.');

    const { daoId, pluginAddress, values } = location.params;
    const { process, stages } = values;
    const { name, id } = process;

    const { t } = useTranslations();

    const setIsBlocked = useSetIsBlocked();

    const stepper = useStepper<ITransactionDialogStepMeta, PublishProcessStep | TransactionDialogStep>({
        initialActiveStep: PublishProcessStep.PIN_METADATA,
    });

    const { status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishProcessDialogUtils.prepareMetadata(values);
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson, values],
    );

    // const handlePrepareTransaction = async () => {
    //     invariant(pinJsonData != null, 'PublishProposalDialog: metadata not pinned for prepare transaction step.');
    //     const { IpfsHash: metadataCid } = pinJsonData;
    //     const { actions } = values;

    //     const processedActions = await publishProcessDialogUtils.prepareActions({ actions, prepareActions });
    //     const processedValues = {
    //         ...values,
    //         actions: processedActions.map((action) => ({
    //             ...action,
    //             type: action.data.type,
    //             daoId,
    //             value: action.data.value,
    //             to: action.data.to,
    //             from: action.data.from,
    //             inputData: action.data.inputData,
    //             data: JSON.stringify(action.data),
    //         })),
    //     };

    //     return publishProcessDialogUtils.buildTransaction({
    //         values: {
    //             ...processedValues,
    //             title: values.title!,
    //             addActions: values.addActions!,
    //             startTimeMode: values.startTimeMode!,
    //             endTimeMode: values.endTimeMode!,
    //         },
    //         metadataCid,
    //         plugin: daoPlugin.meta,
    //     });
    // };

    const getProcessLink = (txReceipt: TransactionReceipt) => {
        const { transactionHash } = txReceipt;

        setIsBlocked(false);

        const proposalId = publishProcessDialogUtils.getProposalId(txReceipt);
        const extendedProposalId = `${transactionHash}-${pluginAddress}-${proposalId}`;

        return `/dao/${daoId}/proposals/${extendedProposalId}`;
    };

    const customSteps: Array<ITransactionDialogStep<PublishProcessStep>> = useMemo(
        () => [
            {
                id: PublishProcessStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`app.governance.publishProposalDialog.step.${PublishProcessStep.PIN_METADATA}.label`),
                    errorLabel: t(
                        `app.governance.publishProposalDialog.step.${PublishProcessStep.PIN_METADATA}.errorLabel`,
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
        <TransactionDialog<PublishProcessStep>
            title={t('app.governance.publishProcessDialog.title')}
            description={t('app.governance.publishProcessDialog.description')}
            submitLabel={t('app.governance.publishProcessDialog.button.submit')}
            successLink={{ label: t('app.governance.publishProcessDialog.button.success'), href: getProcessLink }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={async () => {
                const mockTransaction = generateTransaction();
                return {
                    to: mockTransaction.toAddress as `0x${string}`,
                };
            }}
        >
            <Card className="flex w-full flex-col items-center justify-center gap-y-6 border border-success-400 p-6 text-left">
                <pre className="flex flex-col gap-y-2">
                    <Heading size="h2">PROCESS:</Heading>
                    <Heading size="h3" className="pl-2">
                        {name} - {id}
                    </Heading>
                    <ul className="flex flex-col gap-y-2 pl-4">
                        <Heading size="h3">STAGES:</Heading>
                        {stages.map((stage, index) => (
                            <li key={index} className="pl-2">
                                {stage.stageName} - {stage.stageType}
                                <ul className="flex flex-col gap-y-2 px-4 py-2">
                                    <Heading size="h4">BODIES:</Heading>
                                    {stage.bodies?.map((votingBody, index) => (
                                        <li key={index} className="pl-2">
                                            {votingBody.bodyNameField} - {votingBody.bodyGovernanceTypeField}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </pre>
            </Card>
        </TransactionDialog>
    );
};
