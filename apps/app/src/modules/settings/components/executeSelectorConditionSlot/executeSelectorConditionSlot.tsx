'use client';

import type { IConditionData } from '@/modules/settings/types';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AllowedActionsList } from './allowedActionsList';
import { DecodedAllowedActionsList } from './decodedAllowedActionsList';
import {
    toAllowedActions,
    toAllowedActionViews,
} from './executeSelectorConditionSlotUtils';

interface IExecuteSelectorConditionSlotProps extends IConditionData {
    chainId?: number;
    conditionAddress?: string;
    network?: Network;
    pluginAddress?: string;
}

export const ExecuteSelectorConditionSlot: React.FC<IConditionData> = (
    props,
) => {
    const {
        selectors,
        targets,
        chainId,
        conditionAddress,
        network,
        pluginAddress,
    } = props as IExecuteSelectorConditionSlotProps;
    const { t } = useTranslations();

    const rawAllowedActions = toAllowedActions(selectors, targets);
    const hasRawAllowedActions = rawAllowedActions.length > 0;
    const shouldShowDecodedActions =
        network != null && pluginAddress != null && hasRawAllowedActions;

    return (
        <div className="flex flex-col gap-3">
            <p className="text-neutral-500">
                {t('app.settings.executeSelectorConditionSlot.description')}
            </p>
            {shouldShowDecodedActions ? (
                <DecodedAllowedActionsList
                    chainId={chainId}
                    conditionAddress={conditionAddress}
                    network={network}
                    pluginAddress={pluginAddress}
                    rawAllowedActions={rawAllowedActions}
                />
            ) : hasRawAllowedActions ? (
                <AllowedActionsList
                    actions={toAllowedActionViews(rawAllowedActions)}
                    chainId={chainId}
                />
            ) : (
                <p className="text-neutral-400">
                    {t('app.settings.executeSelectorConditionSlot.noActions')}
                </p>
            )}
        </div>
    );
};
