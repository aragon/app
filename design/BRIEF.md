# Brief: building or updating a live prototype

This is what a Claude agent is given before it builds a prototype or updates one. It is the brief used in the
18 November test, with the paths changed to this branch. The pitfalls at the end took most of the earlier work to
learn; they are the reason a prototype can be built in minutes.

## What a prototype is

A live prototype is one flow of the Aragon App as a single canvas file. A designer opens it on a claude.ai design
canvas, presses Play, and uses it like the app: full screen, clicking through, at desktop width and at phone width.
Afterwards they edit it to design changes. The bar is "close enough": the right content, layout and behaviour.
Pixel-exactness is not required.

## The file format

A `.dc.html` file that the canvas renders. It mounts real `@aragon/gov-ui-kit` React components from a bundle
(`window.GovUiKit`) and adds the app's own page layout around them.

- `<x-dc> … </x-dc>` holds the markup. `{{name}}` holes are filled from `renderVals()` in the
  `<script type="text/x-dc" data-dc-script>` block (`class Component extends DCLogic`). Holes are plain dotted lookups,
  never expressions.
- `<x-import component-from-global-scope="GovUiKit.Button" variant="primary" icon-left="PLUS">Label</x-import>` mounts a
  kit component. Attributes are props in kebab case; `{{hole}}` passes non-string values (numbers, booleans, objects,
  functions). Child markup is `children`.
- `<dc-import name="Footer" hint-size="100%,65px"></dc-import>` mounts another file of this folder (a part).
  `<dc-import>` takes no children: a part cannot wrap content.
- `<sc-for list="{{items}}" as="item">` and `<sc-if value="{{cond}}">` repeat and branch (see the pitfalls).
- Every file loads, in this order, after `<script src="./support.js"></script>`: `ds/aragon-gov-ui-kit/tokens.css`,
  `ds/aragon-gov-ui-kit/components/bundle.css`, `app.css`, `proto.css`,
  `ds/aragon-gov-ui-kit/components/lib/react-hook-form.js`, `ds/aragon-gov-ui-kit/components/bundle.js`. Copy the head
  of an existing prototype. The `ds/` files are the Governance UI Kit; they are installed on the canvas from the design
  system artifact and are not in this repo.

The canvas's own reference for the format is served with every design canvas (`artifact-type/reference/format.md`,
read with the Artifact tool).

## How a prototype is built

- A prototype is ONE file: its logic class holds `state` (current page or step, form values, open dialog),
  `renderVals()` returns one flag per screen plus the handlers, and each screen sits in its own `<sc-if>`.
- Each screen body or dialog is its own part file mounted with `<dc-import>`, taking its state and callbacks as props
  (document the props at the top of the part). The prototype file holds the frame, the state machine and the imports.
  `Dao.dc.html` and `CreateDaoFlow.dc.html` show both patterns.
- Use real Governance UI Kit components wherever the app does. Kit props: read the component's source in
  `packages/gov-ui-kit/src`. Do not guess props. Enum props take the enum's string value, usually UPPERCASE; a wrong
  value fails silently.
- Layout classes come from `app.css`, the app's page layout transcribed by hand with the app's breakpoints. Rules that
  only a prototype needs go in `proto.css`.
- Navigation BETWEEN prototypes is a real link: `<a href="Dao.dc.html">`, or a kit `Button` with `href`. A `<button>`
  inside an `<a>` swallows the click. Navigation INSIDE a prototype is state. A kit component that renders a link but
  must change state: give it `href="#nav:<target>"` and handle the click once on the part's root (see
  `DaoProposals.dc.html`), or `href="#"` with an `on-click` that calls `event.preventDefault()`.
- No dead ends: every exit of a prototype (close, logo, finishing) goes to another prototype. A control whose
  destination is not built does nothing (`href="#"`).
- Images are written as literal paths (`assets/mock/avatar/meridian.svg`, `assets/networks/base.svg`), never built
  in code: the publish step swaps each literal path for the canvas's upload of that image.

## Mobile is required

