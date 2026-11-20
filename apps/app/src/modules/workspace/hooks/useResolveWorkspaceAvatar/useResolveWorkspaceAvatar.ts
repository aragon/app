import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';
import { usePinFile } from '@/shared/api/ipfsService/mutations';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

/**
 * Resolves the avatar input of a workspace form to the IPFS URI to store: a newly selected file is pinned, while an
 * avatar carried over from the stored workspace keeps its URI.
 * @returns A function resolving the URI, undefined when the input holds no avatar.
 */
export const useResolveWorkspaceAvatar = () => {
    const { mutateAsync: pinFile } = usePinFile();

    return async (
        value?: IInputFileAvatarValue,
    ): Promise<string | undefined> => {
        if (value?.file != null) {
            const { IpfsHash } = await pinFile({ body: value.file });

            return ipfsUtils.cidToUri(IpfsHash);
        }

        return value?.url != null ? ipfsUtils.srcToUri(value.url) : undefined;
    };
};
