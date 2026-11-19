# Semantic colour tokens: decisions and open gaps

The review list for the semantic colour work. Every gap between the designer's Figma work, today's code and what
was built goes here, with what the branch currently does. Items are decided one by one with the owner; until then
the branch carries the provisional choice stated on each item.

**Status values:** `OWNER` decided by the owner · `PROVISIONAL` decided by Claude on judgement, awaiting review ·
`OPEN` not decided, nothing built on it · `DESIGNER` needs the designer.

Sources: the Figma branch of the Governance UI Kit (`Semantic: Color` collection, 189 variables, Light and Dark),
`semantic-colors.tokens.json` (its dump), `semantic-colors.component-map.json` (the code-derived mapping, with the
full conflict list), `semantic-colors.parity.json` (the value each token has in the default theme).

## 1. Decided by the owner

| ID | Decision |
| --- | --- |
| O-01 | Reproduce today's colours first under the semantic names; switch to the Figma values later in one reviewed step. |
| O-02 | Colour first. Spacing, radius and type are a later pass; spacing in the app is a separate track worth doing. |
| O-03 | Figma is the starting source because it is ahead; code becomes the source of truth afterwards. |
| O-04 | Components reference semantic tokens only, enforced by a lint rule. |
| O-05 | No deviation from today's code without an argument; each one is argued individually, by related patterns. |
| O-06 | The palette change (true grey, standard green) is reviewed independently of the semantic layer; probably wanted. |
| O-07 | Work happens on one branch cut from `docs/design-prototypes`; kit and prototype commits stay separate. |

## 2. Provisional decisions (made by Claude; review each)

### Naming and mechanism

| ID | Decision | Why | Alternative |
| --- | --- | --- | --- |
| P-01 | Names keep the designer's `property/group/role`; the class is the name with `/` → `-`. The role is a level (`primary/secondary/tertiary`) for static content, a state (`default/hover/active/selected/disabled`) for pressable things, or a one-off (`inverse/subtle/solid/placeholder/focus`). | `primary` equals `default` in 7 groups and differs in 13, so both vocabularies are needed. 142 of 189 Figma names stay untouched. | Two-slot `emphasis-state` names; on-colour names (`text-on-accent`). |
| P-02 | Coloured fills are named `subtle` / `solid` (`bg/accent/primary` → `solid`, `bg/success/primary` → `subtle`, `…/tertiary` → `solid`). | `primary` is the strong fill for accent but the pale fill for statuses. To confirm with the designer: "primary" may have meant "most used fill". | Keep the Figma ordinals. |
| P-03 | Icons have their own class family `icon-*`. | Code colours icons differently from adjacent text (secondary button: text `primary-400`, icon `primary-300`). | `text-icon-*`. |
| P-04 | `text/link/*` stays a separate set. | Link values differ from accent text in both Figma (400/600/800 vs 400/500/600) and code (400/500/700 vs 400/–/600). | Merge into `text/accent/*` (changes link colours). |
| P-05 | The `-inverse` hover/active twins of text and icon collapse into one `inverse` role. | Same value in all of them. | Keep the triplets. |
| P-06 | Classes are generated with Tailwind's documented `@utility`, not the undocumented `--background-color-*` namespaces. | External consumers compile the kit with their own Tailwind (≥ 4.1); only 4.3.5 was tested for the undocumented route. Class names are identical either way. | Property namespaces guarded by a compile test. |
| P-07 | The Figma palette exists only as private `--guk-palette-*` properties, not as public utilities. | It must not become a second set of primitive classes. | Add the ramps to `@theme`. |
| P-08 | Dark mode is triggered by a `data-theme` attribute. Whether users get a toggle is a later product decision. | Keeps dark off until switched on; supports a toggle, system preference or scoped areas. | Follow the operating system automatically. |

### Button

