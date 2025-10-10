import { useTranslations } from '@/shared/components/translationsProvider';

export const GaugeVoterGaugeListHeading = () => {
    const { t } = useTranslations();

    return (
        <div className="flex gap-4 px-6 py-3 text-neutral-500 uppercase">
            <div className="min-w-0 grow basis-0">
                <p className="text-sm font-semibold tracking-wider">
                    {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.name')}
                </p>
            </div>
            <div className="grow basis-0 text-right">
                <p className="text-sm font-semibold tracking-wider">
                    {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.totalVotes')}
                </p>
            </div>
            <div className="grow basis-0 text-right">
                <p className="text-sm font-semibold tracking-wider">
                    {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.yourVotes')}
                </p>
            </div>
            <div className="w-30 md:w-36">
                <p className="text-sm font-semibold tracking-wider" />
            </div>
        </div>
    );
};
