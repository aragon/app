import { useDao } from '@/shared/api/daoService';
import { AutocompleteInput, type IAutocompleteInputProps } from '@/shared/components/forms/autocompleteInput';
import { addressUtils, IconType } from '@aragon/ods';
import { forwardRef, useMemo } from 'react';
import { type IProposalAction, ProposalActionType } from '../../api/governanceService';
import { defaultMetadataAction, defaultTransferAction } from './actionComposerDefinitions';

export interface IActionComposerProps
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (action: IProposalAction) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { daoId, onActionSelected, ...otherProps } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const handleActionSelected = (itemId: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected?.(action.defaultValue);
    };

    const defaultMetadaAction = useMemo(() => {
        const { avatar, name, description, links } = dao!;
        // TODO: updates types to make logo optional
        const existingMetadata = { logo: avatar!, name, description, links };

        return {
            to: dao!.address,
            existingMetadata,
            proposedMetadata: existingMetadata,
            ...defaultMetadataAction,
        };
    }, [dao]);

    const groups = [
        {
            id: 'osx-actions',
            name: 'DAO',
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
    ];

    const items = [
        {
            id: ProposalActionType.TRANSFER,
            name: 'Transfer',
            icon: IconType.APP_TRANSACTIONS,
            defaultValue: defaultTransferAction,
        },
        {
            id: ProposalActionType.METADATA_UPDATE,
            name: 'Set metadata',
            icon: IconType.SETTINGS,
            groupId: 'osx-actions',
            defaultValue: defaultMetadaAction,
        },
    ];

    return (
        <AutocompleteInput
            items={items}
            groups={groups}
            selectItemLabel="Add action"
            placeholder="Filter by action, contract name or address"
            ref={ref}
            onChange={handleActionSelected}
            {...otherProps}
        />
    );
});

ActionComposer.displayName = 'ActionComposer';
