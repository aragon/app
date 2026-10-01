import { Readable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { del, get, list, put as putBlob } from '@vercel/blob';
import { env } from '../lib/env';

export interface IBlobInfo {
    url: string;
    pathname: string;
    uploadedAt: Date;
}

// Seam over the blob storage: routes and tests only consume this interface. The bytes flow
// client → blob store directly (Vercel functions cap request bodies at 4.5 MB); the service reads
// them back for validation, writes the rebuilt copy and transfers it to Linear.
export interface IBlobStore {
    // Downloads the blob bytes; throws when the blob does not exist or the fetch fails.
    fetchBytes: (url: string) => Promise<Uint8Array>;
    // Stores bytes under the pathname plus a random suffix and returns the new blob URL.
    put: (params: {
        pathname: string;
        data: Uint8Array;
        contentType: string;
    }) => Promise<{ url: string }>;
    // Best-effort bulk deletion (idempotent on the blob store side).
    delete: (urls: string[]) => Promise<void>;
    // Lists ALL blobs under the prefix (follows pagination).
    list: (prefix: string) => Promise<IBlobInfo[]>;
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
        put: async ({ pathname, data, contentType }) => {
            const blob = await putBlob(
                pathname,
                Buffer.from(data.buffer, data.byteOffset, data.byteLength),
                { access: 'public', token, addRandomSuffix: true, contentType },
            );

            return { url: blob.url };
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
