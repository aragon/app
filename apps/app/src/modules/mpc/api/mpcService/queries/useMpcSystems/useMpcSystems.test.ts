import { renderHook, waitFor } from '@testing-library/react';
import { generateMpcSystem } from '@/modules/mpc/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { mpcService } from '../../mpcService';
import { useMpcSystems } from './useMpcSystems';

describe('useMpcSystems query', () => {
    const getSystemsSpy = jest.spyOn(mpcService, 'getSystems');

    afterEach(() => {
        getSystemsSpy.mockReset();
    });

    it('fetches the systems of the current user', async () => {
        const systems = [
            generateMpcSystem({ id: 'a' }),
            generateMpcSystem({ id: 'b' }),
        ];
        getSystemsSpy.mockResolvedValue(systems);
        const { result } = renderHook(() => useMpcSystems(), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data).toEqual(systems));
        expect(getSystemsSpy).toHaveBeenCalled();
    });
});
