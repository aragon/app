import { checkBotId } from 'botid/server';
import { ipfsService } from '../../ipfsService';
import { pinJsonAction } from './pinJsonAction';

describe('pinJsonAction', () => {
    const requestSpy = jest.spyOn(ipfsService, 'request');
    const checkBotIdMock = checkBotId as jest.Mock;

    afterEach(() => {
        requestSpy.mockReset();
        checkBotIdMock.mockClear();
    });

    it('rejects an automated request without reaching Pinata', async () => {
        checkBotIdMock.mockResolvedValueOnce({ isBot: true });
        await expect(pinJsonAction({ body: {} })).rejects.toThrow();
        expect(requestSpy).not.toHaveBeenCalled();
    });

    it('pins the content with the app pin metadata', async () => {
        const body = { key: 'value' };
        const expectedBody = {
            pinataContent: body,
            pinataMetadata: ipfsService.buildPinMetadata(),
        };
        const expectedOptions = {
            headers: {
                Authorization: expect.stringContaining('Bearer') as unknown,
            },
            method: 'POST',
        };
        await pinJsonAction({ body });
        expect(requestSpy).toHaveBeenCalledWith(
            ipfsService.urls.pinJson,
            { body: expectedBody },
            expectedOptions,
        );
    });

    it.each([null, 'text', 1, ['item']])(
        'rejects %p without reaching Pinata',
        async (body) => {
            await expect(
                pinJsonAction({ body: body as unknown as object }),
            ).rejects.toThrow();
            expect(requestSpy).not.toHaveBeenCalled();
        },
    );
});
