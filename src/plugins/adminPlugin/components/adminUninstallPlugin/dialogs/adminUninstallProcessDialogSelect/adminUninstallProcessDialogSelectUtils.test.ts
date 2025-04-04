import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';
import { adminUninstallProcessDialogSelectUtils } from './adminUninstallProcessDialogSelectUtils';

describe('adminUninstallSelectProcessDialogUtils', () => {
    const buildRevokePermissionTransactionSpy = jest.spyOn(
        permissionTransactionUtils,
        'buildRevokePermissionTransaction',
    );

    beforeEach(() => {
        buildRevokePermissionTransactionSpy.mockReturnValue({ to: '0x123', data: '0xabc' });
    });

    afterEach(() => {
        buildRevokePermissionTransactionSpy.mockReset();
    });

    describe('buildProposalParams', () => {
        it('builds the correct proposal parameters', () => {
            const pluginAddress: Hex = '0xPluginAddress';
            const daoAddress: Hex = '0xDaoAddress';
            const daoId = 'dao-123';
            const adminAddress: Hex = '0xPluginSetupProcessor';
            const permissionId = 'EXECUTE_PERMISSION';

            const result = adminUninstallProcessDialogSelectUtils.buildProposalParams(
                daoAddress,
                adminAddress,
                pluginAddress,
                daoId,
            );

            expect(buildRevokePermissionTransactionSpy).toHaveBeenCalledWith({
                where: daoAddress,
                who: adminAddress,
                what: permissionId,
                to: daoAddress,
            });

            expect(result).toMatchObject({
                values: {
                    ...adminUninstallProcessDialogSelectUtils.prepareProposalMetadata(),
                    actions: [expect.objectContaining({ from: daoAddress, daoId })],
                },
                daoId,
                pluginAddress,
            });
        });
    });
});
