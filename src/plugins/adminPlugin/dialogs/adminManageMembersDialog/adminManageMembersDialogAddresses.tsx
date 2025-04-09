import type { IMember } from '@/modules/governance/api/governanceService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, Dialog, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

export interface IAdminManageMembersDialogAddressesProps {
    /**
     * List of current admins on the admin plugin.
     */
    currentAdmins: IMember[];
    /**
     * Callback to handle the form submission.
     */
    handleSubmitAddresses: (data: IAdminManageMembersFormData) => void;
    /**
     * Callback to close the dialog.
     */
    onClose: () => void;
}

export interface IAdminManageMembersFormData {
    /**
     * List of members in the form.
     */
    members: ICompositeAddress[];
}

const formId = 'manageAdminsForm';

export const AdminManageMembersDialogAddresses: React.FC<IAdminManageMembersDialogAddressesProps> = (props) => {
    const { currentAdmins, onClose, handleSubmitAddresses } = props;

    const { t } = useTranslations();

    const initialMembers = useMemo(() => currentAdmins.map((member) => ({ address: member.address })), [currentAdmins]);

    const formMethods = useForm<IAdminManageMembersFormData>({
        defaultValues: {
            members: initialMembers,
        },
        mode: 'onTouched',
    });

    const { handleSubmit, control, reset } = formMethods;

    const watchMembersField = useWatch({ name: 'members', control });

    const haveMembersChanged = useMemo(() => {
        const initialMembers = currentAdmins.map((member) => member.address);
        const newMembers = watchMembersField.map((field) => field.address);

        if (initialMembers.length !== newMembers.length) {
            return true;
        }

        return !initialMembers.every((initialAddress) =>
            newMembers.some((newAddress) => addressUtils.isAddressEqual(initialAddress, newAddress)),
        );
    }, [watchMembersField, currentAdmins]);

    // Re-initialise the initial members on the form after fetching the members list
    useEffect(() => {
        reset({ members: initialMembers });
    }, [initialMembers, reset]);

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header onClose={onClose} title={t('app.plugins.admin.adminManageMembers.dialog.addresses.title')} />
            <Dialog.Content description={t('app.plugins.admin.adminManageMembers.dialog.addresses.description')}>
                <form
                    className="flex w-full flex-col gap-3 pb-6 md:gap-2"
                    onSubmit={handleSubmit(handleSubmitAddresses)}
                    id={formId}
                >
                    <AddressesInput.Container name="members" allowEmptyList={true}>
                        {watchMembersField.map((field, index) => (
                            <AddressesInput.Item key={index} index={index} />
                        ))}
                    </AddressesInput.Container>
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.plugins.admin.adminManageMembers.dialog.addresses.action.update'),
                    type: 'submit',
                    form: formId,
                    disabled: !haveMembersChanged,
                }}
                secondaryAction={{
                    label: t('app.plugins.admin.adminManageMembers.dialog.addresses.action.cancel'),
                    onClick: onClose,
                }}
            />
        </FormProvider>
    );
};
