import { randomBytes } from 'node:crypto';
import { PDFDocument, PDFName, type PDFObject, PDFString } from 'pdf-lib';
import sharp from 'sharp';
import { createFileSanitizer } from './sanitizeFile';
import type { IValidatedFile } from './validateFile';

const sanitizer = createFileSanitizer();

const buildFile = (
    data: Uint8Array,
    contentType: string,
    filename = 'file',
): IValidatedFile => ({ data, filename, contentType, size: data.byteLength });

const sanitize = (data: Uint8Array, contentType: string) =>
    sanitizer.sanitize(buildFile(data, contentType));

const expectRebuilt = async (
    result: ReturnType<typeof sanitize>,
): Promise<IValidatedFile> => {
    const resolved = await result;

    if ('error' in resolved) {
        throw new Error(`Rejected with ${resolved.error}`);
    }

    expect(resolved.rebuilt).toBe(true);

    return resolved.file;
};

const includesText = (data: Uint8Array, text: string) =>
    Buffer.from(data).includes(text);

const imageFormats = [
    ['png', 'image/png'],
    ['jpeg', 'image/jpeg'],
    ['gif', 'image/gif'],
    ['webp', 'image/webp'],
] as const;

const createImage = (format: (typeof imageFormats)[number][0]) =>
    sharp({
        create: {
            width: 4,
            height: 2,
            channels: 4,
            background: { r: 200, g: 30, b: 30, alpha: 1 },
        },
    })
        .toFormat(format)
        .toBuffer();

// Bytes appended after the image end: the shape of a polyglot (image + archive) file.
const trailingPayload = Buffer.from('TRAILING-PAYLOAD-MARKER PK\u0003\u0004');

const createPdf = async (
    mutate?: (document: PDFDocument) => Promise<void> | void,
    useObjectStreams = false,
) => {
    const document = await PDFDocument.create({ updateMetadata: false });
    document
        .addPage([200, 100])
        .drawRectangle({ x: 10, y: 10, width: 50, height: 50 });
    await mutate?.(document);

    return document.save({ useObjectStreams });
};

const addOpenActionScript = (document: PDFDocument) => {
    document.catalog.set(
        PDFName.of('OpenAction'),
        document.context.obj({
            S: 'JavaScript',
            JS: PDFString.of('app.alert(1)'),
        }),
    );
};

// A link annotation on the page whose action runs on click.
const addLinkAction = (
    document: PDFDocument,
    action: Record<string, PDFObject | string | number>,
) => {
    document.getPage(0).node.set(
        PDFName.of('Annots'),
        document.context.obj([
            document.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [10, 10, 60, 60],
                A: action,
            }),
        ]),
    );
};

// Actions that reach outside the document when clicked.
const clickActions: [string, Record<string, PDFObject | string | number>][] = [
    ['SubmitForm', { S: 'SubmitForm', F: PDFString.of('https://evil.test') }],
    [
        'GoToR',
        { S: 'GoToR', F: PDFString.of('other.pdf'), D: PDFString.of('p') },
    ],
    ['ImportData', { S: 'ImportData', F: PDFString.of('fields.fdf') }],
    ['Rendition', { S: 'Rendition', OP: 0 }],
];

const asLatin1 = (data: Uint8Array) => Buffer.from(data).toString('latin1');
const fromLatin1 = (text: string) => Buffer.from(text, 'latin1');

