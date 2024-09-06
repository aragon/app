import { useDao } from '@/shared/api/daoService';
import { AutocompleteInput, type IAutocompleteInputProps } from '@/shared/components/forms/autocompleteInput';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { addressUtils, IconType } from '@aragon/ods';
import { forwardRef } from 'react';
import { ProposalActionType } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IActionComposerProps extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel'> {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { daoId, ...otherProps } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const pluginIds = useDaoPluginIds(daoId);

    const test = useSlotFunction({
        pluginIds,
        slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_NATIVE_ACTIONS,
        params: {},
    });

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
        },
        {
            id: ProposalActionType.METADATA_UPDATE,
            name: 'Set metadata',
            icon: IconType.SETTINGS,
            groupId: 'osx-actions',
        },
    ];

    return (
        <AutocompleteInput
            items={items}
            groups={groups}
            selectItemLabel="Add action"
            placeholder="Filter by action, contract name or address"
            ref={ref}
            {...otherProps}
        />
    );
});

ActionComposer.displayName = 'ActionComposer';
