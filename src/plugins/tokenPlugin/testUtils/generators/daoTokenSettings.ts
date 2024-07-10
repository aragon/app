import { generateToken } from '@/modules/finance/testUtils';
import { generateDaoSettings } from '@/shared/testUtils';
import { DaoTokenVotingMode, type IDaoTokenSettings } from '../../types';

export const generateDaoTokenSettings = (settings?: Partial<IDaoTokenSettings>): IDaoTokenSettings => ({
    ...generateDaoSettings(),
    token: generateToken(),
    settings: {
        votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
        supportThreshold: 0,
        minDuration: 0,
        minParticipation: 0,
        minProposerVotingPower: '0',
    },
    ...settings,
});
