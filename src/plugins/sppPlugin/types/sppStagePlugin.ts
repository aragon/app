import type { IDaoPlugin } from '@/shared/api/daoService';
import type { SppProposalType } from './enum';

export type ISppStagePlugin = ISppStagePluginInternal | ISppStagePluginExternal;

export interface ISppStagePluginInternal extends IDaoPlugin {
    /**
     * Type of the SPP stage plugin.
     */
    proposalType: SppProposalType;
}

export interface ISppStagePluginExternal {
    /**
     * Type of the SPP stage plugin.
     */
    proposalType: SppProposalType;
    /**
     * Address of the plugin.
     */
    address: string;
    /**
     * External plugins are identified by empty subdomain.
     */
    subdomain: undefined;
}
