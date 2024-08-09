import type { DialogComponent } from '@/shared/components/dialogProvider';
import { applicationDialogs } from '../../constants/moduleDialogs';

export const providersDialogs: Record<string, DialogComponent> = {
    ...applicationDialogs,
};
