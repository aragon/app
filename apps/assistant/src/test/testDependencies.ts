import type { LanguageModel } from 'ai';
import type { IBlobInfo, IBlobStore } from '../files/blobStore';
import type { IAppDependencies } from '../lib/appDependencies';
import { createSessionStore, type ISessionStore } from '../lib/sessionStore';
import type { ILinearGateway } from '../linear/linearGateway';
import { asRedis, createMockRedis, type IMockRedis } from './mockRedis';

export interface ITestLinearGateway extends ILinearGateway {
    createIssueCalls: Array<{
        title: string;
        description: string;
        labelName: string;
    }>;
    uploadFileCalls: Array<{ filename: string; contentType: string }>;
    failNextCreate: boolean;
}

export const createTestLinearGateway = (): ITestLinearGateway => {
    const gateway: ITestLinearGateway = {
        createIssueCalls: [],
        uploadFileCalls: [],
        failNextCreate: false,
        createIssue: (input) => {
            if (gateway.failNextCreate) {
                gateway.failNextCreate = false;

                return Promise.reject(new Error('Linear is down'));
            }
            gateway.createIssueCalls.push(input);

            return Promise.resolve({
                issueId: `issue-${gateway.createIssueCalls.length}`,
                identifier: `SUP-${gateway.createIssueCalls.length}`,
                url: `https://linear.app/aragon/issue/SUP-${gateway.createIssueCalls.length}`,
            });
        },
        uploadFile: (input) => {
            gateway.uploadFileCalls.push({
                filename: input.filename,
                contentType: input.contentType,
            });

            return Promise.resolve({
                assetUrl: `https://uploads.linear.app/${input.filename}`,
            });
        },
    };

    return gateway;
};

export interface ITestBlobStore extends IBlobStore {
    // Blob content by URL; fetchBytes throws for unknown URLs (like a deleted/missing blob).
    blobs: Map<string, Uint8Array>;
    // Optional metadata used by list(); entries without metadata fall back to uploadedAt=now.
    blobInfo: Map<string, IBlobInfo>;
    deletedUrls: string[];
}

export const createTestBlobStore = (): ITestBlobStore => {
    const store: ITestBlobStore = {
        blobs: new Map(),
        blobInfo: new Map(),
        deletedUrls: [],
        fetchBytes: (url) => {
            const data = store.blobs.get(url);

            return data == null
                ? Promise.reject(new Error(`Blob not found: ${url}`))
                : Promise.resolve(data);
        },
        delete: (urls) => {
            for (const url of urls) {
                store.blobs.delete(url);
                store.blobInfo.delete(url);
                store.deletedUrls.push(url);
            }

            return Promise.resolve();
        },
        list: (prefix) =>
            Promise.resolve(
                [...store.blobs.keys()]
                    .map(
                        (url) =>
                            store.blobInfo.get(url) ?? {
                                url,
                                pathname: new URL(url).pathname.slice(1),
                                uploadedAt: new Date(),
                            },
                    )
                    .filter((blob) => blob.pathname.startsWith(prefix)),
            ),
    };

    return store;
};

export interface ITestDependencies extends IAppDependencies {
    redis: IMockRedis;
    sessionStore: ISessionStore;
    linear: ITestLinearGateway;
    blobStore: ITestBlobStore;
}

export const createTestDependencies = (
    chatModel: LanguageModel,
    // Defaults to the chat mock: suites that never touch /analysis need no second model.
    analysisModel: LanguageModel = chatModel,
): ITestDependencies => {
    const redis = createMockRedis();
    const sessionStore = createSessionStore(asRedis(redis));
    const linear = createTestLinearGateway();
    const blobStore = createTestBlobStore();

    return {
        redis,
        sessionStore,
        linear,
        blobStore,
        getRedis: () => asRedis(redis),
        getSessionStore: () => sessionStore,
        getLinear: () => linear,
        getChatModel: () => chatModel,
        getAnalysisModel: () => analysisModel,
        getBlobStore: () => blobStore,
    };
};
