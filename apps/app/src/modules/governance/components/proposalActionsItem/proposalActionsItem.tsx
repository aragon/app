'use client';

import {
    type IProposalAction as IGukProposalAction,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import type { IProposalActionData } from '../createProposalForm';

export interface IProposalActionsItemProps {
    /**
     * Action to render.
     */
    action: IGukProposalAction;
    /**
     * ID of the DAO that owns the action.
     */
    daoId: string;
    /**
     * Chain ID for blockchain RPC calls.
     */
    chainId?: number;
    /**
     * Index of the action inside `ProposalActions.Container`. Injected by the Container via `cloneElement`, forwarded
     * to the underlying `ProposalActions.Item`.
     */
    index?: number;
}

export const ProposalActionsItem: React.FC<IProposalActionsItemProps> = (
    props,
) => {
    const { action, daoId, chainId, index } = props;

    const fnSelector = proposalActionUtils.actionToFunctionSelector(action);

    const customActionView =
        actionViewRegistry.getViewBySelector(fnSelector) ??
        actionViewRegistry.getViewByActionType(action.type);

    return customActionView ? (
        <ProposalActions.Item<IProposalActionData>
            action={{ ...action, daoId } as IProposalActionData}
            actionFunctionSelector={fnSelector}
            CustomComponent={customActionView.componentDetails}
            chainId={chainId}
            index={index}
            readOnly={true}
        />
    ) : (
        <ProposalActions.Item
            action={action}
            actionFunctionSelector={fnSelector}
            chainId={chainId}
            index={index}
            readOnly={true}
        />
    );
};
