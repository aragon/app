import { notFound, redirect } from 'next/navigation-server';
import type { ReactElement } from 'react';
import {
    type ILayoutWizardCreateProposalProps,
    LayoutWizardCreateProposal,
} from '@/modules/governance/components/layoutWizardCreateProposal';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type IWorkspaceSectionGuardProps,
    WorkspaceSectionGuard,
} from '../workspaceSectionGuard';
import {
    type ILayoutWizardCreateWorkspaceProposalProps,
    LayoutWizardCreateWorkspaceProposal,
} from './layoutWizardCreateWorkspaceProposal';

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
    redirect: jest.fn(() => {
        throw new Error('NEXT_REDIRECT');
    }),
}));

describe('<LayoutWizardCreateWorkspaceProposal /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const redirectMock = redirect as jest.MockedFunction<typeof redirect>;
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );

    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const pluginAddress = '0x9fc3dc011b461664c835f2527fffb1169b3c213e';

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        resolveAccountTypeSpy.mockReset();
        notFoundMock.mockClear();
        redirectMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<ILayoutWizardCreateWorkspaceProposalProps>,
    ) => {
        const completeProps: ILayoutWizardCreateWorkspaceProposalProps = {
            params: Promise.resolve({
                workspaceId: 'demo',
                accountId,
                pluginAddress,
            }),
            children: <div data-testid="page-mock" />,
            ...props,
        };

        // The layout is an async server component, so it is awaited and its element inspected rather than rendered.
        const guard = (await LayoutWizardCreateWorkspaceProposal(
            completeProps,
        )) as ReactElement<IWorkspaceSectionGuardProps>;
        const layout = guard.props
            .children as ReactElement<ILayoutWizardCreateProposalProps>;

        return { guard, layout };
    };

    // Runs the guard the layout renders, as Next does before rendering the DAO layout it wraps.
    const runGuard = async (guard: ReactElement<IWorkspaceSectionGuardProps>) =>
        await WorkspaceSectionGuard(guard.props);

    // The DAO layout replaces the page with its error state when the DAO read fails, so the guard must run before it.
    it('wraps the DAO layout in the guard of the create/{pluginAddress}/proposal subsection', async () => {
        const { guard, layout } = await createTestComponent();

        expect(guard.type).toBe(WorkspaceSectionGuard);
        expect(guard.props).toEqual(
            expect.objectContaining({
                workspaceId: 'demo',
                accountId,
                section: 'create',
                subsection: 'proposal',
            }),
        );
        expect(layout.type).toBe(LayoutWizardCreateProposal);
    });

    it('redirects a Safe to its overview', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        const { guard } = await createTestComponent();

        await expect(runGuard(guard)).rejects.toThrow('NEXT_REDIRECT');
        expect(redirectMock).toHaveBeenCalledWith(
            `/workspace/demo/${accountId}/overview`,
        );
    });

    it('renders the 404 page for an address that is neither a DAO nor a Safe', async () => {
        resolveAccountTypeSpy.mockImplementation(() => notFound());
        const { guard } = await createTestComponent();

        await expect(runGuard(guard)).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
    });

    it('renders the DAO layout for a DAO', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
        const { guard, layout } = await createTestComponent();

        await expect(runGuard(guard)).resolves.toBe(layout);
    });

    it('passes the DAO layout the network and address of the account, and the plugin', async () => {
        const { layout } = await createTestComponent();

        await expect(layout.props.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
            pluginAddress,
        });
    });

    it('exits the wizard to the proposals of the account in the workspace', async () => {
        const { layout } = await createTestComponent();

        expect(layout.props.exitPath).toEqual(
            `/workspace/demo/${accountId}/proposals`,
        );
    });

    it('renders the page inside the wizard layout', async () => {
        const children = <div data-testid="page-mock" />;
        const { layout } = await createTestComponent({ children });

        expect(layout.props.children).toBe(children);
    });

    it.each([
        'all',
        'not-an-account',
        `unknown-network-${address}`,
        `${Network.ETHEREUM_SEPOLIA}-0x123`,
    ])('renders the 404 page for the account segment "%s"', async (segment) => {
        await expect(
            createTestComponent({
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId: segment,
                    pluginAddress,
                }),
            }),
        ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    });

    it('renders the 404 page when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
    });
});
