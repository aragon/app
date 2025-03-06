import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, EmptyState } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface IAdminUninstallCreateProcessDialogProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Metadata of the admin plugin.
     */
    adminMeta: IDaoPlugin;
    /**
     * Whether the dialog is open.
     */
    isOpen: boolean;
    /**
     * Callback to close the dialog.
     */
    onClose: () => void;
}

export const AdminUninstallCreateProcessDialog: React.FC<IAdminUninstallCreateProcessDialogProps> = (props) => {
    const { daoId, adminMeta, isOpen, onClose } = props;

    const router = useRouter();

    const { t } = useTranslations();
    const keyNamespace = 'app.plugins.admin.adminSettingsPanel.adminUninstallCreateProcessDialog';

    const handlePermissionGuardSuccess = useCallback(() => {
        router.push(`/dao/${daoId}/create/process`);
        onClose();
    }, [daoId, router, onClose]);

    const { check: createProcessGuard, result: canCreateProcess } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin: adminMeta,
        daoId,
    });

    const primaryActionProps = canCreateProcess
        ? { href: `/dao/${daoId}/create/process` }
        : { onClick: () => createProcessGuard };

    return (
        <Dialog.Root open={isOpen} size="lg">
            <Dialog.Header title="Remove all admins" onClose={onClose} />
            <Dialog.Content className="flex flex-col items-center gap-4">
                <EmptyState
                    objectIllustration={{ object: 'USERS' }}
                    heading={t(`${keyNamespace}.heading`)}
                    description={t(`${keyNamespace}.description`)}
                    primaryButton={{
                        label: t(`${keyNamespace}.label`),
                        ...primaryActionProps,
                    }}
                />
            </Dialog.Content>
        </Dialog.Root>
    );
};