describe('createFileSanitizer', () => {
    it.each(imageFormats)(
        'rebuilds a %s image from its pixels only',
        async (format, contentType) => {
            const image = await createImage(format);

            const result = await expectRebuilt(
                sanitize(Buffer.concat([image, trailingPayload]), contentType),
            );

            expect(includesText(result.data, 'TRAILING-PAYLOAD-MARKER')).toBe(
                false,
            );
            expect(result).toMatchObject({
                contentType,
                size: result.data.byteLength,
            });
            expect(await sharp(result.data).metadata()).toMatchObject({
                format,
                width: 4,
                height: 2,
            });
        },
    );

    it('drops metadata and bakes the orientation into the pixels', async () => {
        const photo = await createImage('jpeg').then((image) =>
            sharp(image)
                .withMetadata({
                    orientation: 6,
                    exif: { IFD0: { Copyright: 'METADATA-MARKER' } },
                })
                .toBuffer(),
        );
        expect(includesText(photo, 'METADATA-MARKER')).toBe(true);

        const result = await expectRebuilt(sanitize(photo, 'image/jpeg'));

        expect(includesText(result.data, 'METADATA-MARKER')).toBe(false);
        const metadata = await sharp(result.data).metadata();
        expect(metadata.exif).toBeUndefined();
        expect(metadata.orientation).toBeUndefined();
        // Orientation 6 is a 90° turn: the 4×2 photo comes out 2×4.
        expect(metadata).toMatchObject({ width: 2, height: 4 });
    });

    it('keeps every frame of an animated image', async () => {
        const frame = await createImage('png');
        const animated = await sharp(
            [frame, await sharp(frame).negate().toBuffer()],
            { join: { animated: true } },
        )
            .gif()
            .toBuffer();
        expect(await sharp(animated).metadata()).toMatchObject({ pages: 2 });

        const result = await expectRebuilt(sanitize(animated, 'image/gif'));

        // Without `animated` on the decoder only the first frame would survive.
        expect(await sharp(result.data).metadata()).toMatchObject({ pages: 2 });
    });

    it('rejects an image the decoder cannot read', async () => {
        // Signature + IHDR only: sniffs as PNG, holds no pixels.
        const truncated = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49,
            0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15,
            0xc4, 0x89,
        ]);

        await expect(sanitize(truncated, 'image/png')).resolves.toMatchObject({
            error: 'unreadable',
            cause: expect.any(Error),
        });
    });

    it('rejects an image whose header claims more pixels than the budget', async () => {
        const image = await createImage('png');
        // IHDR width and height (bytes 16–23) rewritten to 30000×30000.
        image.writeUInt32BE(30_000, 16);
        image.writeUInt32BE(30_000, 20);

        await expect(sanitize(image, 'image/png')).resolves.toMatchObject({
            error: 'unreadable',
        });
    });

    it('rewrites a plain PDF', async () => {
        const result = await expectRebuilt(
            sanitize(await createPdf(), 'application/pdf'),
        );

        expect(asLatin1(result.data.slice(0, 5))).toEqual('%PDF-');
        expect(result).toMatchObject({
            contentType: 'application/pdf',
            size: result.data.byteLength,
        });
        expect((await PDFDocument.load(result.data)).getPageCount()).toEqual(1);
    });

    it('rejects a PDF with a script on open, even inside a compressed object stream', async () => {
        const pdf = await createPdf(addOpenActionScript, true);
        // The catalog sits in a deflated object stream: a byte search cannot see the action.
        expect(includesText(pdf, '/OpenAction')).toBe(false);

        await expect(sanitize(pdf, 'application/pdf')).resolves.toEqual({
            error: 'active_content',
        });
    });

    it('sees through hex-escaped names', async () => {
        const pdf = asLatin1(await createPdf(addOpenActionScript)).replace(
            '/OpenAction',
            '/Open#41ction',
        );
        expect(pdf).toContain('/Open#41ction');

        await expect(
            sanitize(fromLatin1(pdf), 'application/pdf'),
        ).resolves.toEqual({ error: 'active_content' });
    });

    it('rejects a PDF with an attached file', async () => {
        const pdf = await createPdf((document) =>
            document.attach(Buffer.from('MZ'), 'tool.exe'),
        );

        await expect(sanitize(pdf, 'application/pdf')).resolves.toEqual({
            error: 'active_content',
        });
    });

    it.each(clickActions)(
        'rejects a PDF whose link runs a %s action',
        async (_, action) => {
            const pdf = await createPdf((document) =>
                addLinkAction(document, action),
            );

            await expect(sanitize(pdf, 'application/pdf')).resolves.toEqual({
                error: 'active_content',
            });
        },
    );

    it('keeps a PDF whose link is a plain URL', async () => {
        const pdf = await createPdf((document) =>
            addLinkAction(document, {
                S: 'URI',
                URI: PDFString.of('https://aragon.org'),
            }),
        );

        const result = await expectRebuilt(sanitize(pdf, 'application/pdf'));

        const page = (await PDFDocument.load(result.data)).getPage(0);
        expect(page.node.Annots()?.size()).toEqual(1);
    });

    it('rejects an encrypted PDF', async () => {
        const pdf = asLatin1(await createPdf()).replace(
            'trailer\n<<',
            'trailer\n<<\n/Encrypt 1 0 R',
        );
        expect(pdf).toContain('/Encrypt');

        await expect(
            sanitize(fromLatin1(pdf), 'application/pdf'),
        ).resolves.toEqual({ error: 'encrypted' });
    });

    it('rejects a PDF it cannot parse', async () => {
        const broken = Buffer.from(
            '%PDF-1.7\n1 0 obj\n<< /Type /Catalog\nendobj',
        );

        await expect(
            sanitize(broken, 'application/pdf'),
        ).resolves.toMatchObject({ error: 'unreadable' });
    });

    it('passes text through untouched', async () => {
        const file = buildFile(
            Buffer.from('error: something failed'),
            'text/plain',
            'app.log',
        );

        await expect(sanitizer.sanitize(file)).resolves.toEqual({
            file,
            rebuilt: false,
        });
    });

    // The route caps the output size and does not time the call out, so what the budget has to
    // hold is the worst shape that fits under the upload cap. Both rebuild in 0.6-1.8 s here on
    // a laptop, coverage instrumentation included. The bound below is deliberately far looser:
    // it catches an order-of-magnitude regression rather than pinning a performance number, and
    // must not flake on a two-core shared runner. Building the fixtures is not part of what is
    // measured, hence the separate hook, and the per-test timeout is well above the bound so a
    // slow run fails on the assertion instead of on jest's own clock.
    describe('upload budget', () => {
        const budgetMs = 20_000;
        const fixtureTimeoutMs = 120_000;

        let noisyImage: Buffer;
        let denseDocument: Uint8Array;

        beforeAll(async () => {
            // Noise is what costs the encoder: a flat 48 MP screenshot rebuilds in ~40 ms, this
            // fixture takes an order of magnitude longer at a fraction of the pixels. The bytes
            // come from crypto rather than a JS loop so coverage instrumentation cannot make
            // building the fixture the slowest part of the test.
            noisyImage = await sharp(randomBytes(2200 * 2200 * 3), {
                raw: { width: 2200, height: 2200, channels: 3 },
            })
                .webp()
                .toBuffer();

            denseDocument = await createPdf((document) => {
                for (let index = 0; index < 60_000; index++) {
                    document.context.register(
                        document.context.obj({
                            Type: 'Filler',
                            Index: index,
                            Nested: [1, 2, 3, { A: 'b' }],
                        }),
                    );
                }
            });
        }, fixtureTimeoutMs);

        const measure = async (file: IValidatedFile) => {
            const startTime = Date.now();
            const result = await sanitizer.sanitize(file);

            return { result, elapsedMs: Date.now() - startTime };
        };

        it(
            'rebuilds an incompressible image of upload size in time',
            async () => {
                expect(noisyImage.byteLength).toBeGreaterThan(3 * 1024 * 1024);

                const { result, elapsedMs } = await measure(
                    buildFile(noisyImage, 'image/webp'),
                );

                expect(result).not.toHaveProperty('error');
                expect(elapsedMs).toBeLessThan(budgetMs);
            },
            fixtureTimeoutMs,
        );

        it(
            'walks a PDF packed with indirect objects in time',
            async () => {
                expect(denseDocument.byteLength).toBeGreaterThan(
                    4 * 1024 * 1024,
                );

                const { result, elapsedMs } = await measure(
                    buildFile(denseDocument, 'application/pdf'),
                );

                expect(result).not.toHaveProperty('error');
                expect(elapsedMs).toBeLessThan(budgetMs);
            },
            fixtureTimeoutMs,
        );
    });
});
