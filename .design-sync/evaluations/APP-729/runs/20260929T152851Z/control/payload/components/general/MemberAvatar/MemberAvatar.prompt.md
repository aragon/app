MemberAvatar from @aragon/gov-ui-kit. Use via `window.GovUiKit.MemberAvatar` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface MemberAvatarProps {
  /** ENS name of the user to lookup avatar src. */
  ensName?: string;
  /** 0x address of the user to look up ENS name and avatar src. */
  address?: string;
  /** Direct URL src of the user avatar image to be rendered. */
  avatarSrc?: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** The size of the avatar. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs";
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarSize>>;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### Default

```jsx
() => (
    <GukModulesProvider>
        <MemberAvatar
            address="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
            avatarSrc={blockiesFallback}
        />
    </GukModulesProvider>
)
```

### Sizes

```jsx
() => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <MemberAvatar
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                avatarSrc={blockiesFallback}
                size="xs"
            />
            <MemberAvatar
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                avatarSrc={blockiesFallback}
                size="sm"
            />
            <MemberAvatar
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                avatarSrc={blockiesFallback}
                size="md"
            />
            <MemberAvatar
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                avatarSrc={blockiesFallback}
                size="lg"
            />
            <MemberAvatar
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                avatarSrc={blockiesFallback}
                size="xl"
            />
            <MemberAvatar
                address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
                avatarSrc={blockiesFallback}
                size="2xl"
            />
        </div>
    </GukModulesProvider>
)
```

### WithImage

```jsx
() => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <MemberAvatar
                address="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5"
                avatarSrc={avatarImage}
                size="md"
            />
            <MemberAvatar
                address="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5"
                avatarSrc={avatarImage}
                size="2xl"
            />
        </div>
    </GukModulesProvider>
)
```
