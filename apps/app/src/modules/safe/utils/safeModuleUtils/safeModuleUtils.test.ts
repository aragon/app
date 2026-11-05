import { Network } from '@/shared/api/daoService';
import { networkUtils } from '@/shared/utils/networkUtils';
import { knownSafeModules, safeModuleUtils } from './safeModuleUtils';

describe('safeModule utils', () => {
    // Allowance module v0.1.0 on Sepolia, the deployment Safe{Wallet} enables there for spending limits.
    const allowanceModule = '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134';

    it('names an official module deployment with its version, whatever the address casing', () => {
        expect(
            safeModuleUtils.getModuleInfo(
                Network.ETHEREUM_SEPOLIA,
                allowanceModule.toLowerCase(),
            ),
        ).toEqual({ name: 'allowance', version: '0.1.0' });
    });

    it('returns undefined for an address that is not an official module deployment', () => {
        expect(
            safeModuleUtils.getModuleInfo(
                Network.ETHEREUM_SEPOLIA,
                '0x4444444444444444444444444444444444444444',
            ),
        ).toBeUndefined();
    });

    it('returns undefined for an official module address on a chain it is not deployed to as that module', () => {
        // The v0.1.1 address on Optimism, which on Sepolia is no Allowance deployment at all.
        expect(
            safeModuleUtils.getModuleInfo(
                Network.ETHEREUM_SEPOLIA,
                '0xAA46724893dedD72658219405185Fb0Fc91e091C',
            ),
        ).toBeUndefined();
    });

    it('names every listed version on a chain it is deployed to, so a version that stops resolving is caught here', () => {
        for (const { name, getDeployment, versions } of knownSafeModules) {
            for (const version of versions) {
                const deployment = getDeployment({ version, network: '' });
                const [chainId, address] =
                    Object.entries(deployment?.networkAddresses ?? {}).find(
                        ([id]) =>
                            networkUtils.getNetworkByChainId(Number(id)) !=
                            null,
                    ) ?? [];

                expect(address).toBeDefined();
                expect(
                    safeModuleUtils.getModuleInfo(
                        networkUtils.getNetworkByChainId(
                            Number(chainId),
                        ) as Network,
                        address as string,
                    ),
                ).toEqual({ name, version });
            }
        }
    });
});
