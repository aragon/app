'use client';

// LMM_DEMO_HACK: builds the viem `ActionContext` the demo write-helpers
// (dispatch / settle / warp / top-up) need from the loaded manifest. Shared by
// the demo cheats dropdown and the Focus "Simulate & dispatch" modal so both
// drive the same Anvil fork the same way. Returns `undefined` outside demo mode
// or before the manifest loads.

import { useMemo } from 'react';
import { createPublicClient, http, type PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import {
    type ActionContext,
    deriveAddressesFromManifest,
} from '../components/lidoMoneyMachine/actions';
import { LMM_DEMO_MODE, LMM_RPC_URL } from './lmmDemoConfig';
import { useLmmManifest } from './useLmmManifest';

let cachedClient: PublicClient | undefined;
const getPublicClient = (): PublicClient => {
    cachedClient ??= createPublicClient({
        chain: mainnet,
        transport: http(LMM_RPC_URL),
    });
    return cachedClient;
};

export const useLmmActionContext = (): ActionContext | undefined => {
    const { manifest } = useLmmManifest();
    return useMemo(() => {
        if (!(LMM_DEMO_MODE && manifest)) {
            return undefined;
        }
        const addresses = deriveAddressesFromManifest(
            manifest as unknown as Parameters<
                typeof deriveAddressesFromManifest
            >[0],
        );
        if (!addresses) {
            return undefined;
        }
        return {
            rpc: LMM_RPC_URL,
            publicClient: getPublicClient(),
            dao: manifest.lmm.dao,
            dispatcher: manifest.lmm.dispatcherPlugin,
            addresses,
        };
    }, [manifest]);
};
