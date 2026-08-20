import type {
    IWorkspaceDetails,
    IWorkspaceGate,
    IWorkspaceTarget,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceGovernedAccountTypes } from '../../constants/workspaceHolderType';
import type { IWorkspaceAccount, IWorkspaceSignals } from '../../types';

class WorkspaceUtils {
    /**
     * Returns the number of distinct function selectors protected by the given gates. Selectors are
     * deduplicated because one account can hold several gates covering the same function.
     */
    getGatesCapabilityCount = (gates: IWorkspaceGate[]): number =>
        new Set(
            gates.flatMap((gate) =>
                gate.selectors.map((selector) => selector.selector),
            ),
        ).size;

    /**
     * Returns the number of distinct function selectors gated on the given target.
     */
    getTargetCapabilityCount = (target: IWorkspaceTarget): number =>
        this.getGatesCapabilityCount(target.gates);

    /**
     * Inverts the target-centric workspace payload into the account-centric view, sorted by the
     * number of capabilities each account controls. The backend only exposes accounts as gate
     * holders, so the account list is derived on the client.
     */
    getAccounts = (workspace: IWorkspaceDetails): IWorkspaceAccount[] => {
        const accountIndex = new Map<
            string,
            {
                address: string;
                type: WorkspaceAccountType;
                ref: string | null;
                targets: Map<
                    string,
                    { address: string; gates: IWorkspaceGate[] }
                >;
            }
        >();

        for (const target of workspace.targets) {
            for (const gate of target.gates) {
                for (const holder of gate.holders) {
                    const accountKey = holder.address.toLowerCase();
                    const account = accountIndex.get(accountKey) ?? {
                        address: holder.address,
                        type: holder.type,
                        ref: holder.ref,
                        targets: new Map(),
                    };

                    const targetKey = target.address.toLowerCase();
                    const accountTarget = account.targets.get(targetKey) ?? {
                        address: target.address,
                        gates: [],
                    };
                    accountTarget.gates.push(gate);

                    account.targets.set(targetKey, accountTarget);
                    accountIndex.set(accountKey, account);
                }
            }
        }

        const accounts = Array.from(accountIndex.values()).map((account) => {
            const targets = Array.from(account.targets.values()).map(
                (target) => ({
                    address: target.address,
                    gates: target.gates,
                    capabilityCount: this.getGatesCapabilityCount(target.gates),
                }),
            );

            return {
                address: account.address,
                type: account.type,
                ref: account.ref,
                targets,
                gateCount: targets.reduce(
                    (total, target) => total + target.gates.length,
                    0,
                ),
                capabilityCount: targets.reduce(
                    (total, target) => total + target.capabilityCount,
                    0,
                ),
            };
        });

        return accounts.sort(
            (current, next) =>
                next.capabilityCount - current.capabilityCount ||
                current.address.localeCompare(next.address),
        );
    };

    /**
     * Returns the findings worth surfacing beside the workspace, e.g. ownership transfers in flight
     * or gates held by accounts that are not DAOs.
     */
    getSignals = (workspace: IWorkspaceDetails): IWorkspaceSignals => {
        const gates = workspace.targets.flatMap((target) => target.gates);

        return {
            pendingOwnerTargets: workspace.targets
                .filter((target) => target.pendingOwner != null)
                .map((target) => target.address),
            delegatedAuthorityTargets: workspace.targets
                .filter((target) => target.authority != null)
                .map((target) => target.address),
            failedTargets: workspace.targets
                .filter((target) => target.error != null)
                .map((target) => target.address),
            unclaimedGateTargets: workspace.targets
                .filter((target) =>
                    target.gates.some((gate) => gate.holders.length === 0),
                )
                .map((target) => target.address),
            externalAccounts: this.getAccounts(workspace)
                .filter(
                    (account) =>
                        !workspaceGovernedAccountTypes.includes(account.type),
                )
                .map((account) => account.address),
            inferredGateCount: gates.filter((gate) => gate.inferred).length,
        };
    };
}

export const workspaceUtils = new WorkspaceUtils();
