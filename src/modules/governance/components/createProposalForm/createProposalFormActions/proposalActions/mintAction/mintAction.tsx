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
import { encodeFunctionData, parseUnits, zeroAddress } from 'viem';
import { useFormContext } from 'react-hook-form';
import { useDao } from '@/shared/api/daoService';
import { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';

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
    const { setValue, watch } = useFormContext();

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

    const [receiverInput, setReceiverInput] = useState<string | undefined>(value?.address ?? '0');

    const amountField = useFormField<IMintFormData, 'amount'>('amount', {
        label: 'Tokens',
        rules: { required: true },
        fieldPrefix: fieldName,
    });

    const daoUrlParams = { id: action.daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const plugin = dao?.plugins.find((plugin) => plugin.address === action.pluginAddress);

    const settings = plugin?.settings as ITokenPluginSettings;
    const maxSupply = Number(settings?.token.totalSupply);
    const tokenSymbol = settings?.token.symbol;
    const tokenDecimals = settings?.token.decimals ?? 18;
    const amount = parseUnits(amountField?.value ?? '0', tokenDecimals);

    const receiverAddress = addressUtils.isAddress(receiverInput) ? receiverInput : zeroAddress;

    useEffect(() => {
        const mintParams = [receiverAddress, '1'];
        const newData = encodeFunctionData({ abi: [mintAbi], args: mintParams });
        console.log('newData', newData);
        setValue(`${fieldName}.data`, newData);
    }, [setValue, fieldName, receiverInput, amount]);

    console.log('watch', watch());
    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                chainId={1}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <InputNumber
                placeholder={`0 ${tokenSymbol}`}
                min={0}
                max={maxSupply}
                suffix={tokenSymbol}
                {...amountField}
            />
        </div>
    );
};
