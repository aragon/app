import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, EmptyState, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface IAdminUninstallProcessDialogCreateProps extends IDialogRootProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The admin plugin.
     */
    adminPlugin: IDaoPlugin;
    /**
     * Callback to close the dialog.
     */
    onClose: () => void;
}

export const AdminUninstallProcessDialogCreate: React.FC<IAdminUninstallProcessDialogCreateProps> = (props) => {
    const { daoId, adminPlugin, open: isOpen, onClose } = props;

    const router = useRouter();

    const { t } = useTranslations();

    const createProcessUrl: __next_route_internal_types__.DynamicRoutes = `/dao/${daoId}/create/process`;

    const handlePermissionGuardSuccess = useCallback(() => {
        router.push(createProcessUrl);
        onClose();
    }, [router, onClose, createProcessUrl]);

    const { check: createProcessGuard, result: canCreateProcess } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin: adminPlugin,
        daoId,
    });

    const handleProcessGuard = () => {
        createProcessGuard();
        onClose();
    };

    const defaultActionProps = {
        onClick: canCreateProcess ? undefined : handleProcessGuard,
        href: canCreateProcess ? createProcessUrl : undefined,
    };

    return (
        <Dialog.Root open={isOpen} size="lg">
            <Dialog.Header
                title={t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogCreate.title')}
                onClose={onClose}
            />
            <Dialog.Content className="flex flex-col items-center gap-4">
                <EmptyState
                    objectIllustration={{ object: 'USERS' }}
                    heading={t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogCreate.heading')}
                    description={t(
                        'app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogCreate.description',
                    )}
                    primaryButton={{
                        label: t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogCreate.label'),
                        ...defaultActionProps,
                    }}
                />
            </Dialog.Content>
        </Dialog.Root>
    );
};
