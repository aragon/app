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
});
