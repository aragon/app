import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generatePaginatedResponseMetadata } from '@/shared/testUtils';
import {
    type IWorkspaceAllAssetsAsideCardProps,
    WorkspaceAllAssetsAsideCard,
} from './workspaceAllAssetsAsideCard';

describe('<WorkspaceAllAssetsAsideCard /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceAllAssetsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceAllAssetsAsideCardProps = {
            title: 'All assets',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAllAssetsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the total value and the token count as stats', () => {
        const metadata = {
            ...generatePaginatedResponseMetadata({ totalRecords: 7 }),
            totalAmountUsd: '1234',
        };
        render(createTestComponent({ metadata }));

        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.tokens$/),
        ).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('falls back to a placeholder for the numbers it was not given', () => {
        render(createTestComponent({ metadata: undefined }));

        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('displays the hidden spam count only when there is spam', () => {
        const metadata = {
            ...generatePaginatedResponseMetadata(),
            spamCount: 3,
        };
        render(createTestComponent({ metadata }));

        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.hiddenSpam$/),
        ).toBeInTheDocument();
    });

    it('omits the hidden spam stat when nothing is hidden', () => {
        const metadata = {
            ...generatePaginatedResponseMetadata(),
            spamCount: 0,
        };
        render(createTestComponent({ metadata }));

        expect(
            screen.queryByText(/workspaceAllAssetsAsideCard\.hiddenSpam$/),
        ).not.toBeInTheDocument();
    });

    it('titles the card generically when given no title', () => {
        render(createTestComponent({ title: undefined }));

        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.allAssets$/),
        ).toBeInTheDocument();
    });
});
