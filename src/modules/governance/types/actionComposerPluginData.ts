import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { ComponentType } from 'react';
import type { IProposalAction } from '../api/governanceService';
import type { IActionComposerInputItem } from '../components/actionComposer';
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
    items: Array<IActionComposerInputItem<TMeta>>;
    /**
     * Custom action components.
     */
    components?: Record<string, ActionComposerPluginComponent<TMeta>>;
}
