import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { ComponentType } from 'react';
import type { IProposalAction } from '../api/governanceService';
import type { IActionComposerItem } from '../components/actionComposer';
import type { IProposalActionData } from '../components/createProposalForm';

export type ActionComposerPluginComponent<TMeta = undefined> = ComponentType<
    IProposalActionComponentProps<IProposalActionData<IProposalAction, TMeta>>
>;

export interface IActionComposerPluginData<TMeta = undefined> {
    /**
     * Autocomplete groups for the actions.
     */
    groups: IAutocompleteInputGroup[];
    /**
     * Autocomplete action item.
     */
    items: Array<IActionComposerItem<TMeta>>;
    /**
     * Custom action components.
     */
    components: Record<string, ActionComposerPluginComponent<TMeta>>;
}
