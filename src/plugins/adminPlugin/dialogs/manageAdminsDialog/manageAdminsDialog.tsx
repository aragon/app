import type { IMember } from '@/modules/governance/api/governanceService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    Button,
    Dialog,
    IconType,
    type ICompositeAddress,
    type IDialogRootProps,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AdminDialog } from '../../constants/adminDialogs';
import { ManageAdminsAddMembersItem } from './manageAdminsDialogAddMembersItem';

export interface IManageAdminsDialogProps extends IDialogRootProps {
    /**
     * List of current admins on the admin plugin.
     */
    currentAdmins: IMember[];
    /**
     * Address of the admin plugin.
     */
    pluginAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface IManageAdminsFormData {
    /**
     * List of members in the form.
     */
    members: ICompositeAddress[];
}

const formId = 'manageAdminsForm';

export const ManageAdminsDialog: React.FC<IManageAdminsDialogProps> = (props) => {
    const { currentAdmins, pluginAddress, daoId, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const initialMembers = currentAdmins.map((member) => ({
        address: member.address,
    }));

    const formMethods = useForm<IManageAdminsFormData>({
        defaultValues: {
            members: initialMembers,
        },
        mode: 'onTouched',
    });

    const { handleSubmit, control, reset } = formMethods;

    const membersFieldName = 'members';
    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
    } = useFieldArray({ name: membersFieldName, control });

    const watchMembersField = useWatch({ name: 'members', control });

    const controlledMembersField = useMemo(
        () => membersField.map((field, index) => ({ ...field, ...watchMembersField[index] })),
        [membersField, watchMembersField],
    );

    const handleAddMember = () => addMember({ address: '' });

    const handleRemoveMember = (index: number) => {
        if (membersField.length > 1) {
            removeMember(index);
        }
    };

    useEffect(() => {
        // Needed to make sure that the default values are set correctly on the form
        const members =
            currentAdmins.length > 0 ? currentAdmins.map((member) => ({ address: member.address })) : [{ address: '' }];
        reset({ members });
    }, [currentAdmins, reset]);

    const handleFormSubmit = (data: IManageAdminsFormData) => {
        const params = {
            currentAdmins,
            updatedAdmins: data.members,
            pluginAddress,
            daoId,
        };

        open(AdminDialog.PUBLISH_MANAGE_ADMINS, { params });
        onOpenChange?.(false);
    };

    const checkIsAlreadyInList = (index: number) =>
        controlledMembersField
            .slice(0, index)
            .some((field) => addressUtils.isAddressEqual(field.address, controlledMembersField[index].address));

    const haveMembersChanged = () => {
        const initialMembers = currentAdmins.map((member) => member.address);
        const newMembers = controlledMembersField.map((field) => field.address);

        if (initialMembers.length !== newMembers.length) {
            return true;
        }

        return !initialMembers.every((initialAddress) =>
            newMembers.some((newAddress) => addressUtils.isAddressEqual(initialAddress, newAddress)),
        );
    };

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <FormProvider {...formMethods}>
                <Dialog.Header title={t('app.plugins.admin.manageAdminsDialog.title')} />
                <Dialog.Content description={t('app.plugins.admin.manageAdminsDialog.description')}>
                    <form
                        className="flex w-full flex-col gap-3 pb-6 md:gap-2"
                        onSubmit={handleSubmit(handleFormSubmit)}
                        id={formId}
                    >
                        {membersField.map((field, index) => (
                            <ManageAdminsAddMembersItem
                                key={field.id}
                                index={index}
                                fieldName={membersFieldName}
                                onRemoveMember={membersField.length > 1 ? () => handleRemoveMember(index) : undefined}
                                isAlreadyInList={checkIsAlreadyInList(index)}
                            />
                        ))}
                        <Button
                            size="md"
                            variant="tertiary"
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={handleAddMember}
                        >
                            {t('app.plugins.admin.manageAdminsDialog.add')}
                        </Button>
                    </form>
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: t('app.plugins.admin.manageAdminsDialog.action.update'),
                        type: 'submit',
                        form: formId,
                        disabled: !haveMembersChanged(),
                    }}
                    secondaryAction={{
                        label: t('app.plugins.admin.manageAdminsDialog.action.cancel'),
                        onClick: () => onOpenChange?.(false),
                    }}
                />
            </FormProvider>
        </Dialog.Root>
    );
};
