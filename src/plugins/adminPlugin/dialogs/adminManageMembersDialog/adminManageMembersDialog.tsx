import { useMemberList } from '@/modules/governance/api/governanceService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { type ICompositeAddress, invariant } from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { AdminManageMembersDialogAddresses } from './adminManageMembersDialogAddresses';
import { AdminManageMembersDialogPublish } from './adminManageMembersDialogPublish';

export interface IAdminManageMembersDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the admin plugin.
     */
    pluginAddress: string;
}
export interface IAdminManageMembersDialogProps extends IDialogComponentProps<IAdminManageMembersDialogParams> {}

export interface IManageMembersFormData {
    /**
     * List of members in the form.
     */
    members: ICompositeAddress[];
}

export const AdminManageMembersDialog: React.FC<IAdminManageMembersDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'AdminManageMembersDialog: required parameters must be set.');

    const { daoId, pluginAddress } = location.params;

    const [updatedAdmins, setUpdatedAdmins] = useState<ICompositeAddress[]>([]);

    // TODO: (APP-4045). Setting this to the max pageSize of 300 for now to ensure we get all of the data
    // in the future we should find a better way to handle this.
    const memberParams = { daoId, pluginAddress, pageSize: 300 };
    const { data: memberList, refetch } = useMemberList({ queryParams: memberParams });

    const { close } = useDialogContext();

    const currentAdmins = useMemo(() => {
        return memberList?.pages.flatMap((page) => page.data);
    }, [memberList]);

    const [showPublishManageAdmins, setShowPublishManageAdmins] = useState(false);

    const handleSubmitAddresses = (data: IManageMembersFormData) => {
        setUpdatedAdmins(data.members);
        setShowPublishManageAdmins(true);
    };

    const handleClose = async () => {
        close();
        // After publishing new admins, clicking "Manage Admin" again would show the old list. We need to refetch.
        await refetch();
    };

    return showPublishManageAdmins ? (
        <AdminManageMembersDialogPublish
            currentAdmins={currentAdmins ?? []}
            updatedAdmins={updatedAdmins}
            pluginAddress={pluginAddress}
            daoId={daoId}
            onClose={handleClose}
        />
    ) : (
        <AdminManageMembersDialogAddresses
            currentAdmins={currentAdmins ?? []}
            onClose={handleClose}
            handleSubmitAddresses={handleSubmitAddresses}
        />
    );
};
