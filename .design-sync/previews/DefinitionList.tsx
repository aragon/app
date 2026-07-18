import { DefinitionList, Tag } from '@aragon/gov-ui-kit';

export const Default = () => (
    <DefinitionList.Container className="w-full">
        <DefinitionList.Item term="Proposal threshold">1,000 ANT</DefinitionList.Item>
        <DefinitionList.Item term="Support threshold">&gt; 50%</DefinitionList.Item>
        <DefinitionList.Item term="Minimum participation">15% (1.2M of 8M ANT)</DefinitionList.Item>
        <DefinitionList.Item term="Voting duration">7 days</DefinitionList.Item>
    </DefinitionList.Container>
);

export const WithLinkAndCopy = () => (
    <DefinitionList.Container className="w-full">
        <DefinitionList.Item term="Token contract" copyValue="0xba9E9Be7859560EF2805476f7997cD4ebE7BaF27">
            0xba9E...aF27
        </DefinitionList.Item>
        <DefinitionList.Item term="Website" link={{ href: 'https://app.aragon.org' }}>
            app.aragon.org
        </DefinitionList.Item>
        <DefinitionList.Item
            description="Aragon OSx v1.4"
            link={{ href: 'https://etherscan.io' }}
            term="Operating system"
        >
            0x1234...1234
        </DefinitionList.Item>
    </DefinitionList.Container>
);

export const WithComponentChildren = () => (
    <DefinitionList.Container className="w-full">
        <DefinitionList.Item term="Status">
            <div className="flex">
                <Tag label="Active" variant="success" />
            </div>
        </DefinitionList.Item>
        <DefinitionList.Item term="Description">
            Transfer 250,000 USDC from the treasury to the grants multisig to fund the Q3 2026 ecosystem grants
            program, with milestone-based disbursement and quarterly reporting.
        </DefinitionList.Item>
        <DefinitionList.Item term="Created by">0xF2a1...9c3D</DefinitionList.Item>
    </DefinitionList.Container>
);
