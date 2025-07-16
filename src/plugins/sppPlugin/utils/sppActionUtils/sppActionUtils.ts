import type { IActionComposerPluginData } from '@/modules/governance/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import { actionComposerInputUtils } from '../../../../shared/components/actionComposer/actionComposerInput/actionComposerInputUtils';
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
                    ...actionComposerInputUtils.getDefaultActionPluginMetadataItem(plugin, t, {
                        stageNames: plugin.settings.stages.map((stage) => stage.name),
                    }),
                    meta: plugin,
                },
            ],
        };
    };
}

export const sppActionUtils = new SppActionUtils();
