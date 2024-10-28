import type { IProposalAction } from '@/modules/governance/api/governanceService';
import {
    AddressInput,
    addressUtils,
    type ICompositeAddress,
    InputNumber,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { useEffect, useState } from 'react';
import { encodeFunctionData, parseUnits } from 'viem';
import { useFormContext } from 'react-hook-form';
import { useDao } from '@/shared/api/daoService';

export interface IMintActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export interface IMintFormData {
    /**
     * The address receiving the tokens.
     */
    receiver?: ICompositeAddress;
    /**
     * The amount of tokens to be sent.
     */
    amount?: string;
}

const mintAbi = {
    type: 'function',
    inputs: [
        { name: 'to', internalType: 'address', type: 'address' },
        { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MintAction: React.FC<IMintActionProps> = (props) => {
    const { index, action } = props;

    const { setValue } = useFormContext();

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const {
        onChange: onReceiverChange,
        value,
        ...receiverField
    } = useFormField<IMintFormData, 'receiver'>('receiver', {
        label: 'Address',
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix: fieldName,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(value?.address);

    const amountField = useFormField<IMintFormData, 'amount'>('amount', {
        label: 'Tokens',
        defaultValue: '0',
        rules: { required: true, min: 0, max: 1000000000 },
        fieldPrefix: fieldName,
    });

    const amount = parseUnits(amountField?.value ?? '0', 18);

    useEffect(() => {
        const mintParams = [receiverInput, amount];
        const newData = encodeFunctionData({ abi: [mintAbi], args: mintParams });

        setValue(`${fieldName}.data`, newData);
    }, [setValue, fieldName, receiverInput, amount]);

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                chainId={1}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <InputNumber min={0} max={1000000} {...amountField} />
        </div>
    );
};
