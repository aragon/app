import { notFound, redirect } from 'next/navigation-original';
import type { ReactElement } from 'react';
import {
    DaoProcessDetailsPage,
    type IDaoProcessDetailsPageProps,
} from '@/modules/settings/pages/daoProcessDetailsPage/daoProcessDetailsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type IWorkspaceAccountProcessDetailsPageProps,
    WorkspaceAccountProcessDetailsPage,
} from './workspaceAccountProcessDetailsPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
    redirect: jest.fn(() => {
        throw new Error('NEXT_REDIRECT');
    }),
}));

describe('<WorkspaceAccountProcessDetailsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const slug = 'spp';

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const redirectMock = redirect as jest.MockedFunction<typeof redirect>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        resolveAccountTypeSpy.mockReset();
        notFoundMock.mockClear();
        redirectMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountProcessDetailsPageProps>,
    ) => {
        const completeProps: IWorkspaceAccountProcessDetailsPageProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId, slug }),
            ...props,
        };

        // An async server component rendering another one, so its element is inspected rather than rendered.
        return (await WorkspaceAccountProcessDetailsPage(
            completeProps,
        )) as ReactElement<IDaoProcessDetailsPageProps>;
    };

    it('renders the DAO process page for the DAO of the account', async () => {
        const page = await createTestComponent();

        expect(page.type).toBe(DaoProcessDetailsPage);
        await expect(page.props.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
            slug,
        });
    });

    // A Safe has no processes.
    it('redirects a Safe to its settings', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);

        await expect(createTestComponent()).rejects.toThrow('NEXT_REDIRECT');
        expect(redirectMock).toHaveBeenCalledWith(
            `/workspace/demo/${accountId}/settings`,
        );
    });

    it('looks up the account of the route', async () => {
        await createTestComponent();

        expect(resolveAccountTypeSpy).toHaveBeenCalledWith(accountId);
    });

    it('renders the 404 page when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });
});
