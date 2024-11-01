import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, IconType, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IAddOrRemoveMembersActionFormData } from '../addMembersAction/addMembersActionFormDefinitions';
import { RemoveMemberItem } from './removeMemberItem';

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

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const { fields, append, remove } = useFieldArray<IAddOrRemoveMembersActionFormData>({ name: 'members' });

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    useEffect(() => {
        const addresses = fields.map((field) => field.address);
        const newData = encodeFunctionData({ abi: [removeMembersAbi], args: [addresses] });

        setValue(`${fieldName}.data`, newData);
        setValue(`${fieldName}.to`, action.pluginAddress);
    }, [fieldName, fields, setValue, action.pluginAddress]);

    return (
        <>
            {fields.length > 0 && (
                <div className="flex w-full flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <RemoveMemberItem key={field.id} index={index} remove={remove} action={action} />
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
