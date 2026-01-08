'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ILockToVotePluginSettings } from '../../types';
import { lockToVoteActionUtils } from '../../utils/lockToVoteActionUtils';

export const useLockToVoteActions = (
    plugin: IDaoPlugin<ILockToVotePluginSettings>,
) => {
    const { t } = useTranslations();

    return lockToVoteActionUtils.getLockToVoteActions({ plugin, t });
};
