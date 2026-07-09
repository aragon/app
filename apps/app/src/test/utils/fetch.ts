import { generateResponse } from '@/shared/testUtils';

export const mockFetch = () => {
    global.fetch = jest.fn(() => Promise.resolve(generateResponse()));
};
