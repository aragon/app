import { workspaceApiMocks } from '@/modules/workspace/api/workspaceService/mocks';
import type { IBackendApiMock } from './shared/types';

export const backendApiMocks: IBackendApiMock[] = [...workspaceApiMocks];
