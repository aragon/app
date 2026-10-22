import { notFound } from 'next/navigation-server';
import type { ReactElement } from 'react';
import * as layoutWizard from '@/modules/application/components/layouts/layoutWizard';
import { featureFlags } from '@/shared/featureFlags';
import {
    type ILayoutWizardEditWorkspaceProps,
    LayoutWizardEditWorkspace,
} from './layoutWizardEditWorkspace';

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

describe('<LayoutWizardEditWorkspace /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<ILayoutWizardEditWorkspaceProps>,
    ) => {
        const completeProps: ILayoutWizardEditWorkspaceProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            children: <div data-testid="page-mock" />,
            ...props,
        };

        // The layout is an async server component, so it is awaited and its element inspected rather than rendered.
        return (await LayoutWizardEditWorkspace(
            completeProps,
        )) as ReactElement<layoutWizard.ILayoutWizardProps>;
    };

    it('renders the wizard layout exiting to the overview of the workspace', async () => {
        const layout = await createTestComponent();

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(layout.type).toBe(layoutWizard.LayoutWizard);
        expect(layout.props).toEqual(
            expect.objectContaining({
                exitPath: '/workspace/demo/all/overview',
                name: 'app.workspace.layoutWizardEditWorkspace.name',
            }),
        );
    });

    it('renders the page inside the wizard layout', async () => {
        const children = <div data-testid="page-mock" />;
        const layout = await createTestComponent({ children });

        expect(layout.props).toEqual(expect.objectContaining({ children }));
    });

    it('renders the 404 page instead of the wizard when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
    });
});
