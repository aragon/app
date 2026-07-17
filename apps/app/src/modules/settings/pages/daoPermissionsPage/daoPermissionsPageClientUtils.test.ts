import type { IPermissionRow } from '../../types';
import { filterRowsByMode } from './daoPermissionsPageClientUtils';

const activeDaoAddress = '0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const externalAddress = '0x3333333333333333333333333333333333333333';
const otherAddress = '0x4444444444444444444444444444444444444444';

const buildRow = (partial: Partial<IPermissionRow>): IPermissionRow => ({
    permissionId: 'permission-id',
    whoAddress: pluginAddress,
    whereAddress: activeDaoAddress,
    conditionAddress: '0x0000000000000000000000000000000000000000',
    ...partial,
});

describe('daoPermissionsPageClientUtils', () => {
    describe('filterRowsByMode', () => {
        it('returns permissions granted on the active DAO for granted mode', () => {
            const grantedRow = buildRow({ whereAddress: activeDaoAddress });
            const otherRow = buildRow({ whereAddress: externalAddress });

            const result = filterRowsByMode(
                [grantedRow, otherRow],
                'incoming',
                activeDaoAddress,
            );

            expect(result).toEqual([grantedRow]);
        });

        it('keeps old from-DAO and unrelated relationships in other mode', () => {
            const grantedRow = buildRow({
                whoAddress: pluginAddress,
                whereAddress: activeDaoAddress,
            });
            const oldFromDaoRow = buildRow({
                whoAddress: activeDaoAddress,
                whereAddress: externalAddress,
            });
            const unrelatedRow = buildRow({
                whoAddress: otherAddress,
                whereAddress: externalAddress,
            });

            const result = filterRowsByMode(
                [grantedRow, oldFromDaoRow, unrelatedRow],
                'other',
                activeDaoAddress,
            );

            expect(result).toEqual([oldFromDaoRow, unrelatedRow]);
        });
    });
});
