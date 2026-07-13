// Blob pathname contract: assistant/{sessionId}/{fileId}/{filename}. The client proposes the
// pathname when requesting an upload token; the server verifies it (and re-verifies the blob URL
// at confirm time), so a session can only ever reference blobs under its own prefix.

// Hex digits are matched case-insensitively: the request schemas validate ids with z.uuid(),
// which accepts RFC 4122 UUIDs in any case, and the path check must not be stricter than the
// schema. Session comparison stays case-sensitive — session ids are opaque string keys.
const uuidPattern =
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

const blobPathPattern = new RegExp(
    `^assistant/(${uuidPattern})/(${uuidPattern})/([^/]+)$`,
    'u',
);

// The filename segment may be a raw File.name (the widget does not pre-process it): only length
// and control characters are policed here. The display filename is sanitized separately when the
// content is validated at confirm time.
const maxPathFilenameLength = 150;

export interface IParsedBlobPath {
    sessionId: string;
    fileId: string;
    filename: string;
}

export const buildBlobPathPrefix = (sessionId: string) =>
    `assistant/${sessionId}/`;

export const parseBlobPath = (pathname: string): IParsedBlobPath | null => {
    const match = blobPathPattern.exec(pathname);

    if (match == null) {
        return null;
    }

    const [, sessionId, fileId, filename] = match;

    if (filename.length > maxPathFilenameLength || /\p{Cc}/u.test(filename)) {
        return null;
    }

    return { sessionId, fileId, filename };
};

// Extracts the store id from a read-write token (vercel_blob_rw_<storeId>_<secret>) so blob URLs
// can be pinned to our own store without extra configuration.
export const getStoreIdFromToken = (token: string): string | null => {
    const segments = token.split('_');

    return segments.length >= 5 && segments[3] !== '' ? segments[3] : null;
};

// Validates that the URL points at our store and at the given session's prefix, and returns the
// parsed path. The content itself is validated separately (magic bytes at confirm time).
export const parseSessionBlobUrl = (params: {
    blobUrl: string;
    sessionId: string;
    storeId: string;
}): IParsedBlobPath | null => {
    const { blobUrl, sessionId, storeId } = params;

    let url: URL;
    try {
        url = new URL(blobUrl);
    } catch {
        return null;
    }

    const expectedHost = `${storeId.toLowerCase()}.public.blob.vercel-storage.com`;
    if (url.protocol !== 'https:' || url.hostname !== expectedHost) {
        return null;
    }

    let decodedPath: string;
    try {
        decodedPath = decodeURIComponent(url.pathname.slice(1));
    } catch {
        return null;
    }

    const parsed = parseBlobPath(decodedPath);

    return parsed?.sessionId === sessionId ? parsed : null;
};
