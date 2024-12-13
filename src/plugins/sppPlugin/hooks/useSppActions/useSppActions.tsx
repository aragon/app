import { type IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type ISppPluginSettings } from '../../types';
import { sppActionUtils } from '../../utils/sppActionUtils';

export const useSppActions = (plugin: IDaoPlugin<ISppPluginSettings>) => {
    const { t } = useTranslations();

    return sppActionUtils.getSppActions({ plugin, t });
};
