import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, InputNumber, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData, parseUnits } from 'viem';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import type { IMintFormData } from './mintActionFormDefinitions';

export interface IMintActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

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

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const {
        onChange: onReceiverChange,
        value: receiver,
        ...receiverField
    } = useFormField<IMintFormData, 'receiver'>('receiver', {
        label: t('app.plugins.token.mintActionForm.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix: fieldName,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(receiver?.address);

    const amountField = useFormField<IMintFormData, 'amount'>('amount', {
        label: t('app.plugins.token.mintActionForm.amount.label'),
        rules: { required: true },
        fieldPrefix: fieldName,
    });

    const daoUrlParams = { id: action.daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const plugin = dao?.plugins.find((plugin) => plugin.address === action.pluginAddress);

    const settings = plugin?.settings as ITokenPluginSettings;
    const tokenSymbol = settings?.token.symbol;
    const tokenDecimals = settings?.token.decimals ?? 18;
    const tokenAddress = settings?.token.address;

    const amount = parseUnits(amountField?.value ?? '0', tokenDecimals);

    useEffect(() => {
        const mintParams = [tokenAddress, amount];
        const newData = encodeFunctionData({ abi: [mintAbi], args: mintParams });

        setValue(`${fieldName}.data`, newData);
        setValue(`${fieldName}.to`, tokenAddress);
    }, [setValue, fieldName, tokenAddress, amount]);

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                chainId={1}
                placeholder={t('app.plugins.token.mintActionForm.address.placeholder')}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <InputNumber
                placeholder={t('app.plugins.token.mintActionForm.amount.placeholder', { symbol: tokenSymbol })}
                min={0}
                suffix={tokenSymbol}
                {...amountField}
            />
        </div>
    );
};
