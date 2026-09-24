import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { cmsService, type IFeaturedDelegates } from '@/shared/api/cmsService';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceMembersPageProps,
    WorkspaceMembersPage,
    workspaceMembersCount,
} from './workspaceMembersPage';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceMembersPageClient', () => ({
    WorkspaceMembersPageClient: jest.fn(() => (
        <div data-testid="page-client-mock" />
    )),
}));

describe('<WorkspaceMembersPage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const getFeaturedDelegatesSpy = jest.spyOn(
        cmsService,
        'getFeaturedDelegates',
    );
    const getDaoOverridesSpy = jest.spyOn(cmsService, 'getDaoOverrides');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        getFeaturedDelegatesSpy.mockResolvedValue([]);
        getDaoOverridesSpy.mockResolvedValue({});
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        getFeaturedDelegatesSpy.mockReset();
        getDaoOverridesSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceMembersPageProps>,
    ) => {
        const completeProps: IWorkspaceMembersPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceMembersPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('passes the workspace id and featured delegates to the client when the workspaces feature is enabled', async () => {
        const featuredDelegates = [
            { daoAddress: '0x123' } as unknown as IFeaturedDelegates,
        ];
        getFeaturedDelegatesSpy.mockResolvedValue(featuredDelegates);
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(WorkspaceMembersPageClient).toHaveBeenCalledWith(
            expect.objectContaining({
                workspaceId: 'demo',
                pageSize: workspaceMembersCount,
                featuredDelegates,
            }),
            undefined,
        );
    });

    it('prefetches the DAO overrides so hidden bodies are filtered out from the first render', async () => {
        render(await createTestComponent());

        expect(getDaoOverridesSpy).toHaveBeenCalled();
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });
});
