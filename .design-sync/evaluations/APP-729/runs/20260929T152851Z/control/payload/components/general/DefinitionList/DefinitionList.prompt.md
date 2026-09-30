DefinitionList from @aragon/gov-ui-kit. Use via `window.GovUiKit.DefinitionList` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `DefinitionList.Container`, `DefinitionList.Item`. See the DS docs for composition — e.g. items like `DefinitionList.Item` go inside `<DefinitionList>`; containers like `DefinitionList.Group` wrap multiple `<DefinitionList>`s.

## Examples

### Default

```jsx
() => (
    <DefinitionList.Container className="w-full">
        <DefinitionList.Item term="Proposal threshold">
            1,000 ANT
        </DefinitionList.Item>
        <DefinitionList.Item term="Support threshold">
            &gt; 50%
        </DefinitionList.Item>
        <DefinitionList.Item term="Minimum participation">
            15% (1.2M of 8M ANT)
        </DefinitionList.Item>
        <DefinitionList.Item term="Voting duration">7 days</DefinitionList.Item>
    </DefinitionList.Container>
)
```

### WithLinkAndCopy

```jsx
() => (
    <DefinitionList.Container className="w-full">
        <DefinitionList.Item
            copyValue="0xba9E9Be7859560EF2805476f7997cD4ebE7BaF27"
            term="Token contract"
        >
            0xba9E...aF27
        </DefinitionList.Item>
        <DefinitionList.Item
            link={{ href: 'https://app.aragon.org' }}
            term="Website"
        >
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
)
```

### WithComponentChildren

```jsx
() => (
    <DefinitionList.Container className="w-full">
        <DefinitionList.Item term="Status">
            <div className="flex">
                <Tag label="Active" variant="success" />
            </div>
        </DefinitionList.Item>
        <DefinitionList.Item term="Description">
            Transfer 250,000 USDC from the treasury to the grants multisig to
            fund the Q3 2026 ecosystem grants program, with milestone-based
            disbursement and quarterly reporting.
        </DefinitionList.Item>
        <DefinitionList.Item term="Created by">
            0xF2a1...9c3D
        </DefinitionList.Item>
    </DefinitionList.Container>
)
```

## Related

`DefinitionList.Container`, `DefinitionList.Item`
