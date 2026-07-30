import {
    AddressesInput,
    DebugContextProvider,
    enTranslations,
    FormWrapper,
    GukModulesProvider,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppForm = (props: {
    children?: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            <GukModulesProvider>
                <FormWrapper defaultValues={props.defaultValues}>
                    {props.children}
                </FormWrapper>
            </GukModulesProvider>
        </TranslationsProvider>
    </DebugContextProvider>
);

export const Default = () => (
    <AppForm defaultValues={{ members: [{ address: '' }] }}>
        <AddressesInput.Container
            helpText="Define the wallets that can create and vote on proposals."
            label="Members"
            name="members"
        >
            <AddressesInput.Item index={0} />
        </AddressesInput.Container>
    </AppForm>
);

const memberAddresses = [
    { address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD' },
    { address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786' },
    { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
];

export const Filled = () => (
    <AppForm defaultValues={{ members: memberAddresses }}>
        <AddressesInput.Container
            helpText="The multisig executes an action once enough members approve."
            label="Multisig members"
            name="members"
        >
            {memberAddresses.map((member, index) => (
                <AddressesInput.Item index={index} key={member.address} />
            ))}
        </AddressesInput.Container>
    </AppForm>
);

// Mixed-case address with a broken EIP-55 checksum — AddressInput flags it on render.
export const ChecksumError = () => (
    <AppForm
        defaultValues={{
            members: [
                { address: '0x2a1E345b4A1eB6cD8194Cd75f7C2B34aE2a08cF3' },
            ],
        }}
    >
        <AddressesInput.Container
            helpText="Define the wallets that can create and vote on proposals."
            label="Members"
            name="members"
        >
            <AddressesInput.Item index={0} />
        </AddressesInput.Container>
    </AppForm>
);
