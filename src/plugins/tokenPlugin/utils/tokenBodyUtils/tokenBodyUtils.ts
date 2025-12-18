'use client';

import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ISetupBodyFormExisting } from '@/modules/createDao/dialogs/setupBodyDialog';
import { daoProcessDetailsClientUtils } from '@/modules/settings/pages/daoProcessDetailsPage';
import type { IPluginToFormDataParams } from '@/modules/settings/types';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { ITokenSetupMembershipForm } from '../../components/tokenSetupMembership';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

export interface ITokenPluginToFormDataParams extends IPluginToFormDataParams<ITokenPluginSettings> {}

export class TokenBodyUtils {
    pluginToFormData = (
        params: ITokenPluginToFormDataParams
    ): ISetupBodyFormExisting<ITokenPluginSettings, ICompositeAddress, ITokenSetupMembershipForm> => {
        const { plugin } = params;

        const { settings } = plugin;
        const { token, minParticipation, supportThreshold } = settings;

        return daoProcessDetailsClientUtils.bodyToFormDataDefault<ITokenPluginSettings, ITokenSetupMembershipForm>({
            plugin: {
                ...plugin,
                settings: {
                    ...settings,
                    minParticipation: tokenSettingsUtils.ratioToPercentage(minParticipation),
                    supportThreshold: tokenSettingsUtils.ratioToPercentage(supportThreshold),
                },
            },
            membership: { members: [], token },
        });
    };
}

export const tokenBodyUtils = new TokenBodyUtils();
