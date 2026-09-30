IllustrationHuman from @aragon/gov-ui-kit. Use via `window.GovUiKit.IllustrationHuman` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface IllustrationHumanProps {
  /** Body of the illustration human. */
  body: "ARAGON" | "BLOCKS" | "CHART" | "COMPUTER_CORRECT" | "COMPUTER" | "CORRECT" | "DOUBLE_CORRECT" | "ELEVATING" | "RELAXED" | "SENDING_LOVE" | "VOTING";
  /** Expression of the illustration human. */
  expression: "ANGRY" | "CASUAL" | "CRYING" | "DECIDED" | "EXCITED" | "SAD_LEFT" | "SAD_RIGHT" | "SMILE_WINK" | "SMILE" | "SURPRISED" | "SUSPECTING";
  /** Hairs of the illustration human. */
  hairs?: "AFRO" | "BALD" | "BUN" | "COOL" | "CURLY_BANGS" | "CURLY" | "INFORMAL" | "LONG" | "MIDDLE" | "OLDSCHOOL" | "PUNK" | "SHORT";
  /** Sunglasses of the illustration human. */
  sunglasses?: "BIG_ROUNDED" | "BIG_SEMIROUNDED" | "LARGE_STYLIZED_XL" | "LARGE_STYLIZED" | "PIRATE" | "SMALL_INTELLECTUAL" | "SMALL_SYMPATHETIC" | "SMALL_WEIRD_ONE" | "SMALL_WEIRD_TWO" | "THUGLIFE_ROUNDED" | "THUGLIFE";
  /** Accessory of the illustration human. */
  accessory?: "BUDDHA" | "EARRINGS_CIRCLE" | "EARRINGS_HOOPS" | "EARRINGS_RHOMBUS" | "EARRINGS_SKULL" | "EARRINGS_THUNDER" | "EXPRESSION" | "FLUSHED" | "HEAD_FLOWER" | "PIERCINGS_TATTOO" | "PIERCINGS";
  /** Object to be displayed. */
  object?: unknown;
  /** Position of the object. */
  objectPosition?: "right" | "left";
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <IllustrationHuman
        body="ARAGON"
        expression="SMILE_WINK"
        style={{ width: 200 }}
    />
)
```

### Expressions

```jsx
() => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="VOTING"
            expression="DECIDED"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="BLOCKS"
            expression="EXCITED"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="ELEVATING"
            expression="SMILE"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="COMPUTER"
            expression="SURPRISED"
            style={{ width: 140 }}
        />
    </div>
)
```

### WithAccessories

```jsx
() => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="RELAXED"
            expression="CASUAL"
            hairs="CURLY"
            style={{ width: 140 }}
            sunglasses="BIG_ROUNDED"
        />
        <IllustrationHuman
            accessory="EARRINGS_CIRCLE"
            body="CHART"
            expression="SMILE"
            hairs="LONG"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="SENDING_LOVE"
            expression="SMILE_WINK"
            hairs="BUN"
            style={{ width: 140 }}
        />
    </div>
)
```

### WithObject

```jsx
() => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="VOTING"
            expression="SMILE"
            object="WALLET"
            objectPosition="right"
            style={{ width: 160 }}
        />
        <IllustrationHuman
            body="COMPUTER_CORRECT"
            expression="DECIDED"
            object="SETTINGS"
            objectPosition="left"
            style={{ width: 160 }}
        />
    </div>
)
```
