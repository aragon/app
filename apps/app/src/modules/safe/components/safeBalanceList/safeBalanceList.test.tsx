import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateReactQueryResultSuccess,
    generateSafeBalance,
} from '@/shared/testUtils';
import { type ISafeBalanceListProps, SafeBalanceList } from './safeBalanceList';

describe('<SafeBalanceList /> component', () => {
    const useSafeBalancesSpy = jest.spyOn(safeServiceApi, 'useSafeBalances');

    beforeEach(() => {
        useSafeBalancesSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: [] }),
        );
    });

    afterEach(() => {
        useSafeBalancesSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ISafeBalanceListProps>) => {
        const completeProps: ISafeBalanceListProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafeBalanceList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the native currency of the chain and the tokens held by the Safe', () => {
        useSafeBalancesSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: [
                    generateSafeBalance({ balance: '1000000000000000000' }),
                    generateSafeBalance({
                        tokenAddress:
                            '0x2c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
                        token: {
                            name: 'USD Coin',
                            symbol: 'USDC',
                            decimals: 6,
                            logoUri: null,
                        },
                        balance: '2500000',
                    }),
                ],
            }),
        );
        render(createTestComponent());

        expect(screen.getByText('Ether')).toBeInTheDocument();
        expect(screen.getByText('USD Coin')).toBeInTheDocument();
        expect(screen.getByText('2.5 USDC')).toBeInTheDocument();
    });

    it('renders an empty state when the Safe holds no assets', () => {
        render(createTestComponent());

        expect(
            screen.getByText('app.safe.safeBalanceList.empty.heading'),
        ).toBeInTheDocument();
    });
});
