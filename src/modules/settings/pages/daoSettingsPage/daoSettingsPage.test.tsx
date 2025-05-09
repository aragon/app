import { Network } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DaoSettingsPage, type IDaoSettingsPageProps } from './daoSettingsPage';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

jest.mock('./daoSettingsPageClient', () => ({
    DaoSettingsPageClient: jest.fn(() => <div data-testid="page-client-mock" />),
}));

describe('<DaoSettingsPage /> component', () => {
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoSettingsPageProps>) => {
        const completeProps: IDaoSettingsPageProps = {
            params: Promise.resolve({ addressOrEns: '0x123', network: Network.ETHEREUM_MAINNET }),
            ...props,
        };
        const Component = await DaoSettingsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders and passes the correct daoId to DaoSettingsPageClient', async () => {
        const daoId = 'test-dao-id';
        resolveDaoIdSpy.mockResolvedValue(daoId);

        render(await createTestComponent());

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(DaoSettingsPageClient).toHaveBeenCalledWith(expect.objectContaining({ daoId }), undefined);
    });
});
