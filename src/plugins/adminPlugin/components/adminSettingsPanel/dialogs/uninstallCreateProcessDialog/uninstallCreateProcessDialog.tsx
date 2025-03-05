import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
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
                    heading="No governance process found"
                    description="To remove all admins, you need to first create at least one other governance process for your DAO."
                    primaryButton={{
                        label: 'Create governance process',
                        ...actionProps,
                    }}
                />
            </Dialog.Content>
        </Dialog.Root>
    );
};
