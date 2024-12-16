import * as usePermissionCheckGuard from '@/modules/governance/hooks/usePermissionCheckGuard';
import * as useDialogContext from '@/shared/components/dialogProvider';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateDialogContext, generateTabComponentPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as wagmi from 'wagmi';
import { DaoProposalsPageClient, type IDaoProposalsPageClientProps } from './daoProposalsPageClient';

jest.mock('../../components/daoProposalList', () => ({
    DaoProposalList: { Container: () => <div data-testid="proposal-list-mock" /> },
}));

jest.mock('@/modules/settings/components/daoGovernanceInfo', () => ({
    DaoGovernanceInfo: () => <div data-testid="governance-info-mock" />,
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
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const usePermissionCheckGuardSpy = jest.spyOn(usePermissionCheckGuard, 'usePermissionCheckGuard');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useRouterSpy.mockReturnValue({
            push: jest.fn(),
            prefetch: jest.fn(),
        } as unknown as AppRouterInstance);
        useAccountSpy.mockReturnValue({} as wagmi.UseAccountReturnType);
        usePermissionCheckGuardSpy.mockReturnValue({ check: jest.fn(), result: false });
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
        useDialogContextSpy.mockReset();
        useRouterSpy.mockReset();
        useAccountSpy.mockReset();
        usePermissionCheckGuardSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalsPageClientProps>) => {
        const completeProps: IDaoProposalsPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id', pluginAddress: '0x123' } },
            ...props,
        };

        return <DaoProposalsPageClient {...completeProps} />;
    };

    it('renders the page title, proposals list and proposals page details', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoProposalsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoProposalsPage.aside.settings.title/)).toBeInTheDocument();
        expect(screen.getByTestId('proposal-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('governance-info-mock')).toBeInTheDocument();
    });

    it('renders the create proposal button with the correct link and label', () => {
        const daoId = 'test-id';
        const pluginAddress = '0x082729';
        const initialParams = { queryParams: { daoId, pluginAddress } };
        const plugin = generateDaoPlugin({ address: pluginAddress });
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: plugin })]);
        usePermissionCheckGuardSpy.mockReturnValue({ check: jest.fn(), result: true });

        render(createTestComponent({ initialParams }));
        const createProposalButton = screen.getByRole<HTMLAnchorElement>('link', {
            name: /daoProposalsPage.main.action/,
        });
        expect(createProposalButton).toBeInTheDocument();
        expect(createProposalButton).toHaveAttribute('href', `/dao/${daoId}/create/${pluginAddress}/proposal`);
    });
});
