import { useMemberList } from '@/modules/governance/api/governanceService';
import { Dialog, type ICompositeAddress, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { AdminManageMembersDialogAddresses } from './adminManageMembersDialogAddresses';
import { AdminManageMembersDialogPublish } from './adminManageMembersDialogPublish';

export interface IAdminManageMembersDialogProps extends IDialogRootProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the admin plugin.
     */
    pluginAddress: string;
}

export interface IManageMembersFormData {
    /**
     * List of members in the form.
     */
    members: ICompositeAddress[];
}

export const AdminManageAdminsDialog: React.FC<IAdminManageMembersDialogProps> = (props) => {
    const { onOpenChange, daoId, pluginAddress, ...otherProps } = props;

    const [updatedAdmins, setUpdatedAdmins] = useState<ICompositeAddress[]>([]);

    const memberParams = { daoId, pluginAddress };
    const { data: memberList } = useMemberList({ queryParams: memberParams });

    const currentAdmins = useMemo(() => {
        return memberList?.pages.flatMap((page) => page.data);
    }, [memberList]);

    const [showPublishManageAdmins, setShowPublishManageAdmins] = useState(false);

    const handleSubmitAddresses = (data: IManageMembersFormData) => {
        setUpdatedAdmins(data.members);
        setShowPublishManageAdmins(true);
    };

    // When closing we reset the updated admins and update the dialog content to be the addresses form
    const onClose = () => {
        setShowPublishManageAdmins(false);
        setUpdatedAdmins([]);
        onOpenChange?.(false);
    };

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            {showPublishManageAdmins ? (
                <AdminManageMembersDialogPublish
                    currentAdmins={currentAdmins ?? []}
                    updatedAdmins={updatedAdmins}
                    pluginAddress={pluginAddress}
                    daoId={daoId}
                    onClose={onClose}
                />
            ) : (
                <AdminManageMembersDialogAddresses
                    currentAdmins={currentAdmins ?? []}
                    onClose={onClose}
                    handleSubmitAddresses={handleSubmitAddresses}
                />
            )}
        </Dialog.Root>
    );
};
