import { renderHook } from '@testing-library/react';
import { useMultisigMemberStats } from './useMultisigMemberStats';

describe('useMultisigMemberStats hook', () => {
    it('returns multisig member stats', () => {
        const { result } = renderHook(() => useMultisigMemberStats());
        const [latestActivity] = result.current;
        expect(latestActivity.label).toBe('app.governance.plugins.multisig.multisigMemberStats.latestActivity');
    });
});
