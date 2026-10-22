import { checkBotId } from 'botid/server';
import { ipfsService } from '../../ipfsService';
import { pinJsonAction } from './pinJsonAction';

describe('usePinJson action', () => {
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

    it('triggers the IPFS request with correct params', async () => {
        const body = { key: 'value' };
        const expectedBody = { pinataContent: body };
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
});
