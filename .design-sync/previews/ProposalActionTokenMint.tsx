import { GukModulesProvider, ProposalActionTokenMint, ProposalActionType } from '@aragon/gov-ui-kit';

const baseAction = {
    from: '0x25716fB10298638eD386A5A5dD2E9233D213F442',
    to: '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311',
    data: '',
    value: '0',
    inputData: null,
};

export const NewHolder = () => (
    <GukModulesProvider>
        <ProposalActionTokenMint
            action={{
                ...baseAction,
                type: ProposalActionType.TOKEN_MINT,
                tokenSymbol: 'ARA',
                receiver: {
                    currentBalance: '0',
                    newBalance: '150000',
                    address: '0x32c2FE388ABbB3e678D44DF6a0471086D705316a',
                    name: 'grants-multisig.eth',
                },
            }}
            index={0}
        />
    </GukModulesProvider>
);

export const TopUpExistingHolder = () => (
    <GukModulesProvider>
        <ProposalActionTokenMint
            action={{
                ...baseAction,
                type: ProposalActionType.TOKEN_MINT,
                tokenSymbol: 'GTT',
                receiver: {
                    currentBalance: '250000',
                    newBalance: '500000',
                    address: '0x97fb9274ac39bB275AC76f56390e6713A2C417D9',
                },
            }}
            index={1}
        />
    </GukModulesProvider>
);
