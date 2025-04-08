import type { IDao } from '@/shared/api/daoService';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';
import { IPluginSetupData } from '@/shared/utils/pluginTransactionUtils';

export interface IPrepareProcessMetadata {
    /**
     * Metadata CID of all process plugins ordered by stage and order of body inside the stage.
     */
    plugins: string[];
    /**
     * Metadata CID for the processor plugin (e.g. SPP), only set for advanced governance processes.
     */
    processor?: string;
}

export interface IBuildTransactionParams {
    /**
     * Values of the create-process form.
     */
    values: ICreateProcessFormData;
    /**
     * Metadata structure for the process.
     */
    processMetadata: IPrepareProcessMetadata;
    /**
     * DAO to install the plugins to.
     */
    dao: IDao;
}

export interface IBuildPrepareInstallPluginsActionParams {
    /**
     * Values of the create-process form.
     */
    values: ICreateProcessFormData;
    /**
     * DAO to install the plugins to.
     */
    dao: IDao;
    /**
     * Metadata CID of all the plugins.
     */
    pluginsMetadata: string[];
}

export interface IBuildPrepareInstallPluginActionParams extends Omit<IBuildPreparePluginInstallDataParams, 'metadata'> {
    /**
     * Metadata CID of the plugin.
     */
    metadataCid: string;
}

export interface IBuildProcessProposalActionsParams {
    /**
     * Create-process form values.
     */
    values: ICreateProcessFormData;
    /**
     * DAO to install the plugins for.
     */
    dao: IDao;
    /**
     * Address list of the plugins to be installed.
     */
    setupData: IPluginSetupData[];
}