| ID | Decision | Why | Alternative |
| --- | --- | --- | --- |
| P-09 | Secondary button, pressed: the label becomes `primary-600` (today `primary-400`). **Visible change.** | The designer bound it to the same token as the ghost button. Every other accent pressable darkens its text when pressed (ghost 600, link 700, collapsible 700/800, tertiary 500→800); secondary has no pressed text class at all, which reads as an omission. | Split the token and keep `primary-400`. |
| P-10 | Ghost button, hover: stays white as today, with its own code-only token. | The designer's `bg/surface/hover` (grey 50) equals the page background in Figma, so the hover would be invisible on the page. White is invisible on a card; the kit's pattern for transparent elements is a tint. Candidate: `bg/surface/transparent-hover`. | Take the designer's grey 50; or the tint (new design change). |
| P-11 | Ghost button background stays transparent. | Figma binds `bg/body`, which would paint a grey box on a card. | Follow Figma. |
| P-12 | Four code-only border tokens (`border/accent/fill`, `-hover`, `-active`, `border/surface/fill-disabled`) alias the fill colour. | Today the 1px border of primary and disabled buttons is painted in the fill colour; Figma has no stroke; a transparent border was not pixel-identical. | Remove the border (visible at corners). |
| P-13 | Focus ring keeps today's `*-200` colour through new code-only `ring/*/focus` tokens; the ring offset stays white. | Figma has no ring tokens; it binds primitive `*-400` and offsets with `bg/body`. | Take the Figma ring (visible change; fixes a 2:1 contrast issue noted in the tokens). |
| P-14 | Button uses `bg/accent/default-inverse`, `-hover-inverse`, `-active-inverse` (the designer's binding for the secondary button's fill). | Followed the Figma binding. These three are on the "meaning unresolved" list (see G-07), so no other component uses them yet. | Rename once the binding check settles them. |
| P-15 | The open dropdown trigger's darker border is restored after the Button conversion made it lighter by class ordering. | Regression from the pilot; the trigger passes a class to Button and lost. | — |

### Rest of the kit

| ID | Decision | Why | Alternative |
| --- | --- | --- | --- |
| P-16 | The remaining components are converted from a mapping derived from the code, before the Figma bindings were read. | The binding check could not run unattended. Default look is proven identical by script and screenshots; dark and "next" are approximate until reconciled. | Wait for the binding check. |
| P-17 | A class is converted only if its role-appropriate token can hold exactly today's colour for every user of that token; otherwise it is left unconverted. | Keeps O-01 and O-05 without inventing tokens. | Force conversions and accept visible changes. |
| P-18 | Code-only `shadow/surface/md` (5 uses) and `shadow/accent/md` (2 uses). | Figma covers three shadow sizes; code uses six. | Leave those shadows unconverted. |
| P-19 | Role calls made in the mapping, least certain first: neutral text and fill levels sit one step lighter than Figma (text 800/500/400, fills 50/100); input focus is treated as "active"; keyboard highlight and focus are treated as "hover"; checked marks use `icon-accent-selected`; selected parts use the `surface` group; blue static text is `text-accent-primary`; the DAO avatar disc is `bg-brand-solid`; an open accordion item is "selected"; the tab trigger's underline is `border-surface-selected`. | Judgement from the code, not script-verified. | Each is reconciled against the Figma bindings. |
| P-20 | Focus rings on other components use `focus-ring ring-<group>-focus` without a variant on the colour class (Button uses `focus-visible:`). | The `focus-visible:` form would lose the ring on wrappers using `:has(:focus-visible)`, e.g. the accordion item. | Unify both forms later. |
| P-21 | Three classes in `dataListFilterStatus.tsx` are left unconverted. | The loading text is blue today only through class ordering; renamed, it would turn grey. Needs the code to choose the colour explicitly. | Fix the component, then convert. |

### Tooling and repo

| ID | Decision | Why |
| --- | --- | --- |
| P-22 | The app stylesheet imports the kit's semantic token CSS (with an app changeset). | Without it, converted kit components lose their colours in the app. |
| P-23 | The lint rule is a warning kit-wide and an error for folders with zero findings. | Stops regressions where the conversion is complete. |
| P-24 | The screenshot tool resolves Playwright from the app's dependencies; baseline images are not committed. | Adding the dependency to the kit changes the root lockfile; images are large and platform-dependent. |
| P-25 | Kit changesets: minor for the new layer and Button, patch for the conversion. | New public classes are additive; the conversion changes no pixels apart from P-09. |

## 3. Where the designer's values differ from today's code

Held back in the "next" theme; none affects the default look. Each is a deviation to argue at the value switch.
Status of all: `DESIGNER`.

### Button (from the Figma bindings)

