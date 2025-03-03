import type { IMember } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { Dialog, type ICompositeAddress, invariant, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { Hex } from 'viem';
import { publishManageAdminsProposalDialogUtils } from './publishManageAdminsProposalDialogUtils';

export enum PublishManageAdminsProposalDialogStep {
    PIN_METADATA = 'PIN_METADATA',
}


export interface IPublishManageAdminsProposalDialogProps
    extends IDialogRootProps {
        /**
     * List of current admins on the admin plugin.
     */
            currentAdmins: IMember[];
            /**
             * List of updated admins.
             */
    updatedAdmins: ICompositeAddress[];
    /**
     * Address of the admin plugin.
     */
    pluginAddress: Hex;
    /**
        * ID of the DAO.
        */
    daoId: string;
    }

export const PublishManageAdminsProposalDialog: React.FC<IPublishManageAdminsProposalDialogProps> = (props) => {
    const { currentAdmins, updatedAdmins, pluginAddress, daoId, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'PublishManageAdminsDialog: DAO data must be set.');

    const stepper = useStepper<ITransactionDialogStepMeta, PublishManageAdminsProposalDialogStep | TransactionDialogStep>({
        initialActiveStep: PublishManageAdminsProposalDialogStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishManageAdminsProposalDialogUtils.prepareProposalMetadata();
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

        const actions = publishManageAdminsProposalDialogUtils.buildActionsArray(actionsParams);

        return publishManageAdminsProposalDialogUtils.buildTransaction({
            values: publishManageAdminsProposalDialogUtils.prepareProposalMetadata(),
            actions,
            metadataCid,
            pluginAddress,
        });
    };

    const customSteps: Array<ITransactionDialogStep<PublishManageAdminsProposalDialogStep>> = useMemo(
        () => [
            {
                id: PublishManageAdminsProposalDialogStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(
                        `app.plugins.admin.publishManageAdminsDialog.step.${PublishManageAdminsProposalDialogStep.PIN_METADATA}.label`,
                    ),
                    errorLabel: t(
                        `app.plugins.admin.publishManageAdminsDialog.step.${PublishManageAdminsProposalDialogStep.PIN_METADATA}.errorLabel`,
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
        onOpenChange?.(false);
    };
    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <TransactionDialog
            title={t('app.plugins.admin.publishManageAdminsDialog.title')}
            description={t('app.plugins.admin.publishManageAdminsDialog.description')}
            submitLabel={t('app.plugins.admin.publishManageAdminsDialog.button.submit')}
            onCancelClick={() => onOpenChange?.(false)}
            successLink={{
                label: t('app.plugins.admin.publishManageAdminsDialog.button.success'),
                onClick: onSuccessClick,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
        />
        </Dialog.Root>
    );
};
