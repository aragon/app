import { useCallback, useRef, useState } from 'react';
import {
    mpcService,
    useMpcCreateSystem,
    useMpcRegisterKey,
} from '@/modules/mpc/api/mpcService';
import type { MpcProviderId } from '@/modules/mpc/api/mpcService/domain';
import type { IMpcCeremonyState } from '@/modules/mpc/components/mpcCreateSystemForm';
import { useMpcProvider } from '@/modules/mpc/hooks/useMpcProvider';

export interface IMpcKeyCeremonyParams {
    name: string;
    description?: string;
    chainIds: number[];
    /**
     * Workspace the system is created in.
     */
    workspaceId: string;
}

export interface IUseMpcKeyCeremonyResult {
    /**
     * Current state of the ceremony.
     */
    state: IMpcCeremonyState;
    /**
     * Runs the ceremony: creates the system on the co-signer (once), generates the key with the provider and
     * registers the server share. Safe to call again after an error (the system is reused).
     */
    run: (params: IMpcKeyCeremonyParams) => Promise<void>;
}

/**
 * Key generation ceremony of the create-system wizard (POC: mock Shamir provider).
 */
export const useMpcKeyCeremony = (
    providerId: MpcProviderId = 'mock-shamir',
): IUseMpcKeyCeremonyResult => {
    const provider = useMpcProvider(providerId);
    const { mutateAsync: createSystem } = useMpcCreateSystem();
    const { mutateAsync: registerKey } = useMpcRegisterKey();

    const [state, setState] = useState<IMpcCeremonyState>({ status: 'idle' });
    const systemIdRef = useRef<string>(undefined);
    const hasAttemptedRef = useRef(false);
    const isRunningRef = useRef(false);

    const run = useCallback(
        async (params: IMpcKeyCeremonyParams) => {
            if (isRunningRef.current) {
                return;
            }
            isRunningRef.current = true;
            setState((current) => ({
                ...current,
                status: 'running',
                error: undefined,
            }));

            try {
                if (systemIdRef.current == null) {
                    const system = await createSystem({
                        body: {
                            name: params.name,
                            description: params.description,
                            chainIds: params.chainIds,
                            providerId,
                            workspaceId: params.workspaceId,
                        },
                    });
                    systemIdRef.current = system.id;
                    setState((current) => ({
                        ...current,
                        systemId: system.id,
                    }));
                }

                const systemId = systemIdRef.current;

                if (hasAttemptedRef.current) {
                    // Retry: a previous attempt may have registered the key even if the client saw an error
                    // (network). Never regenerate / overwrite the device share in that case.
                    const existing = await mpcService.getSystem({
                        urlParams: { systemId },
                    });

                    if (existing.status === 'active') {
                        setState({
                            status: 'done',
                            step: 'done',
                            systemId,
                            address: existing.address,
                            keyAlreadyRegistered: true,
                        });
                        return;
                    }
                }

                hasAttemptedRef.current = true;
                const result = await provider.createKey({
                    systemId,
                    onProgress: (step) =>
                        setState((current) => ({ ...current, step })),
                    registerServerShare: async ({
                        address,
                        publicKey,
                        serverShare,
                    }) => {
                        await registerKey({
                            urlParams: { systemId },
                            body: { address, publicKey, serverShare },
                        });
                    },
                });

                setState({
                    status: 'done',
                    step: 'done',
                    systemId,
                    address: result.address,
                    recoveryShareText: result.recoveryShareText,
                });
            } catch (error: unknown) {
                setState((current) => ({ ...current, status: 'error', error }));
            } finally {
                isRunningRef.current = false;
            }
        },
        [createSystem, registerKey, provider, providerId],
    );

    return { state, run };
};
