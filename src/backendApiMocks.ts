import { lockToVotePluginMocks } from './plugins/lockToVotePlugin/testUtils/mocks';
import type { IBackendApiMock } from './shared/types';

export const backendApiMocks: IBackendApiMock[] = [...lockToVotePluginMocks];
