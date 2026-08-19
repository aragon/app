'use client';

import { Card, DefinitionList, Heading, Tag } from '@aragon/gov-ui-kit';
import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcShareStatusProps {
    /**
     * System to display the share status for.
     */
    system: IMpcSystem;
    /**
     * Whether the device share is stored in this browser (undefined while checking).
     */
    hasDeviceShare?: boolean;
}

/**
 * POC / mock: status of the three Shamir shares (device, server, recovery) of a system.
 */
export const MpcShareStatus: React.FC<IMpcShareStatusProps> = (props) => {
    const { system, hasDeviceShare } = props;
    const { t } = useTranslations();

    const deviceLabel =
        hasDeviceShare == null
            ? t('app.mpc.mpcShareStatus.device.checking')
            : hasDeviceShare
              ? t('app.mpc.mpcShareStatus.device.present')
              : t('app.mpc.mpcShareStatus.device.missing');
    const deviceVariant =
        hasDeviceShare == null
            ? 'neutral'
            : hasDeviceShare
              ? 'success'
              : 'critical';

    const recoveryLabel = system.recoveryAcknowledged
        ? t('app.mpc.mpcShareStatus.recovery.acknowledged')
        : t('app.mpc.mpcShareStatus.recovery.pending');

    return (
        <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-2">
                <Heading size="h3">{t('app.mpc.mpcShareStatus.title')}</Heading>
                <Tag
                    label={t('app.mpc.mpcShareStatus.scheme')}
                    variant="warning"
                />
            </div>
            <DefinitionList.Container>
                <DefinitionList.Item
                    description={t('app.mpc.mpcShareStatus.device.description')}
                    term={t('app.mpc.mpcShareStatus.device.term')}
                >
                    <Tag label={deviceLabel} variant={deviceVariant} />
                </DefinitionList.Item>
                <DefinitionList.Item
                    description={t('app.mpc.mpcShareStatus.server.description')}
                    term={t('app.mpc.mpcShareStatus.server.term')}
                >
                    <Tag
                        label={t('app.mpc.mpcShareStatus.server.epoch', {
                            epoch: system.epoch,
                        })}
                        variant={
                            system.status === 'active' ? 'info' : 'neutral'
                        }
                    />
                </DefinitionList.Item>
                <DefinitionList.Item
                    description={t(
                        'app.mpc.mpcShareStatus.recovery.description',
                    )}
                    term={t('app.mpc.mpcShareStatus.recovery.term')}
                >
                    <Tag
                        label={recoveryLabel}
                        variant={
                            system.recoveryAcknowledged ? 'success' : 'warning'
                        }
                    />
                </DefinitionList.Item>
            </DefinitionList.Container>
        </Card>
    );
};
