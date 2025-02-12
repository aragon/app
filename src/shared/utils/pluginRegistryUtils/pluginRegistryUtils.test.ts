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

    describe('getPlugin', () => {
        it('returns the plugin when it is registered', () => {
            const plugin = generatePlugin({ id: 'plugin-1' });
            pluginRegistryUtils.registerPlugin(plugin);
            expect(pluginRegistryUtils.getPlugin('plugin-1')).toEqual(plugin);
        });

        it('returns undefined when the plugin is not registered', () => {
            expect(pluginRegistryUtils.getPlugin('no-plugin')).toBeUndefined();
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
            const pluginId = 'token-voting';
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

    describe('registerSlotFunction', () => {
        it('registers the specified slot function', () => {
            const params = { slotId: 'slot-id', pluginId: 'plugin-id', function: () => null };
            pluginRegistryUtils.registerSlotFunction(params);
            expect(pluginRegistryUtils.getSlotFunction({ slotId: params.slotId, pluginId: params.pluginId })).toEqual(
                params.function,
            );
        });

        it('returns the class instance', () => {
            const params = { slotId: 's', pluginId: 'p', function: () => null };
            const result = pluginRegistryUtils.registerSlotFunction(params);
            expect(result).toEqual(pluginRegistryUtils);
        });

        it('overrides the previous registered slotFunction when passing slot-functions with same slot and plugin ids', () => {
            const slotId = 'governance-member-list';
            const pluginId = 'mulsisig';
            const firstFunction = () => 'first';
            const secondFunction = () => 'second';

            pluginRegistryUtils
                .registerSlotFunction({ slotId, pluginId, function: firstFunction })
                .registerSlotFunction({ slotId, pluginId, function: secondFunction });

            expect(pluginRegistryUtils.getSlotFunction({ slotId, pluginId })).toEqual(secondFunction);
        });
    });

    describe('getSlotFunctions', () => {
        it('returns all the functions registered for the giver slot', () => {
            const slotId = 'test-slot-id';
            pluginRegistryUtils.registerSlotFunction({ slotId, pluginId: '1', function: () => '1' });
            pluginRegistryUtils.registerSlotFunction({ slotId, pluginId: '2', function: () => '2' });
            expect(pluginRegistryUtils.getSlotFunctions(slotId)).toHaveLength(2);
        });

        it('returns empty array when no functions are registered for the given slot id', () => {
            const slotId = 'test-slot-id';
            pluginRegistryUtils.registerSlotFunction({ slotId: 'another-slot', pluginId: '1', function: () => null });
            expect(pluginRegistryUtils.getSlotFunctions(slotId)).toHaveLength(0);
        });
    });

    describe('getSlotFunction', () => {
        it('returns undefined when no function is registered for the given plugin id', () => {
            const slotId = 'slot-id';
            const registeredPluginId = 'multisig';
            const unregisteredPluginId = 'tokenVoting';
            pluginRegistryUtils.registerSlotFunction({ slotId, pluginId: registeredPluginId, function: () => null });
            expect(pluginRegistryUtils.getSlotFunction({ slotId, pluginId: unregisteredPluginId })).toBeUndefined();
        });

        it('returns undefined when no function is registered for the given slot id', () => {
            const registeredSlotId = 'member-list';
            const unregisteredSlotId = 'settings';
            const pluginId = 'token-voting';
            pluginRegistryUtils.registerSlotFunction({
                slotId: registeredSlotId,
                pluginId: pluginId,
                function: () => null,
            });
            expect(
                pluginRegistryUtils.getSlotFunction({ slotId: unregisteredSlotId, pluginId: pluginId }),
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
