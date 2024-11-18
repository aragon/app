import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    addressUtils,
    Button,
    type ICompositeAddress,
    IconType,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { MultisigRemoveMembersActionDialog } from './multisigRemoveMembersActionDialog';
import { MultisigRemoveMembersActionItem } from './multisigRemoveMembersActionItem';

export interface IMultisigRemoveMembersActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export interface IMultisigRemoveMembersActionFormData {
    /**
     * List of members to be removed.
     */
    members: ICompositeAddress[];
}

const removeMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'removeAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigRemoveMembersAction: React.FC<IMultisigRemoveMembersActionProps> = (props) => {
    const { action, index } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const actionFieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const membersFieldName: `${string}.members` = `${actionFieldName}.members`;
    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
    } = useFieldArray<Record<string, IMultisigRemoveMembersActionFormData>>({
        name: membersFieldName,
        rules: { required: true, minLength: 1 },
    });

    const watchFieldArray = useWatch({ name: membersFieldName });
    const controlledMembersField = useMemo(
        () => membersField.map((field, index) => ({ ...field, ...watchFieldArray?.[index] })),
        [membersField, watchFieldArray],
    );

    const handleMemberClick = (memberAddress: string) => addMember({ address: memberAddress });

    const checkIsAlreadyInList = (index: number) =>
        controlledMembersField
            .slice(0, index)
            .some((field) => addressUtils.isAddressEqual(field.address, controlledMembersField[index].address));

    useEffect(() => {
        if (controlledMembersField.some((field) => !addressUtils.isAddress(field.address))) {
            return;
        }

        const addresses = controlledMembersField.map((field) => field.address);
        const newData = encodeFunctionData({ abi: [removeMembersAbi], args: [addresses] });
        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, addresses.toString());
    }, [actionFieldName, controlledMembersField, setValue]);

    return (
        <>
            {membersField.length > 0 && (
                <div className="flex w-full flex-col gap-3 md:gap-2">
                    {membersField.map((field, index) => (
                        <MultisigRemoveMembersActionItem
                            key={field.id}
                            index={index}
                            onRemoveClick={removeMember}
                            fieldName={membersFieldName}
                            isAlreadyInList={checkIsAlreadyInList(index)}
                        />
                    ))}
                </div>
            )}
            <Button
                size="md"
                variant="tertiary"
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() => setIsDialogOpen(true)}
            >
                {t('app.plugins.multisig.multisigRemoveMembersAction.add')}
            </Button>
            <MultisigRemoveMembersActionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                daoId={action.daoId}
                pluginAddress={action.to}
                onMemberClick={handleMemberClick}
            />
        </>
    );
};
