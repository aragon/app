import * as usePermissionCheckGuard from '@/modules/governance/hooks/usePermissionCheckGuard';
import * as daoService from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateReactQueryResultSuccess,
    generateTabComponentPlugin,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DaoProposalsPageClient, type IDaoProposalsPageClientProps } from './daoProposalsPageClient';

jest.mock('../../components/daoProposalList', () => ({
    DaoProposalList: { Container: () => <div data-testid="proposal-list-mock" /> },
}));

jest.mock('@/modules/settings/components/daoPluginInfo', () => ({
    DaoPluginInfo: () => <div data-testid="plugin-info-mock" />,
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('<DaoProposalsPageClient /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const usePermissionCheckGuardSpy = jest.spyOn(usePermissionCheckGuard, 'usePermissionCheckGuard');
    const getDaoUrlSpy = jest.spyOn(daoUtils, 'getDaoUrl');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        usePermissionCheckGuardSpy.mockReturnValue({ check: jest.fn(), result: false });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
        useDialogContextSpy.mockReset();
        usePermissionCheckGuardSpy.mockReset();
        getDaoUrlSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalsPageClientProps>) => {
        const completeProps: IDaoProposalsPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id', pluginAddress: '0x123' } },
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoProposalsPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the page title, proposals list and proposals page details', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoProposalsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('proposal-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('plugin-info-mock')).toBeInTheDocument();
    });

    it('renders the create proposal button with the correct link and label', () => {
        const pluginAddress = '0x082729';
        const initialParams = { queryParams: { daoId: 'test-dao-id', pluginAddress } };
        const testCreateProposalUrl = '/dao/ethereum-sepolia/test-proposal-url';
        getDaoUrlSpy.mockReturnValue(testCreateProposalUrl);
        const plugin = generateDaoPlugin({ address: pluginAddress });

        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: plugin })]);
        usePermissionCheckGuardSpy.mockReturnValue({ check: jest.fn(), result: true });

        render(createTestComponent({ initialParams }));
        const createProposalButton = screen.getByRole<HTMLAnchorElement>('link', {
            name: /daoProposalsPage.main.action/,
        });
        expect(createProposalButton).toBeInTheDocument();
        expect(createProposalButton).toHaveAttribute('href', testCreateProposalUrl);
        expect(getDaoUrlSpy.mock.calls[0][1]).toEqual(`create/${pluginAddress}/proposal`);
    });

    it('hides the plugin info sidebar when multiple plugins exist', () => {
        const plugins = [
            generateTabComponentPlugin({ id: 'token', meta: generateDaoPlugin() }),
            generateTabComponentPlugin({ id: 'multisig', meta: generateDaoPlugin() }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);

        render(createTestComponent());

        expect(screen.queryByTestId('plugin-info-mock')).not.toBeInTheDocument();
    });
});
