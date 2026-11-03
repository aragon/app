import { ipfsService } from './ipfsService';

describe('ipfsService', () => {
    const buildFile = (bytes: number[]) =>
        new File([new Uint8Array(bytes)], 'avatar', { type: 'image/png' });

    it('initialises the service with the correct base url', () => {
        expect(ipfsService['baseUrl']).toMatch(/api.pinata.cloud/);
    });

    describe('validateFile', () => {
        it.each([
            ['PNG', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]],
            ['GIF87a', [0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x00]],
            ['GIF89a', [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00]],
            ['JPEG', [0xff, 0xd8, 0xff, 0xe0, 0x00]],
        ])('accepts a %s file', async (_, bytes) => {
            await expect(
                ipfsService.validateFile(buildFile(bytes)),
            ).resolves.toBeUndefined();
        });

        it('rejects an empty file', async () => {
            await expect(
                ipfsService.validateFile(buildFile([])),
            ).rejects.toThrow('size limit');
        });

        it('rejects a file whose header is a prefix of a signature', async () => {
            await expect(
                ipfsService.validateFile(buildFile([0x89, 0x50])),
            ).rejects.toThrow('PNG, GIF or JPEG');
        });

        it('rejects a value that is not a file', async () => {
            await expect(ipfsService.validateFile({ size: 1 })).rejects.toThrow(
                'size limit',
            );
        });
    });

    describe('validateJson', () => {
        it('accepts a JSON object', () => {
            expect(() =>
                ipfsService.validateJson({ name: 'dao' }),
            ).not.toThrow();
        });

        it.each([null, undefined, 'text', 1, true, []])(
            'rejects %p',
            (content) => {
                expect(() => ipfsService.validateJson(content)).toThrow(
                    'JSON object',
                );
            },
        );
    });

    describe('buildPinMetadata', () => {
        const originalEnv = process.env.NEXT_PUBLIC_ENV;

        afterEach(() => {
            process.env.NEXT_PUBLIC_ENV = originalEnv;
        });

        it('tags the pin with the app source and the environment', () => {
            process.env.NEXT_PUBLIC_ENV = 'preview';
            expect(ipfsService.buildPinMetadata()).toEqual({
                keyvalues: { source: 'aragon-app', environment: 'preview' },
            });
        });
    });
});
