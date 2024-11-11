import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, InputNumber, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData, parseUnits, zeroAddress } from 'viem';
import type { IMintTokensFormData } from './mintTokensActionFormDefinitions';

export interface IMintTokensActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<ITokenPluginSettings>>> {}

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

export const MintTokensAction: React.FC<IMintTokensActionProps> = (props) => {
    const { index, action } = props;

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const {
        onChange: onReceiverChange,
        value: receiver,
        ...receiverField
    } = useFormField<IMintTokensFormData, 'receiver'>('receiver', {
        label: t('app.plugins.token.mintTokensAction.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix: fieldName,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(receiver?.address);

    const amountField = useFormField<IMintTokensFormData, 'amount'>('amount', {
        label: t('app.plugins.token.mintTokensAction.amount.label'),
        rules: {
            required: true,
            validate: (value) => parseFloat(value ?? '') > 0,
        },
        fieldPrefix: fieldName,
    });

    const { symbol: tokenSymbol, address: tokenAddress, decimals: tokenDecimals } = action.meta?.settings.token;
    const parsedAmount = parseUnits(amountField?.value ?? '0', tokenDecimals);

    useEffect(() => {
        const receiverAddress = addressUtils.isAddress(receiver?.address) ? receiver?.address : zeroAddress;
        const mintParams = [receiverAddress, parsedAmount];
        const newData = encodeFunctionData({ abi: [mintTokensAbi], args: mintParams });

        setValue(`${fieldName}.data`, newData);
        setValue(`${fieldName}.to`, tokenAddress);
    }, [setValue, fieldName, parsedAmount, receiver?.address]);

    useEffect(() => {
        setValue(`${fieldName}.inputData.parameters[0].value`, receiver?.address);
    }, [receiver]);

    useEffect(() => {
        console.log({ parsedAmount });
        setValue(`${fieldName}.inputData.parameters[1].value`, parsedAmount.toString());
    }, [parsedAmount]);

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                chainId={1}
                placeholder={t('app.plugins.token.mintTokensAction.address.placeholder')}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <InputNumber
                placeholder={t('app.plugins.token.mintTokensAction.amount.placeholder', { symbol: tokenSymbol })}
                min={0}
                suffix={tokenSymbol}
                {...amountField}
            />
        </div>
    );
};
