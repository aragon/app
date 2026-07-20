import {
    GukModulesProvider,
    ProposalActionChangeMembers,
    ProposalActionType,
} from '@aragon/gov-ui-kit';

const baseAction = {
    from: '0x25716fB10298638eD386A5A5dD2E9233D213F442',
    to: '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311',
    data: '',
    value: '0',
    inputData: null,
};

export const AddMembers = () => (
    <GukModulesProvider>
        <ProposalActionChangeMembers
            action={{
                ...baseAction,
                type: ProposalActionType.ADD_MEMBERS,
                members: [
                    {
                        address: '0xceB69F6342eCE283b2F5c9088Ff249B5d0Ae66ea',
                        name: 'treasury-ops.eth',
                    },
                    { address: '0x97fb9274ac39bB275AC76f56390e6713A2C417D9' },
                    {
                        address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
                        name: 'cgero.eth',
                    },
                ],
                currentMembers: 5,
            }}
            index={0}
        />
    </GukModulesProvider>
);

export const RemoveMembers = () => (
    <GukModulesProvider>
        <ProposalActionChangeMembers
            action={{
                ...baseAction,
                type: ProposalActionType.REMOVE_MEMBERS,
                members: [
                    {
                        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                        name: 'inactive-signer.eth',
                    },
                    { address: '0x8C8D7C46219D9205f056f28fee5950aD564d7465' },
                ],
                currentMembers: 8,
            }}
            index={1}
        />
    </GukModulesProvider>
);

export const AddSingleMember = () => (
    <GukModulesProvider>
        <ProposalActionChangeMembers
            action={{
                ...baseAction,
                type: ProposalActionType.ADD_MEMBERS,
                members: [
                    {
                        address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
                        name: 'security-council.eth',
                    },
                ],
                currentMembers: 3,
            }}
            index={0}
        />
    </GukModulesProvider>
);
