# Zero-RPC Status Calculation Implementation

## Summary

Instead of making RPC calls to fetch ticket data, we use backend-indexed data with contract as fallback.

## Backend Changes Needed

Add these fields to `ILockExit` (when indexing `ExitQueuedV2` events):

```typescript
lockExit: {
    status: boolean,           // Already exists
    queuedAt: number,          // From ticket.queuedAt
    minCooldown: number,       // From ticket.minCooldown
    cooldown: number,          // From ticket.cooldown
    feePercent: number,        // From ticket.feePercent
    minFeePercent: number,     // From ticket.minFeePercent
    slope: string,             // From ticket.slope (as string)
}
```

## Frontend Implementation

Replace lines 74-99 in `tokenLockListItem.tsx`:

```typescript
const pluginFeePercent = plugin.settings.votingEscrow?.feePercent ?? 0;
const pluginMinFeePercent = plugin.settings.votingEscrow?.minFeePercent ?? 0;

const isQueued = lock.lockExit.status;

// Check if backend has ticket data (avoids RPC call)
const hasBackendTicketData = isQueued && lock.lockExit.queuedAt != null && lock.lockExit.minCooldown != null;

// Only fetch from contract if backend data is missing (fallback)
const { ticket, feeAmount } = useTokenExitQueueFeeData({
    tokenId: BigInt(lock.tokenId),
    lockManagerAddress,
    chainId,
    enabled: hasExitQueue && isQueued && !hasBackendTicketData,
});

// Calculate status using fresh client time (zero RPC if backend has data)
const now = DateTime.now().toSeconds();
const status: TokenLockStatus = (() => {
    if (!isQueued) return 'active';

    // Use backend ticket data first (zero RPC calls)
    if (hasBackendTicketData) {
        const canWithdraw = now >= lock.lockExit.queuedAt! + lock.lockExit.minCooldown!;
        return canWithdraw ? 'available' : 'cooldown';
    }

    // Fallback to contract ticket if backend missing
    if (hasExitQueue && ticket != null) {
        const canWithdraw = now >= ticket.queuedAt + ticket.minCooldown;
        return canWithdraw ? 'available' : 'cooldown';
    }

    // Final fallback for non-exit-queue locks
    return tokenLockUtils.getLockStatus(lock);
})();
```

## Benefits

- ✅ Zero RPC calls for status calculation
- ✅ Fresh client-side time comparison
- ✅ Contract fallback if backend data missing
- ✅ Backend can remove `exitDateAt` logic
