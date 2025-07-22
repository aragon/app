import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IPluginToFormDataParams<
    TSettings extends IPluginSettings = IPluginSettings,
    TMembership extends ISetupBodyFormMembership = ISetupBodyFormMembership,
> {
    plugin: IDaoPlugin<TSettings>;
    membership: TMembership;
}
