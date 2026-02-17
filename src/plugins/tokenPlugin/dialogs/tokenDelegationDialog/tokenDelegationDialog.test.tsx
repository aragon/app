import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { mainnet } from 'viem/chains';
import * as wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import {
    type ITransactionDialogProps,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import {
    type ITokenDelegationDialogProps,
    TokenDelegationDialog,
} from './tokenDelegationDialog';

jest.mock('@/shared/components/transactionDialog', () => ({
    ...jest.requireActual('@/shared/components/transactionDialog'),
    TransactionDialog: jest.fn((props: { children: React.ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('<TokenDelegationDialog /> component', () => {
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const useEnsNameSpy = jest.spyOn(wagmi, 'useEnsName');
    const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

    beforeEach(() => {
        useAccountSpy.mockReturnValue({
            address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
        } as unknown as wagmi.UseAccountReturnType);
        useEnsNameSpy.mockReturnValue(
            {} as unknown as wagmi.UseEnsNameReturnType,
        );
        useRouterMock.mockReturnValue({
            back: jest.fn(),
            forward: jest.fn(),
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            refresh: jest.fn(),
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useEnsNameSpy.mockReset();
        useRouterMock.mockReset();
        (TransactionDialog as jest.Mock).mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITokenDelegationDialogProps>,
    ) => {
        const completeProps: ITokenDelegationDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenDelegationDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    const location = {
        id: 'test',
        params: {
            token: '0x123',
            delegate: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
            network: Network.ETHEREUM_MAINNET,
        },
    };

    const getDelegateProps = () => {
        const { children } = (
            TransactionDialog as jest.Mock<
                ReactElement,
                ITransactionDialogProps<string>[]
            >
        ).mock.calls[0][0];

        return (children as ReactElement).props;
    };

    it('passes resolved ENS name to delegate item in transaction dialog', () => {
        const delegateEnsName = 'delegate.eth';
        useEnsNameSpy.mockReturnValue({
            data: delegateEnsName,
        } as unknown as wagmi.UseEnsNameReturnType);

        render(createTestComponent({ location }));

        expect(useEnsNameSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                address: location.params.delegate,
                chainId: mainnet.id,
            }),
        );
        expect(getDelegateProps()).toEqual(
            expect.objectContaining({
                address: location.params.delegate,
                ensName: delegateEnsName,
                isDelegate: true,
            }),
        );
    });

    it('passes undefined ENS name when no ENS is resolved', () => {
        useEnsNameSpy.mockReturnValue({
            data: null,
        } as unknown as wagmi.UseEnsNameReturnType);

        render(createTestComponent({ location }));

        expect(getDelegateProps()).toEqual(
            expect.objectContaining({
                address: location.params.delegate,
                ensName: undefined,
                isDelegate: true,
            }),
        );
    });
});
