import { smartContractService } from '@/modules/governance/api/smartContractService';
import { Network } from '@/shared/api/daoService';
import { contractUtils } from './contractUtils';

describe('contractUtils', () => {
    const getAbiSpy = jest.spyOn(smartContractService, 'getAbi');

    afterEach(() => {
        getAbiSpy.mockReset();
    });

    describe('isSafeContract', () => {
        it('returns false for invalid addresses', async () => {
            const result = await contractUtils.isSafeContract('invalid', Network.ETHEREUM_MAINNET);
            expect(result).toBe(false);
        });

        it('returns false when ABI cannot be fetched', async () => {
            getAbiSpy.mockResolvedValue(undefined);

            const result = await contractUtils.isSafeContract(
                '0x1234567890123456789012345678901234567890',
                Network.ETHEREUM_MAINNET,
            );

            expect(result).toBe(false);
        });

        it('returns true when contract name contains Safe indicators', async () => {
            getAbiSpy.mockResolvedValue({
                name: 'SafeProxy',
                address: '0x1234567890123456789012345678901234567890',
                network: Network.ETHEREUM_MAINNET,
                implementationAddress: null,
                functions: [],
            });

            const result = await contractUtils.isSafeContract(
                '0x1234567890123456789012345678901234567890',
                Network.ETHEREUM_MAINNET,
            );

            expect(result).toBe(true);
        });

        it('returns false when fetching ABI throws an error', async () => {
            getAbiSpy.mockRejectedValue(new Error('Network error'));

            const result = await contractUtils.isSafeContract(
                '0x1234567890123456789012345678901234567890',
                Network.ETHEREUM_MAINNET,
            );

            expect(result).toBe(false);
        });
    });
});
