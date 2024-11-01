import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IMultisigPluginSettings } from '../../types';
import { multisigActionUtils } from '../../utils/multisigActionUtils';

export const useMultisigActions = (props: IDaoPlugin<IMultisigPluginSettings>) => {
    const { t } = useTranslations();

    return multisigActionUtils.getMultisigActions({ plugin: props, t });
};
