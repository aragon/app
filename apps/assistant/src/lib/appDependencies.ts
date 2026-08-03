import type { Redis } from '@upstash/redis';
import type { LanguageModel } from 'ai';
import type { IBlobStore } from '../files/blobStore';
import type { ILinearGateway } from '../linear/linearGateway';
import type { ISessionStore } from './sessionStore';

// Dependency seams of the app: routes only consume these getters. Defaults are constructed
// lazily on first use (Upstash/Linear/Blob clients read env vars at construction, and /health
// must keep working in environments without any secrets); tests inject fakes through createApp.
export interface IAppDependencies {
    // Shared Upstash client: session state and both rate limiters run on it.
    getRedis: () => Redis;
    getSessionStore: () => ISessionStore;
    getLinear: () => ILinearGateway;
    getChatModel: () => LanguageModel;
    getBlobStore: () => IBlobStore;
}

export const lazy = <TValue>(factory: () => TValue): (() => TValue) => {
    let value: TValue | undefined;

    return () => {
        value ??= factory();

        return value;
    };
};
