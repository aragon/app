import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceSectionGuard } from '../../components/workspaceSectionGuard';
import { workspaceAllAccountsSegment } from '../../utils/workspaceUtils';
import {
    type IWorkspaceProposalsPageProps,
    WorkspaceProposalsPage,
} from './workspaceProposalsPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceProposalsPageClient', () => ({
    WorkspaceProposalsPageClient: () => <div data-testid="page-client-mock" />,
}));

jest.mock('../../components/workspaceSectionGuard', () => ({
    WorkspaceSectionGuard: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="section-guard-mock">{children}</div>
    )),
}));

describe('<WorkspaceProposalsPage /> component', () => {
    const accountId = `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const sectionGuardMock = WorkspaceSectionGuard as jest.Mock;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        sectionGuardMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceProposalsPageProps>,
    ) => {
        const completeProps: IWorkspaceProposalsPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceProposalsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the proposals page when the workspaces feature is enabled', async () => {
        isEnabledSpy.mockResolvedValue(true);

        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });

    // The aggregated route names no account, so there is nothing to resolve and nothing to mislead about.
    it('renders the aggregated route without the section guard', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(sectionGuardMock).not.toHaveBeenCalled();
        expect(
            screen.queryByTestId('section-guard-mock'),
        ).not.toBeInTheDocument();
    });

    // Defensive: should the static `all/proposals` route ever be removed, the aggregated URL would fall through to
    // `[accountId]/proposals` carrying the sentinel, and gating on it would read a DAO named `all` and fail a page
    // that works.
    it('renders without the guard when the account segment is the aggregated sentinel', async () => {
        render(
            await createTestComponent({
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId: workspaceAllAccountsSegment,
                }),
            }),
        );

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(sectionGuardMock).not.toHaveBeenCalled();
    });

    // Without the guard a Safe route would render an empty list instead of redirecting.
    it('guards the account-scoped route as the proposals section', async () => {
        render(
            await createTestComponent({
                params: Promise.resolve({ workspaceId: 'demo', accountId }),
            }),
        );

        expect(screen.getByTestId('section-guard-mock')).toBeInTheDocument();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(sectionGuardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                workspaceId: 'demo',
                accountId,
                section: 'proposals',
            }),
            undefined,
        );
    });
});
