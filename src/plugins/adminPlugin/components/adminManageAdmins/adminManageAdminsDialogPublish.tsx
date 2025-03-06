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
import { adminManageAdminsDialogPublishUtils } from './adminManageAdminsDialogPublishUtils';

export enum AdminManageAdminsDialogPublishStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IAdminManageAdminsDialogPublishProps {
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

export const AdminManageAdminsDialogPublish: React.FC<IAdminManageAdminsDialogPublishProps> = (props) => {
    const { currentAdmins, updatedAdmins, pluginAddress, daoId, close } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'ManageAdminsDialogPublish: DAO data must be set.');

    const stepper = useStepper<ITransactionDialogStepMeta, AdminManageAdminsDialogPublishStep | TransactionDialogStep>({
        initialActiveStep: AdminManageAdminsDialogPublishStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = adminManageAdminsDialogPublishUtils.prepareProposalMetadata();
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson],
    );

    const handlePrepareTransaction = () => {
        invariant(pinJsonData != null, 'ManageAdminsDialogPublish: metadata not pinned for prepare transaction step.');

        const { IpfsHash: metadataCid } = pinJsonData;

        const actionsParams = {
            currentAdmins,
            updatedAdmins,
            pluginAddress: pluginAddress as Hex,
            daoAddress: dao.address as Hex,
        };

        const actions = adminManageAdminsDialogPublishUtils.buildActionsArray(actionsParams);

        return adminManageAdminsDialogPublishUtils.buildTransaction({
            values: adminManageAdminsDialogPublishUtils.prepareProposalMetadata(),
            actions,
            metadataCid,
            pluginAddress: pluginAddress as Hex,
        });
    };

    const customSteps: Array<ITransactionDialogStep<AdminManageAdminsDialogPublishStep>> = useMemo(
        () => [
            {
                id: AdminManageAdminsDialogPublishStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(
                        `app.plugins.admin.adminManageAdmins.dialog.publish.step.${AdminManageAdminsDialogPublishStep.PIN_METADATA}.label`,
                    ),
                    errorLabel: t(
                        `app.plugins.admin.adminManageAdmins.dialog.publish.step.${AdminManageAdminsDialogPublishStep.PIN_METADATA}.errorLabel`,
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
            title={t('app.plugins.admin.adminManageAdmins.dialog.publish.title')}
            description={t('app.plugins.admin.adminManageAdmins.dialog.publish.description')}
            submitLabel={t('app.plugins.admin.adminManageAdmins.dialog.publish.button.submit')}
            onCancelClick={close}
            successLink={{
                label: t('app.plugins.admin.adminManageAdmins.dialog.publish.button.success'),
                onClick: onSuccessClick,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
        />
    );
};
