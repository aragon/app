import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    DaoPermissionsPage,
    type IDaoPermissionsPageProps,
} from './daoPermissionsPage';

jest.mock('./daoPermissionsPageClient', () => ({
    DaoPermissionsPageClient: (props: { daoId: string }) => (
        <div data-dao-id={props.daoId} data-testid="page-client-mock" />
    ),
}));

describe('<DaoPermissionsPage /> component', () => {
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        resolveDaoIdSpy.mockReset();
    });

    const createProps = (
        props?: Partial<IDaoPermissionsPageProps>,
    ): IDaoPermissionsPageProps => ({
        params: Promise.resolve({
            addressOrEns: '0x123',
            network: Network.ETHEREUM_MAINNET,
        }),
        ...props,
    });

    it('renders the permissions page for the resolved dao', async () => {
        render(
            <GukModulesProvider>
                {await DaoPermissionsPage(createProps())}
            </GukModulesProvider>,
        );

        const pageClient = screen.getByTestId('page-client-mock');
        expect(pageClient).toBeInTheDocument();
        expect(pageClient.dataset.daoId).toEqual('test-dao-id');
    });

    it('renders nothing when the network is not supported', async () => {
        render(
            <GukModulesProvider>
                {
                    await DaoPermissionsPage(
                        createProps({
                            params: Promise.resolve({
                                addressOrEns: '0x123',
                                network: 'unsupported' as Network,
                            }),
                        }),
                    )
                }
            </GukModulesProvider>,
        );

        expect(
            screen.queryByTestId('page-client-mock'),
        ).not.toBeInTheDocument();
    });
});
