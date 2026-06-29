import { generateTokenMember } from '@/plugins/tokenPlugin/testUtils';
import { mapBackendMemberToTokenVotingDTO } from './mapBackendMemberToTokenVotingDTO';

describe('mapBackendMemberToTokenVotingDTO', () => {
    it('passes address, ens, votingPower and metrics (incl. delegationCount) through', () => {
        const member = generateTokenMember({
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            metrics: {
                firstActivityTimestamp: 1_705_320_000,
                lastActivityTimestamp: 1_718_872_200,
                delegationCount: 3,
            },
        });

        expect(mapBackendMemberToTokenVotingDTO(member)).toEqual({
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            metrics: {
                firstActivityTimestamp: 1_705_320_000,
                lastActivityTimestamp: 1_718_872_200,
                delegationCount: 3,
            },
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
