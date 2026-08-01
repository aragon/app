import { Network } from '@/shared/api/daoService';
import {
    generateDaoPermission,
    generatePermissionEntityRef,
} from './daoPermission';

describe('dao permission generators', () => {
    it('builds coherent enriched defaults', () => {
        const permission = generateDaoPermission();

        expect(permission).toEqual({
            condition: { conditionType: 'unknown' },
            conditionAddress: '0x3333333333333333333333333333333333333333',
            conditionEntity: {
                address: '0x3333333333333333333333333333333333333333',
                layer: 'condition',
            },
            network: Network.ETHEREUM_MAINNET,
            permissionId: '0xPermissionId',
            where: {
                address: '0x2222222222222222222222222222222222222222',
                layer: 'unknown',
            },
            whereAddress: '0x2222222222222222222222222222222222222222',
            who: {
                address: '0x1111111111111111111111111111111111111111',
                layer: 'unknown',
            },
            whoAddress: '0x1111111111111111111111111111111111111111',
        });
    });

    it('overrides entity metadata and condition data', () => {
        const who = generatePermissionEntityRef({
            address: '0x1111111111111111111111111111111111111111',
            label: 'Treasury Safe',
            layer: 'externalActor',
        });
        const permission = generateDaoPermission({
            condition: {
                conditionType: 'voting-power',
                minVotingPower: '1000000000000000000',
            },
            network: Network.ETHEREUM_MAINNET,
            who,
        });

        expect(permission).toMatchObject({
            condition: {
                conditionType: 'voting-power',
                minVotingPower: '1000000000000000000',
            },
            network: Network.ETHEREUM_MAINNET,
            who,
        });
    });
});