| ID | Part | Code today | Figma |
| --- | --- | --- | --- |
| V-01 | Primary, pressed background | `primary-800` | `aragon/600` |
| V-02 | Disabled label, all variants | `neutral-300` | `gray/400` |
| V-03 | Secondary, hover background | `primary-50` | `gray/50` |
| V-04 | Secondary, pressed border | `primary-400` | `aragon/300` |
| V-05 | Secondary and ghost, hover label | `primary-400` (no change) | `aragon/500` |
| V-06 | Secondary and ghost, pressed icon | `primary-400` | `aragon/600` |
| V-07 | Tertiary border, default / hover | `neutral-100` / `neutral-200` | `gray/200` / `gray/300` |
| V-08 | Tertiary label, hover / pressed | `neutral-500` / `neutral-800` | `gray/600` / `gray/700` |
| V-09 | Tertiary icon, default / pressed | `neutral-300` / `neutral-500` | `gray/400` / `gray/600` |
| V-10 | Status buttons, default background | `*-100` | `*/50` |
| V-11 | Status buttons, default border | `*-300` | `*/400` |
| V-12 | Warning, pressed border | `warning-600` | `orange/500` |
| V-13 | Warning label | `warning-800` | `orange/700` |
| V-14 | Shadow colours | today's primary / slate / status colours | Figma's own raw values; status shadows are not bound at all |
| V-15 | Primary, hover shadow size | default | `md` |

### Other

| ID | Part | Code today | Figma |
| --- | --- | --- | --- |
| V-16 | Link, hover / pressed | `primary-500` / `primary-700` | `aragon/600` / `aragon/800` |
| V-17 | All components other than Button | — | Not yet compared: needs the Figma binding extraction (see T-01). |

## 4. Conflicts: one token, different colours in today's code

82 classes are left unconverted because the role-appropriate token is already fixed at another colour by a
different component. Each group is either a real distinction that needs its own token, or an inconsistency to
unify. The complete list, with file and line, is in `semantic-colors.component-map.json` → `conflicts`.
Status of all: `DESIGNER`, with the Figma bindings as evidence.

| ID | Group | Example |
| --- | --- | --- |
| C-01 | Status fills, pale | Tag backgrounds are `*-200`; alerts, avatar icons and input addons are `*-100`. |
| C-02 | Status fills, strong | Tooltip backgrounds are `*-300`; ping and progress are `*-500` (success progress `400`). |
| C-03 | Status borders | Input error/warning borders are `500` (hover `600`); the status buttons' are `300` (hover `500`); alert card `400`; spinner `300`. |
| C-04 | Status text and icons | Alert dialog titles and input addons use `*-600`; alerts and tags use `*-800`. Avatar and input icons use `600`; alert icons `500`. |
| C-05 | Accent interaction steps | The collapsible toggle hovers/presses at `primary-600`/`800` (icon `500`/`700`); the button at `400`/`600`. |
| C-06 | Neutral icon steps | Default icon is `neutral-300` on buttons and radios, `400` on checkbox, file input and search, `500` on tabs; hover, pressed and disabled steps differ similarly. |
| C-07 | Neutral text hover | Dropdown item, checkbox, radio and tab labels hover to `neutral-800`; the tertiary button stays `500`. |
| C-08 | Neutral borders | Pressed border is `400` on buttons and accordion, `300` on data list items, `200` on the dialog close; switch track `200` vs controls `100`; disabled border `300`/`200`/`100` in different controls. |
| C-09 | Neutral fills | Pressed fill is white on buttons, `neutral-50` on dialog close and wallet; icon wells are `50` or `primary-50` where the token is white or `primary-400`; avatar fallback `200` vs `100`; toggle "on" is white where the selected token is `50`. |
| C-10 | Selected state | Toggle "on" text is `primary-400` where the selected text token is `neutral-800`; an open accordion border is `neutral-200` where the selected border token is `primary-400`. |
| C-11 | Tint | Data list item pressed tint is `neutral-400/8`; the action item's is `neutral-800/8`. |

## 5. Classes left unconverted for other reasons

| ID | Count | Reason | Status |
| --- | --- | --- | --- |
| U-01 | 32 | No semantic class exists yet for the property: gradient utilities, `fill-*`, `caret-*`, single-side borders, the tab underline's shadow colour, `prose-neutral`, the collapsible fade. | OPEN |
| U-02 | 14 | No token fits the role. | DESIGNER |
| U-03 | 4 | Would need a token whose meaning is unresolved (progress neutral bar and marker, inverted spinner track, neutral tooltip background). | Waits on G-07 |
| U-04 | 3 | Class-ordering dependency (P-21). | OPEN |
| U-05 | 49 classes in 17 story files | Stories still use primitive classes; harmless, to be updated. | OPEN |
| U-06 | 2 | `var(--color-primary-*)` in the illustrations stylesheet. | OPEN |

