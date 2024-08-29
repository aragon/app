import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { useSupportedDaoPlugin } from '@/shared/hooks/useSupportedDaoPlugin/useSupportedDaoPlugin';
import { DataList, invariant, ProposalDataListItem, ProposalStatus } from '@aragon/ods';
import { useCallback, useMemo } from 'react';
import type { TransactionReceipt } from 'viem';
import { useAccount, useEnsName } from 'wagmi';
import type { ICreateProposalFormData } from '../../components/createProposalForm';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

export enum PublishProposalStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishProposalDialogParams {
    /**
     * Values of the create-proposal form.
     */
    values: ICreateProposalFormData;
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps<IPublishProposalDialogParams> {}

const generateMockValues = (values?: Partial<ICreateProposalFormData>): ICreateProposalFormData => ({
    title: 'Withdraw funds to pay taxes',
    summary: 'Withdraw 2000 USDC for taxes purposes.',
    addActions: false,
    startTimeMode: 'now',
    endTimeMode: 'duration',
    endTimeDuration: { days: 5, hours: 0, minutes: 0 },
    resources: [],
    actions: [],
    ...values,
});

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalDialog: required parameters must be set.');
    const { daoId, values: partialValues } = location.params;
    // TODO: remove mock values and useMemo
    const values = useMemo(() => generateMockValues(partialValues), [partialValues]);

    const { title, summary } = values;

    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const supportedPlugin = useSupportedDaoPlugin(daoId);

    const stepper = useStepper<ITransactionDialogStepMeta, PublishProposalStep | TransactionDialogStep>({
        initialActiveStep: PublishProposalStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishProposalDialogUtils.prepareMetadata(values);
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson, values],
    );

    const handlePrepareTransaction = () => {
        invariant(pinJsonData != null, 'PublishProposalDialog: metadata not pinned for prepare transaction step.');
        const metadataCid = pinJsonData.IpfsHash;

        return publishProposalDialogUtils.buildTransaction({ values, metadataCid, plugin: supportedPlugin! });
    };

    const getProposalLink = (txReceipt: TransactionReceipt) => {
        const { transactionHash } = txReceipt;
        const proposalId = publishProposalDialogUtils.getProposalId(txReceipt);
        const extendedProposalId = `${transactionHash}-${supportedPlugin}-${proposalId}`;

        return `/dao/${daoId}/proposals/${extendedProposalId}`;
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

    const publisher = { address: address!, name: ensName ?? undefined };

    return (
        <TransactionDialog<PublishProposalStep>
            title={t('app.governance.publishProposalDialog.title')}
            description={t('app.governance.publishProposalDialog.description')}
            submitLabel={t('app.governance.publishProposalDialog.button.submit')}
            successLink={{ label: t('app.governance.publishProposalDialog.button.success'), href: getProposalLink }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
        >
            <DataList.Root entityLabel="">
                {/* @ts-expect-error TODO: update ODS component to remove type requirement (APP-3590) */}
                <ProposalDataListItem.Structure
                    title={title}
                    summary={summary}
                    publisher={publisher}
                    status={ProposalStatus.DRAFT}
                />
            </DataList.Root>
        </TransactionDialog>
    );
};
