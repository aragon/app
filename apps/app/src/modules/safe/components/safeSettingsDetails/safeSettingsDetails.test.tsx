import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
    generateSafeInfoResponse,
} from '@/shared/testUtils';
import {
    type ISafeSettingsDetailsProps,
    SafeSettingsDetails,
} from './safeSettingsDetails';

describe('<SafeSettingsDetails /> component', () => {
    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const owners = [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
    ];

    beforeEach(() => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    owners,
                    threshold: 1,
                    nonce: '15',
                    version: '1.5.0',
                }),
            }),
        );
    });

    afterEach(() => {
        useSafeInfoSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeSettingsDetailsProps>,
    ) => {
        const completeProps: ISafeSettingsDetailsProps = {
            network: Network.ETHEREUM_SEPOLIA,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafeSettingsDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the Safe, threshold and nonce rows', () => {
        render(createTestComponent());

        expect(screen.getByText(/safeSettings\.safe$/)).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.threshold$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.thresholdOfOwners/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.currentNonce/),
        ).toBeInTheDocument();
    });

    it('links the Safe to the Safe app', () => {
        render(createTestComponent());

        const link = screen
            .getAllByRole('link')
            .find((l) => l.getAttribute('href')?.includes('safe=sep:'));
        expect(link).toBeInTheDocument();
    });

    it('renders the Safe row alone while the Safe is not read', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeServiceApi.useSafeInfo
            >,
        );
        render(createTestComponent());

        expect(screen.getByText(/safeSettings\.safe$/)).toBeInTheDocument();
        expect(
            screen.queryByText(/safeSettings\.threshold$/),
        ).not.toBeInTheDocument();
    });

    it('renders the Safe row alone on a network with no Safe service', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeServiceApi.useSafeInfo
            >,
        );
        render(createTestComponent({ network: Network.BASE_SEPOLIA }));

        expect(useSafeInfoSpy).toHaveBeenCalledWith(expect.anything(), {
            enabled: false,
        });
        expect(screen.getByText(/safeSettings\.safe$/)).toBeInTheDocument();
        expect(
            screen.queryByText(/safeSettings\.threshold$/),
        ).not.toBeInTheDocument();
        const hrefs = screen
            .getAllByRole('link')
            .map((l) => l.getAttribute('href'));
        expect(hrefs.some((h) => h?.includes('safe='))).toBe(false);
        expect(hrefs.length).toBeGreaterThan(0);
    });
});
