'use client';

import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { lockToVoteActionUtils } from '../../utils/lockToVoteActionUtils';

export const useLockToVoteActions = (plugin: IDaoPlugin<ITokenPluginSettings>) => {
    const { t } = useTranslations();

    return lockToVoteActionUtils.getLockToVoteActions({ plugin, t });
};
