import { render, screen } from '@testing-library/react';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionChangesDetails } from './permissionChangesDetails';

jest.mock('@/shared/api/daoService', () => ({
    useDao: () => ({
        data: {
            address: '0xdao',
            name: 'Test DAO',
            network: 'ethereum-mainnet',
        },
    }),
}));

jest.mock('@/shared/hooks/useDaoChain', () => ({
    useDaoChain: () => ({
        buildEntityUrl: () => 'https://explorer.test/address',
    }),
}));

jest.mock('../hooks/usePermissionEntityResolver', () => ({
    usePermissionEntityResolver: () => (address: string) => ({
        label: address,
        address,
        isSentinel: false,
        type: 'address',
    }),
}));

describe('<PermissionChangesDetails /> component', () => {
    const daoAddress = '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311';
    const pluginAddress = '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d';
    const zeroAddress = `0x${'0'.repeat(40)}`;
    const executeId = permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
    const votingId = permissionNameUtils.getPermissionId(
        'UPDATE_VOTING_SETTINGS_PERMISSION',
    );

    const multiComponents = [
        { name: 'operation', type: 'uint8' },
        { name: 'where', type: 'address' },
        { name: 'who', type: 'address' },
        { name: 'condition', type: 'address' },
        { name: 'permissionId', type: 'bytes32' },
    ];

    const createMultiTargetAction = (rows: string[][]) =>
        ({
            daoId: 'test-dao',
            type: 'unknown',
            inputData: {
                function: 'applyMultiTargetPermissions',
                contract: 'DAO',
                parameters: [
                    {
                        name: '_items',
                        type: 'tuple[]',
                        components: multiComponents,
                        value: rows,
                    },
                ],
            },
        }) as unknown as IProposalActionData;

    const createSingleTargetAction = () =>
        ({
            daoId: 'test-dao',
            type: 'unknown',
            inputData: {
                function: 'applySingleTargetPermissions',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: pluginAddress },
                    {
                        name: 'items',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'who', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                        value: [['0', daoAddress, executeId]],
                    },
                ],
            },
        }) as unknown as IProposalActionData;

    const createTestComponent = (action: IProposalActionData) => (
        <PermissionChangesDetails action={action} index={0} />
    );

    it('renders one card per change, in calldata order, without merging a revoke and a re-grant', () => {
        const action = createMultiTargetAction([
            ['1', pluginAddress, daoAddress, zeroAddress, executeId],
            ['0', pluginAddress, daoAddress, zeroAddress, executeId],
        ]);
        render(createTestComponent(action));

        const headings = screen.getAllByRole('heading', { level: 4 });
        expect(headings).toHaveLength(2);
        expect(headings[0]).toHaveTextContent(
            'permissionChangesDetails.operation.revoke',
        );
        expect(headings[1]).toHaveTextContent(
            'permissionChangesDetails.operation.grant',
        );
    });

    it('marks an out-of-range operation instead of relabelling it as a grant', () => {
        const action = createMultiTargetAction([
            ['7', pluginAddress, daoAddress, zeroAddress, executeId],
        ]);
        render(createTestComponent(action));

        // The raw value is preserved in the label rather than coerced to a known operation.
        expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
            'permissionChangesDetails.unknownOperation (operation=7)',
        );
        expect(
            screen.getByText(
                /permissionChangesDetails\.unknownOperationWarning/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/permissionChangesDetails\.operation\.grant/),
        ).not.toBeInTheDocument();
    });

    it('renders a condition entity only for a conditional grant', () => {
        const conditionAddress = '0x80CB2f4f9B403C4C418C597d96c95FE14FD344a6';
        const action = createMultiTargetAction([
            ['2', pluginAddress, daoAddress, conditionAddress, votingId],
        ]);
        render(createTestComponent(action));

        expect(
            screen.getByText(/permissionActionDetails.conditionTerm/),
        ).toBeInTheDocument();
    });

    it('hoists the shared target of a single-target action above the list', () => {
        render(createTestComponent(createSingleTargetAction()));

        // Rendered once above the cards, not repeated on each card.
        expect(
            screen.getAllByText(/permissionActionDetails.whereTerm/),
        ).toHaveLength(1);
    });
});
