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
import { useTranslations } from '@/shared/components/translationsProvider';
import { useTokenRewardDistribution } from '../../api/tokenRewardService';
import { CryptexDialogId } from '../../constants/cryptexDialogId';

export interface ICryptexMembersFileDownloadDialogParams {
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

export interface ICryptexMembersFileDownloadDialogProps
    extends IDialogComponentProps<ICryptexMembersFileDownloadDialogParams> {}

export const CryptexMembersFileDownloadDialog: React.FC<
    ICryptexMembersFileDownloadDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'CryptexMembersFileDownloadDialog: params must be defined',
    );

    const { pluginAddress, network, asset, onDownload } = location.params;
    const { close } = useDialogContext();
    const { t } = useTranslations();

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

    const handleGenerate = async () => {
        const result = await rewardDistribution.refetch();

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
    };

    const handleClose = () => {
        close(CryptexDialogId.CRYPTEX_MEMBERS_FILE_DOWNLOAD);
    };

    const todayFormatted = DateTime.now().toFormat('yyyy-MM-dd');

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.daos.cryptex.cryptexMembersFileDownloadDialog.description',
                )}
                title={t(
                    'app.daos.cryptex.cryptexMembersFileDownloadDialog.title',
                )}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-6 py-2">
                    <InputDate
                        label={t(
                            'app.daos.cryptex.cryptexMembersFileDownloadDialog.lookbackDateLabel',
                        )}
                        max={todayFormatted}
                        onChange={(event) =>
                            setLookbackDate(event.target.value)
                        }
                        value={lookbackDate}
                    />
                    <InputNumber
                        label={t(
                            'app.daos.cryptex.cryptexMembersFileDownloadDialog.totalAmountLabel',
                        )}
                        min={0}
                        onChange={setTotalAmount}
                        placeholder="0"
                        suffix={tokenSymbol}
                        value={totalAmount}
                    />
                    {rewardDistribution.isError && (
                        <p className="text-critical-600 text-sm">
                            {errorCode
                                ? t(
                                      'app.daos.cryptex.cryptexMembersFileDownloadDialog.error.withCode',
                                      { errorCode },
                                  )
                                : t(
                                      'app.daos.cryptex.cryptexMembersFileDownloadDialog.error.default',
                                  )}
                        </p>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.daos.cryptex.cryptexMembersFileDownloadDialog.generate',
                    ),
                    onClick: handleGenerate,
                    disabled: !isFormValid,
                    isLoading: rewardDistribution.isFetching,
                }}
                secondaryAction={{
                    label: t(
                        'app.daos.cryptex.cryptexMembersFileDownloadDialog.cancel',
                    ),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
