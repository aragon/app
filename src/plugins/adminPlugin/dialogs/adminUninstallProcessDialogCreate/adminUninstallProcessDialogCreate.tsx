import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { daoUtils } from '../../../../shared/utils/daoUtils';

export interface IAdminUninstallProcessDialogCreateParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The admin plugin.
     */
    adminPlugin: IDaoPlugin;
}

export interface IAdminUninstallProcessDialogCreateProps
    extends IDialogComponentProps<IAdminUninstallProcessDialogCreateParams> {}

export const AdminUninstallProcessDialogCreate: React.FC<IAdminUninstallProcessDialogCreateProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'AdminUninstallProcessDialogCreate: required parameters must be set.');

    const { daoId, adminPlugin } = location.params;

    const router = useRouter();
    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const daoUrl = dao && daoUtils.getDaoUrl(dao);

    const handlePermissionGuardSuccess = useCallback(() => {
        router.push(`${daoUrl!}/create/process`);
        close();
    }, [router, daoUrl, close]);

    const { check: createProcessGuard, result: canCreateProcess } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin: adminPlugin,
        daoId,
    });

    const handleCreateProcessClick = () => {
        if (canCreateProcess) {
            close();
        }

        createProcessGuard();
    };

    return (
        <>
            <Dialog.Header
                title={t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogCreate.title')}
                onClose={() => close()}
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
                        href: canCreateProcess && daoUrl ? `${daoUrl}/create/process` : undefined,
                        onClick: handleCreateProcessClick,
                    }}
                />
            </Dialog.Content>
        </>
    );
};
