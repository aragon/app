import { addressUtils, ProposalActionsDecoderMode } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { MultiTargetPermissionsList } from './multiTargetPermissionsList';
import {
    getPermissionManagerAlerts,
    getPermissionManagerParameterComponents,
} from './permissionManagerAction';

const zeroAddress = `0x${'0'.repeat(40)}`;
const where = '0xAB98085757BFd1C2718fF3cFa390a3db2e8fd209';
const who = '0x7bDAE736352aF4d2aa42fF4c828CeF9D92Ed0938';

const buildParameter = (rows: string[][]) => ({
    name: '_items',
    type: 'tuple[]',
    value: rows,
    components: [
        { name: 'operation', type: 'uint8' },
        { name: 'where', type: 'address' },
        { name: 'who', type: 'address' },
        { name: 'condition', type: 'address' },
        { name: 'permissionId', type: 'bytes32' },
    ],
});

describe('<MultiTargetPermissionsList /> component', () => {
    it('renders one row per change, in calldata order and without merging', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['1', where, who, zeroAddress, rootId],
                    ['0', where, who, zeroAddress, rootId],
                ])}
            />,
        );

        // A revoke followed by a re-grant is two real operations, not a no-op.
        expect(screen.getAllByText('ROOT_PERMISSION')).toHaveLength(2);
        expect(screen.getByText(/operation\.revoke/u)).toBeInTheDocument();
        expect(screen.getByText(/operation\.grant$/u)).toBeInTheDocument();
    });

    it('states the section heading and the change count', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['1', where, who, zeroAddress, rootId],
                    ['0', where, who, zeroAddress, rootId],
                ])}
            />,
        );

        expect(screen.getByText(/multiTarget\.summary/u)).toBeInTheDocument();
        expect(screen.getByText(/multiTarget\.heading/u)).toBeInTheDocument();
    });

    it('marks a conditional change on its own row', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['2', where, who, where, rootId],
                    ['0', where, who, zeroAddress, rootId],
                ])}
            />,
        );

        expect(screen.getByText(/multiTarget\.gatedBy/u)).toBeInTheDocument();
        expect(
            screen.getByText(/multiTarget\.unconditional/u),
        ).toBeInTheDocument();
    });

    it('warns on an unrecognised id instead of rendering it silently', () => {
        const unknownId = `0x${'ab'.repeat(32)}`;

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['0', where, who, zeroAddress, unknownId],
                ])}
            />,
        );

        expect(
            screen.getByText(/multiTarget\.unrecognised/u),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/multiTarget\.verifyUnrecognised/u),
        ).toBeInTheDocument();
    });

    it('keeps the full permission hash copyable next to the name', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['0', where, who, zeroAddress, rootId],
                ])}
            />,
        );

        // The name carries the meaning, the truncated hash the evidence, and the copy
        // affordance the full value.
        expect(screen.getByText('ROOT_PERMISSION')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateHash(rootId)),
        ).toBeInTheDocument();
        expect(
            screen.getAllByRole('button', { name: /copy/iu }).length,
        ).toBeGreaterThan(0);
    });

    it('does not present an unknown operation as a grant', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['7', where, who, zeroAddress, rootId],
                ])}
            />,
        );

        expect(
            screen.getByText(/multiTarget\.unknownOperation/u),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/operation\.grant$/u),
        ).not.toBeInTheDocument();
    });

    it('falls back to the truncated hash for an unknown permission', () => {
        const unknownId = `0x${'ab'.repeat(32)}`;

        render(
            <MultiTargetPermissionsList
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter([
                    ['0', where, who, zeroAddress, unknownId],
                ])}
            />,
        );

        expect(screen.queryByText(unknownId)).not.toBeInTheDocument();
        expect(screen.getByText(/0xabab/u)).toBeInTheDocument();
    });
});

