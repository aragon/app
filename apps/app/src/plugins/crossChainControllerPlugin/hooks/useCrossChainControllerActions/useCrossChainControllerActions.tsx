'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { crossChainControllerActionUtils } from '../../utils/crossChainControllerActionUtils';

export const useCrossChainControllerActions = (plugin: IDaoPlugin) => {
    const { t } = useTranslations();

    return crossChainControllerActionUtils.getCrossChainControllerActions({
        plugin,
        t,
    });
};
