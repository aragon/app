import { AutocompleteInput, type IAutocompleteInputProps } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IconType } from '@aragon/gov-ui-kit';
import { forwardRef } from 'react';
import { type IProposalAction } from '../../api/governanceService';

export interface IActionComposerProps
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (action: IProposalAction) => void;
    /**
     * All action items, both plugin specific and plugin agnostic.
     */
    items: Array<{ id: string; name: string; icon: IconType; defaultValue: IProposalAction }>;
    /**
     * All action groups, both plugin specific and plugin agnostic.
     */
    groups: Array<{ id: string; name: string; info: string; indexData: string[] }>;
}

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { onActionSelected, items, groups, ...otherProps } = props;

    const { t } = useTranslations();

    const handleActionSelected = (itemId: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected?.(action.defaultValue);
    };

    return (
        <AutocompleteInput
            items={items}
            groups={groups}
            selectItemLabel={t('app.governance.actionComposer.selectItem')}
            placeholder={t('app.governance.actionComposer.placeholder')}
            ref={ref}
            onChange={handleActionSelected}
            {...otherProps}
        />
    );
});

ActionComposer.displayName = 'ActionComposer';
