import type { IDaoSettings } from '@/shared/api/daoService';

export const generateDaoSettings = (settings?: Partial<IDaoSettings>): IDaoSettings => ({
    ...settings,
});
