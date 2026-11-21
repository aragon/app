# Figma colour-variable bindings per component (raw extraction)

File `y386LuaRWRRcP5ZPz7esr8`, read 2026-11-19, read-only `use_figma` scripts (template: `scan-template.js.txt`, stored as text so the repo linter skips it; placeholders `__PAGES__`, `__START__`).
Semantic collection `VariableCollectionId:26865:22`, primitive collection `VariableCollectionId:13635:31495`.
Each `.txt` is the verbatim return of one call (copied byte-for-byte from the session transcript). Buttons page was done earlier: `button-bindings.txt` (in this folder; it sat one level up in the scratchpad).

## Files -> pages

| File | Pages (component index range) |
|---|---|
| `01-forms-a.txt` | Forms 1:31 (components 0-16 of 20) |
| `02-forms-b-core-1.txt` | Forms 1:31 (17-19), Alerts, Accordion, Avatars, Breadcrumbs, Cards, Clipboard, Collapsible, Data List, Definition List, Dialog, Dropdown, Heading |
| `03-proposal-modules-a.txt` | Proposal (all 21), Actions (37), Asset, Address, DAO, Member, Transaction (0-1 of 8) |
| `04-modules-b-core-2-app.txt` | Transaction (2-7), Votes, Wallet, Links, Spinner, Number, Progress, Select, States, Tabs, Tags, Tooltip, Toggles, Branding, Composers, Footers, Headers, Layouts, Navigations, Plugins, Icon, Illustrations (0-6 of 8) |
| `05-illustrations-tail.txt` | Illustrations (7: Illu404) |

All 41 requested pages are covered; nothing missing. Truncations were planned resume points (byte budget), each picked up by the next file; no component was cut mid-way.

## Format legend

- `=== PAGE name (id) components=N` then per component `## [index] Name (node id) Nv {Prop:values; ...}` (or `COMP` for a standalone component).
- Components = every COMPONENT_SET plus every COMPONENT not inside a set (and not nested inside another component/instance).
- Binding item: `<path> <kind> <token>`. Path = last 2 layer names below the variant root (`@` = the variant root itself; names over 22 chars cut with `~`).
- Kinds: `F` fill, `S` stroke, `T` text fill, `E` effect (shadow) colour (`in:` = inner shadow).
- `X=>Name` = nested INSTANCE (not descended), Name = its main component's set name (or component name).
- `X *F/*S/*T/*E token` (or `X>sublayer *F ...`) = a colour override set on that instance (on the instance itself or on one of its sublayers).
- Token: semantic variable name; `P:` = primitive variable; `RAW:#rrggbb[aa]` = unbound (with `{style name}` if a paint style supplied it); `@NN` = paint opacity %; `GRAD[a>b]` = gradient stops; `IMAGE` = image fill.
- Only visible layers and visible paints are recorded.
- `all:` = items present in every variant.
- ` - <condition> (n): ...` = group of n variants with an identical remaining binding list (exclusive groups).
- `ROWS` then ` + <condition> (n): ...` = alternative, denser layout chosen when shorter: each line lists items present in exactly that subset of variants (additive; a variant's full list = `all:` + every `+` line whose subset contains it).
- Conditions: `Prop=a/b; Prop2=c` = exact cartesian subset (props not named = any value). When the subset is not a product: `fixedProp=x :: [P1,P2] v1,v2 | v1,v3 | ... +N more` lists the combos (first 10 only).

## Notes seen in passing (not analysed)

- Warning/Critical/Success/Info shadows are unbound RAW colours throughout (e.g. `#db7d240d`, `#d627361a`, `#74af071a`, `#1588b91a`); surface/accent shadows are bound (`shadow/*`).
- Focus rings are effect pairs `bg/body` + primitive `P:aragon/400` (`P:red/400` on critical file avatar).
- Primitive bindings in otherwise semantic components: Input/Text focus placeholder/text `P:gray/300`/`P:gray/500`; TextareaRichtext cursor `P:gray/600`; _Action / Index text `P:gray/500`; _DataList / ActionItem `P:aragon/400` + `P:gray/500`; AssetInput link, AssetTransfer spacer/icon; AddressCheck card `P:gray/0`/`P:gray/100`; Member and Transaction data-list items (`P:gray/*`, icons `P:green/500`, `P:red/500`, `P:blue/500`); _TransactionDetail / Summary; _Navigation / DialogContent / Wallet / Default; Card and Dialog content `_Select` placeholder overrides `P:blue/600/700` (Dialog uses `text/info/*` for the same).
- Header / Member gradient is RAW white; Illu404 has RAW `#3164fa` and `#d9d9d9` (inside a `Subtract` boolean group).
- Token-family crossovers: Progress threshold stroke `bg/surface/primary`; Switch handle and StatePingAnimation fills use `icon/*`; _DataList / Filter cursor fill `text/surface/secondary`; Illustrations use `icon/brand/*` fills.
- Irregular state pairs: Input / NumberMax Critical Focus uses `border/critical/hover`; _AssetInput / Field Warning/Critical Hover uses `*/active` and Focus uses `*/hover`; TextareaRichtext Warning/Critical Focus+value text is `text/warning|critical/primary`; Input/Text Critical Default and Input/Time 24h Default have no shadow.
- Transparent tokens carry paint opacity: `bg/surface/transparent-default@1`, `-hover@4`, `-active@8`, Tag outline `bg/surface/transparent@0`.
- Icon page holds only the `Icon` wrapper set (3 sizes, nested instance `proposals`); glyph components are not on that page.
- Layer/component name typos visible in paths: `DefintionList`, `_ExtneralAddress`, `StateEmtpyWrapper`, `warpper`; Link Neutral label layer named `title` in some states.
