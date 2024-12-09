import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { actionComposerUtils } from '@/modules/governance/components/actionComposer/actionComposerUtils';
import { UpdatePluginMetadataAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { type ISppPluginSettings } from '../../types';

export interface IGetSppActionsProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin<ISppPluginSettings>;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export type IGetSppActionsResult = IActionComposerPluginData<IDaoPlugin<ISppPluginSettings>>;

class SppActionUtils {
    getSppActions = ({ plugin, t }: IGetSppActionsProps): IGetSppActionsResult => {
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
                    id: `${address}-${ProposalActionType.METADATA_PLUGIN_UPDATE}`,
                    name: t(`app.plugins.spp.sppActions.${ProposalActionType.METADATA_PLUGIN_UPDATE}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: {
                        ...actionComposerUtils.buildDefaultActionPluginMetadata({
                            name: plugin.name ?? '',
                            summary: plugin.description,
                            resources: plugin.links,
                            key: plugin.processKey ?? '',
                        }),
                        to: address,
                    },
                    meta: plugin,
                },
            ],
            components: {
                [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
            },
        };
    };
}

export const sppActionUtils = new SppActionUtils();
