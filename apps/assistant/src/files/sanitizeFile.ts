import {
    ParseSpeeds,
    PDFArray,
    PDFDict,
    PDFDocument,
    PDFName,
    type PDFObject,
    PDFStream,
} from 'pdf-lib';
import sharp, { type Sharp } from 'sharp';
import type { IValidatedFile } from './validateFile';

export type IFileSanitizeError =
    // The PDF can do something when opened or clicked: scripts, launched programs, event
    // actions, form submissions, other files, attached files, rich media or XFA forms.
    | 'active_content'
    // An encrypted PDF cannot be inspected.
    | 'encrypted'
    // A decoder refused the bytes (corrupt file, oversized dimensions, unsupported structure).
    | 'unreadable';

export interface IFileSanitizeRejection {
    error: IFileSanitizeError;
    // Decoder failure behind an `unreadable` rejection.
    cause?: unknown;
}

export interface IFileSanitizeResult {
    file: IValidatedFile;
    // `true` when `file.data` holds bytes the sanitizer produced, which the caller stores in
    // place of the upload. `false` means the upload passed inspection as it is and its blob
    // stays. An implementation that edits the bytes in place still reports `true`.
    rebuilt: boolean;
}

// Seam over the attachment rebuild: routes and tests only consume this interface. A further
// layer (e.g. a self-hosted antivirus) plugs in behind it. Two things an implementation owes
// the caller: `rebuilt` is accurate, and the work stays inside the upload budget of a Vercel
// function — the caller hands over at most `assistantLimits.maxFileSizeBytes` and does not
// time the call out. Output size is not bounded here; the caller caps it.
export interface IFileSanitizer {
    sanitize: (
        file: IValidatedFile,
    ) => Promise<IFileSanitizeResult | IFileSanitizeRejection>;
}

// Decoded pixel budget: an 8K screenshot is 33 MP, anything larger is a decompression bomb.
// Together with the 5 MiB upload cap this is what keeps the rebuild inside the function budget:
// cost follows entropy rather than pixel count, and the worst shapes that fit under the cap
// measure ~0.9 s (incompressible WebP) and ~0.45 s (PDF holding 60k indirect objects) on an
// M-series laptop — see the budget tests. Far enough under the budget that no deadline is worth
// putting around the call, which neither libvips nor a pdf-lib parse would observe anyway.
const maxInputPixels = 50_000_000;

const imageEncoders = new Map<string, (image: Sharp) => Sharp>([
    ['image/png', (image) => image.png()],
    ['image/jpeg', (image) => image.jpeg({ quality: 90 })],
    ['image/gif', (image) => image.gif()],
    ['image/webp', (image) => image.webp()],
]);

// Decode and re-encode: the output holds pixels only (no metadata, no trailing or foreign
// chunks). `animated` keeps every frame of a gif/webp; `rotate()` bakes the EXIF orientation
// in before the tag is dropped.
const rebuildImage = (
    file: IValidatedFile,
    encode: (image: Sharp) => Sharp,
): Promise<Uint8Array> =>
    encode(
        sharp(file.data, {
            limitInputPixels: maxInputPixels,
            animated: true,
        }).rotate(),
    ).toBuffer();

// Any dictionary key or name value in this set makes a PDF active. Such documents are rejected,
// not stripped: the user re-exports as an image or a flat PDF. The last four are the click
// actions that reach outside the document (submit a form, open another file, import form data,
// play media); a plain `/URI` link stays allowed.
const activePdfNames = new Set([
    'JavaScript',
    'JS',
    'Launch',
    'OpenAction',
    'AA',
    'EmbeddedFile',
    'EmbeddedFiles',
    'RichMedia',
    'XFA',
    'SubmitForm',
    'GoToR',
    'ImportData',
    'Rendition',
]);

const hasActiveName = (object: PDFObject): boolean => {
    if (object instanceof PDFName) {
        return activePdfNames.has(object.decodeText());
    }
    if (object instanceof PDFDict) {
        return object
            .entries()
            .some(
                ([key, value]) =>
                    activePdfNames.has(key.decodeText()) ||
                    hasActiveName(value),
            );
    }
    if (object instanceof PDFStream) {
        return hasActiveName(object.dict);
    }
    if (object instanceof PDFArray) {
        return object.asArray().some(hasActiveName);
    }

    return false;
};

// pdf-lib reads every object in the file sequentially (object streams expanded, xref ignored),
// so nothing hides behind a broken xref table or a compressed stream — names are compared
// decoded, so `/J#61vaScript` is `/JavaScript`. The document is then written out afresh.
const rebuildPdf = async (
    file: IValidatedFile,
): Promise<IFileSanitizeResult | IFileSanitizeRejection> => {
    const document = await PDFDocument.load(file.data, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
        throwOnInvalidObject: true,
        updateMetadata: false,
    });

    if (document.isEncrypted) {
        return { error: 'encrypted' };
    }

    const isActive = document.context
        .enumerateIndirectObjects()
        .some(([, object]) => hasActiveName(object));

    if (isActive) {
        return { error: 'active_content' };
    }

    const data = await document.save({
        addDefaultPage: false,
        updateFieldAppearances: false,
    });

    return { file: { ...file, data, size: data.byteLength }, rebuilt: true };
};

export const createFileSanitizer = (): IFileSanitizer => ({
    sanitize: async (file) => {
        try {
            const encodeImage = imageEncoders.get(file.contentType);

            if (encodeImage != null) {
                const data = await rebuildImage(file, encodeImage);

                return {
                    file: { ...file, data, size: data.byteLength },
                    rebuilt: true,
                };
            }

            if (file.contentType === 'application/pdf') {
                return await rebuildPdf(file);
            }

            // Text passed the strict UTF-8 decode of validateFile: nothing to rebuild.
            return { file, rebuilt: false };
        } catch (error) {
            return { error: 'unreadable', cause: error };
        }
    },
});
