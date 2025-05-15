import { applicationDialogsDefinitions } from '@/modules/application/constants/applicationDialogsDefinitions';
import { createDaoDialogsDefinitions } from '@/modules/createDao/constants/createDaoDialogsDefinitions';
import { financeDialogsDefinitions } from '@/modules/finance/constants/financeDialogsDefinitions';
import { governanceDialogsDefinitions } from '@/modules/governance/constants/governanceDialogsDefinitions';
import { settingsDialogDefinitions } from '@/modules/settings/constants/settingsDialogDefinitions';
import { pluginDialogsDefinitions } from '@/plugins';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';

export const providersDialogs: Record<string, IDialogComponentDefinitions> = {
    ...applicationDialogsDefinitions,
    ...governanceDialogsDefinitions,
    ...financeDialogsDefinitions,
    ...createDaoDialogsDefinitions,
    ...pluginDialogsDefinitions,
    ...settingsDialogDefinitions,
};
