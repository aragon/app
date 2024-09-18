import { generateDaoSettings } from '@/shared/testUtils';
import { type IDaoMultisigSettings } from '../../types';

export const generateDaoMultisigSettings = (settings?: Partial<IDaoMultisigSettings>): IDaoMultisigSettings => ({
    ...generateDaoSettings(),
    minApprovals: 2,
    onlyListed: false,
    ...settings,
});
