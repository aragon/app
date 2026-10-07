import {
    type Abi,
    decodeFunctionData,
    erc20Abi,
    type Hex,
    parseAbi,
} from 'viem';
import { sppReportProposalResultAbi } from '@/plugins/sppPlugin/dialogs/sppReportProposalResultDialog/sppReportProposalResultAbi';

/**
 * Governance-scoped selector set, deliberately not the general 4byte dataset (W12). It covers what
 * an Aragon-originated Safe transaction actually contains: the SPP report and stage advance, the
 * batching entrypoints, value movement, and the calls that change who controls the Safe. Anything
 * outside it decodes to nothing and stays raw calldata rather than a guess - an unknown selector is
 * honest, a mislabelled one is not.
 *
 * `reportProposalResult` is imported rather than restated so this set cannot drift from the encoder
 * that produces the reports.
 */
const governanceAbi: Abi = [
    ...(sppReportProposalResultAbi as Abi),
    ...erc20Abi.filter(
        (item) =>
            item.type === 'function' &&
            (item.name === 'transfer' || item.name === 'approve'),
    ),
    ...parseAbi([
        'function advanceProposal(uint256 _proposalId)',
        'function multiSend(bytes transactions)',
        'function addOwnerWithThreshold(address owner, uint256 _threshold)',
        'function removeOwner(address prevOwner, address owner, uint256 _threshold)',
        'function swapOwner(address prevOwner, address oldOwner, address newOwner)',
        'function changeThreshold(uint256 _threshold)',
        'function setGuard(address guard)',
        'function setFallbackHandler(address handler)',
        'function enableModule(address module)',
        'function disableModule(address prevModule, address module)',
    ]),
];

class SafeCalldataUtils {
    /**
     * Name of the function this calldata calls, decoded locally, or undefined when the selector is
     * outside the bundled set or the arguments do not decode against it. Undefined is a supported
     * answer: the caller shows raw calldata instead of a label.
     */
    decodeFunctionName = (data?: string | null): string | undefined => {
        if (data == null || data === '0x') {
            return undefined;
        }

        try {
            return decodeFunctionData({ abi: governanceAbi, data: data as Hex })
                .functionName;
        } catch {
            return undefined;
        }
    };

    /**
     * Whether a locally decoded name and a remotely supplied one describe different functions.
     *
     * Only a genuine contradiction counts. A selector this app cannot decode is not a
     * disagreement - the remote decoder simply knows more ABIs - and neither is a missing remote
     * answer. Two decoders naming different functions for the same bytes is, and it means at least
     * one of them is wrong about what the owner is signing.
     */
    disagrees = (
        localName: string | undefined,
        remoteName: string | undefined | null,
    ): boolean =>
        localName != null && remoteName != null && localName !== remoteName;
}

export const safeCalldataUtils = new SafeCalldataUtils();
