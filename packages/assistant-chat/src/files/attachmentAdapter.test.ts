import type { PendingAttachment } from '@assistant-ui/react';
import { chatCopy } from '../copy';
import { createAttachmentAdapter } from './attachmentAdapter';

// The blob client uploads straight to storage; the adapter's behaviour under test starts at the
// /files/confirm response, so the upload itself is stubbed to a successful blob.
jest.mock('@vercel/blob/client', () => ({
    upload: jest.fn(() =>
        Promise.resolve({ url: 'https://store.test/assistant/blob' }),
    ),
}));

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

const buildAdapter = () =>
    createAttachmentAdapter({
        assistantUrl: 'https://assistant.test',
        getSessionId: () => sessionId,
        logError: jest.fn(),
    });

const pngFile = () =>
    new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'screenshot.png', {
        type: 'image/png',
    });

// Drives the adapter's `add` generator to completion, returning the thrown error (if any) the
// way the runtime surfaces it on the attachment tile.
const runAdd = async (
    adapter: ReturnType<typeof buildAdapter>,
    file: File,
): Promise<{ attachment: PendingAttachment; error?: Error }> => {
    // `add` is typed as a generator-or-promise union; this adapter always returns the generator.
    const generator = adapter.add({ file }) as AsyncGenerator<
        PendingAttachment,
        void
    >;
    const first = await generator.next();
    const attachment = first.value as PendingAttachment;

    try {
        await generator.next();

        return { attachment };
    } catch (error) {
        return { attachment, error: error as Error };
    }
};

// The service rejects the upload at /files/confirm (422 malicious_file): the blob is deleted
// server-side and nothing is queued for the ticket.
const mockConfirmRejection = () => {
    global.fetch = jest.fn(() =>
        Promise.resolve(
            new Response(
                JSON.stringify({
                    error: {
                        code: 'malicious_file',
                        message: 'Malicious content detected.',
                    },
                }),
                {
                    status: 422,
                    headers: { 'content-type': 'application/json' },
                },
            ),
        ),
    ) as unknown as typeof fetch;
};

// The service accepts the upload and queues the file for the ticket.
const mockConfirmAccepted = () => {
    global.fetch = jest.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'DELETE') {
            return Promise.resolve(new Response(null, { status: 204 }));
        }

        return Promise.resolve(
            new Response(
                JSON.stringify({
                    id: 'file-1',
                    filename: 'screenshot.png',
                    contentType: 'image/png',
                    size: 4,
                }),
                {
                    status: 201,
                    headers: { 'content-type': 'application/json' },
                },
            ),
        );
    }) as unknown as typeof fetch;
};

describe('createAttachmentAdapter', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('refuses to send an attachment whose upload the service rejected', async () => {
        mockConfirmRejection();
        const adapter = buildAdapter();

        const { attachment, error } = await runAdd(adapter, pngFile());

        // The tile reports the rejection with our own wording…
        expect(error?.message).toEqual(chatCopy.fileAlerts.maliciousFile);

        // …and the message cannot carry the file: the server holds no bytes for it, so sending
        // it would show the user an attachment the support team never receives.
        await expect(adapter.send(attachment)).rejects.toThrow();
    });

    it('frees the composer slot of a rejected attachment', async () => {
        mockConfirmRejection();
        const adapter = buildAdapter();

        // Rejected uploads must not consume the per-message slots: several rejections in a row
        // still leave room to attach a valid file.
        for (let index = 0; index < 3; index++) {
            await runAdd(adapter, pngFile());
        }

        const { error } = await runAdd(adapter, pngFile());

        // Still the upload rejection, never the "too many files" alert.
        expect(error?.message).toEqual(chatCopy.fileAlerts.maliciousFile);
    });
    it('stays sendable when another attachment of the same message failed', async () => {
        // The composer sends every attachment concurrently and, when one throws, restores them
        // all and re-sends. A file that already went must survive that second round: otherwise
        // the message is blocked forever and `remove` can no longer delete it server-side.
        mockConfirmAccepted();
        const adapter = buildAdapter();
        const { attachment } = await runAdd(adapter, pngFile());

        await expect(adapter.send(attachment)).resolves.toMatchObject({
            status: { type: 'complete' },
        });

        await expect(adapter.send(attachment)).resolves.toMatchObject({
            status: { type: 'complete' },
        });
    });

    it('still deletes a sent file server-side when it is removed', async () => {
        mockConfirmAccepted();
        const adapter = buildAdapter();
        const { attachment } = await runAdd(adapter, pngFile());
        await adapter.send(attachment);

        await adapter.remove(attachment);

        // The DELETE must reach the service: a file dropped from the composer cannot be left in
        // the session queue, where ticket creation would still attach it.
        const calls = (global.fetch as jest.Mock).mock.calls.map((call) => ({
            url: String(call[0]),
            method: (call[1] as RequestInit | undefined)?.method,
        }));
        expect(
            calls.some(
                (call) =>
                    call.method === 'DELETE' && call.url.includes('/files/'),
            ),
        ).toBe(true);
    });
});
