import { Network } from '@/shared/api/daoService';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as WagmiActions from 'wagmi/actions';
import { DaoSettingsPage, type IDaoSettingsPageProps } from './daoSettingsPage';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

jest.mock('./daoSettingsPageClient', () => ({
    DaoSettingsPageClient: jest.fn(() => <div data-testid="page-client-mock" />),
}));

describe('<DaoSettingsPage /> component', () => {
    const getEnsAddressSpy = jest.spyOn(WagmiActions, 'getEnsAddress');

    beforeEach(() => {
        getEnsAddressSpy.mockResolvedValue('0x12345');
    });

    afterEach(() => {
        getEnsAddressSpy.mockReset();
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
        const daoEns = 'my-dao.dao.eth';
        const daoAddress = '0x12345';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = { addressOrEns: daoEns, network: daoNetwork };
        getEnsAddressSpy.mockResolvedValue(daoAddress);

        render(await createTestComponent({ params: Promise.resolve(params) }));

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(DaoSettingsPageClient).toHaveBeenCalledWith(
            expect.objectContaining({ daoId: `${daoNetwork}-${daoAddress}` }),
            undefined,
        );
    });
});
