import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { applicationDialogs } from '../../constants/moduleDialogs';

export const providersDialogs: Record<string, IDialogComponentDefinitions> = {
    ...applicationDialogs,
};
