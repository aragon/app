import type {
    IPlugin,
    PluginComponent,
    PluginFunction,
    SlotId,
} from '@/shared/utils/pluginRegistryUtils';

/**
 * Component registration definition for a DAO domain slot.
 */
export interface IDaoDomainSlotComponentDefinition {
    /**
     * Slot to register the component under.
     */
    slotId: SlotId;
    /**
     * Component to register for the slot.
     */
    component: PluginComponent;
}

/**
 * Function registration definition for a DAO domain slot.
 */
export interface IDaoDomainSlotFunctionDefinition {
    /**
     * Slot to register the function under.
     */
    slotId: SlotId;
    /**
     * Function to register for the slot.
     */
    fn: PluginFunction;
}

/**
 * Final generated DAO domain definition consumed by DAO initializers.
 */
export interface IDaoDomainDefinition<TMeta extends object = object> {
    /**
     * Plugin identity for the domain.
     */
    plugin: IPlugin;
    /**
     * Slot components to register for the domain.
     */
    slotComponents?: IDaoDomainSlotComponentDefinition[];
    /**
     * Slot functions to register for the domain.
     */
    slotFunctions?: IDaoDomainSlotFunctionDefinition[];
    /**
     * Optional family-specific metadata for the domain.
     */
    meta?: TMeta;
}
