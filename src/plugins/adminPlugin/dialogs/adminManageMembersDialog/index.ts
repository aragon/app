import dynamic from 'next/dynamic';

export const AdminManageMembersDialog = dynamic(() =>
    import('./adminManageMembersDialog').then((mod) => mod.AdminManageMembersDialog),
);

export {
    type IAdminManageMembersDialogParams,
    type IAdminManageMembersDialogProps,
    type IManageMembersFormData,
} from './adminManageMembersDialog';
