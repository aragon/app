import { gaugeVoterPluginMocks } from './plugins/gaugeVoterPlugin/mocks';
import type { IBackendApiMock } from './shared/types';

export const backendApiMocks: IBackendApiMock[] = [...gaugeVoterPluginMocks];
