import { ILinkProps } from '@aragon/gov-ui-kit';

export interface IDaoSettingTermAndDefinition {
    /**
     * The term of the setting.
     */
    term: string;
    /**
     * The definition of the setting.
     */
    definition: string;
    /**
     * The link for the setting.
     */
    link?: ILinkProps;
}
