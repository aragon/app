import type { INormalizeActionsParams } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenPluginSettings } from '../../types';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export interface IUseTokenNormalizeActionsParams extends INormalizeActionsParams<ITokenPluginSettings> {}

export const useTokenNormalizeActions = (params: IUseTokenNormalizeActionsParams) => {
    const { actions, plugin } = params;

    const { t } = useTranslations();

    return actions.map((action) => {
        if (tokenActionUtils.isTokenMintAction(action)) {
            return tokenActionUtils.normalizeTokenMintAction(action);
        } else if (tokenActionUtils.isChangeSettingsAction(action)) {
            const params = { action, settings: plugin.settings, t };
            return tokenActionUtils.normalizeChangeSettingsAction(params);
        }

        return action;
    });
};
