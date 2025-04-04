import type { INormalizeActionsParams } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export interface IUseTokenNormalizeActionsParams extends INormalizeActionsParams {}

export const useTokenNormalizeActions = (params: IUseTokenNormalizeActionsParams) => {
    const { actions } = params;

    const { t } = useTranslations();

    return actions.map((action) => {
        if (tokenActionUtils.isTokenMintAction(action)) {
            return tokenActionUtils.normalizeTokenMintAction(action);
        } else if (tokenActionUtils.isChangeSettingsAction(action)) {
            return tokenActionUtils.normalizeChangeSettingsAction({ action, t });
        }

        return action;
    });
};
