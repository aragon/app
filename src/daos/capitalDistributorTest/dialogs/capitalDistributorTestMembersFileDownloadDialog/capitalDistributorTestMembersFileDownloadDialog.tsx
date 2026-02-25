'use client';

import { Dialog, InputNumber, invariant } from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { type Hex, parseUnits } from 'viem';
import { useRewardDistribution } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CapitalDistributorTestDialogId } from '../../constants/capitalDistributorTestDialogId';
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

    const { gaugePlugin, network } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [totalAmount, setTotalAmount] = useState('');
    const [epochId, setEpochId] = useState('');

    const { token } = gaugePlugin.settings;
    const totalAmountInUnits = useMemo(
        () =>
            totalAmount
                ? parseUnits(totalAmount, token.decimals).toString()
                : '',
        [totalAmount, token.decimals],
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
                    <InputNumber
                        helpText={t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochIdHelpText',
                        )}
                        label={t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.epochIdLabel',
                        )}
                        min={0}
                        onChange={setEpochId}
                        placeholder="0"
                        value={epochId}
                    />
                    <InputNumber
                        label={t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownloadDialog.amountLabel',
                        )}
                        min={0}
                        onChange={setTotalAmount}
                        placeholder="0"
                        suffix={token.symbol}
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
