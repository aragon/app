import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation-server';
import { Network } from '@/shared/api/daoService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import type { WorkspaceAccountSection } from '../../utils/workspaceUtils';
import {
    type IWorkspaceSectionGuardProps,
    WorkspaceSectionGuard,
} from './workspaceSectionGuard';

jest.mock('next/navigation-server', () => ({
    redirect: jest.fn(() => {
        throw new Error('NEXT_REDIRECT');
    }),
}));

describe('<WorkspaceSectionGuard /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const overviewUrl = `/workspace/demo/${accountId}/overview`;

    const redirectMock = redirect as jest.MockedFunction<typeof redirect>;
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );

    const mockAccount = (accountType: WorkspaceAccountType) =>
        resolveAccountTypeSpy.mockResolvedValue(accountType);

    afterEach(() => {
        resolveAccountTypeSpy.mockReset();
        redirectMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceSectionGuardProps>,
    ) => {
        const completeProps: IWorkspaceSectionGuardProps = {
            workspaceId: 'demo',
            accountId,
            section: 'permissions',
            children: <div data-testid="page-mock" />,
            ...props,
        };

        return await WorkspaceSectionGuard(completeProps);
    };

    it('renders the page of a DAO-only section for a DAO', async () => {
        mockAccount(WorkspaceAccountType.DAO);

        render(await createTestComponent());

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it.each<WorkspaceAccountSection>(['permissions', 'proposals'])(
        'redirects a Safe on %s to its overview',
        async (section) => {
            mockAccount(WorkspaceAccountType.SAFE);

            await expect(createTestComponent({ section })).rejects.toThrow(
                'NEXT_REDIRECT',
            );
            expect(redirectMock).toHaveBeenCalledWith(overviewUrl);
        },
    );

    it('renders the page of a section every account type has for a Safe', async () => {
        mockAccount(WorkspaceAccountType.SAFE);

        render(await createTestComponent({ section: 'members' }));

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it('looks up the account of the route', async () => {
        mockAccount(WorkspaceAccountType.DAO);

        await createTestComponent();

        expect(resolveAccountTypeSpy).toHaveBeenCalledWith(accountId);
    });
});
