import type { IDaoPlugin } from '@/shared/api/daoService';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';
import { adminUninstallProcessDialogSelectUtils } from './adminUninstallProcessDialogSelectUtils';

describe('adminUninstallSelectProcessDialogUtils', () => {
    const buildRevokePermissionTransactionSpy = jest.spyOn(
        permissionTransactionUtils,
        'buildRevokePermissionTransaction',
    );

    beforeEach(() => {
        buildRevokePermissionTransactionSpy.mockReturnValue({
            to: '0x123',
            data: '0xabc',
            value: '0',
        });
    });

    afterEach(() => {
        buildRevokePermissionTransactionSpy.mockReset();
    });

    describe('buildProposalParams', () => {
        it('builds the correct proposal parameters', () => {
            const plugin: IDaoPlugin = { address: '0xPluginAddress', subdomain: 'admin' } as IDaoPlugin;
            const daoAddress: Hex = '0xDaoAddress';
            const daoId = 'dao-123';
            const pluginSetupProcessor: Hex = '0xPluginSetupProcessor';

            const result = adminUninstallProcessDialogSelectUtils.buildProposalParams(
                plugin,
                pluginSetupProcessor,
                daoAddress,
                daoId,
            );

            expect(buildRevokePermissionTransactionSpy).toHaveBeenCalledWith({
                where: daoAddress,
                who: pluginSetupProcessor,
                what: 'ROOT_PERMISSION',
                to: daoAddress,
            });

            expect(result).toMatchObject({
                values: {
                    ...adminUninstallProcessDialogSelectUtils.prepareProposalMetadata(),
                    actions: [
                        expect.objectContaining({
                            from: daoAddress,
                            daoId,
                        }),
                    ],
                },
                daoId,
                pluginAddress: plugin.address,
            });
        });
    });
});
