import { assistantLimits } from '@aragon/assistant-contracts';
import { sanitizeFilename, validateFile } from './validateFile';

// Signature + IHDR chunk — file-type reads past the 8-byte signature to rule out APNG.
const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48,
    0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15, 0xc4, 0x89,
]);
const jpegBytes = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0,
    1, 0, 0,
]);
const gifBytes = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0, 0, 0, 0,
]);
const pdfBytes = new TextEncoder().encode('%PDF-1.7 fixture content');
const exeBytes = new Uint8Array([
    0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0xff, 0xff, 0, 0,
]);
const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x20,
]);

describe('sanitizeFilename', () => {
    it('strips directory components', () => {
        expect(sanitizeFilename('../../etc/passwd')).toEqual('passwd');
        expect(sanitizeFilename('C:\\Users\\evil.png')).toEqual('evil.png');
    });

    it('strips control characters', () => {
        expect(sanitizeFilename('re\u0007port.txt')).toEqual('report.txt');
    });

    it('falls back for empty or dot-only names', () => {
        expect(sanitizeFilename('..')).toEqual('file');
        expect(sanitizeFilename('')).toEqual('file');
    });

    it('caps the length but keeps the extension', () => {
        const sanitized = sanitizeFilename(`${'a'.repeat(300)}.png`);

        expect(sanitized.length).toBeLessThanOrEqual(120);
        expect(sanitized.endsWith('.png')).toBeTruthy();
    });
});

describe('validateFile', () => {
    it('accepts allowlisted binary types by magic bytes', async () => {
        expect(await validateFile(pngBytes, 'shot.png')).toMatchObject({
            contentType: 'image/png',
        });
        expect(await validateFile(jpegBytes, 'photo.jpg')).toMatchObject({
            contentType: 'image/jpeg',
        });
        expect(await validateFile(gifBytes, 'anim.gif')).toMatchObject({
            contentType: 'image/gif',
        });
        expect(await validateFile(webpBytes, 'pic.webp')).toMatchObject({
            contentType: 'image/webp',
        });
        expect(await validateFile(pdfBytes, 'doc.pdf')).toMatchObject({
            contentType: 'application/pdf',
        });
    });

    it('derives the content type from sniffing even when the name lies', async () => {
        expect(
            await validateFile(pngBytes, 'actually-a-png.txt'),
        ).toMatchObject({ contentType: 'image/png' });
    });

    it('rejects executables renamed to an allowed extension', async () => {
        expect(await validateFile(exeBytes, 'innocent.png')).toEqual({
            error: 'unsupported_file',
        });
    });

    it('rejects svg content', async () => {
        const svgBytes = new TextEncoder().encode(
            '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        );

        expect(await validateFile(svgBytes, 'image.svg')).toEqual({
            error: 'unsupported_file',
        });
    });

    it('accepts utf-8 text files by extension', async () => {
        const textBytes = new TextEncoder().encode('error: something failed');

        expect(await validateFile(textBytes, 'app.log')).toMatchObject({
            contentType: 'text/plain',
        });
        expect(await validateFile(textBytes, 'notes.md')).toMatchObject({
            contentType: 'text/plain',
        });
    });

    it('rejects binary data with a text extension', async () => {
        expect(await validateFile(exeBytes, 'innocent.txt')).toEqual({
            error: 'unsupported_file',
        });

        const withNulByte = new TextEncoder().encode('text\u0000more');
        expect(await validateFile(withNulByte, 'notes.txt')).toEqual({
            error: 'unsupported_file',
        });
    });

    it('rejects unknown text extensions', async () => {
        const textBytes = new TextEncoder().encode('#!/bin/sh\nrm -rf /');

        expect(await validateFile(textBytes, 'script.sh')).toEqual({
            error: 'unsupported_file',
        });
    });

    it('rejects oversized files before sniffing', async () => {
        const oversized = new Uint8Array(assistantLimits.maxFileSizeBytes + 1);

        expect(await validateFile(oversized, 'big.png')).toEqual({
            error: 'file_too_large',
        });
    });
});
