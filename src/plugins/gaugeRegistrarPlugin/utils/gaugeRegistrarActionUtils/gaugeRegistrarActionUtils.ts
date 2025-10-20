import type { IActionComposerPluginData } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { GaugeRegistrarRegisterGaugeAction } from '../../components/gaugeRegistrarRegisterGaugeAction';
import { GaugeRegistrarUnregisterGaugeAction } from '../../components/gaugeRegistrarUnegisterGaugeAction';
import { GaugeRegistrarActionType } from '../../types/enum/gaugeRegistrarActionType';
import { defaultRegisterGauge, defaultUnregisterGauge } from './gaugeRegistrarActionDefinitions';

export interface IGetGaugeVoterActionProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export type IGetGaugeVoterActionsResult = IActionComposerPluginData<IDaoPlugin>;

class GaugeRegistrarActionUtils {
    getActions = ({ plugin, t }: IGetGaugeVoterActionProps): IGetGaugeVoterActionsResult => {
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
                    id: `${address}-${GaugeRegistrarActionType.REGISTER_GAUGE}`,
                    name: t(`app.plugins.gaugeRegistrar.actions.${GaugeRegistrarActionType.REGISTER_GAUGE}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: defaultRegisterGauge(plugin),
                    meta: plugin,
                },
                {
                    id: `${address}-${GaugeRegistrarActionType.UNREGISTER_GAUGE}`,
                    name: t(`app.plugins.gaugeRegistrar.actions.${GaugeRegistrarActionType.UNREGISTER_GAUGE}`),
                    icon: IconType.SETTINGS,
                    groupId: address,
                    defaultValue: defaultUnregisterGauge(plugin),
                    meta: plugin,
                },
            ],
            components: {
                [GaugeRegistrarActionType.REGISTER_GAUGE]: GaugeRegistrarRegisterGaugeAction,
                [GaugeRegistrarActionType.UNREGISTER_GAUGE]: GaugeRegistrarUnregisterGaugeAction,
            },
        };
    };
}

export const gaugeRegistrarActionUtils = new GaugeRegistrarActionUtils();
