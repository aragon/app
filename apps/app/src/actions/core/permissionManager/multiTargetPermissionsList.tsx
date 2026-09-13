'use client';

import {
    AddressOutput,
    addressUtils,
    Clipboard,
    type IProposalActionsDecoderParameterComponentProps,
    Tag,
    type TagVariant,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type IPermissionChange,
    PermissionOperation,
    permissionOperationUtils,
} from './permissionOperationUtils';

const copyPrefix =
    'app.governance.actionComposer.permissionManagerAction.multiTarget';

const operationCopy: Record<
    PermissionOperation,
    { key: string; variant: TagVariant }
> = {
    [PermissionOperation.GRANT]: { key: 'grant', variant: 'success' },
    [PermissionOperation.REVOKE]: { key: 'revoke', variant: 'critical' },
    [PermissionOperation.GRANT_WITH_CONDITION]: {
        key: 'grantWithCondition',
        variant: 'warning',
    },
};

/** Turns an address into the name the app already knows, or a truncated address. */
type ResolveAddress = (address: string) => string;

const PermissionChangeRow: React.FC<{
    change: IPermissionChange;
    resolveAddress: ResolveAddress;
}> = ({ change, resolveAddress }) => {
    const { t } = useTranslations();
    const operation =
        operationCopy[change.operation] ??
        operationCopy[PermissionOperation.GRANT];
    const isRevoke = change.operation === PermissionOperation.REVOKE;
    const isUnrecognised = change.permissionName == null;

    return (
        <li
            className={classNames(
                'flex flex-col gap-y-2 rounded-xl border p-4',
                change.condition
                    ? 'border-warning-300 bg-warning-100'
                    : 'border-neutral-100',
            )}
        >
            <div className="flex flex-row flex-wrap items-center gap-2">
                <Tag
                    className="uppercase"
                    label={t(
                        `app.governance.actionComposer.permissionManagerAction.operation.${operation.key}`,
                    )}
                    variant={operation.variant}
                />
                {/* The name is the meaning, the hash is the evidence: keep both, and keep
                    the hash copyable in full even though it renders truncated. */}
                <Clipboard copyValue={change.permissionId}>
                    <span
                        className={classNames('text-neutral-800', {
                            'font-mono': isUnrecognised,
                        })}
                    >
                        {change.permissionName ??
                            addressUtils.truncateHash(change.permissionId)}
                    </span>
                </Clipboard>
                {!isUnrecognised && (
                    <span className="font-mono text-neutral-400 text-sm">
                        {addressUtils.truncateHash(change.permissionId)}
                    </span>
                )}
                {isUnrecognised && (
                    <Tag
                        className="uppercase"
                        label={t(`${copyPrefix}.unrecognised`)}
                        variant="warning"
                    />
                )}
            </div>
            <div className="flex flex-row flex-wrap items-center gap-x-1.5 gap-y-1 text-neutral-500">
                <span>{t(`${copyPrefix}.${isRevoke ? 'from' : 'to'}`)}</span>
                <AddressOutput
                    address={change.who}
                    copy={true}
                    label={resolveAddress(change.who)}
                />
                <span>{t(`${copyPrefix}.on`)}</span>
                <AddressOutput
                    address={change.where}
                    copy={true}
                    label={resolveAddress(change.where)}
                />
                <span>
                    {change.condition
                        ? t(`${copyPrefix}.gatedBy`, {
                              condition: addressUtils.truncateAddress(
                                  change.condition,
                              ),
                          })
                        : ` · ${t(`${copyPrefix}.unconditional`)}`}
                    {isUnrecognised &&
                        ` · ${t(`${copyPrefix}.verifyUnrecognised`)}`}
                </span>
            </div>
        </li>
    );
};

/**
 * Renders the `_items` tuple array of `applyMultiTargetPermissions` as one card per
 * change instead of five disabled inputs per row. Entries are listed in calldata order
 * and never merged: the order is what executes, and a revoke followed by a re-grant is
 * two real operations even when they appear to cancel out.
 */
const PermissionChangesView: React.FC<{
    changes: IPermissionChange[];
    resolveAddress: ResolveAddress;
}> = ({ changes, resolveAddress }) => {
    const { t } = useTranslations();

    return (
        <div className="flex w-full flex-col gap-y-3">
            <div className="flex flex-col gap-y-1">
                <p className="font-semibold text-neutral-500 text-sm uppercase tracking-wide">
                    {t(`${copyPrefix}.heading`)}
                </p>
                <p className="text-neutral-800">
                    {t(`${copyPrefix}.summary`, { count: changes.length })}
                </p>
            </div>
            <ul className="flex w-full flex-col gap-y-2">
                {changes.map((change, index) => (
                    <PermissionChangeRow
                        change={change}
                        key={`${change.permissionId}-${change.who}-${index.toString()}`}
                        resolveAddress={resolveAddress}
                    />
                ))}
            </ul>
        </div>
    );
};

const truncateOnly: ResolveAddress = (address) =>
    addressUtils.truncateAddress(address);

/**
 * Resolving variant. Split out so the DAO plugins query only runs when a DAO context
 * exists — the same list renders in places that have none.
 */
const ResolvedPermissionChanges: React.FC<{
    changes: IPermissionChange[];
    daoId: string;
}> = ({ changes, daoId }) => {
    const { t } = useTranslations();
    const daoPlugins = useDaoPlugins({ daoId });
    const daoAddress = daoUtils.parseDaoId(daoId).address;

    const resolveAddress: ResolveAddress = (address) => {
        if (addressUtils.isAddressEqual(address, daoAddress)) {
            return t(`${copyPrefix}.thisDao`);
        }

        const plugin = daoPlugins?.find((item) =>
            addressUtils.isAddressEqual(item.meta.address, address),
        );

        return plugin
            ? daoUtils.getPluginName(plugin.meta)
            : addressUtils.truncateAddress(address);
    };

    return (
        <PermissionChangesView
            changes={changes}
            resolveAddress={resolveAddress}
        />
    );
};

export interface IMultiTargetPermissionsListProps
    extends IProposalActionsDecoderParameterComponentProps {
    /**
     * DAO the action belongs to. When set, addresses resolve to the DAO and its plugin
     * names instead of rendering as raw hex.
     */
    daoId?: string;
    /**
     * Target for actions that hoist it out of the rows, i.e. `applySingleTargetPermissions`.
     */
    fallbackWhere?: string;
}

export const MultiTargetPermissionsList: React.FC<
    IMultiTargetPermissionsListProps
> = ({ parameter, daoId, fallbackWhere }) => {
    const changes = permissionOperationUtils.getPermissionChanges(
        parameter,
        fallbackWhere,
    );

    return daoId ? (
        <ResolvedPermissionChanges changes={changes} daoId={daoId} />
    ) : (
        <PermissionChangesView
            changes={changes}
            resolveAddress={truncateOnly}
        />
    );
};
