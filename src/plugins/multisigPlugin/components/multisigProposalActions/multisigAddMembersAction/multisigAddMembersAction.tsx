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
import { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { MultisigAddMembersActionItem } from './multisigAddMembersActionItem';

export interface IMultisigAddMembersActionProps extends IProposalActionComponentProps<IProposalActionData> {}

export interface IMultisigAddMembersActionFormData {
    /**
     * List of members to be added.
     */
    members: ICompositeAddress[];
}

const addMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'addAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigAddMembersAction: React.FC<IMultisigAddMembersActionProps> = (props) => {
    const { index, action } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const actionFieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const membersFieldName: `${string}.members` = `${actionFieldName}.members`;
    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
    } = useFieldArray<Record<string, IMultisigAddMembersActionFormData>>({
        name: membersFieldName,
    });

    const watchMembersField = useWatch<Record<string, IMultisigAddMembersActionFormData['members']>>({
        name: membersFieldName,
    });
    const controlledMembersField = useMemo(
        () => membersField.map((field, index) => ({ ...field, ...watchMembersField[index] })),
        [membersField, watchMembersField],
    );

    useEffect(() => {
        if (controlledMembersField.some((field) => !addressUtils.isAddress(field.address))) {
            return;
        }

        const addresses = controlledMembersField.map((field) => field.address);
        const newData = encodeFunctionData({ abi: [addMembersAbi], args: [addresses] });
        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, addresses.toString());
    }, [actionFieldName, controlledMembersField, setValue]);

    const handleRemoveMember = (index: number) => removeMember(index);

    const handleAddMember = () => addMember({ address: '' });

    const checkIsAlreadyInList = (index: number) =>
        controlledMembersField
            .slice(0, index)
            .some((field) => addressUtils.isAddressEqual(field.address, controlledMembersField[index].address));

    return (
        <>
            <div className="flex w-full flex-col gap-3 md:gap-2">
                {membersField.map((field, index) => (
                    <MultisigAddMembersActionItem
                        key={field.id}
                        index={index}
                        onRemoveMember={membersField.length > 1 ? () => handleRemoveMember(index) : undefined}
                        pluginAddress={action.to}
                        fieldName={membersFieldName}
                        isAlreadyInList={checkIsAlreadyInList(index)}
                    />
                ))}
            </div>
            <Button size="md" variant="tertiary" className="w-fit" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                {t('app.plugins.multisig.multisigAddMembersAction.add')}
            </Button>
        </>
    );
};
