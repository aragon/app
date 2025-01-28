import {
    getTimelockInfo,
    getTimelockStatus,
    TimelockStatus,
} from '@/plugins/sppPlugin/components/sppVotingTerminal/sppVotingTerminalStageTimelock';
import { DateTime } from 'luxon';

describe('getTimelockStatus', () => {
    it('returns COMPLETE if the stage has ended', () => {
        const stageIndex = 0;
        const currentStageIndex = 1;
        const minAdvance = DateTime.now().minus({ days: 1 });

        const status = getTimelockStatus(stageIndex, currentStageIndex, minAdvance);

        expect(status).toBe(TimelockStatus.COMPLETE);
    });

    it('returns ACTIVE if the stage is the current stage and has not ended', () => {
        const stageIndex = 1;
        const currentStageIndex = 1;
        const minAdvance = DateTime.now().plus({ days: 1 });

        const status = getTimelockStatus(stageIndex, currentStageIndex, minAdvance);

        expect(status).toBe(TimelockStatus.ACTIVE);
    });

    it('returns PENDING if the stage is neither active nor complete therefore upcoming', () => {
        const stageIndex = 2;
        const currentStageIndex = 1;
        const minAdvance = DateTime.now().plus({ days: 1 });

        const status = getTimelockStatus(stageIndex, currentStageIndex, minAdvance);

        expect(status).toBe(TimelockStatus.PENDING);
    });
});

describe('getTimelockInfo', () => {
    it('returns the correct heading and description for ACTIVE status', () => {
        const result = getTimelockInfo(TimelockStatus.ACTIVE);
        expect(result.heading).toBe('app.plugins.spp.sppVotingTerminalStageTimelock.active.heading');
        expect(result.description).toBe('app.plugins.spp.sppVotingTerminalStageTimelock.active.description');
    });

    it('returns the correct heading and description for COMPLETE status', () => {
        const result = getTimelockInfo(TimelockStatus.COMPLETE);
        expect(result.heading).toBe('app.plugins.spp.sppVotingTerminalStageTimelock.complete.heading');
        expect(result.description).toBe('app.plugins.spp.sppVotingTerminalStageTimelock.complete.description');
    });

    it('returns the correct heading and description for PENDING status', () => {
        const result = getTimelockInfo(TimelockStatus.PENDING);
        expect(result.heading).toBe('app.plugins.spp.sppVotingTerminalStageTimelock.pending.heading');
        expect(result.description).toBe('app.plugins.spp.sppVotingTerminalStageTimelock.pending.description');
    });
});
