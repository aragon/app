import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';

export interface IUseGovernanceSettingsParams<TSettings = unknown> {
    /**
     * ID of the DAO to parse the settings for.
     */
    daoId: string;
    /**
     * Address of the DAO plugin to display the settings for.
     */
    pluginAddress: string;
    /**
     * Plugin-specific settings object to be parsed.
     */
    settings: TSettings;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
    /**
     * The decision these settings are read for, when they are shown on one proposal's body rather
     * than as the DAO's standing configuration. Native bodies get their snapshot from the indexed
     * sub-proposal's own `settings`; a body whose configuration is only readable live needs the
     * decision itself to recover what applied to it.
     */
    proposal?: ISppProposal;
    /**
     * Stage the body is set up on, paired with `proposal`.
     */
    stage?: ISppStage;
}
