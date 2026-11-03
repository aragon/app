import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { DaoProposalDetailsPage } from '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import {
    type IWorkspaceProposalDetailsPageProps,
    WorkspaceProposalDetailsPage,
} from './workspaceProposalDetailsPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock(
    '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPage',
    () => ({
        DaoProposalDetailsPage: jest.fn(() => (
            <div data-testid="dao-proposal-details-mock" />
        )),
    }),
);

jest.mock('../../components/workspaceAccountGate', () => ({
    WorkspaceAccountGate: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="account-gate-mock">{children}</div>
    )),
}));

describe('<WorkspaceProposalDetailsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const proposalSlug = 'MUL-4';

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const detailsPageMock = DaoProposalDetailsPage as jest.Mock;
    const accountGateMock = WorkspaceAccountGate as jest.Mock;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        detailsPageMock.mockClear();
        accountGateMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceProposalDetailsPageProps>,
    ) => {
        const completeProps: IWorkspaceProposalDetailsPageProps = {
            params: Promise.resolve({
                workspaceId: 'demo',
                accountId,
                proposalSlug,
            }),
            ...props,
        };
        const Component = await WorkspaceProposalDetailsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the DAO proposal details page behind the account gate', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(
            screen.getByTestId('dao-proposal-details-mock'),
        ).toBeInTheDocument();
        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId }),
            undefined,
        );
    });

    it('hands the details page the account as DAO route parameters', async () => {
        render(await createTestComponent());

        const pageProps = detailsPageMock.mock.calls.at(-1)?.[0] as
            | { params: Promise<unknown> }
            | undefined;

        await expect(pageProps?.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
            proposalSlug,
        });
    });

    it('passes a mis-cased account through unchanged', async () => {
        const lowercaseId = accountId.toLowerCase();
        render(
            await createTestComponent({
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId: lowercaseId,
                    proposalSlug,
                }),
            }),
        );

        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId: lowercaseId }),
            undefined,
        );

        const pageProps = detailsPageMock.mock.calls.at(-1)?.[0] as
            | { params: Promise<unknown> }
            | undefined;

        await expect(pageProps?.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address.toLowerCase(),
            proposalSlug,
        });
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
        expect(detailsPageMock).not.toHaveBeenCalled();
    });
});
