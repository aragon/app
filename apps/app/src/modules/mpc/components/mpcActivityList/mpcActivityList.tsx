'use client';

import { DataList, DateFormat, formatterUtils, Tag } from '@aragon/gov-ui-kit';
import { useMpcActivity } from '@/modules/mpc/api/mpcService';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcActivityListProps {
    /**
     * ID of the system.
     */
    systemId: string;
}

export const MpcActivityList: React.FC<IMpcActivityListProps> = (props) => {
    const { systemId } = props;
    const { t } = useTranslations();

    const { data, isLoading, isError } = useMpcActivity({
        urlParams: { systemId },
    });

    const state = isLoading ? 'initialLoading' : isError ? 'error' : 'idle';

    return (
        <DataList.Root
            entityLabel={t('app.mpc.mpcActivityList.entity')}
            itemsCount={data?.length}
            state={state}
        >
            <DataList.Container
                emptyState={{
                    heading: t('app.mpc.mpcActivityList.empty.heading'),
                    description: t('app.mpc.mpcActivityList.empty.description'),
                    objectIllustration: { object: 'ARCHIVE' },
                }}
                errorState={{
                    heading: t('app.mpc.mpcActivityList.error.heading'),
                    description: t('app.mpc.mpcActivityList.error.description'),
                    objectIllustration: { object: 'ERROR' },
                }}
            >
                {data?.map((entry) => (
                    <DataList.Item
                        className="flex flex-col gap-2"
                        key={entry.id}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Tag
                                label={t(
                                    `app.mpc.mpcActivityList.type.${entry.type}`,
                                )}
                                variant={
                                    entry.type.includes('failed') ||
                                    entry.type.includes('rejected')
                                        ? 'critical'
                                        : entry.type === 'share_released' ||
                                            entry.type === 'key_exported'
                                          ? 'warning'
                                          : 'neutral'
                                }
                            />
                            <span className="text-neutral-500 text-sm">
                                {formatterUtils.formatDate(entry.at, {
                                    format: DateFormat.RELATIVE,
                                }) ?? entry.at}
                            </span>
                        </div>
                        <p className="text-neutral-800 text-sm">
                            {t('app.mpc.mpcActivityList.actor', {
                                actor: entry.actor,
                            })}
                        </p>
                        {entry.data != null &&
                            Object.keys(entry.data).length > 0 && (
                                <pre className="overflow-x-auto rounded-lg bg-neutral-50 p-2 font-mono text-neutral-500 text-xs">
                                    {JSON.stringify(entry.data)}
                                </pre>
                            )}
                    </DataList.Item>
                ))}
            </DataList.Container>
        </DataList.Root>
    );
};
