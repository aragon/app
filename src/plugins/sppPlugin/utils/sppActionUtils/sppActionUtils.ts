import { type IPluginActionComposerData } from '@/modules/governance/components/actionComposer';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { type ISppPluginSettings, SppProposalActionType } from '../../types';
import { UpdatePluginMetadataAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction';
import { defaultUpdateMetadata } from '@/modules/governance/components/actionComposer/actionComposerDefinitions';
import { ProposalActionType } from '@/modules/governance/api/governanceService';

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

export type IGetSppActionsResult = IPluginActionComposerData<IDaoPlugin<ISppPluginSettings>, SppProposalActionType>;

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
                    id: `${address}-${SppProposalActionType.UPDATE_PLUGIN_METADATA}`,
                    name: 'UPDATE_METADATA_SPP',
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: {
                        ...defaultUpdateMetadata({
                            name: plugin.name ?? '',
                            summary: plugin.description,
                            resources: plugin.links,
                            key: plugin.processKey,
                        }),
                        to: address,
                    },
                    meta: plugin,
                },
            ],
            components: {
                [ProposalActionType.METADATA_UPDATE]: UpdatePluginMetadataAction,
            },
        };
    };
}

export const sppActionUtils = new SppActionUtils();
