'use client';

import {
    Dialog,
    DropdownContainer,
    DropdownItem,
    InputContainer,
    InputNumber,
    invariant,
} from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { type Hex, parseUnits } from 'viem';
import type { IAsset } from '@/modules/finance/api/financeService';
import {
    useEpochMetrics,
    useRewardDistribution,
} from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CapitalDistributorTestDialogId } from '../../constants/capitalDistributorTestDialogId';
import { capitalDistributorTestMinEpochId } from '../../constants/capitalDistributorTestMinEpochId';
import { rewardUtils } from '../../utils/rewardUtils';

export interface ICapitalDistributorTestMembersFileDownloadDialogParams {
    /**
     * Gauge plugin.
     */
    gaugePlugin: IGaugeVoterPlugin;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Asset selected in the campaign creation form.
     */
    asset?: IAsset;
    /**
     * Called with the downloaded file name after a successful download.
     */
    onDownload?: (fileName: string) => void;
}

export interface ICapitalDistributorTestMembersFileDownloadDialogProps
    extends IDialogComponentProps<ICapitalDistributorTestMembersFileDownloadDialogParams> {}

export const CapitalDistributorTestMembersFileDownloadDialog: React.FC<
    ICapitalDistributorTestMembersFileDownloadDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'CapitalDistributorTestMembersFileDownloadDialog: params must be defined',
    );

    const { gaugePlugin, network, asset } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    console.log('gaugePlugin', gaugePlugin);
    const epochMetrics = useEpochMetrics({
        urlParams: {
            pluginAddress: gaugePlugin.address as Hex,
            network,
        },
        queryParams: {},
    });

    const currentEpochId = epochMetrics.data?.epochId
        ? Number(epochMetrics.data.epochId)
        : undefined;

    const validEpochs = useMemo(() => {
        if (currentEpochId == null) {
            return [];
        }

        const epochs: number[] = [];

        for (
            let i = currentEpochId;
            i >= capitalDistributorTestMinEpochId && epochs.length < 10;
            i--
        ) {
            epochs.push(i);
        }

        return epochs;
    }, [currentEpochId]);

    const defaultEpoch = currentEpochId != null ? String(currentEpochId) : '';

    const [totalAmount, setTotalAmount] = useState('');
    const [epochId, setEpochId] = useState(defaultEpoch);

    const tokenDecimals =
        asset?.token.decimals ?? gaugePlugin.settings.token.decimals;
    const tokenSymbol = asset?.token.symbol;

    const totalAmountInUnits = useMemo(
        () =>
            totalAmount
                ? parseUnits(totalAmount, tokenDecimals).toString()
                : '',
        [totalAmount, tokenDecimals],
    );

    const rewardDistribution = useRewardDistribution(
        {
            urlParams: {
                pluginAddress: gaugePlugin.address as Hex,
                network,
                epochId: Number(epochId),
            },
            queryParams: {
                rewardTotalAmount: totalAmountInUnits,
            },
        },
        { enabled: false },
    );

    const isFormValid = totalAmount !== '' && epochId !== '';

    const handleGenerate = () => {
        rewardDistribution.refetch().then((result) => {
            if (result.data == null) {
                return;
            }

            const rewardJson = rewardUtils.toRewardJson({
                owners: result.data.owners,
            });

            const blob = new Blob([JSON.stringify(rewardJson, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            const fileName = `reward-distribution-epoch-${result.data.epoch}.json`;
            anchor.href = url;
            anchor.download = fileName;
            anchor.click();
            URL.revokeObjectURL(url);
            location.params?.onDownload?.(fileName);
            handleClose();
        });
    };

    const handleClose = () => {
        close(CapitalDistributorTestDialogId.MEMBERS_FILE_DOWNLOAD);
    };

    const selectedEpochLabel =
        epochId !== ''
            ? t(
                  'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochOption',
                  { epochId },
              )
            : t(
                  'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochSelectPlaceholder',
              );

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.description',
                )}
                title={t(
                    'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.title',
                )}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-6 py-2">
                    <InputContainer
                        helpText={t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochIdHelpText',
                        )}
                        id="epoch-select"
                        label={t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochIdLabel',
                        )}
                        useCustomWrapper={true}
                    >
                        <div className="w-fit">
                            <DropdownContainer
                                disabled={validEpochs.length === 0}
                                label={selectedEpochLabel}
                                size="md"
                                variant="tertiary"
                            >
                                {validEpochs.map((epoch) => (
                                    <DropdownItem
                                        key={epoch}
                                        onSelect={() =>
                                            setEpochId(String(epoch))
                                        }
                                        selected={epochId === String(epoch)}
                                    >
                                        {t(
                                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochOption',
                                            { epochId: epoch },
                                        )}
                                    </DropdownItem>
                                ))}
                            </DropdownContainer>
                        </div>
                    </InputContainer>
                    <InputNumber
                        label={t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.amountLabel',
                        )}
                        min={0}
                        onChange={setTotalAmount}
                        placeholder="0"
                        suffix={tokenSymbol}
                        value={totalAmount}
                    />
                    {rewardDistribution.isError && (
                        <p className="text-critical-600 text-sm">
                            {t(
                                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.error',
                            )}
                        </p>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.generate',
                    ),
                    onClick: handleGenerate,
                    disabled: !isFormValid,
                    isLoading: rewardDistribution.isFetching,
                }}
                secondaryAction={{
                    label: t(
                        'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.cancel',
                    ),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
