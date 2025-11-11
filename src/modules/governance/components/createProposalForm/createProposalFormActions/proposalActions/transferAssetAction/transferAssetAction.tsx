import type { IAsset } from '@/modules/finance/api/financeService';
import { type ITransferAssetFormData, TransferAssetForm } from '@/modules/finance/components/transferAssetForm';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer';
import { useDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { useToken } from '@/shared/hooks/useToken';
import { addressUtils, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, erc20Abi, formatUnits, type Hex, parseUnits, zeroAddress } from 'viem';
import { useReadContract } from 'wagmi';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';

export interface ITransferAssetActionProps extends IProposalActionComponentProps<IProposalActionData> {}

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
    const { action, index } = props;

    const { setValue } = useFormContext();
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    const fieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    // Fetch the token info and the balance of the DAO using the "to" attribute set on the action when the action type
    // is transferActionLocked to correctly initialize the form data and disable the token selection.
    const disableTokenSelection = action.type === actionComposerUtils.transferActionLocked;
    const { id: chainId } = networkDefinitions[dao!.network];
    const { data: token } = useToken({ address: action.to as Hex, chainId, enabled: disableTokenSelection });
    const { data: balance } = useReadContract({
        abi: erc20Abi,
        address: action.to as Hex,
        functionName: 'balanceOf',
        args: [dao!.address as Hex],
        chainId,
    });

    const receiver = useWatch<Record<string, ITransferAssetFormData['receiver']>>({
        name: `${fieldName}.receiver`,
        defaultValue: undefined,
    });
    const asset = useWatch<Record<string, ITransferAssetFormData['asset']>>({
        name: `${fieldName}.asset`,
        defaultValue: undefined,
    });
    const amount = useWatch<Record<string, ITransferAssetFormData['amount']>>({
        name: `${fieldName}.amount`,
        defaultValue: '0',
    });

    const tokenDecimals = asset?.token.decimals ?? 18;
    const tokenAddress = asset?.token.address ?? action.to;
    const tokenName = asset?.token.name ?? 'Ether';

    const isNativeToken = tokenAddress === zeroAddress;
    const receiverAddress = addressUtils.isAddress(receiver?.address) ? receiver?.address : zeroAddress;

    const weiAmount = parseUnits(amount ?? '0', tokenDecimals);

    useEffect(() => {
        if (token == null || balance == null) {
            return;
        }

        const tokenAsset = { ...token, address: tokenAddress, network: dao!.network, logo: '', priceUsd: '0' };
        const tokenBalance = formatUnits(balance, tokenDecimals);
        const asset: IAsset = { token: tokenAsset, amount: tokenBalance };

        setValue(`${fieldName}.asset`, asset);
    }, [token, balance, tokenAddress, tokenDecimals, setValue, fieldName, dao]);

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
        const newAmount = formatUnits(weiAmount, tokenDecimals);

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

    return (
        <TransferAssetForm
            sender={dao!.address}
            network={dao!.network}
            fieldPrefix={fieldName}
            disableAssetField={disableTokenSelection}
        />
    );
};
