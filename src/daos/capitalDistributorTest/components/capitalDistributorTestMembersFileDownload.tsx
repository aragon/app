'use client';

import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { type ComponentProps, useState } from 'react';
import {
    useEpochMetrics,
    useRewardDistribution,
} from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { rewardUtils } from '../utils/rewardUtils';

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
    const [totalAmount, setTotalAmount] = useState('');

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
            if (result.data == null) {
                return;
            }

            const rewardJson = rewardUtils.toRewardJson({
                owners: result.data.owners,
                totalAmount: BigInt(totalAmount),
            });

            const blob = new Blob([JSON.stringify(rewardJson, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `reward-distribution-epoch-${result.data.epoch}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
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
            <input
                className="w-full rounded border px-3 py-2 text-sm"
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Total amount (wei)"
                type="number"
                value={totalAmount}
            />
            <Button
                className="w-fit"
                disabled={totalAmount === ''}
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
