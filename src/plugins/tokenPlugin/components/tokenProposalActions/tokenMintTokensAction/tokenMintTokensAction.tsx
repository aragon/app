import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    InputNumber,
    type ICompositeAddress,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData, parseUnits, zeroAddress } from 'viem';

export interface ITokenMintTokensActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<ITokenPluginSettings>>> {}

export interface ITokenMintTokensFormData {
    /**
     * The address receiving the tokens.
     */
    receiver?: ICompositeAddress;
    /**
     * The amount of tokens to be minted.
     */
    amount?: string;
}

const mintTokensAbi = {
    type: 'function',
    inputs: [
        { name: 'to', internalType: 'address', type: 'address' },
        { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const TokenMintTokensAction: React.FC<ITokenMintTokensActionProps> = (props) => {
    const { index, action } = props;

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const fieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const {
        onChange: onReceiverChange,
        value: receiver,
        ...receiverField
    } = useFormField<ITokenMintTokensFormData, 'receiver'>('receiver', {
        label: t('app.plugins.token.tokenMintTokensAction.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix: fieldName,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(receiver?.address);

    const amountField = useFormField<ITokenMintTokensFormData, 'amount'>('amount', {
        label: t('app.plugins.token.tokenMintTokensAction.amount.label'),
        rules: {
            required: true,
            validate: (value) => parseFloat(value ?? '') > 0,
        },
        fieldPrefix: fieldName,
    });

    const { symbol: tokenSymbol, decimals: tokenDecimals } = action.meta.settings.token;
    const parsedAmount = parseUnits(amountField.value ?? '0', tokenDecimals);

    useEffect(() => {
        const receiverAddress = addressUtils.isAddress(receiver?.address) ? receiver?.address : zeroAddress;
        const mintParams = [receiverAddress, parsedAmount];
        const newData = encodeFunctionData({ abi: [mintTokensAbi], args: mintParams });

        setValue(`${fieldName}.data`, newData);
    }, [setValue, fieldName, parsedAmount, receiver?.address]);

    useEffect(() => {
        setValue(`${fieldName}.inputData.parameters[0].value`, receiver?.address);
    }, [receiver, fieldName, setValue]);

    useEffect(() => {
        setValue(`${fieldName}.inputData.parameters[1].value`, parsedAmount.toString());
    }, [parsedAmount, fieldName, setValue]);

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                chainId={1}
                placeholder={t('app.plugins.token.tokenMintTokensAction.address.placeholder')}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <InputNumber
                placeholder={t('app.plugins.token.tokenMintTokensAction.amount.placeholder', { symbol: tokenSymbol })}
                min={0}
                suffix={tokenSymbol}
                {...amountField}
            />
        </div>
    );
};
