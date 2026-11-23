import { HttpService } from '../httpService';

export interface IPinMetadata {
    /**
     * Key-value pairs stored with the pin on Pinata.
     */
    keyvalues: Record<string, string | undefined>;
}

// Any value: the 4-byte chunk size between the RIFF and WEBP markers of a WebP file
const riffChunkSize = [null, null, null, null];

class IpfsService extends HttpService {
    jwt = process.env.NEXT_SECRET_IPFS_JWT!;

    urls = {
        pinJson: '/pinning/pinJSONToIPFS',
        pinFile: '/pinning/pinFileToIPFS',
    };

    /**
     * Size limit of a pinned file, the limit the avatar inputs apply. The pin actions are reachable without a
     * session, so the limits of the forms are enforced on the server as well.
     */
    maxFileSize = 1024 * 1024;

    /**
     * Leading bytes of the image formats the avatar inputs accept (PNG, GIF, JPEG, WebP), `null` matching any
     * byte. The content is checked instead of the client-supplied MIME type, which browsers derive from the file
     * extension.
     */
    private readonly imageSignatures: (number | null)[][] = [
        [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
        [0xff, 0xd8, 0xff],
        [0x52, 0x49, 0x46, 0x46, ...riffChunkSize, 0x57, 0x45, 0x42, 0x50],
    ];

    constructor() {
        super('https://api.pinata.cloud');
    }

    /**
     * Metadata stored with every pin, so the Pinata account owner can tell the pins made through the app from
     * the other usages of the key.
     */
    buildPinMetadata = (): IPinMetadata => ({
        keyvalues: {
            source: 'aragon-app',
            environment: process.env.NEXT_PUBLIC_ENV,
        },
    });

    /**
     * Throws when the content is not a JSON object, the only shape the app pins. Its size is capped by the body
     * limit of Next.js server actions (1 MB by default), which rejects the request before the action runs.
     */
    validateJson = (content: unknown): void => {
        const isObject =
            typeof content === 'object' &&
            content != null &&
            !Array.isArray(content);

        if (!isObject) {
            throw new Error(
                'IpfsService: pinned content must be a JSON object.',
            );
        }
    };

    /**
     * Throws when the file is not a PNG, GIF, JPEG or WebP image within the size limit.
     */
    validateFile = async (file: unknown): Promise<void> => {
        if (
            !(file instanceof Blob) ||
            file.size === 0 ||
            file.size > this.maxFileSize
        ) {
            throw new Error(
                'IpfsService: pinned file must be a file within the size limit.',
            );
        }

        const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
        const isImage = this.imageSignatures.some(
            (signature) =>
                header.length >= signature.length &&
                signature.every(
                    (byte, index) => byte == null || header[index] === byte,
                ),
        );

        if (!isImage) {
            throw new Error(
                'IpfsService: pinned file must be a PNG, GIF, JPEG or WebP image.',
            );
        }
    };
}

export const ipfsService = new IpfsService();
