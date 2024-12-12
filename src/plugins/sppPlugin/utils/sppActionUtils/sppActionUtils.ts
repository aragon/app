import { ProposalActionType } from '@/modules/governance/api/governanceService';
import type {
    IDaoPluginMetadataObject,
    IProposalActionUpdatePluginMetadata,
} from '@/modules/governance/api/governanceService/domain/proposalActionUpdatePluginMetadata';
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

const defaultUpdateMetadata = (metadata: IDaoPluginMetadataObject): IProposalActionUpdatePluginMetadata => ({
    type: ProposalActionType.METADATA_PLUGIN_UPDATE,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    proposedMetadata: metadata,
    existingMetadata: metadata,
    inputData: {
        function: 'setMetadata',
        contract: '',
        parameters: [
            {
                name: '_metadata',
                type: 'bytes',
                notice: 'The IPFS hash of the new metadata object',
                value: '',
            },
        ],
    },
});

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
                    name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.METADATA_PLUGIN_UPDATE}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: {
                        ...defaultUpdateMetadata({
                            name: plugin.name ?? '',
                            description: plugin.description ?? '',
                            links: plugin.links ?? [],
                            processKey: plugin.processKey ?? '',
                            stageNames: plugin.settings.stages.map(({ name }) => name),
                        }),
                        to: address,
                    },
                    meta: plugin,
                },
            ],
        };
    };
}

export const sppActionUtils = new SppActionUtils();
