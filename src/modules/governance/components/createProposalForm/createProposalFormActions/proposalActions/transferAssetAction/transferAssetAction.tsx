import {
    addressUtils,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    encodeFunctionData,
    erc20Abi,
    formatUnits,
    type Hex,
    parseUnits,
    zeroAddress,
} from 'viem';
import { useBalance, useReadContract } from 'wagmi';
import type { IAsset } from '@/modules/finance/api/financeService';
import {
    type ITransferAssetFormData,
    TransferAssetForm,
} from '@/modules/finance/components/transferAssetForm';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer';
import { useDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { useToken } from '@/shared/hooks/useToken';
import type { IImportedTransferActionData } from '@/modules/governance/utils/proposalActionsImportExportUtils';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';

export interface ITransferAssetActionProps
    extends IProposalActionComponentProps<
        IProposalActionData & IImportedTransferActionData
    > {}

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

export const TransferAssetAction: React.FC<ITransferAssetActionProps> = (
    props,
) => {
    const { action, index } = props;

    const { setValue, getValues } = useFormContext();
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    const fieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(
        fieldName,
    );

    // Fetch the token info and the balance of the DAO using the "to" attribute set on the action when the action type
    // is transferActionLocked to correctly initialize the form data and disable the token selection.
    const disableTokenSelection =
        action.type === actionComposerUtils.transferActionLocked;
    const { id: chainId } = networkDefinitions[dao!.network];

    // For imported ERC20 actions, we need to fetch token details to get correct decimals
    const isImportedErc20Action =
        action.rawAmount != null && action.to !== zeroAddress;
    const { data: token } = useToken({
        address: action.to as Hex,
        chainId,
        enabled: disableTokenSelection || isImportedErc20Action,
    });
    const { data: balance } = useReadContract({
        abi: erc20Abi,
        address: action.to as Hex,
        functionName: 'balanceOf',
        args: [dao!.address as Hex],
        chainId,
    });

    const receiver = useWatch<
        Record<string, ITransferAssetFormData['receiver']>
    >({
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

    // For imported/uploaded actions fetch balance for the current DAO but keep it separate from transferActionLocked, which is a different thing.
    const shouldFetchImportedTokenBalance =
        !disableTokenSelection && asset != null && asset.amount == null;
    const { data: nativeBalance } = useBalance({
        address: dao!.address as Hex,
        chainId,
        query: {
            enabled: shouldFetchImportedTokenBalance && isNativeToken,
        },
    });
    const { data: erc20Balance } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as Hex,
        functionName: 'balanceOf',
        args: [dao!.address as Hex],
        chainId,
        query: {
            enabled: shouldFetchImportedTokenBalance && !isNativeToken,
        },
    });

    const receiverAddress = addressUtils.isAddress(receiver?.address)
        ? receiver?.address
        : zeroAddress;

    const weiAmount = parseUnits(amount ?? '0', tokenDecimals);

    // Initialize asset field for transferActionLocked case
    useEffect(() => {
        if (token == null || balance == null) {
            return;
        }

        const tokenAsset = {
            ...token,
            address: tokenAddress,
            network: dao!.network,
            logo: '',
            priceUsd: '0',
        };
        const tokenBalance = formatUnits(balance, tokenDecimals);
        const asset: IAsset = { token: tokenAsset, amount: tokenBalance };

        setValue(`${fieldName}.asset`, asset);
    }, [token, balance, tokenAddress, tokenDecimals, setValue, fieldName, dao]);

    // Initialize imported ERC20 action with fetched token details and formatted amount
    useEffect(() => {
        if (
            !isImportedErc20Action ||
            token == null ||
            action.rawAmount == null
        ) {
            return;
        }

        const tokenAsset = {
            ...token,
            address: tokenAddress,
            network: dao!.network,
            logo: '',
            priceUsd: '0',
        };

        // Format the raw amount with the correct decimals
        const formattedAmount = formatUnits(
            BigInt(action.rawAmount),
            token.decimals,
        );

        // Set both asset and amount fields
        setValue(`${fieldName}.asset`, {
            token: tokenAsset,
            amount: undefined,
        });
        setValue(`${fieldName}.amount`, formattedAmount);

        // Clear rawAmount after initialization
        setValue(`${fieldName}.rawAmount`, undefined);
    }, [
        isImportedErc20Action,
        token,
        action.rawAmount,
        tokenAddress,
        dao,
        setValue,
        fieldName,
    ]);

    // Update asset balance for imported actions. Uploaded and decoded transfer actions have token info, but don't have max available balance for the given DAO.
    useEffect(() => {
        if (!shouldFetchImportedTokenBalance) {
            return;
        }

        const currentAsset = getValues(`${fieldName}.asset`);
        if (currentAsset == null) {
            return;
        }

        const balanceValue = isNativeToken
            ? nativeBalance?.value
            : erc20Balance;

        if (balanceValue == null) {
            return;
        }

        const formattedBalance = formatUnits(balanceValue, tokenDecimals);

        // Only update if balance has actually changed to prevent loops
        if (currentAsset.amount !== formattedBalance) {
            setValue(`${fieldName}.asset`, {
                ...currentAsset,
                amount: formattedBalance,
            });
        }
    }, [
        shouldFetchImportedTokenBalance,
        isNativeToken,
        nativeBalance,
        erc20Balance,
        tokenDecimals,
        setValue,
        fieldName,
        getValues,
    ]);

    useEffect(() => {
        const transferParams = [receiverAddress, weiAmount];
        const newData = isNativeToken
            ? '0x'
            : encodeFunctionData({
                  abi: [erc20TransferAbi],
                  args: transferParams,
              });

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

    useEffect(() => {
        // Get current inputData to preserve function and stateMutability
        const currentAction = getValues(`actions.${index.toString()}`) as
            | IProposalActionData
            | undefined;
        const currentInputData = currentAction?.inputData ?? {};

        const newContractParameters = [
            { name: '_to', type: 'address', value: receiverAddress },
            { name: '_value', type: 'uint256', value: weiAmount.toString() },
        ];
        const processedParameters = isNativeToken ? [] : newContractParameters;

        // Preserve all inputData fields while updating specific ones
        setValue(`${fieldName}.inputData`, {
            ...currentInputData,
            contract: tokenName,
            parameters: processedParameters,
        });
    }, [
        isNativeToken,
        receiverAddress,
        weiAmount,
        setValue,
        fieldName,
        tokenName,
        index,
        getValues,
    ]);

    return (
        <TransferAssetForm
            daoId={dao!.id}
            disableAssetField={disableTokenSelection}
            fieldPrefix={fieldName}
            network={dao!.network}
            sender={dao!.address}
        />
    );
};
