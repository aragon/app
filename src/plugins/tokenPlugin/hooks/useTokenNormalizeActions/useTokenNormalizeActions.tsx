import type { INormalizeActionsParams } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenPluginSettings } from '../../types';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export interface IUseTokenNormalizeActionsParams extends INormalizeActionsParams<ITokenPluginSettings> {}

export const useTokenNormalizeActions = (params: IUseTokenNormalizeActionsParams) => {
    const { actions, settings } = params;

    const { t } = useTranslations();

    return actions.map((action) => {
        if (tokenActionUtils.isTokenMintAction(action)) {
            return tokenActionUtils.normalizeTokenMintAction(action);
        } else if (tokenActionUtils.isChangeSettingsAction(action)) {
            return tokenActionUtils.normalizeChangeSettingsAction({ action, settings, t });
        }

        return action;
    });
};
