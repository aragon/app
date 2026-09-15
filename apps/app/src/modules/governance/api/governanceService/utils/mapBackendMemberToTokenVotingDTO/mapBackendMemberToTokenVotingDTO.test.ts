import { generateTokenMember } from '@/plugins/tokenPlugin/testUtils';
import { mapBackendMemberToTokenVotingDTO } from './mapBackendMemberToTokenVotingDTO';

describe('mapBackendMemberToTokenVotingDTO', () => {
    it('passes address, ens, votingPower and delegationCount through and emits null activity timestamps', () => {
        const member = generateTokenMember({
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            metrics: {
                firstActivity: 100,
                lastActivity: 200,
                delegationCount: 3,
            },
        });

        expect(mapBackendMemberToTokenVotingDTO(member)).toEqual({
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            // The legacy backend only reports activity as block numbers,
            // which the mapper does not resolve to timestamps.
            firstActivityTimestamp: null,
            lastActivityTimestamp: null,
            delegationCount: 3,
        });
    });

    it('drops the type / firstActive / lastActive fields', () => {
        const member = generateTokenMember({
            type: 'token-voting',
            firstActive: 100,
            lastActive: 200,
        });

        const dto = mapBackendMemberToTokenVotingDTO(member);

        expect(dto).not.toHaveProperty('type');
        expect(dto).not.toHaveProperty('firstActive');
        expect(dto).not.toHaveProperty('lastActive');
    });
});
