export interface ICidToSrcOptions {
    /**
     * Size of the image to be loaded, used to optimise the loading of the image.
     * @default 80
     */
    size?: number;
}

class IpfsUtils {
    private ipfsGateway = 'https://aragon-1.mypinata.cloud';

    private ipfsPrefix = 'ipfs://';

    cidToSrc = (cid?: string | null, options?: ICidToSrcOptions): string | undefined => {
        const { size = 256 } = options ?? {};

        const processedSize = size.toString();
        const processedCid = cid?.startsWith(this.ipfsPrefix) ? cid.replace(this.ipfsPrefix, '') : cid;

        const params = new URLSearchParams({ 'img-width': processedSize, 'img-height': processedSize });

        return processedCid != null ? `${this.ipfsGateway}/ipfs/${processedCid}?${params.toString()}` : undefined;
    };

    isUri = (value: string) => value.startsWith(this.ipfsPrefix);

    cidToUri = (cid?: string | null): string | undefined => (cid ? `${this.ipfsPrefix}${cid}` : undefined);

    srcToUri = (src: string): string | undefined => {
        const hash = new URL(src).pathname.split('/').pop();

        return this.cidToUri(hash);
    };
}

export const ipfsUtils = new IpfsUtils();
