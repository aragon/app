import type { IProposalActionInputDataParameter } from '@aragon/gov-ui-kit';
import { encodeFunctionData } from 'viem';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import {
    PermissionOperation,
    permissionOperationUtils,
} from './permissionOperationUtils';

describe('permissionOperationUtils', () => {
    const zeroAddress = `0x${'0'.repeat(40)}`;
    const where = '0xAB98085757BFd1C2718fF3cFa390a3db2e8fd209';
    const who = '0x7bDAE736352aF4d2aa42fF4c828CeF9D92Ed0938';

    const buildParameter = (
        rows: string[][],
    ): IProposalActionInputDataParameter => ({
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

    it('reads each row into a change, resolving known permission names', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        const changes = permissionOperationUtils.getPermissionChanges(
            buildParameter([['0', where, who, zeroAddress, rootId]]),
        );

        expect(changes).toEqual([
            {
                operation: PermissionOperation.GRANT,
                where,
                who,
                condition: undefined,
                permissionId: rootId,
                permissionName: 'ROOT_PERMISSION',
            },
        ]);
    });

    it('maps the operation enum as deployed, 0 grant and 1 revoke', () => {
        const id = permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
        const changes = permissionOperationUtils.getPermissionChanges(
            buildParameter([
                ['0', where, who, zeroAddress, id],
                ['1', where, who, zeroAddress, id],
                ['2', where, who, where, id],
            ]),
        );

        expect(changes.map((change) => change.operation)).toEqual([
            PermissionOperation.GRANT,
            PermissionOperation.REVOKE,
            PermissionOperation.GRANT_WITH_CONDITION,
        ]);
    });

    it('normalises the zero-address condition to undefined and keeps a real one', () => {
        const id = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        const changes = permissionOperationUtils.getPermissionChanges(
            buildParameter([
                ['0', where, who, zeroAddress, id],
                ['2', where, who, where, id],
            ]),
        );

        expect(changes[0].condition).toBeUndefined();
        expect(changes[1].condition).toBe(where);
    });

    it('leaves an unknown permission id unresolved rather than guessing', () => {
        const unknownId = `0x${'ab'.repeat(32)}`;
        const [change] = permissionOperationUtils.getPermissionChanges(
            buildParameter([['1', where, who, zeroAddress, unknownId]]),
        );

        expect(change.permissionName).toBeUndefined();
        expect(change.permissionId).toBe(unknownId);
    });

    it('zips by component name, not by position', () => {
        const id = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        const parameter = buildParameter([[id, who, where, zeroAddress, '1']]);
        parameter.components = [
            { name: 'permissionId', type: 'bytes32' },
            { name: 'who', type: 'address' },
            { name: 'where', type: 'address' },
            { name: 'condition', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ];

        const [change] =
            permissionOperationUtils.getPermissionChanges(parameter);

        expect(change.operation).toBe(PermissionOperation.REVOKE);
        expect(change.who).toBe(who);
        expect(change.where).toBe(where);
        expect(change.permissionName).toBe('ROOT_PERMISSION');
    });

    it('takes the target from the fallback when rows do not carry one', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        // applySingleTargetPermissions hoists `where` into a sibling parameter.
        const parameter: IProposalActionInputDataParameter = {
            name: 'items',
            type: 'tuple[]',
            value: [['1', who, rootId]],
            components: [
                { name: 'operation', type: 'uint8' },
                { name: 'who', type: 'address' },
                { name: 'permissionId', type: 'bytes32' },
            ],
        };

        const [change] = permissionOperationUtils.getPermissionChanges(
            parameter,
            where,
        );

        expect(change.where).toBe(where);
        expect(change.who).toBe(who);
        expect(change.operation).toBe(PermissionOperation.REVOKE);
        expect(change.condition).toBeUndefined();
    });

    describe('calldata round trip', () => {
        const components = [
            { name: 'operation', type: 'uint8' },
            { name: 'where', type: 'address' },
            { name: 'who', type: 'address' },
            { name: 'condition', type: 'address' },
            { name: 'permissionId', type: 'bytes32' },
        ];

        const abi = [
            {
                type: 'function' as const,
                name: 'applyMultiTargetPermissions',
                inputs: [{ name: '_items', type: 'tuple[]', components }],
            },
        ];

        it('serialises changes back into the rows they were parsed from', () => {
            const rootId =
                permissionNameUtils.getPermissionId('ROOT_PERMISSION');
            const executeId =
                permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
            const rows = [
                ['1', where, who, zeroAddress, rootId],
                ['0', where, who, zeroAddress, executeId],
                ['2', where, who, where, rootId],
            ];

            const changes = permissionOperationUtils.getPermissionChanges({
                name: '_items',
                type: 'tuple[]',
                value: rows,
                components,
            });
            const serialised = changes.map((change) =>
                permissionOperationUtils.toRowValues(
                    change,
                    components.map((component) => component.name),
                ),
            );

            expect(serialised).toEqual(rows);
        });

        it('produces calldata identical to encoding the original rows', () => {
            const rootId =
                permissionNameUtils.getPermissionId('ROOT_PERMISSION');
            const rows = [
                ['1', where, who, zeroAddress, rootId],
                ['2', where, who, where, rootId],
            ];

            const changes = permissionOperationUtils.getPermissionChanges({
                name: '_items',
                type: 'tuple[]',
                value: rows,
                components,
            });
            const serialised = changes.map((change) =>
                permissionOperationUtils.toRowValues(
                    change,
                    components.map((component) => component.name),
                ),
            );

            // What the editor writes must encode to the same calldata as the values it
            // was given, otherwise the UI silently changes the transaction.
            expect(encodeFunctionData({ abi, args: [serialised] })).toBe(
                encodeFunctionData({ abi, args: [rows] }),
            );
        });

        it('keeps a reordered ABI honest, serialising by name not position', () => {
            const rootId =
                permissionNameUtils.getPermissionId('ROOT_PERMISSION');
            const reordered = [
                { name: 'permissionId', type: 'bytes32' },
                { name: 'who', type: 'address' },
                { name: 'where', type: 'address' },
                { name: 'condition', type: 'address' },
                { name: 'operation', type: 'uint8' },
            ];
            const rows = [[rootId, who, where, zeroAddress, '1']];

            const changes = permissionOperationUtils.getPermissionChanges({
                name: '_items',
                type: 'tuple[]',
                value: rows,
                components: reordered,
            });
            const serialised = changes.map((change) =>
                permissionOperationUtils.toRowValues(
                    change,
                    reordered.map((component) => component.name),
                ),
            );

            expect(serialised).toEqual(rows);
        });
    });

    it('returns nothing when the parameter is not a decoded tuple array', () => {
        expect(
            permissionOperationUtils.getPermissionChanges({
                name: '_items',
                type: 'tuple[]',
                value: undefined,
            }),
        ).toEqual([]);
    });
});
