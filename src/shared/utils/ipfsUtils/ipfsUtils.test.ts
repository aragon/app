import { ipfsUtils } from './ipfsUtils';

describe('ipfs utils', () => {
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

    it('uses the default size of 80 when no size is provided', () => {
        const src = ipfsUtils.cidToSrc('800a');
        expect(src).toContain('img-width=80&img-height=80');
    });
});
