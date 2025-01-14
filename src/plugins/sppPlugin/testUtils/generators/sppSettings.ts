import { generatePluginSettings } from '@/shared/testUtils';
import type { ISppPluginSettings } from '../../types';

export const generateSppPluginSettings = (settings?: Partial<ISppPluginSettings>): ISppPluginSettings => ({
    ...generatePluginSettings(),
    stages: [],
    ...settings,
});
