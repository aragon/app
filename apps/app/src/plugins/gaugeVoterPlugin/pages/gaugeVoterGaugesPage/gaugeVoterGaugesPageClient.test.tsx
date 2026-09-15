import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    GaugeVoterGaugesPageClient,
    type IGaugeVoterGaugesPageClientProps,
} from './gaugeVoterGaugesPageClient';

jest.mock('./gaugeVoterGaugesPageContent', () => ({
    GaugeVoterGaugesPageContent: () => <div data-testid="page-content-mock" />,
}));

describe('<GaugeVoterGaugesPageClient /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const getDaoUrlSpy = jest.spyOn(daoUtils, 'getDaoUrl');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
        getDaoUrlSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IGaugeVoterGaugesPageClientProps>,
    ) => {
        const completeProps: IGaugeVoterGaugesPageClientProps = {
            dao: generateDao(),
            initialParams: {
                urlParams: {
                    pluginAddress: '0x123',
                    network: Network.ETHEREUM_SEPOLIA,
                },
                queryParams: {},
            },
            ...props,
        };

        return (
            <GukModulesProvider>
                <GaugeVoterGaugesPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the page content when the DAO has a gauge voter plugin', () => {
        render(createTestComponent());
        expect(screen.getByTestId('page-content-mock')).toBeInTheDocument();
    });

    it('renders the not-found state linking to the dashboard when the DAO has no gauge voter plugin to display', () => {
        const dashboardUrl = '/dao/ethereum-sepolia/test-dao/dashboard';
        useDaoPluginsSpy.mockReturnValue([]);
        getDaoUrlSpy.mockReturnValue(dashboardUrl);

        render(createTestComponent());

        expect(
            screen.getByText(/gaugeVoterGaugesPage.error.notFound.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: /gaugeVoterGaugesPage.error.action/,
            }),
        ).toHaveAttribute('href', dashboardUrl);
        expect(
            screen.queryByTestId('page-content-mock'),
        ).not.toBeInTheDocument();
    });
});
