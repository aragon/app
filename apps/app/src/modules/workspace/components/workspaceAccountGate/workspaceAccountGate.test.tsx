import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccountGateProps,
    WorkspaceAccountGate,
} from './workspaceAccountGate';

describe('<WorkspaceAccountGate /> component', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    beforeEach(() => {
        getDaoSpy.mockResolvedValue(generateDao());
    });

    afterEach(() => {
        getDaoSpy.mockReset();
    });

    // Each test builds its own address so the DAO queries are never deduped across tests by React Query.
    let testIndex = 0;

    const buildAccountId = () => {
        testIndex += 1;
        const suffix = testIndex.toString().padStart(2, '0');

        return `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140D${suffix}`;
    };

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountGateProps>,
    ) => {
        const completeProps: IWorkspaceAccountGateProps = {
            accountId: buildAccountId(),
            children: <div data-testid="page-mock" />,
            ...props,
        };

        // The query client must sit inside the gov-ui-kit provider, which carries a query client of its own that
        // would otherwise shadow this one.
        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceAccountGate {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('renders the page once the DAO of the account has resolved', async () => {
        const accountId = buildAccountId();
        render(createTestComponent({ accountId }));

        expect(await screen.findByTestId('page-mock')).toBeInTheDocument();
        expect(getDaoSpy).toHaveBeenCalledWith({
            urlParams: { id: accountId },
        });
    });

    it('displays a loading state while the DAO loads', async () => {
        getDaoSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(await screen.findByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
    });

    it('displays an error instead of the page when the DAO fails to load', async () => {
        getDaoSpy.mockRejectedValue(new Error('dao error'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceAccountGate\.error\.heading$/),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
        expect(getDaoSpy).toHaveBeenCalledTimes(1);
    });
});
