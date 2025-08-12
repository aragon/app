'use client';

import type { INormalizeActionsParams } from '@/modules/governance/types';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils } from '@aragon/gov-ui-kit';
import { lockToVoteActionUtils } from '../../utils/lockToVoteActionUtils';

export interface IUseLockToVoteNormalizeActionsParams extends INormalizeActionsParams {}

export const useLockToVoteNormalizeActions = (params: IUseLockToVoteNormalizeActionsParams) => {
    const { actions, daoId } = params;

    const { t } = useTranslations();
    const daoPlugins = useDaoPlugins({ daoId, includeSubPlugins: true }) ?? [];

    return actions.map((action) => {
        if (lockToVoteActionUtils.isChangeSettingsAction(action)) {
            const plugin = daoPlugins.find(({ meta }) => addressUtils.isAddressEqual(action.to, meta.address));
            const { token } = (plugin?.meta as IDaoPlugin<ITokenPluginSettings>).settings;

            return lockToVoteActionUtils.normalizeChangeSettingsAction({ action, token, t });
        }

        return action;
    });
};
