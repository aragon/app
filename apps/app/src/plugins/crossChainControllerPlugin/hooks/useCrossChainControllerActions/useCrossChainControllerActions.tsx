'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import type { ICrossChainControllerPlugin } from '../../types';
import { crossChainControllerActionUtils } from '../../utils/crossChainControllerActionUtils';

export const useCrossChainControllerActions = (
    plugin: ICrossChainControllerPlugin,
) => {
    const { t } = useTranslations();

    return crossChainControllerActionUtils.getCrossChainControllerActions({
        plugin,
        t,
    });
};
