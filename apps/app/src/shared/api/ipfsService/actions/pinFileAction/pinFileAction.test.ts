import { ipfsService } from '../../ipfsService';
import { pinFileAction } from './pinFileAction';

describe('pinFileAction', () => {
    const requestSpy = jest.spyOn(ipfsService, 'request');

    const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    const buildFile = (bytes: number[], name = 'avatar.png') =>
        new File([new Uint8Array(bytes)], name, { type: 'image/png' });

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('pins the file with the app pin metadata', async () => {
        const file = buildFile([...pngHeader, 0x00, 0x00]);
        requestSpy.mockResolvedValue({ IpfsHash: 'cid' });

        const result = await pinFileAction({ body: file });

        expect(result).toEqual({ IpfsHash: 'cid' });
        const [url, params, options] = requestSpy.mock.calls[0];
        const formData = params?.body as FormData;
        expect(url).toBe(ipfsService.urls.pinFile);
        expect(formData.get('file')).toBeInstanceOf(File);
        expect(formData.get('pinataMetadata')).toBe(
            JSON.stringify(ipfsService.buildPinMetadata()),
        );
        expect(options).toEqual({
            headers: {
                Authorization: expect.stringContaining('Bearer') as unknown,
            },
            method: 'POST',
        });
    });

    it('rejects a file that is not an image whatever MIME type it declares', async () => {
        const file = buildFile([...Buffer.from('<html></html>')]);
        await expect(pinFileAction({ body: file })).rejects.toThrow();
        expect(requestSpy).not.toHaveBeenCalled();
    });

    it('rejects a file above the size limit', async () => {
        const bytes = new Uint8Array(ipfsService.maxFileSize + 1);
        bytes.set(pngHeader);
        const file = new File([bytes], 'avatar.png', { type: 'image/png' });
        await expect(pinFileAction({ body: file })).rejects.toThrow();
        expect(requestSpy).not.toHaveBeenCalled();
    });

    it('rejects a body that is not a file', async () => {
        const body = 'text' as unknown as File;
        await expect(pinFileAction({ body })).rejects.toThrow();
        expect(requestSpy).not.toHaveBeenCalled();
    });
});
