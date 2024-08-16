class IpfsUtils {
    private ipfsGateway = 'https://aragon-1.mypinata.cloud';

    cidToSrc = (cid?: string | null): string | undefined => {
        if (cid?.startsWith('ipfs://')) {
            return `${this.ipfsGateway}/${cid.replace('://', '/')}`;
        }

        if (cid?.startsWith('https://aragon-1.mypinata.cloud')) {
            return cid;
        }

        return cid != null ? `${this.ipfsGateway}/ipfs/${cid}` : undefined;
    };
}

export const ipfsUtils = new IpfsUtils();
