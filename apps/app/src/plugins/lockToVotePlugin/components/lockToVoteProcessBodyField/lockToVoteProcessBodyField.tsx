'use client';

import {
    ChainEntityType,
    DefinitionList,
    formatterUtils,
    NumberFormat,
    Tag,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type {
    ISetupBodyFormExisting,
    ISetupBodyFormNew,
} from '@/modules/createDao/dialogs/setupBodyDialog';
import { BodyType } from '@/modules/createDao/types/enum';
import { useMemberList } from '@/modules/governance/api/governanceService';
import type {
    ITokenSetupMembershipForm,
    ITokenSetupMembershipMember,
} from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { useTokenTotalSupply } from '@/shared/hooks/useTokenTotalSupply';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { DaoLockToVoteVotingMode } from '../../types';
import { lockToVoteSettingsUtils } from '../../utils/lockToVoteSettingsUtils';
import type { ILockToVoteSetupGovernanceForm } from '../lockToVoteSetupGovernance/lockToVoteSetupGovernance.api';

export interface ILockToVoteProcessBodyFieldProps {
    /**
     * The field from the create process form.
     */
    body:
        | ISetupBodyFormNew<
              ILockToVoteSetupGovernanceForm,
              ITokenSetupMembershipMember,
              ITokenSetupMembershipForm
          >
        | ISetupBodyFormExisting<
              ILockToVoteSetupGovernanceForm,
              ITokenSetupMembershipMember,
              ITokenSetupMembershipForm
          >;
    /**
     * Displays / hides some of the token-voting governance settings depending on the process governance type.
     */
    isAdvancedGovernance?: boolean;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const LockToVoteProcessBodyField = (
    props: ILockToVoteProcessBodyFieldProps,
) => {
    const { body, isAdvancedGovernance, daoId, readOnly } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { buildEntityUrl, chainId } = useDaoChain({ network: dao?.network });

    const { membership, governance } = body;

    const initialParams = {
        queryParams: {
            daoId,
            pluginAddress: body.type === BodyType.EXISTING ? body.address : '',
        },
    };
    const { data: memberList } = useMemberList(initialParams, {
        enabled: body.type === BodyType.EXISTING,
    });

    const {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
    } = membership.token;

    const { data: totalSupply, isLoading: isTotalSupplyLoading } =
        useTokenTotalSupply({
            chainId,
            address: tokenAddress,
        });

    const { votingMode, supportThreshold, minParticipation, minDuration } =
        governance;

    const parsedTotalSupply =
        totalSupply != null
            ? formatUnits(bigIntUtils.safeParse(totalSupply), tokenDecimals)
            : undefined;
    const formattedSupply = formatterUtils.formatNumber(parsedTotalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
        fallback: '0',
    });

    const {
        minParticipationToken,
        formattedMinParticipation,
        formattedMinParticipationToken,
    } = lockToVoteSettingsUtils.formatMinParticipation({
        minParticipationPercentage: minParticipation,
        totalSupply,
        decimals: tokenDecimals,
    });

    const voteChangeLabel =
        votingMode === DaoLockToVoteVotingMode.VOTE_REPLACEMENT
            ? 'enabled'
            : 'disabled';

    const proposalDurationObject = dateUtils.secondsToDuration(minDuration);
    const formattedMinDuration = t(
        'app.plugins.lockToVote.lockToVoteProcessBodyField.proposalDurationDefinition',
        proposalDurationObject,
    );

    const numberOfMembers = readOnly
        ? memberList?.pages[0].metadata.totalRecords
        : membership.members.length;

    const readOnlyTokenProps = {
        link: {
            href: buildEntityUrl({
                type: ChainEntityType.TOKEN,
                id: tokenAddress,
            }),
        },
        copyValue: tokenAddress,
        description: t(
            'app.plugins.lockToVote.lockToVoteProcessBodyField.tokenNameAndSymbol',
            {
                tokenName,
                tokenSymbol,
            },
        ),
    };

    const contractInfo = useDaoPluginInfo({
        daoId,
        address: body.type === BodyType.EXISTING ? body.address : '',
    });

    return (
        <DefinitionList.Container className="w-full">
            {readOnly &&
                contractInfo.map(
                    ({ term, definition, description, link, copyValue }) => (
                        <DefinitionList.Item
                            copyValue={copyValue}
                            description={description}
                            key={term}
                            link={link}
                            term={term}
                        >
                            {definition}
                        </DefinitionList.Item>
                    ),
                )}
            <DefinitionList.Item
                term={t(
                    'app.plugins.lockToVote.lockToVoteProcessBodyField.tokenTerm',
                )}
                {...(readOnly ? readOnlyTokenProps : {})}
            >
                {tokenName} (${tokenSymbol})
            </DefinitionList.Item>
            {numberOfMembers! > 0 && (
                <DefinitionList.Item
                    link={
                        readOnly
                            ? {
                                  href: daoUtils.getDaoUrl(dao, 'members'),
                                  isExternal: false,
                              }
                            : undefined
                    }
                    term={t(
                        'app.plugins.lockToVote.lockToVoteProcessBodyField.distributionTerm',
                    )}
                >
                    {t(
                        'app.plugins.lockToVote.lockToVoteProcessBodyField.holders',
                        {
                            count: numberOfMembers,
                        },
                    )}
                </DefinitionList.Item>
            )}

            <DefinitionList.Item
                term={t(
                    'app.plugins.lockToVote.lockToVoteProcessBodyField.supplyTerm',
                )}
            >
                {totalSupply != null && Number(totalSupply) > 0
                    ? `${formattedSupply} ($${tokenSymbol})`
                    : '-'}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.plugins.lockToVote.lockToVoteProcessBodyField.supportTerm',
                )}
            >
                {t(
                    'app.plugins.lockToVote.lockToVoteProcessBodyField.supportDefinition',
                    {
                        threshold: supportThreshold,
                    },
                )}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.plugins.lockToVote.lockToVoteProcessBodyField.minParticipationTerm',
                )}
            >
                {isTotalSupplyLoading
                    ? '-'
                    : minParticipationToken === 0
                      ? t(
                            'app.plugins.lockToVote.lockToVoteProcessBodyField.minParticipationDefinitionNoToken',
                            {
                                minParticipation: formattedMinParticipation,
                            },
                        )
                      : t(
                            'app.plugins.lockToVote.lockToVoteProcessBodyField.minParticipationDefinition',
                            {
                                minParticipation: formattedMinParticipation,
                                tokenValue: formattedMinParticipationToken,
                                tokenSymbol,
                            },
                        )}
            </DefinitionList.Item>
            {!isAdvancedGovernance && (
                <DefinitionList.Item
                    term={t(
                        'app.plugins.lockToVote.lockToVoteProcessBodyField.proposalDurationTerm',
                    )}
                >
                    {formattedMinDuration}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t(
                    'app.plugins.lockToVote.lockToVoteProcessBodyField.voteChange',
                )}
            >
                <Tag
                    className="max-w-fit"
                    label={t(
                        `app.plugins.lockToVote.lockToVoteProcessBodyField.${voteChangeLabel}`,
                    )}
                    variant={
                        voteChangeLabel === 'enabled' ? 'primary' : 'neutral'
                    }
                />
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
