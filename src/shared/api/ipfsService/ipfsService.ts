import { HttpService } from '../httpService';

class IpfsService extends HttpService {
    jwt = process.env.NEXT_SECRET_IPFS_JWT!;

    urls = {
        pinJson: '/pinning/pinJSONToIPFS',
        pinFile: '/pinning/pinFileToIPFS',
    };

    constructor() {
        super('https://api.pinata.cloud');
    }
}

export const ipfsService = new IpfsService();
