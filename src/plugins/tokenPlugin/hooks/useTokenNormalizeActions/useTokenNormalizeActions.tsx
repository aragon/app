import type { INormalizeActionsParams } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { ITokenPluginSettings } from '../../types';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export interface IUseTokenNormalizeActionsParams extends INormalizeActionsParams {}

export const useTokenNormalizeActions = (params: IUseTokenNormalizeActionsParams) => {
    const { actions, daoId } = params;

    const { t } = useTranslations();
    const daoPlugins = useDaoPlugins({ daoId, includeSubPlugins: true }) ?? [];

    return actions.map((action) => {
        if (tokenActionUtils.isTokenMintAction(action)) {
            return tokenActionUtils.normalizeTokenMintAction(action);
        } else if (tokenActionUtils.isChangeSettingsAction(action)) {
            const plugin = daoPlugins.find(({ meta }) => addressUtils.isAddressEqual(action.to, meta.address));
            const { token } = (plugin?.meta as IDaoPlugin<ITokenPluginSettings>).settings;

            return tokenActionUtils.normalizeChangeSettingsAction({ action, token, t });
        }

        return action;
    });
};
