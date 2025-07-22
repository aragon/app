import type { ISetupBodyFormExisting } from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogDefinitions';
import { daoProcessDetailsClientUtils } from '@/modules/settings/pages/daoProcessDetailsPage/daoProcessDetailsClientUtils';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ITokenSetupMembershipForm } from '../../components/tokenSetupMembership';

export interface NormalizeTokenBodyParams {
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export class TokenBodyUtils {
    normalizeTokenBody = (
        params: NormalizeTokenBodyParams,
    ): ISetupBodyFormExisting<ITokenPluginSettings, ICompositeAddress, ITokenSetupMembershipForm> => {
        const { plugin } = params;
        return daoProcessDetailsClientUtils.normalizeBody<ITokenPluginSettings, ITokenSetupMembershipForm>({
            plugin,
            membership: { members: [], token: plugin.settings.token },
            governance: plugin.settings.governance,
        });
    };
}

export const tokenBodyUtils = new TokenBodyUtils();
