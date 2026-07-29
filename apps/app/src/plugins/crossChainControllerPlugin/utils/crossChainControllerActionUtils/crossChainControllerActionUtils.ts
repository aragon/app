import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { CrossChainControllerForwardMessageAction } from '../../components/crossChainControllerActions/crossChainControllerForwardMessageAction';
import { CrossChainControllerProposalActionType } from '../../types';
import { defaultForwardMessage } from './crossChainControllerActionDefinitions';

export interface IGetCrossChainControllerActionsProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export type IGetCrossChainControllerActionsResult =
    IActionComposerPluginData<IDaoPlugin>;

class CrossChainControllerActionUtils {
    getCrossChainControllerActions = ({
        plugin,
        t,
    }: IGetCrossChainControllerActionsProps): IGetCrossChainControllerActionsResult => {
        const { address } = plugin;

        return {
            groups: [
                {
                    id: address,
                    name: daoUtils.getPluginName(plugin),
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: `${address}-${CrossChainControllerProposalActionType.FORWARD_MESSAGE}`,
                    name: t(
                        `app.plugins.crossChainController.crossChainControllerActions.${CrossChainControllerProposalActionType.FORWARD_MESSAGE}`,
                    ),
                    icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
                    groupId: address,
                    defaultValue: { ...defaultForwardMessage, to: address },
                },
            ],
            components: {
                [CrossChainControllerProposalActionType.FORWARD_MESSAGE]:
                    CrossChainControllerForwardMessageAction,
            },
        };
    };
}

export const crossChainControllerActionUtils =
    new CrossChainControllerActionUtils();
