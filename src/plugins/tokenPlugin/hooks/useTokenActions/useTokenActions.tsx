import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenPluginSettings } from '../../types';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export const useTokenActions = (plugin: IDaoPlugin<ITokenPluginSettings>) => {
    const { t } = useTranslations();

    return tokenActionUtils.getTokenActions({ plugin, t });
};
