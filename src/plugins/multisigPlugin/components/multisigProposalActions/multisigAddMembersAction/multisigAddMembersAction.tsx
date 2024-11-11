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
import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, zeroAddress } from 'viem';
import { MultisigAddMembersActionItem } from './multisigAddMembersActionItem';

export interface IMultisigAddMembersActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

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

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const { fields, append, remove } = useFieldArray<Record<string, IMultisigAddMembersActionFormData>>({
        name: `${fieldName}.members`,
    });

    const watchFieldArray = useWatch({ name: `${fieldName}.members` });
    const controlledFields = fields.map((field, index) => ({
        ...field,
        ...watchFieldArray?.[index],
    }));

    useEffect(() => {
        if (fields.length === 0) {
            append({ address: '' });
        }
        setValue(`${fieldName}.to`, action.pluginAddress);
    }, [fields.length, append, fieldName, setValue, action.pluginAddress]);

    // Ref to prevent infinite loop when using controlled fields
    const prevDataRef = useRef<string | null>(null);

    useEffect(() => {
        const addresses = controlledFields
            .map((field) => (addressUtils.isAddress(field.address) ? field.address : zeroAddress))
            .filter(Boolean);
        const newData = encodeFunctionData({ abi: [addMembersAbi], args: [addresses] });
        if (prevDataRef.current !== newData) {
            setValue(`${fieldName}.data`, newData);
            prevDataRef.current = newData;
        }
    }, [fieldName, controlledFields, setValue, action.pluginAddress]);

    return (
        <>
            {fields.length > 0 && (
                <div className="flex w-full flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <MultisigAddMembersActionItem
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
