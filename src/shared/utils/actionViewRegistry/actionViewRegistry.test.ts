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

    describe('getViewBySelector', () => {});
    describe('getViewsByPermissionId', () => {});
});
