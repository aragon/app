jest.mock('@xyflow/react/dist/style.css', () => ({}));

import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { fireEvent, render, screen } from '@testing-library/react';
import { type IDaoPermission, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { PermissionsGraph } from './permissionsGraph';

jest.mock('./permissionsGraphCanvas', () => ({
    PermissionsGraphCanvas: () => (
        <div data-testid="permissions-graph-canvas" />
    ),
}));

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: () => ({
        t: (key: string) =>
            ({
                'app.settings.daoPermissionsPage.graphView.fullscreen.open':
                    'Expand graph',
                'app.settings.daoPermissionsPage.graphView.fullscreen.close':
                    'Exit full screen',
            })[key] ?? key,
    }),
}));

const dao = generateDao({
    address: '0x1111111111111111111111111111111111111111',
    network: Network.ETHEREUM_MAINNET,
    name: 'Test DAO',
});

const row: IDaoPermission = {
    permissionId: 'permission-id',
    whoAddress: ANY_ADDR,
    whereAddress: dao.address,
    conditionAddress: ALLOW_FLAG,
};

const createTestComponent = () => (
    <GukModulesProvider>
        <PermissionsGraph
            accountRefs={[]}
            activeAccountAddress={dao.address}
            dao={dao}
            daoPlugins={[]}
            isLoading={false}
            rows={[row]}
        />
    </GukModulesProvider>
);

describe('<PermissionsGraph /> component', () => {
    it('toggles the graph container into the rich-text-style full-screen view', () => {
        render(createTestComponent());

        const container = screen.getByTestId('permissions-graph-container');
        const expandButton = screen.getByRole('button', {
            name: 'Expand graph',
        });

        expect(container).not.toHaveClass('fixed');

        fireEvent.click(expandButton);

        expect(container).toHaveClass('fixed', 'top-0', 'left-0', 'h-screen');
        expect(
            screen.getByRole('button', { name: 'Exit full screen' }),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', { name: 'Exit full screen' }),
        );

        expect(container).not.toHaveClass('fixed');
        expect(
            screen.getByRole('button', { name: 'Expand graph' }),
        ).toBeInTheDocument();
    });

    it('closes full-screen mode on Escape before other key handlers run', () => {
        const handleEscape = jest.fn();
        document.addEventListener('keydown', handleEscape);
        render(createTestComponent());

        const container = screen.getByTestId('permissions-graph-container');
        fireEvent.click(screen.getByRole('button', { name: 'Expand graph' }));

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(container).not.toHaveClass('fixed');
        expect(handleEscape).not.toHaveBeenCalled();

        document.removeEventListener('keydown', handleEscape);
    });
});
