import {
    permissionActionAbis,
    permissionActionSelectors,
} from './permissionActionSelectors';

describe('permissionActionSelectors', () => {
    it('keeps the selectors of the deployed DAO permission functions', () => {
        // Pinned so a change to the parameter names or types cannot silently move a selector.
        expect(permissionActionSelectors).toEqual({
            grant: '0xd68bad2c',
            revoke: '0xd96054c4',
            grantWithCondition: '0xc9dbc2a4',
            applySingleTargetPermissions: '0x22844d04',
            applyMultiTargetPermissions: '0xe978afe5',
        });
    });

    it('names the tuple components the bulk editor addresses cells by', () => {
        const singleItems = permissionActionAbis.applySingleTargetPermissions
            .inputs[1] as { components?: Array<{ name?: string }> };
        const multiItems = permissionActionAbis.applyMultiTargetPermissions
            .inputs[0] as { components?: Array<{ name?: string }> };

        expect(singleItems.components?.map((c) => c.name)).toEqual([
            'operation',
            'who',
            'permissionId',
        ]);
        expect(multiItems.components?.map((c) => c.name)).toEqual([
            'operation',
            'where',
            'who',
            'condition',
            'permissionId',
        ]);
    });
});
