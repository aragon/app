import { decodeFunctionData, type Hex, zeroAddress } from 'viem';
import { adminPlugin } from '@/plugins/adminPlugin/constants/adminPlugin';
import { Network } from '@/shared/api/daoService';
import type { ICreateDaoPluginSettings } from '../../types';
import { daoFactoryAbi } from './daoFactoryAbi';
import { publishDaoDialogUtils } from './publishDaoDialogUtils';

describe('publishDaoDialog utils', () => {
    const values = {
        name: 'dao',
        description: 'description',
        resources: [],
        ens: '',
        network: Network.ETHEREUM_SEPOLIA,
    };
    const baseParams = {
        values,
        metadataCid: 'QmTest',
        connectedAddress: zeroAddress,
    };

    const decodePluginSettings = (data: Hex) =>
        decodeFunctionData({ abi: daoFactoryAbi, data }).args?.[1];

    describe('buildTransaction', () => {
        it('installs the admin plugin by default', async () => {
            const { data } =
                await publishDaoDialogUtils.buildTransaction(baseParams);
            const [settings] = decodePluginSettings(data)!;
            expect(settings.pluginSetupRef.pluginSetupRepo).toEqual(
                adminPlugin.repositoryAddresses[values.network],
            );
        });

        it('installs the given plugin settings instead of the admin plugin', async () => {
            const pluginSettings: ICreateDaoPluginSettings[] = [
                {
                    pluginSetupRef: {
                        pluginSetupRepo:
                            '0x0000000000000000000000000000000000000aBc',
                        versionTag: { release: 1, build: 3 },
                    },
                    data: '0x1234',
                },
            ];

            const { data } = await publishDaoDialogUtils.buildTransaction({
                ...baseParams,
                pluginSettings,
            });

            expect(decodePluginSettings(data)).toEqual(pluginSettings);
        });
    });
});
