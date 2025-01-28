import {
    getTimelockInfo,
    getTimelockStatus,
    TimelockStatus,
} from '@/plugins/sppPlugin/components/sppVotingTerminal/sppVotingTerminalStageTimelock';
import { generateSppProposal, generateSppStage } from '@/plugins/sppPlugin/testUtils';

describe('getTimelockStatus', () => {
    it('returns COMPLETE if the stage has ended', () => {
        const stage = generateSppStage({ stageIndex: 2, minAdvance: 2020202 });
        const proposal = generateSppProposal({ stageIndex: 2, lastStageTransition: 2020202 });

        const { status } = getTimelockStatus(stage, proposal);

        expect(status).toBe(TimelockStatus.COMPLETE);
    });

    it('returns ACTIVE if the stage is the current stage and has not ended', () => {
        const stage = generateSppStage({ stageIndex: 1, minAdvance: Date.now() + 10000 });
        const proposal = generateSppProposal({ stageIndex: 1, lastStageTransition: Date.now() });

        const { status } = getTimelockStatus(stage, proposal);

        expect(status).toBe(TimelockStatus.ACTIVE);
    });

    it('returns PENDING if the stage is neither active nor complete therefore upcoming', () => {
        const stage = generateSppStage({ stageIndex: 2, minAdvance: Date.now() + 10000 });
        const proposal = generateSppProposal({ stageIndex: 1, lastStageTransition: Date.now() });

        const { status } = getTimelockStatus(stage, proposal);

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
