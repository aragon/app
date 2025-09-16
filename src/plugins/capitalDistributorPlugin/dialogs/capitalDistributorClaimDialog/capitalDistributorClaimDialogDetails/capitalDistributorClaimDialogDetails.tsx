import { CampaignStatus, type ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import type { ICapitalDistributorPlugin } from '@/plugins/capitalDistributorPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AlertInline,
    Card,
    Checkbox,
    DateFormat,
    formatterUtils,
    Heading,
    Link,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { formatUnits } from 'viem';
import type { ICapitalDistributorClaimDialogForm } from '../capitalDistributorClaimDialogDefinitions';
import { CapitalDistributorClaimDialogDetailsInfo } from './capitalDistributorClaimDialogDetailsInfo';

export interface ICapitalDistributorClaimDialogDetailsProps {
    /**
     * Campaign to display the details for.
     */
    campaign: ICampaign;
    /**
     * Capital distributor plugin.
     */
    plugin: ICapitalDistributorPlugin;
}

export const CapitalDistributorClaimDialogDetails: React.FC<ICapitalDistributorClaimDialogDetailsProps> = (props) => {
    const { campaign, plugin } = props;
    const { resources, type, token, userData, endTime } = campaign;
    const { totalAmount, totalClaimed, status } = userData;

    const { t } = useTranslations();
    const { formState } = useFormContext();

    const {
        value: termsConditionsAccepted,
        onChange: onTermsConditionsAcceptedChange,
        label: termsConditionsAcceptedLabel,
        ...termsConditionsAcceptedField
    } = useFormField<ICapitalDistributorClaimDialogForm, 'termsConditionsAccepted'>('termsConditionsAccepted', {
        label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.termsConditionsAccepted.label'),
        rules: { required: plugin.termsConditionsUrl != null },
        defaultValue: false,
    });

    const amount = status === CampaignStatus.CLAIMED ? totalClaimed : totalAmount;
    const parsedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })!;

    const claimValue = Number(parsedAmount) * Number(token.priceUsd);
    const formattedClaimValue = formatterUtils.formatNumber(claimValue, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const formattedTimeLeft = formatterUtils.formatDate(endTime * 1000, { format: DateFormat.DURATION });
    const formattedDeadline = formatterUtils.formatDate(endTime * 1000, { format: DateFormat.YEAR_MONTH_DAY_TIME });

    const claimableLabel = t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.claimable');
    const timeLeftValue = t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.timeLeft', {
        time: formattedTimeLeft,
    });

    const amountDetails = [
        { label: 'amount', value: `${formattedAmount} ${token.symbol}`, token },
        { label: 'value', value: formattedClaimValue },
    ];
    const metaDetails = [
        { label: 'type', value: type },
        { label: 'status', value: claimableLabel },
    ];
    const timeDetails = [
        { label: 'claimable', value: timeLeftValue },
        { label: 'deadline', value: formattedDeadline },
    ];

    const completeDetails = endTime !== 0 ? [amountDetails, metaDetails, timeDetails] : [amountDetails, metaDetails];
    const displayTermsConditionAlert =
        formState.isSubmitted && plugin.termsConditionsUrl != null && !termsConditionsAccepted;

    return (
        <div className="flex grow flex-col gap-4">
            <Card className="flex grow flex-col gap-3 border border-neutral-100 p-6">
                {completeDetails.map((detailsGroup, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-row">
                            {detailsGroup.map((details) => (
                                <CapitalDistributorClaimDialogDetailsInfo key={details.label} info={details} />
                            ))}
                        </div>
                        {index !== completeDetails.length - 1 && <div className="h-[1px] w-full bg-neutral-100" />}
                    </React.Fragment>
                ))}
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
            {plugin.termsConditionsUrl != null && (
                <div className="flex flex-row gap-1">
                    <Checkbox
                        checked={termsConditionsAccepted}
                        label={termsConditionsAcceptedLabel as string}
                        onCheckedChange={onTermsConditionsAcceptedChange}
                        {...termsConditionsAcceptedField}
                    />
                    <Link href={plugin.termsConditionsUrl} isExternal={true}>
                        {t(
                            'app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.termsConditionsAccepted.link',
                        )}
                    </Link>
                </div>
            )}
            {displayTermsConditionAlert && (
                <AlertInline
                    message={t(
                        'app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.termsConditionsAccepted.error',
                    )}
                    variant="critical"
                />
            )}
        </div>
    );
};
