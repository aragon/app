import { ipfsUtils } from './ipfsUtils';

describe('ipfs utils', () => {
    it('coverts a cid with the ipfs:// format into a src', () => {
        const cid = 'abc123';
        const processedCid = `ipfs://${cid}`;
        expect(ipfsUtils.cidToSrc(processedCid)).toEqual(`${ipfsUtils['ipfsGateway']}/ipfs/${cid}`);
    });

    it('coverts a simple ipfs cid into a src', () => {
        const cid = 'qrt855';
        expect(ipfsUtils.cidToSrc(cid)).toEqual(`${ipfsUtils['ipfsGateway']}/ipfs/${cid}`);
    });

    it('returns undefined when cid is null or undefined', () => {
        expect(ipfsUtils.cidToSrc(null)).toBeUndefined();
        expect(ipfsUtils.cidToSrc(undefined)).toBeUndefined();
    });
});
