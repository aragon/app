import type {
    IPlugin,
    PluginComponent,
    PluginFunction,
    SlotId,
} from '@/shared/utils/pluginRegistryUtils';

export interface IDaoDomainSlotComponentDefinition {
    slotId: SlotId;
    component: PluginComponent;
}

export interface IDaoDomainSlotFunctionDefinition {
    slotId: SlotId;
    fn: PluginFunction;
}

export interface IDaoDomainDefinition<TMeta extends object = object> {
    plugin: IPlugin;
    slotComponents?: IDaoDomainSlotComponentDefinition[];
    slotFunctions?: IDaoDomainSlotFunctionDefinition[];
    meta?: TMeta;
}
