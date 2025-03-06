import type { IDaoPlugin } from '@/shared/api/daoService';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';
import { adminUninstallSelectProcessDialogUtils } from './adminUninstallSelectProcessDialogUtils';

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

            const result = adminUninstallSelectProcessDialogUtils.buildProposalParams(
                plugin,
                daoAddress,
                daoId,
                pluginSetupProcessor,
            );

            expect(buildRevokePermissionTransactionSpy).toHaveBeenCalledWith({
                where: daoAddress,
                who: pluginSetupProcessor,
                what: 'ROOT_PERMISSION',
                to: daoAddress,
            });

            expect(result).toEqual({
                values: {
                    title: 'Remove all admins',
                    summary:
                        'This proposal intends to remove all admin control of the DAO. The action will revoke their permission to execute transactions on behalf of the DAO. By passing the proposal, it signifies that this governance process is configured properly and is able to execute on behalf of the DAO now.',
                    body: '',
                    addActions: true,
                    resources: [],
                    actions: [
                        {
                            to: '0x123',
                            data: '0xabc',
                            value: '0',
                            from: daoAddress,
                            type: 'function',
                            inputData: null,
                            daoId,
                            meta: undefined,
                        },
                    ],
                    startTimeMode: 'now',
                },
                daoId,
                pluginAddress: plugin.address,
                prepareActions: {},
            });
        });
    });
});
