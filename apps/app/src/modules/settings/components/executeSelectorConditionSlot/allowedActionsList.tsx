'use client';

import {
    AddressOutput,
    ChainEntityType,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IAllowedActionView } from './executeSelectorConditionSlotUtils';
import { EMPTY_ALLOWED_ACTION_VALUE } from './executeSelectorConditionSlotUtils';

export interface IAllowedActionsListProps {
    actions: IAllowedActionView[];
    chainId?: number;
}

export const AllowedActionsList: React.FC<IAllowedActionsListProps> = ({
    actions,
    chainId,
}) => {
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <div className="flex flex-col">
            {actions.map((action) => (
                <div
                    className="flex min-w-0 flex-col gap-tight border-b border-surface-secondary py-inset-item-flat first:pt-0 last:border-b-0 last:pb-0"
                    key={action.id}
                >
                    <div className="flex min-w-0 items-center gap-related--fixed-10 type-title-item--document-default">
                        <span className="truncate text-surface-primary">
                            {action.functionName ??
                                action.selector ??
                                t(
                                    'app.settings.executeSelectorConditionSlot.anySelector',
                                )}
                        </span>
                        {action.selector != null && (
                            <span className="shrink-0 text-surface-secondary">
                                {action.selector}
                            </span>
                        )}
                    </div>
                    <div className="flex min-w-0 items-center gap-related--fixed-10 type-supporting--body-size text-surface-secondary">
                        <span className="truncate">
                            {action.contractName ??
                                t(
                                    'app.settings.executeSelectorConditionSlot.unknownContract',
                                )}
                        </span>
                        {action.target === EMPTY_ALLOWED_ACTION_VALUE ? (
                            <span className="shrink-0">
                                {EMPTY_ALLOWED_ACTION_VALUE}
                            </span>
                        ) : (
                            <span className="w-fit shrink-0">
                                <AddressOutput
                                    address={action.target}
                                    href={buildEntityUrl({
                                        type: ChainEntityType.ADDRESS,
                                        id: action.target,
                                    })}
                                />
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
