import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    type IWorkspaceAssetsAsideCardProps,
    WorkspaceAssetsAsideCard,
} from './workspaceAssetsAsideCard';

describe('<WorkspaceAssetsAsideCard /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceAssetsAsideCardProps = {
            title: 'All assets',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAssetsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the total value and the token count as stats', () => {
        render(createTestComponent({ totalAmountUsd: '1234', assetsCount: 7 }));

        expect(
            screen.getByText(/workspaceAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAssetsAsideCard\.tokens$/),
        ).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('falls back to a placeholder for the numbers it was not given', () => {
        render(createTestComponent());

        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('displays the hidden spam count only when there is spam', () => {
        render(createTestComponent({ spamCount: 3 }));

        expect(
            screen.getByText(/workspaceAssetsAsideCard\.hiddenSpam$/),
        ).toBeInTheDocument();
    });

    it('omits the hidden spam stat when nothing is hidden', () => {
        render(createTestComponent({ spamCount: 0 }));

        expect(
            screen.queryByText(/workspaceAssetsAsideCard\.hiddenSpam$/),
        ).not.toBeInTheDocument();
    });
});
