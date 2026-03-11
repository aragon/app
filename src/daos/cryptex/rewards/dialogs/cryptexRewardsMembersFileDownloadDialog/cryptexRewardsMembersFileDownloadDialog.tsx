'use client';

import { Dialog, InputDate, InputNumber, invariant } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { type Hex, parseUnits } from 'viem';
import type { IAsset } from '@/modules/finance/api/financeService';
import type { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTokenRewardDistribution } from '../../api/tokenRewardService';
import { CryptexRewardsDialogId } from '../../constants/cryptexRewardsDialogId';

export interface ICryptexRewardsMembersFileDownloadDialogParams {
    /**
     * Token voting governance plugin address.
     */
    pluginAddress: Hex;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Asset selected in the campaign creation form.
     */
    asset?: IAsset;
    /**
     * Callback when file is downloaded with the filename.
     */
    onDownload: (fileName: string) => void;
}

export interface ICryptexRewardsMembersFileDownloadDialogProps
    extends IDialogComponentProps<ICryptexRewardsMembersFileDownloadDialogParams> {}

export const CryptexRewardsMembersFileDownloadDialog: React.FC<
    ICryptexRewardsMembersFileDownloadDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'CryptexRewardsMembersFileDownloadDialog: params must be defined',
    );

    const { pluginAddress, network, asset, onDownload } = location.params;
    const { close } = useDialogContext();

    const [lookbackDate, setLookbackDate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');

    const tokenDecimals = asset?.token.decimals ?? 18;
    const tokenSymbol = asset?.token.symbol;

    const rewardTotalAmountInWei =
        totalAmount !== ''
            ? parseUnits(totalAmount, tokenDecimals).toString()
            : '';

    const rewardDistribution = useTokenRewardDistribution(
        {
            urlParams: { pluginAddress, network },
            queryParams: {
                rewardTotalAmount: rewardTotalAmountInWei,
                lookbackDate,
            },
        },
        { enabled: false },
    );

    const errorCode =
        rewardDistribution.error &&
        (rewardDistribution.error as AragonBackendServiceError).code;

    const isFormValid = lookbackDate !== '' && totalAmount !== '';

    const handleGenerate = () => {
        rewardDistribution.refetch().then((result) => {
            if (result.data == null) {
                return;
            }

            const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            const fileName = `cryptex-rewards-${lookbackDate}.json`;
            anchor.href = url;
            anchor.download = fileName;
            anchor.click();
            URL.revokeObjectURL(url);
            onDownload(fileName);
            handleClose();
        });
    };

    const handleClose = () => {
        close(CryptexRewardsDialogId.CRYPTEX_REWARDS_MEMBERS_FILE_DOWNLOAD);
    };

    const todayFormatted = DateTime.now().toFormat('yyyy-MM-dd');

    return (
        <>
            <Dialog.Header
                description="Generate and download a rewards JSON based on governance participation"
                title="Generate rewards file"
            />
            <Dialog.Content>
                <div className="flex flex-col gap-6 py-2">
                    <InputDate
                        label="Include proposals since"
                        max={todayFormatted}
                        onChange={(event) =>
                            setLookbackDate(event.target.value)
                        }
                        value={lookbackDate}
                    />
                    <InputNumber
                        label="Total reward amount"
                        min={0}
                        onChange={setTotalAmount}
                        placeholder="0"
                        suffix={tokenSymbol}
                        value={totalAmount}
                    />
                    {rewardDistribution.isError && (
                        <p className="text-critical-600 text-sm">
                            {errorCode
                                ? `Failed to generate rewards: ${errorCode}`
                                : 'Failed to generate reward distribution. Please try again.'}
                        </p>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: 'Generate',
                    onClick: handleGenerate,
                    disabled: !isFormValid,
                    isLoading: rewardDistribution.isFetching,
                }}
                secondaryAction={{
                    label: 'Cancel',
                    onClick: handleClose,
                }}
            />
        </>
    );
};
