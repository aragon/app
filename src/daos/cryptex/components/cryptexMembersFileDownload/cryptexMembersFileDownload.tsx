'use client';

import { Button, Card, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { cryptexTokenVotingPluginAddresses } from '../../constants/cryptex';
import { CryptexDialogId } from '../../constants/cryptexDialogId';
import type { ICryptexMembersFileDownloadDialogParams } from '../../dialogs/cryptexMembersFileDownloadDialog';
import type { ICryptexMembersFileDownloadProps } from './cryptexMembersFileDownload.api';

export const CryptexMembersFileDownload: React.FC<
    ICryptexMembersFileDownloadProps
> = (props) => {
    const { dao, asset } = props;

    const { open } = useDialogContext();

    const [downloadedFileName, setDownloadedFileName] = useState<string | null>(
        null,
    );

    const pluginAddress = cryptexTokenVotingPluginAddresses[dao.id];

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
            helpText="Generate and download a rewards JSON based on governance participation"
            id="cryptex-members-file"
            label="Members file"
            useCustomWrapper={true}
        >
            {downloadedFileName && (
                <Card className="border border-neutral-100 px-6 py-2 shadow-neutral-sm">
                    <p className="text-neutral-400 text-sm">
                        {downloadedFileName}
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
                Generate rewards file
            </Button>
        </InputContainer>
    );
};
