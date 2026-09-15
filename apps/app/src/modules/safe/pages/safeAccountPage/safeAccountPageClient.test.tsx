import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import * as useDaoChainModule from '@/shared/hooks/useDaoChain';
import {
    generateReactQueryResultSuccess,
    generateSafeInfoResponse,
} from '@/shared/testUtils';
import {
    type ISafeAccountPageClientProps,
    SafeAccountPageClient,
} from './safeAccountPageClient';

jest.mock('../../components/safeOwnerList', () => ({
    SafeOwnerList: () => <div data-testid="owner-list-mock" />,
}));

jest.mock('../../components/safePendingTransactionList', () => ({
    SafePendingTransactionList: (props: { currentNonce?: string }) => (
        <div data-nonce={props.currentNonce} data-testid="pending-list-mock" />
    ),
}));

jest.mock('../../components/safeBalanceList', () => ({
    SafeBalanceList: () => <div data-testid="balance-list-mock" />,
}));

describe('<SafeAccountPageClient /> component', () => {
    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useDaoChainSpy = jest.spyOn(useDaoChainModule, 'useDaoChain');

    beforeEach(() => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse(),
            }),
        );
        useDaoChainSpy.mockReturnValue({
            chainId: 1,
            network: Network.ETHEREUM_MAINNET,
            networkDefinition: undefined,
            buildEntityUrl: () => 'https://explorer.test/address',
            isLoading: false,
        });
    });

    afterEach(() => {
        useSafeInfoSpy.mockReset();
        useDaoChainSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeAccountPageClientProps>,
    ) => {
        const completeProps: ISafeAccountPageClientProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            ...props,
        };

        return <SafeAccountPageClient {...completeProps} />;
    };

    it('renders the owners, pending transactions and assets of the Safe', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({ nonce: '42' }),
            }),
        );
        render(createTestComponent());

        expect(screen.getByTestId('owner-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('balance-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('pending-list-mock').dataset.nonce).toEqual(
            '42',
        );
    });

    it('displays the reported Safe version verbatim', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({ version: '1.4.1+L2' }),
            }),
        );
        render(createTestComponent());

        expect(screen.getByText('1.4.1+L2')).toBeInTheDocument();
    });

    it('renders a Safe below the EIP-1271 floor without gating the read view', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({ version: '1.1.1' }),
            }),
        );
        render(createTestComponent());

        expect(screen.getByText('1.1.1')).toBeInTheDocument();
        expect(screen.getByTestId('owner-list-mock')).toBeInTheDocument();
    });

    it.each([
        { network: Network.CHILIZ_MAINNET },
        { network: Network.CITREA_MAINNET },
    ])(
        'renders an unsupported surface and skips the request on $network',
        ({ network }) => {
            render(createTestComponent({ network }));

            expect(
                screen.getByText(
                    'app.safe.safeAccountPage.unsupportedNetwork.heading',
                ),
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId('owner-list-mock'),
            ).not.toBeInTheDocument();
            expect(useSafeInfoSpy).toHaveBeenCalledWith(expect.anything(), {
                enabled: false,
            });
        },
    );
});
