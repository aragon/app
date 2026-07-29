import { useTranslations } from '@/shared/components/translationsProvider';

export const GaugeVoterGaugeListHeading = () => {
    const { t } = useTranslations();

    return (
        <div className="hidden gap-4 px-6 py-3 text-neutral-500 uppercase md:flex">
            <div className="min-w-0 grow basis-0">
                <p className="font-semibold text-sm tracking-wider">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.name',
                    )}
                </p>
            </div>
            <div className="grow basis-0 text-right">
                <p className="font-semibold text-sm tracking-wider">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.totalVotes',
                    )}
                </p>
            </div>
            <div className="grow basis-0 text-right">
                <p className="font-semibold text-sm tracking-wider">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.yourVotes',
                    )}
                </p>
            </div>
            <div className="w-30 md:w-36">
                <p className="font-semibold text-sm tracking-wider" />
            </div>
        </div>
    );
};
