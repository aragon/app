import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenPluginSettings } from '../../types';
import { tokenActionUtils } from '../../utils/tokenActionUtils';

export const useTokenActions = (props: IDaoPlugin<ITokenPluginSettings>) => {
    const { name, subdomain, address } = props;

    const { t } = useTranslations();

    return tokenActionUtils.getTokenActions({ name, subdomain, address, t });
};
