import { Network } from '@/shared/api/daoService';
import { safeAppAccountUrl } from './safeTxServiceNetworks';

describe('safeTxServiceNetworks', () => {
    describe('safeAppAccountUrl', () => {
        it('addresses the Safe app EIP-3770 style, with the chain short name', () => {
            expect(
                safeAppAccountUrl({
                    network: Network.ETHEREUM_SEPOLIA,
                    address: '0xd84C233A7D1578021d21E39785439bEdDB165F3D',
                }),
            ).toEqual(
                'https://app.safe.global/home?safe=sep:0xd84C233A7D1578021d21E39785439bEdDB165F3D',
            );
        });

        it('checksums the address rather than trusting the caller casing', () => {
            // The Safe app resolves nothing for a lowercased address, and the backend stores some
            // Safe addresses lowercased.
            expect(
                safeAppAccountUrl({
                    network: Network.ETHEREUM_MAINNET,
                    address: '0xd84c233a7d1578021d21e39785439beddb165f3d',
                }),
            ).toEqual(
                'https://app.safe.global/home?safe=eth:0xd84C233A7D1578021d21E39785439bEdDB165F3D',
            );
        });

        it('returns no link for a network Safe does not serve', () => {
            // Better to state the Safe without a link than to send someone to a page that cannot
            // resolve it.
            expect(
                safeAppAccountUrl({
                    network: Network.CITREA_MAINNET,
                    address: '0xd84C233A7D1578021d21E39785439bEdDB165F3D',
                }),
            ).toBeUndefined();
        });
    });
});
