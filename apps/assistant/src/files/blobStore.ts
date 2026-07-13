import { Readable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { del, get, list } from '@vercel/blob';
import { env } from '../lib/env';

export interface IBlobInfo {
    url: string;
    pathname: string;
    uploadedAt: Date;
}

// Seam over the blob storage: routes and tests only consume this interface. The bytes flow
// client → blob store directly (Vercel functions cap request bodies at 4.5 MB), the service only
// reads them back for validation and the final transfer to Linear.
export interface IBlobStore {
    // Downloads the blob bytes; throws when the blob does not exist or the fetch fails.
    fetchBytes(url: string): Promise<Uint8Array>;
    // Best-effort bulk deletion (idempotent on the blob store side).
    delete(urls: string[]): Promise<void>;
    // Lists ALL blobs under the prefix (follows pagination).
    list(prefix: string): Promise<IBlobInfo[]>;
}

export const createVercelBlobStore = (): IBlobStore => {
    const token = env.blobReadWriteToken();

    if (token == null) {
        throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
    }

    return {
        fetchBytes: async (url) => {
            // Use the Blob SDK (auth + streaming) rather than raw fetch of the public URL.
            const result = await get(url, { access: 'public', token });

            if (result == null || result.statusCode !== 200) {
                throw new Error(
                    result == null
                        ? 'Blob not found'
                        : `Blob fetch failed with status ${result.statusCode}`,
                );
            }

            return new Uint8Array(
                await buffer(Readable.fromWeb(result.stream)),
            );
        },
        delete: async (urls) => {
            if (urls.length > 0) {
                await del(urls, { token });
            }
        },
        list: async (prefix) => {
            const blobs: IBlobInfo[] = [];
            let cursor: string | undefined;

            do {
                const page = await list({ prefix, cursor, token });
                blobs.push(
                    ...page.blobs.map((blob) => ({
                        url: blob.url,
                        pathname: blob.pathname,
                        uploadedAt: new Date(blob.uploadedAt),
                    })),
                );
                cursor = page.cursor ?? undefined;
            } while (cursor != null);

            return blobs;
        },
    };
};
