import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';

export const useMultisigMemberStats = (): IPageHeaderStat[] => {
    const { t } = useTranslations();

    return [
        {
            // TODO: Display real last activity date (APP-3405)
            label: t('app.governance.plugins.multisig.multisigMemberStats.latestActivity'),
            value: 3,
            suffix: 'days ago',
        },
    ];
};
