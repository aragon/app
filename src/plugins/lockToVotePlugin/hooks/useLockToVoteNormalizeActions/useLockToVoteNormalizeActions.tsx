'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import type { INormalizeActionsParams } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { ILockToVotePluginSettings } from '../../types';
import { lockToVoteActionUtils } from '../../utils/lockToVoteActionUtils';

export interface IUseLockToVoteNormalizeActionsParams extends INormalizeActionsParams {}

export const useLockToVoteNormalizeActions = (params: IUseLockToVoteNormalizeActionsParams) => {
    const { actions, daoId } = params;

    const { t } = useTranslations();
    const daoPlugins = useDaoPlugins({ daoId, includeSubPlugins: true }) ?? [];

    return actions.map((action) => {
        if (lockToVoteActionUtils.isChangeSettingsAction(action)) {
            const plugin = daoPlugins.find(({ meta }) => addressUtils.isAddressEqual(action.to, meta.address));
            const { token } = (plugin?.meta as IDaoPlugin<ILockToVotePluginSettings>).settings;

            return lockToVoteActionUtils.normalizeChangeSettingsAction({ action, token, t });
        }

        return action;
    });
};
