'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/gov-ui-kit';
import type { ITransactionListStatsProps } from './transactionListStats.api';

export const TransactionListStats: React.FC<ITransactionListStatsProps> = (props) => {
    const { dao, ...otherProps } = props;

    const { t } = useTranslations();

    const subDaoCount = dao.plugins.filter((plugin) => plugin.isSubPlugin).length;
    const bodyCount = dao.plugins.filter((plugin) => plugin.isBody).length;

    return (
        <DefinitionList.Container {...otherProps}>
            <DefinitionList.Item term={t('app.finance.transactionListStats.bodies')}>
                <p className="text-neutral-500">{bodyCount}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.finance.transactionListStats.subDaos')}>
                <p className="text-neutral-500">{subDaoCount}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.finance.transactionListStats.note')}>
                <p className="text-sm text-neutral-500">{t('app.finance.transactionListStats.aggregateNote')}</p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
