import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import * as ReactQuery from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import * as DaoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as BlockNavigation from '@/shared/components/blockNavigationContext';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import { DialogProvider } from '@/shared/components/dialogProvider/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateDao,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import { ExecuteActionsDialog } from './executeActionsDialog';
import type {
    IExecuteActionsDialogParams,
    IExecuteActionsDialogProps,
} from './executeActionsDialog.api';

jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({})),
}));

jest.mock('@tanstack/react-query', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
}));

describe('<ExecuteActionsDialog /> component', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useSendTransactionSpy = jest.spyOn(Wagmi, 'useSendTransaction');
    const useMutationSpy = jest.spyOn(ReactQuery, 'useMutation');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useBlockNavigationContextSpy = jest.spyOn(
        BlockNavigation,
        'useBlockNavigationContext',
    );

    const network = Network.ETHEREUM_MAINNET;

    beforeEach(() => {
        useConnectionSpy.mockReturnValue({
            address: '0x123',
        } as unknown as Wagmi.UseConnectionReturnType);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ network }) }),
        );
        useSendTransactionSpy.mockReturnValue({
            mutate: jest.fn(),
        } as unknown as Wagmi.UseSendTransactionReturnType);
        useMutationSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'idle',
        } as unknown as ReactQuery.UseMutationResult);
        useBlockNavigationContextSpy.mockReturnValue({
            isBlocked: false,
            setIsBlocked: jest.fn(),
        });
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useSendTransactionSpy.mockReset();
        useMutationSpy.mockReset();
        useDaoSpy.mockReset();
        useBlockNavigationContextSpy.mockReset();
    });

    const generateLocation = (
        params?: Partial<IExecuteActionsDialogParams>,
    ): IDialogLocation<IExecuteActionsDialogParams> => ({
        id: 'test',
        params: { daoId: 'test', actions: [], ...params },
    });

    const createTestComponent = (
        props?: Partial<IExecuteActionsDialogProps>,
    ) => {
        const completeProps: IExecuteActionsDialogProps = {
            location: generateLocation(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DialogProvider>
                    <Dialog.Root open={true}>
                        <ExecuteActionsDialog {...completeProps} />
                    </Dialog.Root>
                </DialogProvider>
            </GukModulesProvider>
        );
    };

    it('throws when the dialog parameters are not set', () => {
        testLogger.suppressErrors();
        const location = { id: 'test', params: undefined };
        expect(() => render(createTestComponent({ location }))).toThrow();
    });

    it('renders the title, description and prepare/submit steps', () => {
        render(createTestComponent());
        expect(
            screen.getByText(/executeActionsDialog.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/executeActionsDialog.step.prepare.label/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/executeActionsDialog.step.submit.label/),
        ).toBeInTheDocument();
    });

    it('auto-prepares the transaction once the DAO is loaded', async () => {
        const prepare = jest.fn();
        useMutationSpy.mockReturnValue({
            mutate: prepare,
            status: 'idle',
        } as unknown as ReactQuery.UseMutationResult);

        render(createTestComponent());

        await waitFor(() => expect(prepare).toHaveBeenCalled());
    });

    it('dispatches the transaction and completes immediately on submit, without waiting for the wallet', () => {
        const sendTransaction = jest.fn();
        const transaction = { to: '0x1', value: BigInt(0), data: '0x' };
        useSendTransactionSpy.mockReturnValue({
            mutate: sendTransaction,
        } as unknown as Wagmi.UseSendTransactionReturnType);
        // The prepared transaction is ready; the send mutation result is never awaited.
        useMutationSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'success',
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);

        render(createTestComponent());

        fireEvent.click(
            screen.getByRole('button', {
                name: /executeActionsDialog.button.submit/,
            }),
        );

        expect(sendTransaction).toHaveBeenCalledWith(
            expect.objectContaining(transaction),
            expect.anything(),
        );
        expect(
            screen.getByRole('link', {
                name: /executeActionsDialog.button.success/,
            }),
        ).toBeInTheDocument();
    });

    it('surfaces an error and offers a retry when the wallet rejects the transaction straight away', () => {
        useSendTransactionSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'error',
        } as unknown as Wagmi.UseSendTransactionReturnType);
        useMutationSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'success',
            data: { to: '0x1', value: BigInt(0), data: '0x' },
        } as unknown as ReactQuery.UseMutationResult);

        render(createTestComponent());

        expect(
            screen.getByText(/executeActionsDialog.step.submit.errorLabel/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /transactionDialog.footer.retry/,
            }),
        ).toBeInTheDocument();
    });

    it('pins the send to the required chain id of the DAO', () => {
        const sendTransaction = jest.fn();
        const transaction = { to: '0x1', value: BigInt(0), data: '0x' };
        useSendTransactionSpy.mockReturnValue({
            mutate: sendTransaction,
        } as unknown as Wagmi.UseSendTransactionReturnType);
        useMutationSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'success',
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);

        render(createTestComponent());

        fireEvent.click(
            screen.getByRole('button', {
                name: /executeActionsDialog.button.submit/,
            }),
        );

        expect(sendTransaction).toHaveBeenCalledWith(
            { ...transaction, chainId: networkDefinitions[network].id },
            expect.anything(),
        );
    });

    it('re-blocks navigation when an optimistically submitted transaction later fails', () => {
        const setIsBlocked = jest.fn();
        useBlockNavigationContextSpy.mockReturnValue({
            isBlocked: false,
            setIsBlocked,
        });
        useSendTransactionSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'error',
        } as unknown as Wagmi.UseSendTransactionReturnType);
        useMutationSpy.mockReturnValue({
            mutate: jest.fn(),
            status: 'success',
            data: { to: '0x1', value: BigInt(0), data: '0x' },
        } as unknown as ReactQuery.UseMutationResult);

        render(createTestComponent());

        expect(setIsBlocked).toHaveBeenCalledWith(true);
    });
});
