import { notFound } from 'next/navigation-server';
import type { ReactElement } from 'react';
import * as layoutWizard from '@/modules/application/components/layouts/layoutWizard';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import {
    type ILayoutWizardCreateWorkspaceTransactionProps,
    LayoutWizardCreateWorkspaceTransaction,
} from './layoutWizardCreateWorkspaceTransaction';

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

describe('<LayoutWizardCreateWorkspaceTransaction /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;

    const accountId = `${Network.ETHEREUM_SEPOLIA}-0x0000000000000000000000000000000000000001`;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
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
        return (await LayoutWizardCreateWorkspaceTransaction(
            completeProps,
        )) as ReactElement<layoutWizard.ILayoutWizardProps>;
    };

    it('renders the wizard layout exiting to the transactions of the account', async () => {
        const layout = await createTestComponent();

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(layout.type).toBe(layoutWizard.LayoutWizard);
        expect(layout.props).toEqual(
            expect.objectContaining({
                exitPath: `/workspace/demo/${accountId}/transactions`,
                name: 'app.workspace.layoutWizardCreateWorkspaceTransaction.name',
            }),
        );
    });

    it('renders the page inside the wizard layout', async () => {
        const children = <div>page</div>;
        const layout = await createTestComponent({ children });

        expect(layout.props).toEqual(expect.objectContaining({ children }));
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
