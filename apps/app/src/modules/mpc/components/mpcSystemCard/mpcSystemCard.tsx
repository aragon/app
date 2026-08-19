'use client';

import { addressUtils, Card, Heading, Tag } from '@aragon/gov-ui-kit';
import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { mpcSystemPath } from '@/modules/mpc/constants/mpcConstants';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcSystemCardProps {
    /**
     * System to display.
     */
    system: IMpcSystem;
}

export const MpcSystemCard: React.FC<IMpcSystemCardProps> = (props) => {
    const { system } = props;
    const { t } = useTranslations();

    const statusVariant = system.status === 'active' ? 'success' : 'warning';

    return (
        <Link className="block" href={mpcSystemPath(system.id)}>
            <Card className="flex h-full flex-col gap-3 p-6 transition-shadow hover:shadow-neutral-md">
                <div className="flex items-start justify-between gap-3">
                    <Heading size="h3">{system.name}</Heading>
                    <Tag
                        label={t(
                            `app.mpc.mpcSystemCard.status.${system.status}`,
                        )}
                        variant={statusVariant}
                    />
                </div>
                {system.description && (
                    <p className="line-clamp-2 text-neutral-500 text-sm">
                        {system.description}
                    </p>
                )}
                <div className="flex flex-col gap-1 text-neutral-500 text-sm">
                    <span className="font-mono">
                        {system.address != null
                            ? addressUtils.truncateAddress(system.address)
                            : t('app.mpc.mpcSystemCard.noAddress')}
                    </span>
                    <span>
                        {t('app.mpc.mpcSystemCard.members', {
                            count: system.members.length,
                        })}
                        {' · '}
                        {t('app.mpc.mpcSystemCard.epoch', {
                            epoch: system.epoch,
                        })}
                    </span>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                    <Tag
                        label={t('app.mpc.mpcSystemCard.provider', {
                            provider: system.providerId,
                        })}
                        variant="warning"
                    />
                    <Tag
                        label={t('app.mpc.mpcSystemCard.threshold')}
                        variant="neutral"
                    />
                </div>
            </Card>
        </Link>
    );
};
