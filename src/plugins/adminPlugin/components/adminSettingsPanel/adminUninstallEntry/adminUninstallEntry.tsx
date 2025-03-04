import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { Button } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { UninstallCreateProcessDialog } from '../dialogs/uninstallCreateProcessDialog';
import { UninstallSelectProcessDialog } from '../dialogs/uninstallSelectProcessDialog';

export interface IAdminUninstallEntryProps {
    daoId: string;
}

export const AdminUninstallEntry: React.FC<IAdminUninstallEntryProps> = (props) => {
    const { daoId } = props;
    const [isCreateProcessDialogOpen, setIsCreateProcessDialogOpen] = useState(false);
    const [isSelectProcessDialogOpen, setIsSelectProcessDialogOpen] = useState(false);

    const daoPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS, includeSubPlugins: false })!;

    const handleOpenDialog = () => {
        if (daoPlugins.length > 1) {
            setIsSelectProcessDialogOpen(true);
        } else {
            setIsCreateProcessDialogOpen(true);
        }
    };

    const handleCreateProcessDialogClose = () => {
        setIsCreateProcessDialogOpen(false);
    };

    const handleSelectProcessDialogClose = () => {
        setIsSelectProcessDialogOpen(false);
    };

    return (
        <>
            <Button size="md" variant="critical" onClick={() => handleOpenDialog()}>
                Remove all admins
            </Button>
            <UninstallCreateProcessDialog
                daoId={daoId}
                isOpen={isCreateProcessDialogOpen}
                onClose={handleCreateProcessDialogClose}
            />
            <UninstallSelectProcessDialog
                daoId={daoId}
                isOpen={isSelectProcessDialogOpen}
                onClose={handleSelectProcessDialogClose}
            />
        </>
    );
};
