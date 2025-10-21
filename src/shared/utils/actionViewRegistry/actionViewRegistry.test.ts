import type { Hex } from 'viem';
import { ActionViewRegistry } from './actionViewRegistry';
import type { IActionViewDescriptor } from './actionViewRegistry.api';

describe('ActionViewRegistry', () => {
    const mockComponent = () => null;
    let actionViewRegistry: ActionViewRegistry;

    beforeEach(() => {
        actionViewRegistry = new ActionViewRegistry();
    });

    describe('register', () => {
        it('registers a view with function selector and permission id', () => {
            const descriptor: IActionViewDescriptor = {
                id: 'test-view',
                functionSelector: '0xa9059cbb' as Hex,
                permissionId: 'TRANSFER_PERMISSION',
                component: mockComponent,
                label: 'Transfer',
            };

            expect(() => actionViewRegistry.register(descriptor)).not.toThrow();
        });

        it('throws error when no selector nor permission id provided', () => {
            const descriptor: IActionViewDescriptor = {
                id: 'test-view-invalid',
                component: mockComponent,
            };

            expect(() => actionViewRegistry.register(descriptor)).toThrow(
                'Action view "test-view-invalid" must provide at least one matching criterion: functionSelector or permissionId',
            );
        });

        it('throws when duplicate ID provided ', () => {
            const descriptor: IActionViewDescriptor = {
                id: 'test-view',
                functionSelector: '0xa9059cbb' as Hex,
                permissionId: 'TRANSFER_PERMISSION',
                component: mockComponent,
                label: 'Transfer',
            };

            actionViewRegistry.register(descriptor);
            expect(() => actionViewRegistry.register(descriptor)).toThrow(
                `Action view with id "test-view" is already registered`,
            );
        });
    });

    describe('getViewBySelector', () => {
        it('returns view when selector matches', () => {
            const descriptor: IActionViewDescriptor = {
                id: 'transfer-view',
                functionSelector: '0xa9059cbb' as Hex,
                component: mockComponent,
                label: 'Transfer',
            };

            actionViewRegistry.register(descriptor);

            const result = actionViewRegistry.getViewBySelector('0xa9059cbb' as Hex);
            expect(result).toEqual(descriptor);
        });

        it('returns undefined when no selector matches', () => {
            const descriptor: IActionViewDescriptor = {
                id: 'transfer-view',
                functionSelector: '0xa9059cbb' as Hex,
                component: mockComponent,
                label: 'Transfer',
            };

            actionViewRegistry.register(descriptor);

            const result = actionViewRegistry.getViewBySelector('0x12345678' as Hex);
            expect(result).toBeUndefined();
        });

        it('returns undefined when no views are registered', () => {
            const result = actionViewRegistry.getViewBySelector('0xa9059cbb' as Hex);
            expect(result).toBeUndefined();
        });
    });

    describe('getViewsByPermissionId', () => {
        it('returns views when permission id matches', () => {
            const descriptor1: IActionViewDescriptor = {
                id: 'transfer-view-1',
                permissionId: 'TRANSFER_PERMISSION',
                component: mockComponent,
                label: 'Transfer 1',
            };

            const descriptor2: IActionViewDescriptor = {
                id: 'transfer-view-2',
                permissionId: 'TRANSFER_PERMISSION',
                component: mockComponent,
                label: 'Transfer 2',
            };

            const descriptor3: IActionViewDescriptor = {
                id: 'mint-view',
                permissionId: 'MINT_PERMISSION',
                component: mockComponent,
                label: 'Mint',
            };

            actionViewRegistry.register(descriptor1);
            actionViewRegistry.register(descriptor2);
            actionViewRegistry.register(descriptor3);

            const result = actionViewRegistry.getViewsByPermissionId('TRANSFER_PERMISSION');
            expect(result).toHaveLength(2);
            expect(result).toEqual([descriptor1, descriptor2]);
        });

        it('returns empty array when no permission id matches', () => {
            const descriptor: IActionViewDescriptor = {
                id: 'transfer-view',
                permissionId: 'TRANSFER_PERMISSION',
                component: mockComponent,
                label: 'Transfer',
            };

            actionViewRegistry.register(descriptor);

            const result = actionViewRegistry.getViewsByPermissionId('MINT_PERMISSION');
            expect(result).toEqual([]);
        });

        it('returns empty array when no views are registered', () => {
            const result = actionViewRegistry.getViewsByPermissionId('TRANSFER_PERMISSION');
            expect(result).toEqual([]);
        });
    });
});
