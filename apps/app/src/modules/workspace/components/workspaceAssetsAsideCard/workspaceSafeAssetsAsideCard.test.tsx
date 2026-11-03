import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generatePaginatedResponseMetadata } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceSafeAssetsAsideCardProps,
    WorkspaceSafeAssetsAsideCard,
} from './workspaceSafeAssetsAsideCard';

describe('<WorkspaceSafeAssetsAsideCard /> component', () => {
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
        metadata: { name: 'Grants Safe' },
    };

    const createTestComponent = (
        props?: Partial<IWorkspaceSafeAssetsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceSafeAssetsAsideCardProps = {
            account: safeAccount,
            label: 'Grants Safe',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSafeAssetsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('titles the card with the label of the account', () => {
        render(createTestComponent());
        expect(screen.getByText('Grants Safe')).toBeInTheDocument();
    });

    it('displays the asset stats of the Safe', () => {
        const metadata = {
            ...generatePaginatedResponseMetadata({ totalRecords: 7 }),
            totalAmountUsd: '1234',
            spamCount: 2,
        };
        render(createTestComponent({ metadata }));

        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.tokens$/),
        ).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAllAssetsAsideCard\.hiddenSpam$/),
        ).toBeInTheDocument();
    });

    it('falls back to a placeholder while the totals are not read yet', () => {
        render(createTestComponent({ metadata: undefined }));
        expect(screen.getAllByText('-')).toHaveLength(2);
    });
});
