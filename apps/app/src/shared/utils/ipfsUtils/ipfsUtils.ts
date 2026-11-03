export interface ICidToSrcOptions {
    /**
     * Size of the image to be loaded, used to optimise the loading of the image.
     * @default 256
     */
    size?: number;
}

class IpfsUtils {
    private ipfsGateway = 'https://aragon-1.mypinata.cloud';

    private ipfsPrefix = 'ipfs://';

    // CID segment of a gateway URL such as https://ipfs.eth.aragon.network/ipfs/<cid>/
    private gatewayCidPattern = /^https?:\/\/[^/]+\/ipfs\/([^/?#]+)/;

    cidToSrc = (
        cid?: string | null,
        options?: ICidToSrcOptions,
    ): string | undefined => {
        const { size = 256 } = options ?? {};

        const processedSize = size.toString();
        const processedCid = cid != null ? this.toCid(cid) : cid;

        const params = new URLSearchParams({
            'img-width': processedSize,
            'img-height': processedSize,
        });

        return processedCid != null
            ? `${this.ipfsGateway}/ipfs/${processedCid}?${params.toString()}`
            : undefined;
    };

    // Metadata stores the image as a bare CID, an ipfs:// URI or a full gateway URL.
    private toCid = (value: string): string => {
        if (value.startsWith(this.ipfsPrefix)) {
            return value.replace(this.ipfsPrefix, '');
        }

        return this.gatewayCidPattern.exec(value)?.[1] ?? value;
    };

    isUri = (value: string) => value.startsWith(this.ipfsPrefix);

    cidToUri = (cid?: string | null): string | undefined =>
        cid ? `${this.ipfsPrefix}${cid}` : undefined;

    srcToUri = (src: string): string | undefined => {
        const hash = new URL(src).pathname.split('/').pop();

        return this.cidToUri(hash);
    };
}

export const ipfsUtils = new IpfsUtils();
