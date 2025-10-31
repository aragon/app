import { tokenExitQueuePluginMocks } from './plugins/tokenPlugin/testUtils/mocks/tokenExitQueueFeeMocks';
import type { IBackendApiMock } from './shared/types';

export const backendApiMocks: IBackendApiMock[] = [...tokenExitQueuePluginMocks];
