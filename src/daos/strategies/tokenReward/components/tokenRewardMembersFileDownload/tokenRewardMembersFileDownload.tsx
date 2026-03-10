'use client';

import { Button, Card, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { TokenRewardDialogId } from '../../constants/tokenRewardDialogId';
import type { ITokenRewardMembersFileDownloadDialogParams } from '../../dialogs/tokenRewardMembersFileDownloadDialog';
import type { ITokenRewardMembersFileDownloadProps } from './tokenRewardMembersFileDownload.api';

export const TokenRewardMembersFileDownload: React.FC<
    ITokenRewardMembersFileDownloadProps
> = (props) => {
    const { dao, asset } = props;

    const { open } = useDialogContext();

    const [downloadedFileName, setDownloadedFileName] = useState<string | null>(
        null,
    );

    const governancePlugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.TOKEN_VOTING,
        includeSubPlugins: false,
    });
    const governancePlugin = governancePlugins?.[0]?.meta as
        | IDaoPlugin
        | undefined;

    const handleClick = () => {
        if (governancePlugin?.address == null) {
            return;
        }

        const params: ITokenRewardMembersFileDownloadDialogParams = {
            pluginAddress: governancePlugin.address as Hex,
            network: dao.network,
            asset,
            onDownload: setDownloadedFileName,
        };

        open(TokenRewardDialogId.TOKEN_REWARD_MEMBERS_FILE_DOWNLOAD, {
            params,
            disableOutsideClick: true,
        });
    };

    return (
        <InputContainer
            helpText="Generate and download a rewards JSON based on governance participation"
            id="token-reward-members-file"
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
                disabled={governancePlugin?.address == null}
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
