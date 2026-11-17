import { notFound, redirect } from 'next/navigation-server';
import type { ReactElement } from 'react';
import * as layoutWizard from '@/modules/application/components/layouts/layoutWizard';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type IWorkspaceSectionGuardProps,
    WorkspaceSectionGuard,
} from '../workspaceSectionGuard';
import {
    type ILayoutWizardCreateWorkspaceTransactionProps,
    LayoutWizardCreateWorkspaceTransaction,
} from './layoutWizardCreateWorkspaceTransaction';

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
    redirect: jest.fn(() => {
        throw new Error('NEXT_REDIRECT');
    }),
}));

describe('<LayoutWizardCreateWorkspaceTransaction /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const redirectMock = redirect as jest.MockedFunction<typeof redirect>;
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );

    const accountId = `${Network.ETHEREUM_SEPOLIA}-0x0000000000000000000000000000000000000001`;

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
        props?: Partial<ILayoutWizardCreateWorkspaceTransactionProps>,
    ) => {
        const completeProps: ILayoutWizardCreateWorkspaceTransactionProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId }),
            children: <div>page</div>,
            ...props,
        };

        // The layout is an async server component, so it is awaited and its element inspected rather than rendered.
        const guard = (await LayoutWizardCreateWorkspaceTransaction(
            completeProps,
        )) as ReactElement<IWorkspaceSectionGuardProps>;
        const layout = guard.props
            .children as ReactElement<layoutWizard.ILayoutWizardProps>;

        return { guard, layout };
    };

    // Runs the guard the layout renders, as Next does before rendering the wizard layout it wraps.
    const runGuard = async (guard: ReactElement<IWorkspaceSectionGuardProps>) =>
        await WorkspaceSectionGuard(guard.props);

    it('wraps the wizard layout in the guard of the create/transaction subsection', async () => {
        const { guard, layout } = await createTestComponent();

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(guard.type).toBe(WorkspaceSectionGuard);
        expect(guard.props).toEqual(
            expect.objectContaining({
                workspaceId: 'demo',
                accountId,
                section: 'create',
                subsection: 'transaction',
            }),
        );
        expect(layout.type).toBe(layoutWizard.LayoutWizard);
    });

    it('redirects a DAO to its overview', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
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

    it('renders the wizard layout for a Safe', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        const { guard, layout } = await createTestComponent();

        await expect(runGuard(guard)).resolves.toBe(layout);
    });

    it('exits the wizard to the transactions of the account', async () => {
        const { layout } = await createTestComponent();

        expect(layout.props).toEqual(
            expect.objectContaining({
                exitPath: `/workspace/demo/${accountId}/transactions`,
                name: 'app.workspace.layoutWizardCreateWorkspaceTransaction.name',
            }),
        );
    });

    it('renders the page inside the wizard layout', async () => {
        const children = <div>page</div>;
        const { layout } = await createTestComponent({ children });

        expect(layout.props.children).toBe(children);
    });

    it.each(['all', 'not-an-account'])(
        'renders the 404 page for the account segment %s',
        async (segment) => {
            await expect(
                createTestComponent({
                    params: Promise.resolve({
                        workspaceId: 'demo',
                        accountId: segment,
                    }),
                }),
            ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        },
    );

    it('renders the 404 page instead of the wizard when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
    });
});
