import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import * as wagmi from 'wagmi';
import * as ensModule from '@/modules/ens';
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
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');
    const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;

    beforeEach(() => {
        useConnectionSpy.mockReturnValue({
            address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
        } as unknown as wagmi.UseConnectionReturnType);
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useEnsAvatarSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsAvatar>);
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
        useConnectionSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
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
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);

        render(createTestComponent({ location }));

        expect(useEnsNameSpy).toHaveBeenCalledWith(location.params.delegate);
        expect(getDelegateProps()).toEqual(
            expect.objectContaining({
                address: location.params.delegate,
                ensName: delegateEnsName,
                isDelegate: true,
            }),
        );
    });

    it('passes undefined ENS name when no ENS is resolved', () => {
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
