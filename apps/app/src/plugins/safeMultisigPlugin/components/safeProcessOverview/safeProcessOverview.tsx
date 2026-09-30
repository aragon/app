'use client';

import { Button, Card, IconType } from '@aragon/gov-ui-kit';
import Image from 'next/image';
import safeWallet from '@/assets/images/safeWallet.png';
import { safeAppAccountUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';

/** Transaction destination for a Safe process; Safe transactions are not indexed Aragon proposals. */
export interface ISafeProcessOverviewProps {
    plugin: IDaoPlugin;
    initialParams: { queryParams: { daoId: string } };
}

export const SafeProcessOverview: React.FC<ISafeProcessOverviewProps> = ({
    plugin,
    initialParams,
}) => {
    const { t } = useTranslations();
    const { network } = daoUtils.parseDaoId(initialParams.queryParams.daoId);
    const href = safeAppAccountUrl({ network, address: plugin.address });

    return (
        <Card className="flex flex-col items-start gap-4 p-6">
            <div className="flex items-center gap-3">
                <Image alt="Safe" height={32} src={safeWallet} width={32} />
                <h2 className="text-lg text-neutral-800">
                    {t(
                        'app.plugins.safeMultisig.safeProcess.transactionsTitle',
                    )}
                </h2>
            </div>
            <p className="text-neutral-500">
                {t(
                    'app.plugins.safeMultisig.safeProcess.transactionsDescription',
                )}
            </p>
            {href != null && (
                <Button
                    href={href}
                    iconRight={IconType.LINK_EXTERNAL}
                    target="_blank"
                    variant="tertiary"
                >
                    {t('app.plugins.safeMultisig.safeProcess.viewInSafe')}
                </Button>
            )}
        </Card>
    );
};
