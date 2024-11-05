import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, InputNumber, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData, parseUnits, zeroAddress } from 'viem';
import type { IMintFormData } from './mintTokensActionFormDefinitions';

export interface IMintTokensActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

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
    } = useFormField<IMintFormData, 'receiver'>('receiver', {
        label: t('app.plugins.token.mintTokensAction.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix: fieldName,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(receiver?.address);

    const amountField = useFormField<IMintFormData, 'amount'>('amount', {
        label: t('app.plugins.token.mintTokensAction.amount.label'),
        rules: { required: true },
        fieldPrefix: fieldName,
    });

    const daoPluginParams = { daoId: action.daoId, pluginAddress: action.pluginAddress };

    const plugin = useDaoPlugins(daoPluginParams)![0];

    const settings = plugin?.meta.settings as ITokenPluginSettings;
    const tokenSymbol = settings?.token.symbol;
    const tokenAddress = settings?.token.address;

    useEffect(() => {
        const tokenDecimals = settings?.token.decimals ?? 18;
        const amount = parseUnits(amountField?.value ?? '0', tokenDecimals);
        const receiverAddress = addressUtils.isAddress(receiver?.address) ? receiver?.address : zeroAddress;
        const mintParams = [receiverAddress, amount];
        const newData = encodeFunctionData({ abi: [mintTokensAbi], args: mintParams });

        setValue(`${fieldName}.data`, newData);
        setValue(`${fieldName}.to`, tokenAddress);
    }, [setValue, fieldName, tokenAddress, settings?.token.decimals, amountField?.value, receiver?.address]);

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
