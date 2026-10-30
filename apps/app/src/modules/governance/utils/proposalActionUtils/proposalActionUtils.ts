import {
    addressUtils,
    type IProposalAction as IGukProposalAction,
    ProposalActionTypeNoBasicView,
} from '@aragon/gov-ui-kit';
import { type AbiStateMutability, type Hex, toFunctionSelector } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { INormalizeActionsParams, IRawActionTuple } from '../../types';

class ProposalActionUtils {
    /**
     * Parses the decoded value of an `Action[]` parameter (e.g. the `_actions` parameter of `createProposal`/`execute`)
     * into raw action tuples. The backend returns each entry as a positional `[to, value, data]` array; object entries
     * (`{ to, value, data }`) are accepted as well.
     * @param value - Decoded parameter value.
     * @returns The raw actions tuple, or an empty array when the value is not a list.
     */
    parseRawActionTuple = (value: unknown): IRawActionTuple[] => {
        if (!Array.isArray(value)) {
            return [];
        }

        return value.map((entry: unknown) => {
            if (Array.isArray(entry)) {
                const [to, actionValue, data] = entry as [
                    string,
                    string | number,
                    string,
                ];

                return { to, value: String(actionValue), data };
            }

            return entry as IRawActionTuple;
        });
    };

    /**
     * Builds raw-calldata stubs out of a raw actions tuple, used as a fallback view when the decoded actions are
     * missing or out of sync with the tuple.
     * @param tuple - The raw actions tuple.
     * @param from - Sender attributed to the stubs, when known.
     */
    buildRawActionStubs = (
        tuple: IRawActionTuple[],
        from = '',
    ): IProposalAction[] =>
        tuple.map((entry) => ({
            from,
            to: entry.to,
            data: entry.data,
            value: entry.value,
            type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
            inputData: null,
        }));

    /**
     * Compares two native-currency amounts written as strings, tolerating a difference in notation between the decoded
     * action and the calldata it was decoded from (hex vs decimal, leading zeros). Falls back to an exact comparison
     * when either side is not a number at all, so an unparseable amount counts as a mismatch rather than a match.
     * @param value - Amount of the decoded action.
     * @param otherValue - Amount carried by the raw tuple.
     * @returns True when both amounts are the same.
     */
    isSameActionValue = (value: string, otherValue: string): boolean => {
        try {
            return BigInt(value) === BigInt(otherValue);
        } catch {
            return value === otherValue;
        }
    };

    /**
     * Checks that the function a decoded action describes in `inputData` is the one its calldata selects. The views
     * render `inputData`, not the calldata, so a decode naming another function must not pass as the call. Actions
     * without decoded data and native transfers carry no selector to compare.
     * @param action - The decoded action.
     * @returns True when the decoded function matches the calldata selector, or there is none to compare.
     */
    isSameSelector = (action: IProposalAction): boolean => {
        try {
            const selector = this.actionToFunctionSelector(action);

            return (
                selector == null ||
                selector.toLowerCase() ===
                    action.data.slice(0, 10).toLowerCase()
            );
        } catch {
            return false;
        }
    };

    /**
     * Checks that a decoded action describes the same call as the raw tuple entry it was decoded from. The two come
     * from different sources - the backend decodes the action, the app reads the tuple out of the calldata - so
     * addresses and calldata are compared case-insensitively and the value numerically. The decoded function must
     * also be the one the calldata selects, since the views render the decoded data rather than the calldata.
     * @param action - The decoded action.
     * @param rawEntry - The raw tuple entry at the same position.
     * @returns True when the action matches the tuple entry.
     */
    isSameAction = (
        action: IProposalAction,
        rawEntry: IRawActionTuple,
    ): boolean =>
        addressUtils.isAddressEqual(action.to, rawEntry.to) &&
        action.data.toLowerCase() === rawEntry.data.toLowerCase() &&
        this.isSameActionValue(action.value, rawEntry.value) &&
        this.isSameSelector(action);

    /**
     * Resolves the decoded actions to render against the raw tuple read from the calldata, falling back to raw-calldata
     * stubs when the decoded actions do not describe the same calls. Matching the count alone is not enough: the tuple
     * is what actually executes, so a decoded action that names a different target, value or calldata must never be
     * shown in its place.
     * @param actions - The decoded actions.
     * @param rawActions - The raw tuple, undefined when the source provides none.
     * @param from - Sender attributed to the raw stubs.
     * @returns The decoded actions when they match the tuple, the raw stubs otherwise.
     */
    resolveActions = (
        actions: IProposalAction[],
        rawActions: IRawActionTuple[] | undefined,
        from = '',
    ): IProposalAction[] => {
        if (rawActions == null) {
            return actions;
        }

        const matchesRawTuple =
            actions.length === rawActions.length &&
            actions.every((action, index) =>
                this.isSameAction(action, rawActions[index]),
            );

        return matchesRawTuple
            ? actions
            : this.buildRawActionStubs(rawActions, from);
    };

    /**
     * Resolves the sub-actions of a wrapper action to render, falling back to raw-calldata stubs built from `rawTuple`
     * when the decoded `subActions` are missing or do not describe the same calls as the tuple.
     */
    resolveNestedActions = (
        subActions: IProposalAction[] | undefined,
        rawTuple: IRawActionTuple[],
    ): IProposalAction[] => this.resolveActions(subActions ?? [], rawTuple);

    /**
     * Normalizes the actions through every registered plugin normalization function.
     *
     * The normalization functions are hooks (e.g. `useMultisigNormalizeActions`), so this must be called on every
     * render of the calling component, before any early return — otherwise the hook count changes between renders.
     */
    normalizeActions = (
        actions: IProposalAction[],
        daoId: string,
    ): IGukProposalAction[] => {
        // Use all registered normalization functions to make sure we render the native action correctly even if a DAO
        // does not have the related plugin (e.g. a Multisig DAO updating the settings of a Token-based DAO)
        const normalizeFunctions = pluginRegistryUtils.getSlotFunctions<
            INormalizeActionsParams,
            IProposalAction[]
        >(GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS);

        return normalizeFunctions.reduce(
            (current, normalizeFunction) =>
                normalizeFunction({ actions: current, daoId }),
            actions,
        );
    };

    actionToFunctionSelector = (action: IProposalAction): Hex | undefined => {
        const { inputData, data } = action;

        if (inputData == null) {
            return;
        }

        const {
            function: actionFunction,
            parameters,
            stateMutability,
        } = inputData;

        // Parameters might be undefined at runtime despite type definitions
        const actionParameters = parameters as typeof parameters | undefined;
        if (!actionParameters) {
            return;
        }

        // A native transfer is built with empty calldata and no parameters, and has no
        // selector to show. A call whose parameters are not filled in yet also has empty
        // calldata, but its selector comes from the ABI, not the calldata, and the action
        // view registry needs it before anything is encoded.
        const isNativeTransfer = data === '0x' && actionParameters.length === 0;

        if (isNativeTransfer) {
            return;
        }

        const functionSelector = toFunctionSelector({
            type: 'function',
            name: actionFunction,
            inputs: actionParameters,
            outputs: [],
            stateMutability: stateMutability as AbiStateMutability,
        });

        return functionSelector;
    };
}

export const proposalActionUtils = new ProposalActionUtils();
