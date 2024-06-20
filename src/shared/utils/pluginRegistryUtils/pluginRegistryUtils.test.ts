import { PluginRegistryUtils } from './pluginRegistryUtils';

describe('pluginRegistry utils', () => {
    let pluginRegistryUtils = new PluginRegistryUtils();

    afterEach(() => {
        pluginRegistryUtils = new PluginRegistryUtils();
    });

    it('register the specified slot component', () => {
        const params = { slotId: 'slot-id', pluginId: 'plugin-id', component: () => null };
        pluginRegistryUtils.registerSlotComponent(params);
        expect(pluginRegistryUtils.getSlotComponent({ slotId: params.slotId, pluginId: params.pluginId })).toEqual(
            params.component,
        );
    });

    it('register function returns the utility instance', () => {
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

    it('returns undefined when no component is registered for the given slot and plugin ids', () => {
        const slotId = 'slot-id';
        const registeredPluginId = 'multisig';
        const unregisteredPluginId = 'tokenVoting';
        pluginRegistryUtils.registerSlotComponent({ slotId, pluginId: registeredPluginId, component: () => null });
        expect(pluginRegistryUtils.getSlotComponent({ slotId, pluginId: unregisteredPluginId })).toBeUndefined();
    });
});
