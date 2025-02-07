import { ProcessStageType, type ICreateProcessFormStage } from '@/modules/createDao/components/createProcessForm';

export const generateProcessFormStage = (values?: Partial<ICreateProcessFormStage>): ICreateProcessFormStage => ({
    name: 'stage',
    type: ProcessStageType.NORMAL,
    timing: {
        votingPeriod: { days: 0, hours: 0, minutes: 0 },
        earlyStageAdvance: false,
        stageExpiration: { days: 0, hours: 0, minutes: 0 },
    },
    requiredApprovals: 0,
    bodies: [],
    ...values,
});
