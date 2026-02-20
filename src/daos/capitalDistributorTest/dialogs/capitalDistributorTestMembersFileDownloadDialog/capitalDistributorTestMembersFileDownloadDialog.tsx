'use client';

import { Dialog, InputNumber, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useRewardDistribution } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CapitalDistributorTestDialogId } from '../../constants/capitalDistributorTestDialogId';
import { rewardUtils } from '../../utils/rewardUtils';

export interface ICapitalDistributorTestMembersFileDownloadDialogParams {
    /**
     * Address of the gauge plugin.
     */
    gaugePluginAddress: `0x${string}`;
    /**
     * Network of the DAO.
     */
    network: Network;
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

    const { gaugePluginAddress, network } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [totalAmount, setTotalAmount] = useState('');
    const [epochId, setEpochId] = useState('');

    console.log('askdh', {
        pluginAddress: gaugePluginAddress,
        network,
        epochId: Number(epochId),
    });
    const rewardDistribution = useRewardDistribution(
        {
            urlParams: {
                pluginAddress: gaugePluginAddress,
                network,
                epochId: Number(epochId),
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
                <div className="flex flex-col gap-3 py-2">
                    <InputNumber
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
                        suffix="wei"
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
