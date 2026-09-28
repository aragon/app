import { Network } from '@/shared/api/daoService';
import {
    generateDaoPermission,
    generatePermissionEntityRef,
} from './daoPermission';

describe('dao permission generators', () => {
    it('builds coherent enriched defaults and applies overrides', () => {
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

        const who = generatePermissionEntityRef({
            address: '0x1111111111111111111111111111111111111111',
            label: 'Treasury Safe',
            layer: 'externalActor',
        });
        const overridden = generateDaoPermission({
            condition: {
                conditionType: 'voting-power',
                minVotingPower: '1000000000000000000',
            },
            network: Network.ETHEREUM_MAINNET,
            who,
        });

        expect(overridden).toMatchObject({
            condition: {
                conditionType: 'voting-power',
                minVotingPower: '1000000000000000000',
            },
            network: Network.ETHEREUM_MAINNET,
            who,
        });
    });
});
