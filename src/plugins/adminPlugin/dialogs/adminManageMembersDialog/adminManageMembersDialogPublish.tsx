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
import { adminManageMembersDialogPublishUtils } from './adminManageMembersDialogPublishUtils';

export enum AdminManageMembersDialogPublishStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IAdminManageMembersDialogPublishProps {
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
     * Callback to notify successful update.
     */
    onSuccess: () => void;
}

export const AdminManageMembersDialogPublish: React.FC<IAdminManageMembersDialogPublishProps> = (props) => {
    const { currentAdmins, updatedAdmins, pluginAddress, daoId, onSuccess } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'ManageAdminsDialogPublish: DAO data must be set.');

    const stepper = useStepper<ITransactionDialogStepMeta, AdminManageMembersDialogPublishStep | TransactionDialogStep>(
        {
            initialActiveStep: AdminManageMembersDialogPublishStep.PIN_METADATA,
        },
    );

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = adminManageMembersDialogPublishUtils.prepareProposalMetadata();
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

        const actions = adminManageMembersDialogPublishUtils.buildActionsArray(actionsParams);

        return adminManageMembersDialogPublishUtils.buildTransaction({
            actions,
            metadataCid,
            pluginAddress: pluginAddress as Hex,
        });
    };

    const customSteps: Array<ITransactionDialogStep<AdminManageMembersDialogPublishStep>> = useMemo(
        () => [
            {
                id: AdminManageMembersDialogPublishStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(
                        `app.plugins.admin.adminManageMembersDialog.publish.step.${AdminManageMembersDialogPublishStep.PIN_METADATA}.label`,
                    ),
                    errorLabel: t(
                        `app.plugins.admin.adminManageMembersDialog.publish.step.${AdminManageMembersDialogPublishStep.PIN_METADATA}.errorLabel`,
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
        onSuccess();
    };

    return (
        <TransactionDialog
            title={t('app.plugins.admin.adminManageMembersDialog.publish.title')}
            description={t('app.plugins.admin.adminManageMembersDialog.publish.description')}
            submitLabel={t('app.plugins.admin.adminManageMembersDialog.publish.button.submit')}
            successLink={{
                label: t('app.plugins.admin.adminManageMembersDialog.publish.button.success'),
                onClick: onSuccessClick,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
        />
    );
};
