import { actionsDialogsDefinitions } from '@/actions';
import { daosDialogsDefinitions } from '@/daos/daosDialogsDefinitions';
import { applicationDialogsDefinitions } from '@/modules/application/constants/applicationDialogsDefinitions';
import { capitalFlowDialogsDefinitions } from '@/modules/capitalFlow/constants/capitalFlowDialogsDefinitions';
import { createDaoDialogsDefinitions } from '@/modules/createDao/constants/createDaoDialogsDefinitions';
import { financeDialogsDefinitions } from '@/modules/finance/constants/financeDialogsDefinitions';
import { flowDialogsDefinitions } from '@/modules/flow/constants/flowDialogsDefinitions';
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
    ...capitalFlowDialogsDefinitions,
    ...flowDialogsDefinitions,
    ...actionsDialogsDefinitions,
    ...daosDialogsDefinitions,
};
