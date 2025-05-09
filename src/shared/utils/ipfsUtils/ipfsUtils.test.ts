import { ipfsUtils } from './ipfsUtils';

describe('ipfs utils', () => {
    describe('cidToSrc', () => {
        it('coverts a cid with the ipfs:// format into a src', () => {
            const cid = 'abc123';
            const processedCid = `ipfs://${cid}`;
            expect(ipfsUtils.cidToSrc(processedCid)).toContain(`${ipfsUtils['ipfsGateway']}/ipfs/${cid}`);
        });

        it('coverts a simple ipfs cid into a src', () => {
            const cid = 'qrt855';
            expect(ipfsUtils.cidToSrc(cid)).toContain(`${ipfsUtils['ipfsGateway']}/ipfs/${cid}`);
        });

        it('returns undefined when cid is null or undefined', () => {
            expect(ipfsUtils.cidToSrc(null)).toBeUndefined();
            expect(ipfsUtils.cidToSrc(undefined)).toBeUndefined();
        });

        it('adds the image size query params to the image src', () => {
            const size = 100;
            const src = ipfsUtils.cidToSrc('apt029', { size });
            expect(src).toContain(`img-width=${size.toString()}&img-height=${size.toString()}`);
        });

        it('uses the default size of 256 when no size is provided', () => {
            const src = ipfsUtils.cidToSrc('800a');
            expect(src).toContain('img-width=256&img-height=256');
        });
    });

    describe('isUri', () => {
        it('returns true when value starts with ipfs prefix', () => {
            expect(ipfsUtils.isUri('ipfs://test')).toBeTruthy();
        });

        it('returns false when value does not start with ipfs prefix', () => {
            expect(ipfsUtils.isUri('test')).toBeFalsy();
        });
    });

    describe('cidToUri', () => {
        it('returns a valid ipfs:// URI when a CID is provided', () => {
            const cid = 'bafybeigdyrztgvdrx3nldjbk8m7';
            const result = ipfsUtils.cidToUri(cid);
            expect(result).toEqual(`ipfs://${cid}`);
        });

        it('returns undefined when CID is null or undefined', () => {
            expect(ipfsUtils.cidToUri(null)).toBeUndefined();
            expect(ipfsUtils.cidToUri(undefined)).toBeUndefined();
        });
    });

    describe('srcToUri', () => {
        it('converts a valid IPFS gateway URL to an ipfs:// URI', () => {
            const src = 'https://aragon-1.mypinata.cloud/ipfs/abc123';
            expect(ipfsUtils.srcToUri(src)).toEqual('ipfs://abc123');
        });

        it('converts a valid IPFS gateway URL with query params to an ipfs:// URI', () => {
            const src = 'https://aragon-1.mypinata.cloud/ipfs/abc123?img-width=80&img-height=80';
            expect(ipfsUtils.srcToUri(src)).toEqual('ipfs://abc123');
        });

        it('returns undefined if the pathname is empty', () => {
            const src = 'https://aragon-1.mypinata.cloud/ipfs/';
            expect(ipfsUtils.srcToUri(src)).toBeUndefined();
        });
    });
});
