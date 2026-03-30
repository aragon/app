'use client';

import { Button, Card, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    cryptex,
    cryptexTokenVotingPluginAddress,
    tokenVotingRewardsTest,
    tokenVotingRewardsTestTokenVotingPluginAddress,
} from '../../constants';
import { CryptexDialogId } from '../../constants/cryptexDialogId';
import type { ICryptexMembersFileDownloadDialogParams } from '../../dialogs/cryptexMembersFileDownloadDialog';
import type { ICryptexMembersFileDownloadProps } from './cryptexMembersFileDownload.api';

const tokenVotingPluginAddresses: Record<string, `0x${string}`> = {
    [cryptex.id]: cryptexTokenVotingPluginAddress,
    [tokenVotingRewardsTest.id]: tokenVotingRewardsTestTokenVotingPluginAddress,
};

export const CryptexMembersFileDownload: React.FC<
    ICryptexMembersFileDownloadProps
> = (props) => {
    const { dao, asset } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const [downloadedFileName, setDownloadedFileName] = useState<string | null>(
        null,
    );

    const pluginAddress = tokenVotingPluginAddresses[dao.id];

    const handleClick = () => {
        if (pluginAddress == null) {
            return;
        }

        const params: ICryptexMembersFileDownloadDialogParams = {
            pluginAddress,
            network: dao.network,
            asset,
            onDownload: setDownloadedFileName,
        };

        open(CryptexDialogId.CRYPTEX_MEMBERS_FILE_DOWNLOAD, {
            params,
            disableOutsideClick: true,
        });
    };

    return (
        <InputContainer
            helpText={t('app.daos.cryptex.cryptexMembersFileDownload.helpText')}
            id="cryptex-members-file"
            label={t('app.daos.cryptex.cryptexMembersFileDownload.label')}
            useCustomWrapper={true}
        >
            {downloadedFileName && (
                <Card className="border border-neutral-100 px-6 py-2 shadow-neutral-sm">
                    <p className="text-neutral-400 text-sm">
                        {t(
                            'app.daos.cryptex.cryptexMembersFileDownload.downloadedFile',
                            { fileName: downloadedFileName },
                        )}
                    </p>
                </Card>
            )}
            <Button
                className="w-fit"
                disabled={pluginAddress == null}
                iconLeft={IconType.PLUS}
                onClick={handleClick}
                size="md"
                variant="tertiary"
            >
                {t('app.daos.cryptex.cryptexMembersFileDownload.button')}
            </Button>
        </InputContainer>
    );
};
