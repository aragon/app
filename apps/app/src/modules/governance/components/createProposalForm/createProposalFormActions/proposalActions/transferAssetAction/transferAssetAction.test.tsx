import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import * as wagmi from 'wagmi';
import * as daoService from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import * as useTokenModule from '@/shared/hooks/useToken/useToken';
import {
    generateDao,
    generateDialogContext,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { TransferAssetAction } from './transferAssetAction';

describe('<TransferAssetAction /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useTokenSpy = jest.spyOn(useTokenModule, 'useToken');
    const useReadContractSpy = jest.spyOn(wagmi, 'useReadContract');
    const useBalanceSpy = jest.spyOn(wagmi, 'useBalance');
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');

    const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const receiverAddress = '0x2222222222222222222222222222222222222222';
    const rawAmount = '1234000000'; // 1234 tokens with 6 decimals

    const originalData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [receiverAddress, BigInt(rawAmount)],
    });

    const resolvedToken = {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        totalSupply: '1000000000000',
    };

    // Action shape produced by uploading a JSON file with an ERC20 transfer
    // (see normalizeTransferAction): placeholder 18-decimals token, amount '0'
    // and the real wei amount stored in rawAmount until decimals are fetched.
    const generateImportedAction = () => ({
        type: 'TRANSFER',
        to: tokenAddress,
        value: BigInt(0),
        data: originalData,
        inputData: {
            function: 'transfer',
            contract: 'USDC',
            parameters: [
                { name: '_to', type: 'address', value: receiverAddress },
                { name: '_value', type: 'uint256', value: rawAmount },
            ],
        },
        receiver: { address: receiverAddress },
        amount: '0',
        asset: {
            token: {
                address: tokenAddress,
                network: 'ethereum-mainnet',
                symbol: '',
                name: 'USDC',
                logo: '',
                decimals: 18,
                priceUsd: '0',
                totalSupply: null,
            },
            amount: undefined,
        },
        rawAmount,
        daoId: 'dao-test',
        meta: undefined,
    });

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ id: 'dao-test' }),
            }),
        );
        useTokenSpy.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        });
        useReadContractSpy.mockReturnValue({
            data: BigInt(0),
        } as unknown as wagmi.UseReadContractReturnType);
        useBalanceSpy.mockReturnValue({
            data: undefined,
        } as unknown as wagmi.UseBalanceReturnType);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useTokenSpy.mockReset();
        useReadContractSpy.mockReset();
        useBalanceSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    // Mimics useProposalActionsField's actionsMerged: the action prop is the
    // live watched form value, as on the real create-proposal page.
    const WatchedAction = (props: {
        initialAction: Record<string, unknown>;
    }) => {
        const watched = useWatch({ name: 'actions.0' });
        const action = { ...props.initialAction, ...(watched as object) };
        return (
            <TransferAssetAction
                action={action as unknown as IProposalActionData}
                index={0}
            />
        );
    };

    // biome-ignore lint/suspicious/noExplicitAny: test probe for form values
    let getFormValues: any;

    const Host = (props: { initialAction: Record<string, unknown> }) => {
        const methods = useForm({
            defaultValues: { actions: [props.initialAction] },
        });
        getFormValues = methods.getValues;
        return (
            <GukModulesProvider>
                <FormProvider {...methods}>
                    <WatchedAction initialAction={props.initialAction} />
                </FormProvider>
            </GukModulesProvider>
        );
    };

    const createTestComponent = (initialAction: Record<string, unknown>) => (
        <Host initialAction={initialAction} />
    );

    it('initializes an imported action when token data is cached at mount', () => {
        useTokenSpy.mockReturnValue({
            data: resolvedToken,
            isLoading: false,
            isError: false,
        });

        render(createTestComponent(generateImportedAction()));

        const action = getFormValues('actions.0');
        expect(action.amount).toEqual('1234');
        expect(action.data).toEqual(originalData);
        expect(action.asset.token.decimals).toEqual(6);
        expect(action.rawAmount).toBeUndefined();
        expect(action.inputData.parameters[1].value).toEqual(rawAmount);
    });

    it('keeps the uploaded calldata untouched while token data is loading and initializes the amount once it resolves', () => {
        const { rerender } = render(
            createTestComponent(generateImportedAction()),
        );

        // Token details not fetched yet: nothing may be derived from the
        // placeholder values, so the uploaded calldata must stay untouched.
        const loadingAction = getFormValues('actions.0');
        expect(loadingAction.data).toEqual(originalData);
        expect(loadingAction.rawAmount).toEqual(rawAmount);

        act(() => {
            useTokenSpy.mockReturnValue({
                data: resolvedToken,
                isLoading: false,
                isError: false,
            });
        });
        rerender(createTestComponent(generateImportedAction()));

        const action = getFormValues('actions.0');
        expect(action.amount).toEqual('1234');
        expect(action.data).toEqual(originalData);
        expect(action.asset.token.decimals).toEqual(6);
        expect(action.rawAmount).toBeUndefined();
    });

    it('encodes the transfer data for actions composed in the app', async () => {
        // Composer-created action: asset selected, amount typed in by the user after mount.
        const composedAmount = '5';
        const composedAction = {
            type: 'TRANSFER',
            to: tokenAddress,
            value: BigInt(0),
            data: '0x',
            inputData: undefined,
            receiver: { address: receiverAddress },
            amount: undefined,
            asset: {
                token: {
                    address: tokenAddress,
                    network: 'ethereum-mainnet',
                    symbol: 'TEST',
                    name: 'Test token',
                    logo: '',
                    decimals: 18,
                    priceUsd: '0',
                    totalSupply: null,
                },
                amount: '100',
            },
            daoId: 'dao-test',
            meta: undefined,
        };

        render(createTestComponent(composedAction));

        const user = userEvent.setup();
        await user.type(screen.getByRole('spinbutton'), composedAmount);

        const expectedData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [receiverAddress, parseUnits(composedAmount, 18)],
        });

        const action = getFormValues('actions.0');
        expect(action.data).toEqual(expectedData);
        expect(action.amount).toEqual(composedAmount);
        expect(action.value).toEqual('0');
        expect(action.to).toEqual(tokenAddress);
    });
});
