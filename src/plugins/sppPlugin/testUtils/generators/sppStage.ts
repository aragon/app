import type { ISppStage } from '../../types';

export const generateSppStage = (stage?: Partial<ISppStage>): ISppStage => ({
    stageIndex: 0,
    name: 'Stage Name',
    plugins: [],
    voteDuration: 1,
    maxAdvance: 1,
    minAdvance: 1,
    approvalThreshold: 1,
    vetoThreshold: 1,
    ...stage,
});
