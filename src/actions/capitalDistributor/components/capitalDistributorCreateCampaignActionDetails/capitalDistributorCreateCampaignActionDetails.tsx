'use client';

import {
    Avatar,
    addressUtils,
    ChainEntityType,
    Clipboard,
    DateFormat,
    DefinitionList,
    formatterUtils,
    type IProposalAction,
    type IProposalActionComponentProps,
    Link,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { formatUnits, type Hex, zeroAddress, zeroHash } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import {
    type TranslationFunction,
    useTranslations,
} from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useToken } from '@/shared/hooks/useToken';
import type { ICapitalDistributorActionCreateCampaign } from '../../types/capitalDistributorActionCreateCampaign';
import { capitalDistributorActionParser } from '../../utils/capitalDistributorActionParser';

export interface ICapitalDistributorCreateCampaignActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

const formatScheduleTime = (
    timestampSeconds: number,
    t: TranslationFunction,
): string => {
    if (timestampSeconds === 0) {
        return t(
            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.schedule.openEnded',
        );
    }

    const formatted = formatterUtils.formatDate(timestampSeconds * 1000, {
        format: DateFormat.YEAR_MONTH_DAY_TIME,
    });

    return formatted ?? '';
};

export const CapitalDistributorCreateCampaignActionDetails: React.FC<
    ICapitalDistributorCreateCampaignActionDetailsProps
> = (props) => {
    const { action } = props;

    const typedAction =
        action as unknown as ICapitalDistributorActionCreateCampaign;
    const { daoId, inputData } = typedAction;
    const { totalAmount, claimersCount, token, metadata } = inputData ?? {};

    // merkleRoot, actionEncoderId and the schedule times are never hydrated by
    // the backend, so they're always read from the decoded calldata; payoutToken
    // is read from here only when the backend couldn't resolve the token.
    const decodedInputData =
        capitalDistributorActionParser.parseCreateCampaignInputData(
            action.inputData?.parameters ?? [],
        );

    const payoutTokenAddress = token?.address ?? decodedInputData.payoutToken;
    const { merkleRoot, actionEncoderId, startTime, endTime } =
        decodedInputData;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { buildEntityUrl, chainId } = useDaoChain({ network: dao?.network });

    const payoutTokenLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: payoutTokenAddress,
    });

    const shouldReadTokenOnChain =
        token == null &&
        chainId != null &&
        addressUtils.isAddress(payoutTokenAddress) &&
        payoutTokenAddress !== zeroAddress;
    const { data: onChainToken } = useToken({
        address: payoutTokenAddress as Hex,
        chainId: chainId ?? 0,
        enabled: shouldReadTokenOnChain,
    });

    const tokenSymbol = token?.symbol ?? onChainToken?.symbol;

    const isVeLockEncoder =
        actionEncoderId !== zeroHash && actionEncoderId !== '0x';
    const payoutTypeKey = isVeLockEncoder
        ? 'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.payoutType.veLockEncoder'
        : 'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.payoutType.default';

    const parsedAmount =
        totalAmount && token
            ? formatUnits(BigInt(totalAmount), token.decimals)
            : null;
    const formattedAmount = parsedAmount
        ? formatterUtils.formatNumber(parsedAmount, {
              format: NumberFormat.TOKEN_AMOUNT_SHORT,
          })
        : null;
    const fiatValue =
        parsedAmount && token?.priceUsd
            ? Number(parsedAmount) * Number(token.priceUsd)
            : null;
    const formattedFiatValue =
        fiatValue != null
            ? formatterUtils.formatNumber(fiatValue, {
                  format: NumberFormat.FIAT_TOTAL_SHORT,
              })
            : null;

    const { title, description, resources } = metadata ?? {};

    return (
        <DefinitionList.Container>
            {title && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.titleTerm',
                    )}
                >
                    {title}
                </DefinitionList.Item>
            )}
            {description && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.descriptionTerm',
                    )}
                >
                    {description}
                </DefinitionList.Item>
            )}
            {resources && resources.length > 0 && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.resourcesTerm',
                    )}
                >
                    <div className="flex flex-col gap-3">
                        {resources.map((link) => (
                            <Link
                                href={link.url}
                                isExternal={true}
                                key={link.url}
                                showUrl={true}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </DefinitionList.Item>
            )}
            {formattedAmount && token && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.totalAmountTerm',
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Avatar size="sm" src={token.logo} />
                        <span>
                            {formattedAmount} {token.symbol}
                        </span>
                        {formattedFiatValue && (
                            <span className="text-neutral-500">
                                {formattedFiatValue}
                            </span>
                        )}
                    </div>
                </DefinitionList.Item>
            )}
            {claimersCount != null && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.claimersTerm',
                    )}
                >
                    {claimersCount}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                copyValue={payoutTokenAddress}
                link={{ href: payoutTokenLink }}
                term={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.assetTerm',
                )}
            >
                {tokenSymbol
                    ? `${tokenSymbol} (${addressUtils.truncateAddress(payoutTokenAddress)})`
                    : addressUtils.truncateAddress(payoutTokenAddress)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.payoutTypeTerm',
                )}
            >
                {t(payoutTypeKey)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.merkleRootTerm',
                )}
            >
                <Clipboard copyValue={merkleRoot}>
                    {addressUtils.truncateHash(merkleRoot)}
                </Clipboard>
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.startTimeTerm',
                )}
            >
                {formatScheduleTime(startTime, t)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionDetails.endTimeTerm',
                )}
            >
                {formatScheduleTime(endTime, t)}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
