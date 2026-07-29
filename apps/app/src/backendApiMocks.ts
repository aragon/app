import { permissionsMocks } from './modules/settings/constants/permissionsMocks';
import { crossChainControllerMocks } from './plugins/crossChainControllerPlugin/constants/crossChainControllerMocks';
import type { IBackendApiMock } from './shared/types';

export const backendApiMocks: IBackendApiMock[] = [
    ...permissionsMocks,
    ...crossChainControllerMocks,
];
