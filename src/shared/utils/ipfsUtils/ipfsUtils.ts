class IpfsUtils {
    private ipfsGateway = 'https://aragon-1.mypinata.cloud';

    cidToSrc = (cid?: string | null): string | undefined => {
        if (cid?.startsWith('ipfs://')) {
            return `${this.ipfsGateway}/${cid.replace('://', '/')}`;
        }

        return cid != null ? `${this.ipfsGateway}/ipfs/${cid}?img-width=80&img-height=80&img-onerror=redirect` : undefined;
    };
}

export const ipfsUtils = new IpfsUtils();