Every prototype works at 390 px wide as well as at 1440: nothing overflowing sideways, and the app's own mobile
layout. The app's responsive classes are in its source (`md:`, `lg:` …); inside the DAO page column they are container
queries (pitfall 7). Where the app swaps navigation on small screens, so does the prototype (`DaoNav.dc.html`).
There are no separate phone frames: a prototype is checked at phone width by narrowing the same file.

## Ground truth

- The app source: `apps/app/src`. Copy structure, order, spacing and copy from the source, not from an idea of the
  page. Strings: `apps/app/src/assets/locales/en.json`.
- Plugin content: pages render plugin "slot" components (token voting, multisig, …) registered in
  `apps/app/src/plugins/<plugin>/index.ts` (`grep -rn registerSlotComponent apps/app/src/plugins/<plugin>`).
- App components that are not in the kit (anything under `apps/app/src/shared/components`) are rebuilt as markup with
  classes in `app.css`. Search `app.css` for the component's file name before adding rules.
- Not on `main`, and used in the test: reference screenshots of the app on mock data, the mock data itself, and
  static screens of every app page. They are on the branch `docs/design-canvas` (`design/reference/`,
  `design/baseline-check/data.cjs`, `design/canvas/`). The DAO pages and the explore page here were made by lifting
  the matching static screen and making it live; the two wizards were built from the app source and the screenshots.

## Checking

The test used a load check only: each prototype was rendered through the canvas runtime at 1440 and 390 px wide and
had to show no page errors and no sideways overflow. The script for that is now `design/publish/check-canvas.cjs`
(`RUNBOOK.md`, "Load check"). Nothing compares a prototype with the app.

## Rules

- No tools. No generators, no test frameworks. Write the files.
- Change only the files the task names. Several agents can write into `design/canvas/` at once if each owns its files.
- Report plainly: files written, what works, what was left out and why, page errors at both widths.

## Pitfalls of the canvas runtime (all verified, each one bit us)

