import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { fireEvent, render, screen } from '@testing-library/react';
import { generateDaoPermission } from '@/shared/testUtils';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import type { IPermissionGraphEdge, IPermissionGraphNode } from '../../types';
import {
    type IPermissionDetailPanelProps,
    PermissionDetailPanel,
} from './permissionDetailPanel';

const whoAddress = '0x1111111111111111111111111111111111111111';
const whereAddress = '0x2222222222222222222222222222222222222222';

const nodes: IPermissionGraphNode[] = [
    {
        id: whoAddress,
        kind: 'actor',
        label: 'Who Body',
        address: whoAddress,
    },
    {
        id: whereAddress,
        kind: 'plugin',
        label: 'Where Plugin',
        address: whereAddress,
    },
];

const buildEdge = (
    partial?: Partial<IPermissionGraphEdge>,
): IPermissionGraphEdge => ({
    id: 'edge-1',
    source: whoAddress,
    target: whereAddress,
    permissionName: 'EXECUTE_PERMISSION',
    permissionDisplayName: 'Execute',
    row: generateDaoPermission({
        whoAddress,
        whereAddress,
        condition: undefined,
        conditionEntity: undefined,
        network: undefined,
        who: undefined,
        where: undefined,
    }),
    ...partial,
});

describe('<PermissionDetailPanel /> component', () => {
    beforeAll(() => {
        initialiseConditionRegistry();
    });

    const createTestComponent = (
        props?: Partial<IPermissionDetailPanelProps>,
    ) => {
        const completeProps: IPermissionDetailPanelProps = {
            edge: buildEdge(),
            nodes,
            onClose: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <PermissionDetailPanel {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the permission name header and the who/where node labels of the edge', () => {
        render(createTestComponent());

        expect(
            screen.getAllByText('EXECUTE_PERMISSION').length,
        ).toBeGreaterThan(0);
        expect(screen.getByText('Who Body')).toBeInTheDocument();
        expect(screen.getByText('Where Plugin')).toBeInTheDocument();
    });

    it('renders the condition label pill only when the edge carries one', () => {
        const { rerender } = render(createTestComponent());

        expect(
            screen.queryByText(/graphView.edge.condition/),
        ).not.toBeInTheDocument();

        rerender(
            createTestComponent({
                edge: buildEdge({ conditionLabel: 'VotingPower' }),
            }),
        );

        expect(
            screen.getByText(/graphView.edge.condition/),
        ).toBeInTheDocument();
    });

    it('closes through the header close button without starting a drag', () => {
        const onClose = jest.fn();
        render(createTestComponent({ onClose }));

        const closeButton = screen.getByRole('button', {
            name: /graphView.detail.close/,
        });
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
