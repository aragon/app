import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation-original';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    DaoPermissionsPage,
    type IDaoPermissionsPageProps,
} from './daoPermissionsPage';

jest.mock(
    'next/navigation-original',
    () => ({
        notFound: jest.fn(() => {
            throw new Error('not-found');
        }),
    }),
    { virtual: true },
);

jest.mock('./daoPermissionsPageClient', () => ({
    DaoPermissionsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoPermissionsPage /> component', () => {
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    beforeEach(() => {
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        resolveDaoIdSpy.mockReset();
        isEnabledSpy.mockReset();
        jest.clearAllMocks();
    });

    const createProps = (): IDaoPermissionsPageProps => ({
        params: Promise.resolve({
            addressOrEns: '0x123',
            network: Network.ETHEREUM_MAINNET,
        }),
    });

    it('renders when the permissions page flag is enabled', async () => {
        render(
            <GukModulesProvider>
                {await DaoPermissionsPage(createProps())}
            </GukModulesProvider>,
        );

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(isEnabledSpy).toHaveBeenCalledWith('permissionsPage');
    });

    it('returns not found when the permissions page flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(DaoPermissionsPage(createProps())).rejects.toThrow(
            'not-found',
        );

        expect(NextNavigation.notFound).toHaveBeenCalled();
    });
});
