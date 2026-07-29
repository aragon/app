export const generateResponse = (response?: Partial<Response>): Response => {
    const defaultHeaders = new Headers();
    const defaults: Response = {
        headers: defaultHeaders as unknown as Headers,
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'OK',
        type: 'default',
        url: '',
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(() => Promise.resolve('')),
        json: jest.fn(() => Promise.resolve({})),
        bytes: jest.fn(),
        ...response,
    };

    return defaults;
};
