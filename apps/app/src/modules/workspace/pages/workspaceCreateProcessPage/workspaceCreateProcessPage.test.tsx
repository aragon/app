import { notFound } from 'next/navigation-original';
import type { ReactElement } from 'react';
import {
    CreateProcessPage,
    type ICreateProcessPageProps,
} from '@/modules/createDao/pages/createProcessPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceGateProps,
    WorkspaceGate,
} from '../../components/workspaceGate';
import {
    type IWorkspaceCreateProcessPageProps,
    WorkspaceCreateProcessPage,
} from './workspaceCreateProcessPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

describe('<WorkspaceCreateProcessPage /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;

    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const pluginAddress = '0x9fc3dc011b461664c835f2527fffb1169b3c213e';

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceCreateProcessPageProps>,
    ) => {
        const completeProps: IWorkspaceCreateProcessPageProps = {
            params: Promise.resolve({
                workspaceId: 'demo',
                accountId,
                pluginAddress,
            }),
            ...props,
        };

        // The page is an async server component composing other server components, so its element tree is inspected
        // rather than rendered.
        const gate = (await WorkspaceCreateProcessPage(
            completeProps,
        )) as ReactElement<IWorkspaceGateProps>;
        const page = gate.props
            .children as ReactElement<ICreateProcessPageProps>;

        return { gate, page };
    };

    // The page sits under the wizard layout rather than `LayoutWorkspace`, so it renders the gate itself.
    it('renders the workspace gate', async () => {
        const { gate } = await createTestComponent();

        expect(gate.type).toBe(WorkspaceGate);
        expect(gate.props.workspaceId).toEqual('demo');
    });

    it('renders the DAO process page inside the gate for the DAO of the account', async () => {
        const { page } = await createTestComponent();

        expect(page.type).toBe(CreateProcessPage);
        await expect(page.props.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
            pluginAddress,
        });
    });

    it('renders the 404 page when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });
});
