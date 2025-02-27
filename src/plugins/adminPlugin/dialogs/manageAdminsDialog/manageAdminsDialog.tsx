import type { IMember } from "@/modules/governance/api/governanceService";
import { useTranslations } from "@/shared/components/translationsProvider";
import {
    addressUtils,
    Button,
    Dialog,
    IconType,
    type ICompositeAddress,
    type IDialogRootProps,
} from '@aragon/gov-ui-kit';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { ManageAdminsAddMembersItem } from './manageAdminsDialogAddMembersItem';

export interface IManageAdminsDialogProps extends IDialogRootProps {
    currentAdmins: IMember[];
}

export interface IManageAdminsFormData {
    members: ICompositeAddress[];
}

export const ManageAdminsDialog: React.FC<IManageAdminsDialogProps> = (props) => {
    const { currentAdmins, ...otherProps } = props;

    const { t } = useTranslations();

    const initialMembers = currentAdmins.map((member) => ({
        address: member.address,
    }));

    const formMethods = useForm<IManageAdminsFormData>({
        defaultValues: {
            members: initialMembers.length > 0 ? initialMembers : [{ address: '' }],
        },
        mode: 'onChange',
    });

    const { handleSubmit, control } = formMethods;

    const membersFieldName = 'members';
    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
    } = useFieldArray({ name: membersFieldName, control });

    const handleAddMember = () => addMember({ address: '' });

    const handleRemoveMember = (index: number) => {
        if (membersField.length > 1) {
            removeMember(index);
        }
    };

    const handleFormSubmit = (data: IManageAdminsFormData) => {
        console.log('data', data);
    };
    console.log('membersField', membersField);
    const checkIsAlreadyInList = (index: number) =>
        membersField
            .slice(0, index)
            .some((field) => addressUtils.isAddressEqual(field.address, membersField[index].address));

    return (
        <Dialog.Root {...otherProps}>
            <Dialog.Header title={t('app.plugins.admin.manageAdminsDialog.title')} />
            <Dialog.Content description={t('app.plugins.admin.manageAdminsDialog.description')}>
                <FormProvider {...formMethods}>
                    <form
                        className="flex w-full flex-col gap-3 pb-6 md:gap-2"
                        onSubmit={handleSubmit(handleFormSubmit)}
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
                </FormProvider>
            </Dialog.Content>
        </Dialog.Root>
    );
};
