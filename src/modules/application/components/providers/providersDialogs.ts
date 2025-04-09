import { governanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import { pluginDialogs } from '@/plugins';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';

import { applicationDialogs } from '@/modules/application/constants/applicationDialogsDefinitions';
import { createDaoDialogs } from '@/modules/createDao/constants/createDaoDialogsDefinitions';
import { financeDialogs } from '@/modules/finance/constants/financeDialogsDefinitions';

export const providersDialogs: Record<string, IDialogComponentDefinitions> = {
    ...applicationDialogs,
    ...governanceDialogs,
    ...financeDialogs,
    ...createDaoDialogs,
    ...pluginDialogs,
};
