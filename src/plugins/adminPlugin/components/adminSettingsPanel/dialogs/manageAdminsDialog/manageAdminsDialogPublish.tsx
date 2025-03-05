import { type IMember } from '@/modules/governance/api/governanceService';
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
import { type ICompositeAddress, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { type Hex } from 'viem';
import { manageAdminsDialogPublishUtils } from './manageAdminsDialogPublishUtils';

export enum ManageAdminsDialogPublishStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IManageAdminsDialogPublishProps {
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
    pluginAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback to close the dialog.
     */
    close: () => void;
}

export const ManageAdminsDialogPublish: React.FC<IManageAdminsDialogPublishProps> = (props) => {
    const { currentAdmins, updatedAdmins, pluginAddress, daoId, close } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'PublishManageAdminsDialog: DAO data must be set.');

    const stepper = useStepper<ITransactionDialogStepMeta, ManageAdminsDialogPublishStep | TransactionDialogStep>({
        initialActiveStep: ManageAdminsDialogPublishStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = manageAdminsDialogPublishUtils.prepareProposalMetadata();
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
            pluginAddress: pluginAddress as Hex,
            daoAddress: dao.address as Hex,
        };

        const actions = manageAdminsDialogPublishUtils.buildActionsArray(actionsParams);

        return manageAdminsDialogPublishUtils.buildTransaction({
            values: manageAdminsDialogPublishUtils.prepareProposalMetadata(),
            actions,
            metadataCid,
            pluginAddress: pluginAddress as Hex,
        });
    };

    const customSteps: Array<ITransactionDialogStep<ManageAdminsDialogPublishStep>> = useMemo(
        () => [
            {
                id: ManageAdminsDialogPublishStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(
                        `app.plugins.admin.manageAdminsDialogPublish.step.${ManageAdminsDialogPublishStep.PIN_METADATA}.label`,
                    ),
                    errorLabel: t(
                        `app.plugins.admin.manageAdminsDialogPublish.step.${ManageAdminsDialogPublishStep.PIN_METADATA}.errorLabel`,
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
            title={t('app.plugins.admin.manageAdminsDialogPublish.title')}
            description={t('app.plugins.admin.manageAdminsDialogPublish.description')}
            submitLabel={t('app.plugins.admin.manageAdminsDialogPublish.button.submit')}
            onCancelClick={close}
            successLink={{
                label: t('app.plugins.admin.manageAdminsDialogPublish.button.success'),
                onClick: onSuccessClick,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
        />
    );
};
