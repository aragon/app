import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceSafeAsideCardProps,
    WorkspaceSafeAsideCard,
} from './workspaceSafeAsideCard';

describe('<WorkspaceSafeAsideCard /> component', () => {
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
        metadata: { name: 'Grants Safe' },
    };

    const createTestComponent = (
        props?: Partial<IWorkspaceSafeAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceSafeAsideCardProps = {
            account: safeAccount,
            title: 'Grants Safe',
            stats: [],
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSafeAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the title of the card', () => {
        render(createTestComponent());
        expect(screen.getByText('Grants Safe')).toBeInTheDocument();
    });

    it('renders the given stats', () => {
        const stats = [
            { label: 'Transactions', value: '12' },
            { label: 'Last activity', value: '1 day ago' },
        ];
        render(createTestComponent({ stats }));

        expect(screen.getByText('Transactions')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Last activity')).toBeInTheDocument();
        expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });

    it('renders the description of the Safe when set', () => {
        const account = {
            ...safeAccount,
            metadata: { name: 'Grants Safe', description: 'Funds grants' },
        };
        render(createTestComponent({ account }));

        expect(screen.getByText('Funds grants')).toBeInTheDocument();
    });

    it('renders the chain and the address of the Safe', () => {
        render(createTestComponent());

        expect(
            screen.getByText(networkDefinitions[safeAccount.network].name),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: '0xA941…6419' }),
        ).toHaveAttribute('href', expect.stringMatching(safeAddress));
    });

    it('renders the Octav link of the Safe', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('link', {
                name: /financeDetailsList.octavLabel/,
            }),
        ).toHaveAttribute(
            'href',
            `https://pro.octav.fi/?addresses=${safeAddress}`,
        );
    });
});
