'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { gaugeRegistrarActionUtils } from '../../utils/gaugeRegistrarActionUtils';

export const useGaugeRegistrarActions = (plugin: IDaoPlugin) => {
    const { t } = useTranslations();

    return gaugeRegistrarActionUtils.getActions({ plugin, t });
};
