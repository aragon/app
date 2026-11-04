import { ActionViewRegistry } from './actionViewRegistry';
import type { IActionViewDescriptor } from './actionViewRegistry.api';

describe('actionViewRegistry utils', () => {
    const componentDetails = () => null;

    const createRegistry = (views: IActionViewDescriptor[]) => {
        const registry = new ActionViewRegistry();
        views.forEach((view) => registry.register(view));

        return registry;
    };

    describe('getDaoIndependentView', () => {
        it('resolves a DAO-independent view by action type', () => {
            const view = {
                actionType: 'Transfer',
                componentDetails,
                isDaoIndependent: true,
            };
            const registry = createRegistry([view]);

            expect(registry.getDaoIndependentView('Transfer')).toBe(view);
        });

        it('resolves a DAO-independent view by function selector', () => {
            const view = {
                actionType: 'PermissionGrant',
                functionSelector: '0xa1b2c3d4' as const,
                componentDetails,
                isDaoIndependent: true,
            };
            const registry = createRegistry([view]);

            expect(
                registry.getDaoIndependentView('Unknown', '0xa1b2c3d4'),
            ).toBe(view);
        });

        it('prefers the view matching the action type over the one matching the selector', () => {
            const typeView = {
                actionType: 'Transfer',
                componentDetails,
                isDaoIndependent: true,
            };
            const selectorView = {
                actionType: 'Other',
                functionSelector: '0xa9059cbb' as const,
                componentDetails,
                isDaoIndependent: true,
            };
            const registry = createRegistry([selectorView, typeView]);

            expect(
                registry.getDaoIndependentView('Transfer', '0xa9059cbb'),
            ).toBe(typeView);
        });

        it('does not resolve views that depend on the DAO', () => {
            const registry = createRegistry([
                { actionType: 'Execute', componentDetails },
                {
                    actionType: 'ActivateGauge',
                    functionSelector: '0xa1b2c3d4',
                    componentDetails,
                },
            ]);

            expect(registry.getDaoIndependentView('Execute')).toBeUndefined();
            expect(
                registry.getDaoIndependentView('Unknown', '0xa1b2c3d4'),
            ).toBeUndefined();
        });

        it('does not resolve DAO-independent views without a details component', () => {
            const registry = createRegistry([
                {
                    actionType: 'Transfer',
                    functionSelector: '0xa9059cbb',
                    isDaoIndependent: true,
                },
            ]);

            expect(
                registry.getDaoIndependentView('Transfer', '0xa9059cbb'),
            ).toBeUndefined();
        });
    });
});
