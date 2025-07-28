'use client';

import {
    SetupBodyType,
    type ISetupBodyFormExisting,
    type ISetupBodyFormNew,
} from '@/modules/createDao/dialogs/setupBodyDialog';
import { useMemberList } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import {
    ChainEntityType,
    DefinitionList,
    formatterUtils,
    NumberFormat,
    Tag,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { DaoTokenVotingMode } from '../../types';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../tokenSetupMembership';

export interface ITokenProcessBodyFieldProps {
    /**
     * The field from the create process form.
     */
    body:
        | ISetupBodyFormNew<ITokenSetupGovernanceForm, ITokenSetupMembershipMember, ITokenSetupMembershipForm>
        | ISetupBodyFormExisting<ITokenSetupGovernanceForm, ITokenSetupMembershipMember, ITokenSetupMembershipForm>;
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

export const TokenProcessBodyField = (props: ITokenProcessBodyFieldProps) => {
    const { body, isAdvancedGovernance, daoId, readOnly } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const { membership, governance } = body;

    const initialParams = {
        queryParams: { daoId, pluginAddress: body.type === SetupBodyType.EXISTING ? body.address : '' },
    };
    const { data: memberList } = useMemberList(initialParams, { enabled: body.type === SetupBodyType.EXISTING });

    const {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        totalSupply,
    } = membership.token;
    const { votingMode, supportThreshold, minParticipation, minDuration } = governance;

    const parsedTotalSupply = formatUnits(BigInt(totalSupply), tokenDecimals);
    const formattedSupply = formatterUtils.formatNumber(parsedTotalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
        fallback: '0',
    });

    const voteChangeLabel = votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT ? 'enabled' : 'disabled';
    const earlyExecutionLabel = votingMode === DaoTokenVotingMode.EARLY_EXECUTION ? 'enabled' : 'disabled';

    const minDurationObject = dateUtils.secondsToDuration(minDuration);
    const formattedMinDuration = t('app.plugins.token.tokenProcessBodyField.minDurationDefinition', minDurationObject);

    const numberOfMembers = readOnly ? memberList?.pages[0].metadata.totalRecords : membership.members.length;

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[dao!.network].id });

    const readOnlyTokenProps = {
        link: {
            href: buildEntityUrl({ type: ChainEntityType.TOKEN, id: tokenAddress }),
        },
        copyValue: tokenAddress,
        description: t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
        }),
    };

    const contractInfo = useDaoPluginInfo({ daoId, address: body.type === SetupBodyType.EXISTING ? body.address : '' });

    return (
        <DefinitionList.Container className="w-full">
            {readOnly &&
                contractInfo.map(({ term, definition, description, link, copyValue }) => (
                    <DefinitionList.Item
                        key={term}
                        term={term}
                        description={description}
                        link={link}
                        copyValue={copyValue}
                    >
                        {definition}
                    </DefinitionList.Item>
                ))}
            <DefinitionList.Item
                term={t('app.plugins.token.tokenProcessBodyField.tokenTerm')}
                {...(readOnly ? readOnlyTokenProps : {})}
            >
                {tokenName} (${tokenSymbol})
            </DefinitionList.Item>
            {numberOfMembers! > 0 && (
                <DefinitionList.Item
                    term={t('app.plugins.token.tokenProcessBodyField.distributionTerm')}
                    link={
                        readOnly
                            ? {
                                  href: daoUtils.getDaoUrl(dao, 'members'),
                                  isExternal: false,
                              }
                            : undefined
                    }
                >
                    {t('app.plugins.token.tokenProcessBodyField.holders', {
                        count: numberOfMembers,
                    })}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supplyTerm')}>
                {formattedSupply!} (${tokenSymbol})
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supportTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.supportDefinition', {
                    threshold: supportThreshold,
                })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.minParticipationTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.minParticipationDefinition', {
                    minParticipation: minParticipation,
                })}
            </DefinitionList.Item>
            {!isAdvancedGovernance && (
                <>
                    <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.minDurationTerm')}>
                        {formattedMinDuration}
                    </DefinitionList.Item>
                    <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.earlyExecution')}>
                        <Tag
                            label={t(`app.plugins.token.tokenProcessBodyField.${earlyExecutionLabel}`)}
                            variant={earlyExecutionLabel === 'enabled' ? 'primary' : 'neutral'}
                            className="max-w-fit"
                        />
                    </DefinitionList.Item>
                </>
            )}
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.voteChange')}>
                <Tag
                    label={t(`app.plugins.token.tokenProcessBodyField.${voteChangeLabel}`)}
                    variant={voteChangeLabel === 'enabled' ? 'primary' : 'neutral'}
                    className="max-w-fit"
                />
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
