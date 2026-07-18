import { GukModulesProvider, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';

export const Verified = () => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure
            contractAddress="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
            contractName="GovernanceERC20"
            functionName="transfer"
        />
    </GukModulesProvider>
);

export const Unverified = () => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure contractAddress="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5" />
    </GukModulesProvider>
);

export const WithFunctionSelector = () => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure
            contractAddress="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
            contractName="GovernanceERC20"
            functionName="approve"
            functionSelector="0x095ea7b3"
        />
    </GukModulesProvider>
);

export const WithRemoveButton = () => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure
            contractAddress="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
            contractName="GovernanceERC20"
            functionName="mint"
            onRemove={() => undefined}
        />
    </GukModulesProvider>
);
