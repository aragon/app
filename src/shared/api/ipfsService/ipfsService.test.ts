import { ipfsService } from './ipfsService';

describe('ipfs service', () => {
    it('initialises the service with the correct base url', async () => {
        expect(ipfsService['baseUrl']).toMatch(/api.pinata.cloud/);
    });
});
