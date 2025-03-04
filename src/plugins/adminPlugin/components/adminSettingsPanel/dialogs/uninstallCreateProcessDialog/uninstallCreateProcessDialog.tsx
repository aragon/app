import { Dialog, EmptyState } from '@aragon/gov-ui-kit';

export interface IUninstallCreateProcessDialogProps {
    daoId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const UninstallCreateProcessDialog: React.FC<IUninstallCreateProcessDialogProps> = (props) => {
    const { daoId, isOpen, onClose } = props;

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
                        href: `/dao/${daoId}/create/process`,
                    }}
                />
            </Dialog.Content>
        </Dialog.Root>
    );
};
