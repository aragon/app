import { financeDialogs } from '@/modules/finance/constants/moduleDialogs';
import { governanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { applicationDialogs } from '../../constants/moduleDialogs';

export const providersDialogs: Record<string, IDialogComponentDefinitions> = {
    ...applicationDialogs,
    ...governanceDialogs,
    ...financeDialogs,
};
