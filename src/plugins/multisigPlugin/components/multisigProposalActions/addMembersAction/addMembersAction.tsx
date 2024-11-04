import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, Button, IconType, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { IAddOrRemoveMembersActionFormData } from './addMembersActionFormDefinitions';
import { useEffect } from 'react';
import { encodeFunctionData, zeroAddress } from 'viem';
import { AddMemberItem } from './addMemberItem';
import { useAccount } from 'wagmi';

export interface IAddMembersActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const addMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'addAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const AddMembersAction: React.FC<IAddMembersActionProps> = (props) => {
    const { index, action } = props;

    const { address } = useAccount();

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const { fields, append, remove } = useFieldArray<Record<string, IAddOrRemoveMembersActionFormData>>({
        name: `${fieldName}.members`,
    });

    // Needed to control the entire field array (see Controlled Field Array on useFieldArray)
    const watchFieldArray = useWatch({ name: `${fieldName}.members` });
    const controlledFields = fields.map((field, index) => ({ ...field, ...watchFieldArray[index] }));

    useEffect(() => {
        const addresses = fields
            .map((field) => (addressUtils.isAddress(field.address) ? field.address : zeroAddress))
            .filter(Boolean);
        const newData = encodeFunctionData({ abi: [addMembersAbi], args: [addresses] });

        setValue(`${fieldName}.data`, newData);
        setValue(`${fieldName}.to`, action.pluginAddress);
        setValue(`${fieldName}.from`, address);
    }, [fieldName, fields, setValue, action.pluginAddress, address]);

    console.log('CONTROLLED_FIELDS =>', controlledFields);
    console.log('FIELDS =>', fields);

    return (
        <>
            {fields.length > 0 && (
                <div className="flex w-full flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <AddMemberItem
                            key={field.id}
                            index={index}
                            remove={remove}
                            action={action}
                            fieldName={`${fieldName}.members`}
                        />
                    ))}
                </div>
            )}
            <Button
                size="md"
                variant="tertiary"
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() => append({ address: '' })}
            >
                {t('app.plugins.multisig.multisigAddMembersAction.add')}
            </Button>
        </>
    );
};
