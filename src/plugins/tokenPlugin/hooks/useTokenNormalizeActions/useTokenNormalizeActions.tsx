import type { INormalizeActionsParams } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { ITokenPluginSettings } from '../../types';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export interface IUseTokenNormalizeActionsParams extends INormalizeActionsParams<ITokenPluginSettings> {}

export const useTokenNormalizeActions = (params: IUseTokenNormalizeActionsParams) => {
    const { actions, daoId } = params;

    const daoPlugins = useDaoPlugins({ daoId, includeSubPlugins: true }) ?? [];

    const { t } = useTranslations();

    return actions.map((action) => {
        if (tokenActionUtils.isTokenMintAction(action)) {
            return tokenActionUtils.normalizeTokenMintAction(action);
        } else if (tokenActionUtils.isChangeSettingsAction(action)) {
            const { to: pluginAddress } = action;
            const plugin = daoPlugins.find(({ meta }) => addressUtils.isAddressEqual(pluginAddress, meta.address))
                ?.meta as IDaoPlugin<ITokenPluginSettings>;

            return tokenActionUtils.normalizeChangeSettingsAction({ action, settings: plugin.settings, t });
        }

        return action;
    });
};
