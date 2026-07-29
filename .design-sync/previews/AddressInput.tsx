import { AddressInput, GukModulesProvider } from '@aragon/gov-ui-kit';

const noop = () => undefined;

export const WithAddress = () => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            helpText="The address receiving the transferred tokens."
            label="Recipient"
            onChange={noop}
            value="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
        />
    </GukModulesProvider>
);

export const Empty = () => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            label="Wallet address or ENS"
            onChange={noop}
            placeholder="0x… or name.eth"
            value=""
        />
    </GukModulesProvider>
);

export const ChecksumError = () => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            label="Recipient"
            onChange={noop}
            value="0x17c6808fA04DC9de98eaCfeb4c66B352067c1cDD"
        />
    </GukModulesProvider>
);

export const Disabled = () => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            disabled={true}
            label="Token contract"
            onChange={noop}
            value="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
        />
    </GukModulesProvider>
);
