import type { IMember } from '@/modules/governance/api/governanceService';
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
import { useStepper } from '@/shared/hooks/useStepper';
import { type ICompositeAddress, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { Hex } from 'viem';
import { useAccount } from 'wagmi';
import { publishManageAdminsProposalUtils } from './publishManageAdminsProposalUtils';

export enum PublishManageAdminsProposalStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishManageAdminsProposalDialogParams {
    currentAdmins: IMember[];
    updatedAdmins: ICompositeAddress[];
    pluginAddress: Hex;
    daoId: string;
}

export interface IPublishManageAdminsProposalDialogProps
    extends IDialogComponentProps<IPublishManageAdminsProposalDialogParams> {}

export const PublishManageAdminsProposalDialog: React.FC<IPublishManageAdminsProposalDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'PublishManageAdminsDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'PublishManageAdminsDialog: user must be connected.');

    const { currentAdmins, updatedAdmins, pluginAddress, daoId } = location.params;

    const { close } = useDialogContext();
    const { t } = useTranslations();
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'PublishManageAdminsDialog: DAO data must be set.');

    const stepper = useStepper<ITransactionDialogStepMeta, PublishManageAdminsProposalStep | TransactionDialogStep>({
        initialActiveStep: PublishManageAdminsProposalStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishManageAdminsProposalUtils.prepareProposalMetadata();
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson],
    );

    const handlePrepareTransaction = () => {
        invariant(pinJsonData != null, 'PublishManageAdminsDialog: metadata not pinned for prepare transaction step.');

        const { IpfsHash: metadataCid } = pinJsonData;

        const actionsParams = {
            currentAdmins,
            updatedAdmins,
            pluginAddress,
            daoAddress: dao.address as Hex,
        };

        const actions = publishManageAdminsProposalUtils.buildActionsArray(actionsParams);

        return publishManageAdminsProposalUtils.buildTransaction({
            values: publishManageAdminsProposalUtils.prepareProposalMetadata(),
            actions,
            metadataCid,
            pluginAddress,
        });
    };

    const customSteps: Array<ITransactionDialogStep<PublishManageAdminsProposalStep>> = useMemo(
        () => [
            {
                id: PublishManageAdminsProposalStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(
                        `app.plugins.admin.publishManageAdminsDialog.step.${PublishManageAdminsProposalStep.PIN_METADATA}.label`,
                    ),
                    errorLabel: t(
                        `app.plugins.admin.publishManageAdminsDialog.step.${PublishManageAdminsProposalStep.PIN_METADATA}.errorLabel`,
                    ),
                    state: status,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ],
        [status, handlePinJson, t],
    );

    const onSuccessClick = () => {
        router.refresh();
        close();
    };
    return (
        <TransactionDialog
            title={t('app.plugins.admin.publishManageAdminsDialog.title')}
            description={t('app.plugins.admin.publishManageAdminsDialog.description')}
            submitLabel={t('app.plugins.admin.publishManageAdminsDialog.button.submit')}
            onCancelClick={close}
            successLink={{
                label: t('app.plugins.admin.publishManageAdminsDialog.button.success'),
                onClick: onSuccessClick,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
        />
    );
};
