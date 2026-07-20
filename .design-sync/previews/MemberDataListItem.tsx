import { GukModulesProvider, MemberDataListItem } from '@aragon/gov-ui-kit';

export const Default = () => (
    <GukModulesProvider>
        <div className="max-w-80">
            <MemberDataListItem.Structure
                address="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
                delegationCount={9}
                tokenAmount={12_500}
                tokenSymbol="ANT"
            />
        </div>
    </GukModulesProvider>
);

export const Delegate = () => (
    <GukModulesProvider>
        <div className="max-w-80">
            <MemberDataListItem.Structure
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                delegationCount={1}
                ensName="cgero.eth"
                isDelegate={true}
                tokenAmount={480_000}
                tokenSymbol="ANT"
            />
        </div>
    </GukModulesProvider>
);

export const Minimal = () => (
    <GukModulesProvider>
        <div className="max-w-80">
            <MemberDataListItem.Structure address="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5" />
        </div>
    </GukModulesProvider>
);

export const MemberGrid = () => (
    <GukModulesProvider>
        <div className="grid grid-cols-3 gap-3">
            <MemberDataListItem.Structure
                address="0x17366cae2b9c6C3055e9e3C78936a69006BE5409"
                delegationCount={24}
                ensName="builder.eth"
                tokenAmount={1_200_000}
                tokenSymbol="ANT"
            />
            <MemberDataListItem.Structure
                address="0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8"
                delegationCount={3}
                tokenAmount={56_000}
                tokenSymbol="ANT"
            />
            <MemberDataListItem.Skeleton />
        </div>
    </GukModulesProvider>
);
