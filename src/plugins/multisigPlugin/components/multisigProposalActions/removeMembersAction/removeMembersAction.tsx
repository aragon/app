import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, IconType, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IAddOrRemoveMembersActionFormData } from '../addMembersAction/addMembersActionFormDefinitions';
import { RemoveMemberItem } from './removeMemberItem';
import { useAccount } from 'wagmi';

export interface IRemoveMembersActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const removeMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'removeAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const RemoveMembersAction: React.FC<IRemoveMembersActionProps> = (props) => {
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
        const addresses = controlledFields.map((field) => field.address).filter(Boolean);
        const newData = encodeFunctionData({ abi: [removeMembersAbi], args: [addresses] });

        setValue(`${fieldName}.data`, newData);
        setValue(`${fieldName}.to`, action.pluginAddress);
        setValue(`${fieldName}.from`, address);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldName, fields, setValue, action.pluginAddress, address]);

    console.log(controlledFields);

    return (
        <>
            {controlledFields.length > 0 && (
                <div className="flex w-full flex-col gap-3 md:gap-2">
                    {controlledFields.map((field, index) => (
                        <RemoveMemberItem
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
                {t('app.plugins.multisig.multisigRemoveMembersAction.add')}
            </Button>
        </>
    );
};
