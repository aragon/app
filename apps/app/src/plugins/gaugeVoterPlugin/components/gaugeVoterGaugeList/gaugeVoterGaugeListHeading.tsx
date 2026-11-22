import { useTranslations } from '@/shared/components/translationsProvider';

export const GaugeVoterGaugeListHeading = () => {
    const { t } = useTranslations();

    return (
        <div className="hidden gap-group px-inset-surface-wide py-inset-item-flat text-surface-secondary uppercase md:flex">
            <div className="min-w-0 grow basis-0">
                <p className="type-supporting--column-heading type-strong">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.name',
                    )}
                </p>
            </div>
            <div className="grow basis-0 text-right">
                <p className="type-supporting--column-heading type-strong">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.totalVotes',
                    )}
                </p>
            </div>
            <div className="grow basis-0 text-right">
                <p className="type-supporting--column-heading type-strong">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.yourVotes',
                    )}
                </p>
            </div>
            <div className="w-30 md:w-36">
                <p className="type-supporting--column-heading type-strong" />
            </div>
        </div>
    );
};