## 6. Gaps in the Figma token set

| ID | Gap | Status |
| --- | --- | --- |
| G-01 | Dark mode is partly filled: 69 of the 160 non-effect tokens have the same value in Light and Dark (status borders, link text, most icons). Some are legitimately equal (brand blue); `text/accent/secondary` stays the darkest blue on a dark surface. | DESIGNER |
| G-02 | Shadows: colours for three sizes only, as raw hex, identical in both modes. | DESIGNER |
| G-03 | No focus-ring tokens (the kit has 45 focus-ring uses). Covered by code-only tokens (P-13). | PROVISIONAL |
| G-04 | Info has no hover/active states. Decided not a gap: info is only used for static tags and alerts (proposal statuses map to tag variants). | PROVISIONAL |
| G-05 | Duplicate names with the same value (37 within their own group), e.g. `bg/surface/primary` = `bg/surface/default`. Kept on purpose where one is a level and the other a state (P-01). | PROVISIONAL |
| G-06 | Values that look like placeholders: `bg/{success,warning,critical}/active` are white; `bg/surface/primary-inverse` is mid-grey in Light; the primitive `aragon/100a1` holds the `aragon/50` colour. | DESIGNER |
| G-07 | Meaning unresolved, not used outside Button: `bg/accent/{default,hover,active}-inverse`, `bg/surface/{primary,secondary,tertiary,hover,disabled}-inverse`, `border/accent/primary-inverse`, `bg/info/secondary`. Settled by reading what they are bound to (T-01). | OPEN |
| G-08 | `neutral-25` has no counterpart in the Figma grey ramp. | DESIGNER |
| G-09 | Some components still bind primitives directly in Figma (seen on Cards and Forms); they will not respond to the mode switch there. | DESIGNER |
| G-10 | No semantic layer for spacing, radius or type in Figma. Out of scope for this pass (O-02). | — |

## 7. Palette change (reviewed separately, O-06)

| ID | Item | Status |
| --- | --- | --- |
| L-01 | Slate grey → true neutral grey; lime → standard green; amber/coral/cyan → standard orange/red/cyan; ramps gain a 950 step. Visible to every consumer of the kit. | OPEN |
| L-02 | Contrast check where green replaces lime (e.g. `text-success-800` on `bg-success-100`). | OPEN |
| L-03 | Ramp renames (`neutral`→`gray`, `primary`→`aragon`, …): only in a later major release. | OPEN |
| L-04 | `.design-sync/tokens/README.md` records that earlier token work deliberately did not adopt the Figma palette or modes. Who decided that, and does it still hold? | OPEN |

## 8. Still to do

| ID | Item | Status |
| --- | --- | --- |
| T-01 | Read the Figma bindings for all components, compare them line by line with the component map, correct the mapping where the designer chose differently, and add each difference to section 3. | In progress (extraction) |
| T-02 | Convert the app (about 700 colour classes in 217 files, plus 37 hex literals and 27 `var(--color-*)` uses in charts, the wallet theme and the permissions graph). | OPEN |
| T-03 | Convert the design prototypes under `design/canvas` (about 265 colour-variable references and 148 palette classes), then refresh the canvases' copy of the kit. | OPEN |
| T-04 | Switch the default theme to the Figma values and enable dark mode in the app. Needs sections 3, 4 and 6 reviewed. | OPEN |
| T-05 | Remove primitive colour classes from the kit's public surface (major release), after a deprecation window. | OPEN |
| T-06 | Wire `tokens:semantic:check`, the map check and the screenshot comparison into CI. | OPEN |
| T-07 | Declare Playwright as a kit dev dependency (P-24). | OPEN |
| T-08 | Re-check two component-registry entries flagged stale by an unrelated earlier commit (`ensUtils`, `MemberAvatar`). | OPEN |
| T-09 | Spacing: audit the app's gaps and paddings and propose role tokens (inconsistent responsive rules, e.g. `gap-2 md:gap-3` nine times and `gap-3 md:gap-2` seven times). Separate track. | OPEN |
| T-10 | Product: should users get a light/dark/system toggle? Is per-DAO theming wanted? (The naming does not block either.) | OPEN |
