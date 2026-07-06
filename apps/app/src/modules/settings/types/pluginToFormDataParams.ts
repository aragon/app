import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IPluginToFormDataParams<
    TSettings extends IPluginSettings = IPluginSettings,
    TMembership extends ISetupBodyFormMembership = ISetupBodyFormMembership,
> {
    /**
     * Plugin to be processed.
     */
    plugin: IDaoPlugin<TSettings>;
    /**
     * Membership form data of the plugin.
     */
    membership: TMembership;
}