1. **Unknown classes do nothing.** A class passed with `class-name` / `layout-class-name` / `class` must exist in the kit
   stylesheet (the kit's `components/bundle.css`) or in `app.css`. The kit stylesheet only
   contains classes the kit itself uses, so app classes like `lg:grid-cols-2` may be missing.
2. **Every mounted component gets wrapped** in an extra element by the canvas. Consequences:
   - kit `:last-child` rules break: rows of a `DefinitionList` lose their divider. Wrap every row except the last in
     `<div class="dl-row">…</div>`;
   - text a kit component must receive as a plain string (e.g. `DefinitionList.Item` with a `link`) goes in the
     `children="…"` attribute, not as element content;
   - `style` on an `<x-import>` / `<dc-import>` keeps only position and size. Use `class-name` for colour, typography.
3. **Lists that paginate count children.** Items of a `DataList.Container` followed by `DataList.Pagination` must be
   written out one per line, starting at column 0 (no indentation, no `<sc-for>`), with the closing `</x-import>` of the
   container also at column 0 — otherwise the pagination reads "3 of 9" instead of "9 of 9". See `DaoProposals.dc.html`.
4. **Text colour.** Text that has no colour class in the app is black (the app's `<body>` sets no colour), and so is it on
   the canvas: do not add `color` to make it grey or neutral-800 unless the app source does. When an app element sets a
   colour class for its children (e.g. `text-neutral-800` on a cell), set it on your wrapper too.
5. **Line heights.** Tailwind's `leading-*` does not inherit into children that set a text size (e.g. a parent with
   `leading-tight` and children with `text-base` / `text-sm` keep 24px / 20px). When you transcribe
   text, give each text element its own `line-height` (text-sm 20px, text-base 24px or 1.25 when `leading-tight`,
   text-lg 28px, text-xl 28px).
6. **Dates.**
   - A kit component that prints a date relative to now ("3 days left"): pass an offset from `Date.now()`.
   - A kit prop that takes a date and prints it as an absolute date: pass a timezone-less local ISO string copied from
     the screenshot (`date="2026-11-14T18:18:00"`); it then prints the same text in any timezone.
   - Relative text the app prints itself (e.g. "2 days ago" in a stat): compute it in `renderVals` with
     `GovUiKit.formatterUtils.formatDate(Date.now() - 2 * day, { format: GovUiKit.DateFormat.RELATIVE })`, the
     formatter the app uses.
   - Absolute dates in your own markup: fixed text copied from the screenshot.
7. **Breakpoint classes.** The app's `sm:`/`md:`/`lg:`/`xl:` classes inside the page column are container queries on the
   column, not the window (`apps/app/src/modules/application/components/layouts/layoutRoot/breakpoints.css`); at 1440
   with the sidebar the column is narrower than `xl`. When you copy such classes into `class-name` check first: the kit stylesheet rarely has them. Add the rule to `app.css` the way existing rules do (`@container app`
   inside `.app-column`), or drop it if it has no effect at the widths drawn.
8. **Radix `asChild` components crash** (`Tooltip` with `trigger-as-child`, any Slot): the canvas wrapper breaks the
   single-child rule. Draw only the trigger (a closed tooltip shows nothing else) and say so.
9. **`false` vs missing.** The kit sometimes treats `children={false}` differently from no children (e.g.
   `ProposalActions.Footer` renders an empty 16px row for `false`). Pass `children="{{no}}"` with `no: false` when the
   app passes `false`.
10. **Controlled inputs.** A kit input given `value` needs `on-change="{{noop}}"` (`noop: () => undefined`).
11. **Links** go only to screens that exist in `project/`; otherwise `href="#"`. Kit `Button` takes `href` directly; do
   not wrap a button in `<a>`.

Verified to work on the canvas: `ToggleGroup`/`Toggle`, `DataList.*` (also `DataList.Item` on its own),
`DefinitionList.*` (with the wrapper rule), `Accordion.*`, `Collapsible`, `CardCollapsible`, `CardEmptyState`,
`EmptyState`, `DocumentParser`, `ProposalVoting.*` (an inactive tab renders nothing; `Tabs.List` hides itself with one
tab), `ProposalActions.*`, `ActionSimulation`, `Breadcrumbs`, all `*DataListItem.Structure`, `Wallet`, `DaoAvatar`,
`MemberAvatar`, `Avatar`, `AvatarIcon`, `AddressOutput`, `AddressInput`, `InputText`, `TextArea`, `InputFileAvatar`,
`InputContainer`, `RadioGroup`/`RadioCard`, `Progress`, `Link`, `Tag`, `Button`, `Card`, `Heading`, `Icon`,
`IllustrationObject`. Not working: `Tooltip` with `trigger-as-child` (pitfall 8).

### More, learned while drawing the static screens

- **Kit props with a capital first letter** (e.g. `ProposalActions.Item`'s `CustomComponent`) can't be set as a kebab attribute: pass `dc-props="{{obj}}"`, an object merged into the props. Props that take a component can be filled in `renderVals()` with `React.createElement` (`window.React`, `GovUiKit`, `ReactHookForm` are globals).
- **Kit components that call `useFormContext`** throw outside a form: wrap them in a global provider, e.g. `window.X = (p) => { const m = ReactHookForm.useForm(); return React.createElement(ReactHookForm.FormProvider, m, p.children) }`, mounted with `<x-import component-from-global-scope="X">`.
- **State the kit derives from the connected wallet** (the "You" tag on member rows, "by You", the connected `Wallet`) can't be reproduced: write that piece out with the same kit components the app uses.
- **Footer**: `with-sidebar="{{yes}}"` needs `yes: true` in `renderVals()`. A page 65 px taller than a 900 px reference usually means it is missing. On short pages the footer renders at height 0.
- **Height off by exactly one flex `gap`**: look in the app source for an element that is mounted but hidden (`sr-only`); it still takes a gap.
- **`AvatarIcon`/`Avatar` `responsive-size`** renders the small size on the canvas: pass the size the reference shows.
- **Which plugin renders a slot**: grep `registerSlotComponent` in the plugin; if the plugin registers none, the module's default component is used.
- **Unknown / unverified actions** in `ProposalActions` need `inputData: null`.
- **Dates**: relative labels come from `formatterUtils.formatDate(…, {format: RELATIVE})` on `Date.now()` offsets; status and absolute dates often exist only in the screenshot: copy them.