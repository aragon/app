import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    generateSafeInfoResponse,
} from '@/shared/testUtils';
import { type ISafeOwnerListProps, SafeOwnerList } from './safeOwnerList';

describe('<SafeOwnerList /> component', () => {
    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');

    beforeEach(() => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse(),
            }),
        );
    });

    afterEach(() => {
        useSafeInfoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ISafeOwnerListProps>) => {
        const completeProps: ISafeOwnerListProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafeOwnerList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders one item per owner of the Safe', () => {
        const owners = [
            '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            '0x2c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
        ];
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({ owners, threshold: 2 }),
            }),
        );
        render(createTestComponent());

        for (const owner of owners) {
            expect(
                screen.getByText(addressUtils.truncateAddress(owner)),
            ).toBeInTheDocument();
        }
    });

    it('renders an error state when the Safe info cannot be read', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultError({ error: new Error('failed') }),
        );
        render(createTestComponent());

        expect(
            screen.getByText('app.safe.safeOwnerList.error.heading'),
        ).toBeInTheDocument();
    });
});
