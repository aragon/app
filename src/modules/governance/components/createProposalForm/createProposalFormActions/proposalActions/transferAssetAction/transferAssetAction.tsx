import { type ITransferAssetFormData, TransferAssetForm } from '@/modules/finance/components/transferAssetForm';
import type { IProposalActionWithdrawToken } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, type IProposalActionComponentProps } from '@aragon/ods';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, formatUnits, parseUnits, zeroAddress } from 'viem';
import type { IProposalActionIndexed } from '../../../createProposalFormDefinitions';

export interface ITransferAssetActionProps
    extends IProposalActionComponentProps<IProposalActionIndexed<IProposalActionWithdrawToken>> {}

const erc20TransferAbi = {
    type: 'function',
    inputs: [
        { name: '_to', type: 'address' },
        { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
};

export const TransferAssetAction: React.FC<ITransferAssetActionProps> = (props) => {
    const { action } = props;

    const { setValue } = useFormContext();

    const fieldName = `actions.[${action.index}]`;
    useFormField<Record<string, IProposalActionIndexed<IProposalActionWithdrawToken>>, typeof fieldName>(fieldName);

    const receiver = useWatch<Record<string, ITransferAssetFormData['receiver']>>({ name: `${fieldName}.receiver` });
    const token = useWatch<Record<string, ITransferAssetFormData['token']>>({ name: `${fieldName}.token` });
    const amount = useWatch<Record<string, ITransferAssetFormData['amount']>>({ name: `${fieldName}.amount` });

    const tokenDecimals = token?.decimals ?? 18;
    const tokenAddress = token?.address ?? zeroAddress;
    const tokenName = token?.name ?? 'Ether';
    const isNativeToken = tokenAddress === zeroAddress;

    const receiverAddress = addressUtils.isAddress(receiver?.address) ? receiver?.address : zeroAddress;

    const weiAmount = parseUnits(amount ?? '0', tokenDecimals);

    useEffect(() => {
        const transferParams = [receiverAddress, weiAmount];
        const newData = isNativeToken ? '0x' : encodeFunctionData({ abi: [erc20TransferAbi], args: transferParams });

        setValue(`${fieldName}.data`, newData);
    }, [isNativeToken, receiverAddress, weiAmount, fieldName, setValue]);

    useEffect(() => {
        const newTarget = isNativeToken ? receiverAddress : tokenAddress;

        setValue(`${fieldName}.to`, newTarget);
    }, [isNativeToken, receiverAddress, tokenAddress, fieldName, setValue]);

    useEffect(() => {
        const newAmount = formatUnits(weiAmount, tokenDecimals).toString();

        setValue(`${fieldName}.amount`, newAmount);
    }, [weiAmount, tokenDecimals, fieldName, setValue]);

    useEffect(() => {
        const newValue = isNativeToken ? weiAmount.toString() : '0';

        setValue(`${fieldName}.value`, newValue);
    }, [isNativeToken, weiAmount, fieldName, setValue]);

    useEffect(() => setValue(`${fieldName}.inputData.contract`, tokenName), [setValue, fieldName, tokenName]);

    useEffect(() => {
        const newContractParameters = [
            { name: '_to', type: 'address', value: receiverAddress },
            { name: '_value', type: 'uint256', value: weiAmount.toString() },
        ];
        const processedParameters = isNativeToken ? [] : newContractParameters;

        setValue(`${fieldName}.inputData.parameters`, processedParameters);
    }, [isNativeToken, receiverAddress, weiAmount, setValue, fieldName]);

    const daoUrlParams = { id: action.daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    return <TransferAssetForm sender={dao!.address} network={dao!.network} fieldPrefix={fieldName} />;
};