describe('getPermissionManagerParameterComponents for multi-target actions', () => {
    const multiTargetComponents = [
        { name: 'operation', type: 'uint8' },
        { name: 'where', type: 'address' },
        { name: 'who', type: 'address' },
        { name: 'condition', type: 'address' },
        { name: 'permissionId', type: 'bytes32' },
    ];

    const buildAction = (functionName: string, parameterType: string) => ({
        inputData: {
            function: functionName,
            contract: 'DAO',
            parameters: [
                {
                    name: '_items',
                    type: parameterType,
                    value: [],
                    components: multiTargetComponents,
                },
            ],
        },
    });

    it('renders the list for applyMultiTargetPermissions on read', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        const action = {
            inputData: {
                function: 'applyMultiTargetPermissions',
                contract: 'DAO',
                parameters: [
                    {
                        ...buildParameter([
                            ['0', where, who, zeroAddress, rootId],
                        ]),
                    },
                ],
            },
        };
        const components = getPermissionManagerParameterComponents(action);
        const Component = components?.[0];

        if (Component == null) {
            throw new Error(
                'applyMultiTargetPermissions should map a component to parameter 0',
            );
        }

        render(
            <Component
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={action.inputData.parameters[0]}
            />,
        );

        expect(screen.getByText('ROOT_PERMISSION')).toBeInTheDocument();
    });

    it('renders applySingleTargetPermissions rows, keyed to the array parameter', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        const action = {
            inputData: {
                function: 'applySingleTargetPermissions',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: where },
                    {
                        name: 'items',
                        type: 'tuple[]',
                        value: [['1', who, rootId]],
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'who', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
            },
        };
        const components = getPermissionManagerParameterComponents(action);

        // The list is keyed at 1; parameter 0 is the hoisted target, which gets the
        // address field rather than being left as raw hex.
        expect(components?.[0]).toBeDefined();

        const Component = components?.[1];

        if (Component == null) {
            throw new Error('expected a component on the items parameter');
        }

        render(
            <Component
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={action.inputData.parameters[1]}
            />,
        );

        expect(screen.getByText('ROOT_PERMISSION')).toBeInTheDocument();
    });

    it('swaps in the row editor in the composer instead of raw ABI fields', () => {
        const action = buildAction('applyMultiTargetPermissions', 'tuple[]');

        expect(
            getPermissionManagerParameterComponents(action, true)?.[0],
        ).toBeDefined();
    });

    const permissionActionFixtures: Record<string, { inputData: unknown }> = {
        applyMultiTargetPermissions: {
            inputData: {
                function: 'applyMultiTargetPermissions',
                contract: 'DAO',
                parameters: [
                    {
                        name: '_items',
                        type: 'tuple[]',
                        value: [],
                        components: multiTargetComponents,
                    },
                ],
            },
        },
        applySingleTargetPermissions: {
            inputData: {
                function: 'applySingleTargetPermissions',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: where },
                    {
                        name: 'items',
                        type: 'tuple[]',
                        value: [],
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'who', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
            },
        },
        grant: {
            inputData: {
                function: 'grant',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: '' },
                    { name: '_who', type: 'address', value: '' },
                    { name: '_permissionId', type: 'bytes32', value: '' },
                ],
            },
        },
    };

    it.each(Object.keys(permissionActionFixtures))(
        'raises the risk alert for %s',
        (functionName) => {
            expect(
                getPermissionManagerAlerts(
                    permissionActionFixtures[functionName] as Parameters<
                        typeof getPermissionManagerAlerts
                    >[0],
                ),
            ).toBeDefined();
        },
    );

    it('raises no risk alert for an unrelated action', () => {
        const action = buildAction('applySomethingElse', 'tuple[]');

        expect(getPermissionManagerAlerts(action)).toBeUndefined();
    });

    it('returns the same component identities across calls', () => {
        const action = buildAction('applyMultiTargetPermissions', 'tuple[]');
        const singleTarget = (target: string) => ({
            inputData: {
                function: 'applySingleTargetPermissions',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: target },
                    {
                        name: 'items',
                        type: 'tuple[]',
                        value: [],
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'who', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
            },
        });

        // The target changes as the user types it; the editor must keep its identity or
        // the inputs remount and focus is lost mid-keystroke.
        expect(
            getPermissionManagerParameterComponents(
                singleTarget('0xab'),
                true,
            )?.[1],
        ).toBe(
            getPermissionManagerParameterComponents(
                singleTarget('0xabcd'),
                true,
            )?.[1],
        );

        // A fresh closure per render remounts the field and the input loses focus
        // mid-typing, so identity has to be stable.
        expect(getPermissionManagerParameterComponents(action, true)?.[0]).toBe(
            getPermissionManagerParameterComponents(action, true)?.[0],
        );
        expect(getPermissionManagerParameterComponents(action)?.[0]).toBe(
            getPermissionManagerParameterComponents(action)?.[0],
        );
    });

    it('leaves a differently shaped tuple to the kit default fields', () => {
        // The serialiser keys off component names; an ABI naming the grantee `_who`
        // would be accepted and then silently erased on the next write.
        const action = {
            inputData: {
                function: 'applyMultiTargetPermissions',
                contract: 'DAO',
                parameters: [
                    {
                        name: '_items',
                        type: 'tuple[]',
                        value: [],
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: '_who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
            },
        };

        expect(getPermissionManagerParameterComponents(action)).toBeUndefined();
        expect(
            getPermissionManagerParameterComponents(action, true),
        ).toBeUndefined();
    });

    it('leaves unrelated actions to the kit default fields in the composer', () => {
        const action = buildAction('applySomethingElse', 'tuple[]');

        expect(
            getPermissionManagerParameterComponents(action, true),
        ).toBeUndefined();
    });

    it('ignores an unrelated single-parameter tuple array', () => {
        const action = buildAction('applySomethingElse', 'tuple[]');

        expect(getPermissionManagerParameterComponents(action)).toBeUndefined();
    });
});
