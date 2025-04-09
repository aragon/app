import { generateDaoPlugin } from '@/shared/testUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';
import { adminUninstallProcessDialogSelectUtils } from './adminUninstallProcessDialogSelectUtils';

describe('adminUninstallSelectProcessDialogUtils', () => {
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
            const pluginAddress: Hex = '0xPluginAddress';
            const daoAddress: Hex = '0xDaoAddress';
            const daoId = 'dao-123';
            const adminAddress: Hex = '0xPluginSetupProcessor';
            const permissionId = 'EXECUTE_PERMISSION';

            const plugin = generateDaoPlugin({
                address: pluginAddress,
                subdomain: 'admin',
            });

            const result = adminUninstallProcessDialogSelectUtils.buildProposalParams(
                daoAddress,
                adminAddress,
                plugin,
                daoId,
            );

            expect(buildRevokePermissionTransactionSpy).toHaveBeenCalledWith({
                where: daoAddress,
                who: adminAddress,
                what: permissionId,
                to: daoAddress,
            });

            expect(result).toMatchObject({
                proposal: {
                    ...adminUninstallProcessDialogSelectUtils.prepareProposalMetadata(),
                    actions: [{ to: '0x123', data: '0xabc', value: BigInt(0) }],
                },
                daoId,
                plugin,
            });
        });
    });
});
