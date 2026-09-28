import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ICrossChainControllerPluginSettings } from './crossChainControllerPluginSettings';

export interface ICrossChainControllerPlugin
    extends IDaoPlugin<ICrossChainControllerPluginSettings> {}
