import { ipfsService } from '../../ipfsService';
import { pinJsonAction } from './pinJsonAction';

describe('usePinJson action', () => {
    const requestSpy = jest.spyOn(ipfsService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('triggers the IPFS request with correct params', () => {
        const body = { key: 'value' };
        const expectedBody = JSON.stringify({ pinataContent: body });
        const expectedOptions = {
            headers: { Authorization: expect.stringContaining('Bearer'), 'Content-Type': 'application/json' },
            method: 'POST',
        };
        pinJsonAction({ body });
        expect(requestSpy).toHaveBeenCalledWith(ipfsService.urls.pinJson, { body: expectedBody }, expectedOptions);
    });
});
