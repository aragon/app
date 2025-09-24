import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';
import { uninstallProcessDialogUtils } from './uninstallProcessDialogUtils';

describe('uninstallProcessDialogUtils', () => {
    const buildRevokePermissionTransactionSpy = jest.spyOn(
        permissionTransactionUtils,
        'buildRevokePermissionTransaction',
    );

    beforeEach(() => {
        buildRevokePermissionTransactionSpy.mockReturnValue({ to: '0x123', data: '0xabc', value: BigInt(0) });
    });

    afterEach(() => {
        buildRevokePermissionTransactionSpy.mockReset();
    });

    describe('buildProposalParams', () => {
        it('builds the correct proposal parameters', () => {
            const daoAddress: Hex = '0xDaoAddress';
            const adminAddress: Hex = '0xPluginSetupProcessor';
            const permissionId = 'EXECUTE_PERMISSION';

            const to = '0xTo';
            const data = '0xData';
            buildRevokePermissionTransactionSpy.mockReturnValue({ to, data, value: BigInt(0) });

            const result = uninstallProcessDialogUtils.buildProposal(daoAddress, adminAddress);

            expect(buildRevokePermissionTransactionSpy).toHaveBeenCalledWith({
                where: daoAddress,
                who: adminAddress,
                what: permissionId,
                to: daoAddress,
            });

            expect(result).toEqual({
                ...uninstallProcessDialogUtils.prepareProposalMetadata(),
                actions: [{ to, data, value: BigInt(0) }],
            });
        });
    });
});
