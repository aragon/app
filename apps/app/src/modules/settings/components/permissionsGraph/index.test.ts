const mockDynamic = jest.fn((_loader: () => Promise<unknown>) => () => null);
const mockPermissionsGraph = jest.fn(() => null);
const mockGraphModule = jest.fn(() => ({
    PermissionsGraph: mockPermissionsGraph,
}));

jest.mock('next/dynamic', () => ({
    __esModule: true,
    default: (loader: () => Promise<unknown>) => mockDynamic(loader),
}));

jest.mock('./permissionsGraph', () => mockGraphModule());

import { PermissionsGraph } from './index';

describe('permissionsGraph barrel', () => {
    it('exports the named graph component through a lazy boundary', async () => {
        expect(PermissionsGraph).toBeDefined();
        expect(mockDynamic).toHaveBeenCalledTimes(1);
        expect(mockDynamic).toHaveBeenCalledWith(expect.any(Function));
        expect(mockGraphModule).not.toHaveBeenCalled();

        const loader = mockDynamic.mock.calls[0]?.[0];

        if (loader == null) {
            throw new Error('Dynamic graph loader was not registered');
        }

        await expect(loader()).resolves.toBe(mockPermissionsGraph);
        expect(mockGraphModule).toHaveBeenCalledTimes(1);
    });
});
