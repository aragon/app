import { generatePlugin } from '@/shared/testUtils';
import { PluginRegistryUtils } from './pluginRegistryUtils';

describe('pluginRegistry utils', () => {
    let pluginRegistryUtils = new PluginRegistryUtils();

    afterEach(() => {
        pluginRegistryUtils = new PluginRegistryUtils();
    });

    describe('registerPlugin', () => {
        it('regiters the specified plugins', () => {
            const firstPlugin = generatePlugin({ id: 'plugin-1' });
            const secondPlugin = generatePlugin({ id: 'plugin-2' });
            pluginRegistryUtils.registerPlugin(firstPlugin).registerPlugin(secondPlugin);
            expect(pluginRegistryUtils['pluginRegistry'].plugins).toEqual([firstPlugin, secondPlugin]);
        });

        it('returns the class instance', () => {
            expect(pluginRegistryUtils.registerPlugin(generatePlugin())).toEqual(pluginRegistryUtils);
        });
    });

    describe('registerSlotComponent', () => {
        it('registers the specified slot component', () => {
            const params = { slotId: 'slot-id', pluginId: 'plugin-id', component: () => null };
            pluginRegistryUtils.registerSlotComponent(params);
            expect(pluginRegistryUtils.getSlotComponent({ slotId: params.slotId, pluginId: params.pluginId })).toEqual(
                params.component,
            );
        });

        it('returns the class instance', () => {
            const params = { slotId: 's', pluginId: 'p', component: () => null };
            const result = pluginRegistryUtils.registerSlotComponent(params);
            expect(result).toEqual(pluginRegistryUtils);
        });

        it('overrides the previous registered slotComponent when passing slot-components with same slot and plugin ids', () => {
            const slotId = 'governance-member-list';
            const pluginId = 'mulsisig';
            const firstComponent = () => 'first';
            const secondComponent = () => 'second';

            pluginRegistryUtils
                .registerSlotComponent({ slotId, pluginId, component: firstComponent })
                .registerSlotComponent({ slotId, pluginId, component: secondComponent });

            expect(pluginRegistryUtils.getSlotComponent({ slotId, pluginId })).toEqual(secondComponent);
        });
    });

    describe('getSlotComponent', () => {
        it('returns undefined when no component is registered for the given plugin id', () => {
            const slotId = 'slot-id';
            const registeredPluginId = 'multisig';
            const unregisteredPluginId = 'tokenVoting';
            pluginRegistryUtils.registerSlotComponent({ slotId, pluginId: registeredPluginId, component: () => null });
            expect(pluginRegistryUtils.getSlotComponent({ slotId, pluginId: unregisteredPluginId })).toBeUndefined();
        });

        it('returns undefined when no component is registered for the given slot id', () => {
            const registeredSlotId = 'member-list';
            const unregisteredSlotId = 'settings';
            const pluginId = 'tokenVoting';
            pluginRegistryUtils.registerSlotComponent({
                slotId: registeredSlotId,
                pluginId: pluginId,
                component: () => null,
            });
            expect(
                pluginRegistryUtils.getSlotComponent({ slotId: unregisteredSlotId, pluginId: pluginId }),
            ).toBeUndefined();
        });
    });

    describe('listContainsRegisteredPlugins', () => {
        it('returns true when list contains a registered plugin', () => {
            const plugins = [generatePlugin({ id: '1' }), generatePlugin({ id: '2' })];
            const list = ['5', '7', plugins[1].id];
            pluginRegistryUtils.registerPlugin(plugins[0]).registerPlugin(plugins[1]);
            expect(pluginRegistryUtils.listContainsRegisteredPlugins(list)).toBeTruthy();
        });

        it('returns false when list does not contain a registered plugin', () => {
            const plugins = [generatePlugin({ id: '8' }), generatePlugin({ id: '5' })];
            const list = ['4', '1', '000', '88'];
            pluginRegistryUtils.registerPlugin(plugins[0]).registerPlugin(plugins[1]);
            expect(pluginRegistryUtils.listContainsRegisteredPlugins(list)).toBeFalsy();
        });

        it('returns false when list is not defined', () => {
            const plugins = [generatePlugin({ id: '0' })];
            pluginRegistryUtils.registerPlugin(plugins[0]);
            expect(pluginRegistryUtils.listContainsRegisteredPlugins()).toBeFalsy();
        });
    });
});
