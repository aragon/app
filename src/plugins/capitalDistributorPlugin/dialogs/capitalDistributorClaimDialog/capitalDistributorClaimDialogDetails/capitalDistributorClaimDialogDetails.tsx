import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { Card, DateFormat, formatterUtils, Heading, Link, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { CapitalDistributorClaimDialogDetailsInfo } from './capitalDistributorClaimDialogDetailsInfo';

export interface ICapitalDistributorClaimDialogDetailsProps {
    /**
     * Campaign to display the details for.
     */
    campaign: ICampaign;
}

export const CapitalDistributorClaimDialogDetails: React.FC<ICapitalDistributorClaimDialogDetailsProps> = (props) => {
    const { campaign } = props;
    const { resources, type, token, amount, endTime } = campaign;

    const { t } = useTranslations();

    const parsedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })!;

    const claimValue = Number(parsedAmount) * Number(token.priceUsd);
    const formattedClaimValue = formatterUtils.formatNumber(claimValue, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const formattedTimeLeft = formatterUtils.formatDate(endTime * 1000, { format: DateFormat.DURATION });
    const formattedDeadline = formatterUtils.formatDate(endTime * 1000, { format: DateFormat.YEAR_MONTH_DAY });

    return (
        <WizardDialog.Step id="overview" order={1} meta={{ name: '' }} className="flex flex-col gap-4">
            <Card className="flex grow flex-col gap-3 border border-neutral-100 p-6">
                <div className="flex flex-row">
                    <CapitalDistributorClaimDialogDetailsInfo
                        info={{
                            label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.amount'),
                            value: `${formattedAmount} ${token.symbol}`,
                        }}
                    />
                    <CapitalDistributorClaimDialogDetailsInfo
                        info={{
                            label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.value'),
                            value: formattedClaimValue,
                        }}
                    />
                </div>
                <div className="h-[1px] w-full bg-neutral-100" />
                <div className="flex flex-row">
                    <CapitalDistributorClaimDialogDetailsInfo
                        info={{
                            label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.type'),
                            value: type,
                        }}
                    />
                    <CapitalDistributorClaimDialogDetailsInfo
                        info={{
                            label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.status'),
                            value: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.claimable'),
                        }}
                    />
                </div>
                {endTime !== 0 && (
                    <>
                        <div className="h-[1px] w-full bg-neutral-100" />
                        <div className="flex flex-row">
                            <CapitalDistributorClaimDialogDetailsInfo
                                info={{
                                    label: t(
                                        'app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.claimable',
                                    ),
                                    value: t(
                                        'app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.timeLeft',
                                        { time: formattedTimeLeft },
                                    ),
                                }}
                            />
                            <CapitalDistributorClaimDialogDetailsInfo
                                info={{
                                    label: t(
                                        'app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.deadline',
                                    ),
                                    value: formattedDeadline,
                                }}
                            />
                        </div>
                    </>
                )}
            </Card>
            {resources != null && resources.length > 0 && (
                <Card className="flex flex-col gap-3 border border-neutral-100 p-6">
                    <Heading size="h4">
                        {t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.resources')}
                    </Heading>
                    <div className="flex flex-col gap-4">
                        {resources.map((resource) => (
                            <Link key={resource.url} href={resource.url} isExternal={true} showUrl={true}>
                                {resource.name}
                            </Link>
                        ))}
                    </div>
                </Card>
            )}
        </WizardDialog.Step>
    );
};
