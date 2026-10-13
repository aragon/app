import type { ReactElement } from 'react';
import * as layoutWizard from '@/modules/application/components/layouts/layoutWizard';
import {
    type ILayoutWizardEditWorkspaceProps,
    LayoutWizardEditWorkspace,
} from './layoutWizardEditWorkspace';

describe('<LayoutWizardEditWorkspace /> component', () => {
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
});
