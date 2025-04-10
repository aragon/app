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
            const daoAddress: Hex = '0xDaoAddress';
            const daoId = 'dao-123';
            const adminAddress: Hex = '0xPluginSetupProcessor';
            const permissionId = 'EXECUTE_PERMISSION';

            const plugin = generateDaoPlugin({ address: '0x123', subdomain: 'admin' });

            const to = '0xTo';
            const data = '0xData';
            buildRevokePermissionTransactionSpy.mockReturnValue({ to, data, value: BigInt(0) });

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
                    actions: [{ to, data, value: BigInt(0) }],
                },
                daoId,
                plugin,
            });
        });
    });
});
