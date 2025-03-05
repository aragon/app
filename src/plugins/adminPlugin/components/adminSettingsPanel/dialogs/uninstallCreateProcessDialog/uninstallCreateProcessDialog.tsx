import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, EmptyState } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';

export interface IUninstallCreateProcessDialogProps {
    daoId: string;
    adminMeta: IDaoPlugin;
    isOpen: boolean;
    onClose: () => void;
}

export const UninstallCreateProcessDialog: React.FC<IUninstallCreateProcessDialogProps> = (props) => {
    const { daoId, adminMeta, isOpen, onClose } = props;

    const router = useRouter();

    const { t } = useTranslations();

    const keyNamespace = 'app.plugins.admin.adminSettingsPanel.uninstallCreateProcessDialog';

    const handlePermissionGuardSuccess = () => {
        router.push(`/dao/${daoId}/create/process`);
        onClose();
    };

    const { check: createProcessGuard, result: canCreateProcess } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin: adminMeta,
        daoId,
    });

    const actionProps = {
        onClick: canCreateProcess ? undefined : () => createProcessGuard(),
        href: canCreateProcess ? `/dao/${daoId}/create/process` : undefined,
    };

    return (
        <Dialog.Root open={isOpen} size="lg">
            <Dialog.Header title="Remove all admins" onClose={() => onClose()} />
            <Dialog.Content className="flex flex-col items-center gap-4">
                <EmptyState
                    objectIllustration={{ object: 'USERS' }}
                    heading={t(`${keyNamespace}.heading`)}
                    description={t(`${keyNamespace}.description`)}
                    primaryButton={{
                        label: t(`${keyNamespace}.label`),
                        ...actionProps,
                    }}
                />
            </Dialog.Content>
        </Dialog.Root>
    );
};
