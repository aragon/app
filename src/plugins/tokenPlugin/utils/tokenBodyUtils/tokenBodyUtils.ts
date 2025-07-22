'use client';

import type { ISetupBodyFormExisting } from '@/modules/createDao/dialogs/setupBodyDialog';
import { daoProcessDetailsClientUtils } from '@/modules/settings/pages/daoProcessDetailsPage';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ITokenSetupMembershipForm } from '../../components/tokenSetupMembership';

export interface IPluginToFormDataParams {
    /**
     * Plugin to be returned as usable form data.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export class TokenBodyUtils {
    pluginToFormData = (
        params: IPluginToFormDataParams,
    ): ISetupBodyFormExisting<ITokenPluginSettings, ICompositeAddress, ITokenSetupMembershipForm> => {
        const { plugin } = params;
        return daoProcessDetailsClientUtils.bodyToFormDataDefault<ITokenPluginSettings, ITokenSetupMembershipForm>({
            plugin,
            membership: { members: [], token: plugin.settings.token },
        });
    };
}

export const tokenBodyUtils = new TokenBodyUtils();
