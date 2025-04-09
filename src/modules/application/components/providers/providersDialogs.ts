import { applicationDialogs } from '@/modules/application/constants/applicationDialogsDefinitions';
import { createDaoDialogs } from '@/modules/createDao/constants/createDaoDialogsDefinitions';
import { financeDialogs } from '@/modules/finance/constants/financeDialogsDefinitions';
import { governanceDialogs } from '@/modules/governance/constants/governanceDialogsDefinitions';
import { pluginDialogs } from '@/plugins';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';

export const providersDialogs: Record<string, IDialogComponentDefinitions> = {
    ...applicationDialogs,
    ...governanceDialogs,
    ...financeDialogs,
    ...createDaoDialogs,
    ...pluginDialogs,
};
