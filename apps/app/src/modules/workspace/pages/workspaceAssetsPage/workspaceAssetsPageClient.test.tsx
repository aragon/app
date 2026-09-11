import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    type IWorkspaceAssetsPageClientProps,
    WorkspaceAssetsPageClient,
} from './workspaceAssetsPageClient';

describe('<WorkspaceAssetsPageClient /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsPageClientProps>,
    ) => {
        const completeProps: IWorkspaceAssetsPageClientProps = { ...props };

        return (
            <GukModulesProvider>
                <WorkspaceAssetsPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the assets section', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceAssetsPage\.main\.title$/),
        ).toBeInTheDocument();
    });

    it('displays the placeholder until the aggregated assets are wired up', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceAssetsPage\.placeholder\.title$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAssetsPage\.placeholder\.description$/),
        ).toBeInTheDocument();
    });
});
