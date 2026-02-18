'use client';

import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
import {
    useEpochMetrics,
    useRewardDistribution,
} from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';

export interface ICapitalDistributorTestMembersFileDownloadProps
    extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const CapitalDistributorTestMembersFileDownload: React.FC<
    ICapitalDistributorTestMembersFileDownloadProps
> = ({ dao }) => {
    const { t } = useTranslations();

    const gaugePlugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
    });
    const gaugePlugin = gaugePlugins?.[0]?.meta;

    const epochMetrics = useEpochMetrics(
        {
            urlParams: {
                pluginAddress: gaugePlugin?.address as `0x${string}`,
                network: dao.network,
            },
            queryParams: {},
        },
        { enabled: !!gaugePlugin },
    );

    const epochId = epochMetrics.data?.epochId
        ? Number(epochMetrics.data.epochId)
        : undefined;

    const rewardDistribution = useRewardDistribution(
        {
            urlParams: {
                pluginAddress: gaugePlugin?.address as `0x${string}`,
                network: dao.network,
                epochId: epochId ?? 0,
            },
        },
        { enabled: false },
    );

    const handleClick = () => {
        rewardDistribution.refetch().then((result) => {
            // biome-ignore lint/suspicious/noConsole: test component
            console.log('rewardDistribution', result.data);
        });
    };

    return (
        <InputContainer
            alert={
                rewardDistribution.isError
                    ? {
                          message: t(
                              'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.error',
                          ),
                          variant: 'critical',
                      }
                    : undefined
            }
            helpText={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.helpText',
            )}
            id="katana-members-file"
            isOptional={true}
            label={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.label',
            )}
            useCustomWrapper={true}
        >
            <Button
                className="w-fit"
                iconLeft={IconType.REWARDS}
                isLoading={rewardDistribution.isFetching}
                onClick={handleClick}
                variant={'tertiary'}
            >
                {t(
                    'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.button',
                )}
            </Button>
        </InputContainer>
    );
};
