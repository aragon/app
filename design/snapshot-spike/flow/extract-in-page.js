// Runs inside the app page (React 19 dev build). Walks the fiber tree from <body> and returns an IR tree:
//   {k:'el', tag, attrs:[[name,value]], kids:[...]}   host element (attributes read from the DOM node)
//   {k:'text', text}
//   {k:'kit', path, props:{...encoded}, kids:[...], owner}  gov-ui-kit instance; kids = what the app passed as children
// Encoded prop values: plain JSON, or {$fn:name}, {$date:iso}, {$undef:1}, {$el:IR|null}, {$drop:reason}.
// kitExports: the gov-ui-kit module namespace object (same identities the app renders).
(kitExports) => {
    const stats = { kit: {}, dropped: [], fns: [], elProps: [], portals: 0, hidden: 0, unmatchedKit: {} };
    // ---- identity map type -> "Path" ----
    const kitPath = new Map();
    const reg = (value, p) => {
        if (value && (typeof value === 'function' || (typeof value === 'object' && value.$$typeof))) {
            if (!kitPath.has(value)) kitPath.set(value, p);
        }
    };
    // Dotted paths first (DataList.Root rather than its flat alias), as the hand-drawn screens use them.
    for (const [name, value] of Object.entries(kitExports)) {
        if (/^[A-Z]/.test(name) && value && typeof value === 'object' && !value.$$typeof) {
            for (const [sub, v] of Object.entries(value)) {
                if (/^[A-Z]/.test(sub)) reg(v, `${name}.${sub}`);
            }
        }
    }
    for (const [name, value] of Object.entries(kitExports)) {
        if (/^[A-Z]/.test(name)) reg(value, name);
    }
    // Spike2: react-hook-form's FormProvider is exported too (kit inputs call useFormContext); the canvas mounts its own.
    const pathOf = (fiber) => kitPath.get(fiber.elementType) ?? kitPath.get(fiber.type) ?? (fiber.type?.name === 'FormProvider' ? '$FormProvider' : undefined);
    // Spike2: transitions. window.__xTargets = [{el, to}]: the fiber that receives the click is the innermost kit
    // instance above el (or a host element with an onClick handler, if that comes first).
    const gotoOf = new Map();
    // Spike3 links: the fiber that receives a click on element el (used at export time for listed targets, and later by
    // the journey's click recorder through window.__xHit, against the xids of the last export).
    const findHit = (el) => {
        const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
        let f = el[key];
        let hit = null;
        for (; f; f = f.return) {
            if ((f.tag === 0 || f.tag === 1 || f.tag === 11 || f.tag === 14 || f.tag === 15) && pathOf(f)) {
                // A host element with a handler found first wins only when the app rendered it (its owner is not inside this kit instance).
                const inside = (o) => { for (let g = o; g; g = g._debugOwner) if (g === f || g === f.alternate) return true; return false; }; // owner chain: kit-internal markup was rendered by the kit instance
                if (!hit || inside(hit._debugOwner)) hit = f;
                break;
            }
            if (f.tag === 5 && (f.memoizedProps?.onClick || f.memoizedProps?.onMouseDown) && !hit) { hit = f; }
        }
        // A kit instance rendered by another kit instance (DataList.Item inside AssetDataListItem.Structure) is not in
        // the export: climb to the kit instance whose owner chain does not lead to another kit instance above it.
        if (hit && pathOf(hit)) {
            for (let g = hit.return; g; g = g.return) {
                if (!pathOf(g)) continue;
                let owned = false;
                for (let o = hit._debugOwner; o; o = o._debugOwner) if (o === g || o === g.alternate) { owned = true; break; }
                if (owned) hit = g;
            }
        }
        return hit;
    };
    for (const t of window.__xTargets ?? []) {
        const hit = findHit(t.el);
        if (hit) { gotoOf.set(hit, t.to); if (hit.alternate) gotoOf.set(hit.alternate, t.to); stats.targets = [...(stats.targets ?? []), (pathOf(hit) ?? hit.type) + '->' + t.to]; }
        else stats.targets = [...(stats.targets ?? []), 'NOT FOUND ->' + t.to];
    }

    // Spike3 links: every exported node gets an xid; fiber (and its alternate) -> xid stays in the page so a later click
    // can be mapped to the node of this export it hit.
    const xids = new Map();
    let xseq = 0;
    const tagX = (fiber, node) => { node.xid = ++xseq; xids.set(fiber, node.xid); if (fiber.alternate) xids.set(fiber.alternate, node.xid); };
    window.__xHit = (el) => {
        const hit = findHit(el);
        const text = (el.closest('button,a,[role=button],[role=radio]') ?? el).innerText?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? '';
        const desc = `${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''} "${text}"`;
        if (!hit) return { xid: null, desc, text };
        // A hit that is not in this export (an element that appeared after it, e.g. in a dialog opened later) is no link
        // from this state: xid null, so the recorder looks at the clicks before it.
        return { xid: xids.get(hit) ?? null, what: pathOf(hit) ?? hit.type, desc, text };
    };

    const rootFiber = (() => {
        const key = Object.keys(document.body).find((k) => k.startsWith('__reactFiber$'));
        return document.body[key];
    })();

    // ---- prop encoding ----
    const isElement = (v) => v && typeof v === 'object' && (v.$$typeof === Symbol.for('react.transitional.element') || v.$$typeof === Symbol.for('react.element'));
    const isPlain = (v) => {
        const p = Object.getPrototypeOf(v);
        return p === Object.prototype || p === null;
    };

    // Within one kit instance: app-owned fibers keyed by their props object (fiber.memoizedProps === element.props).
    const encode = (v, ctx, where, depth = 0, seen = new Set()) => {
        if (v === undefined) return { $undef: 1 };
        if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
        if (typeof v === 'number') return Number.isFinite(v) ? v : { $drop: `non-finite number ${v}` };
        if (typeof v === 'bigint') return { $bigint: String(v) };
        if (typeof v === 'function') {
            const key = where.split('.').pop();
            if (/^on[A-Z]/.test(key)) {
                stats.fns.push(where);
                return { $fn: v.name || 'anonymous' };
            }
            // Spike2: a component passed as a prop (e.g. ProposalActions.Item CustomComponent): export what it rendered
            // inside this kit instance, so the canvas gets a component drawing the same markup.
            const key2 = where.split('.').pop();
            if (/^[A-Z]/.test(key2) && ctx.kit) {
                const find = (g) => { for (let c = g.child; c; c = c.sibling) { if (c.type === v || c.elementType === v) return c; const r = find(c); if (r) return r; } return null; };
                const f = find(ctx.kit);
                if (f) { stats.compProps = (stats.compProps ?? 0) + 1; return { $comp: kidsOf(f) }; }
            }
            stats.dropped.push(`${where} (function)`);
            return { $drop: 'function (component or render prop)' };
        }
        if (typeof v === 'symbol') return { $drop: 'symbol' };
        if (v instanceof Date) return { $date: v.toISOString() };
        if (isElement(v)) {
            const f = findFiber(v, ctx);
            stats.elProps.push(where);
            if (f) return { $el: walk(f) };
            return { $el: [fromElement(v)] };
        }
        if (seen.has(v) || depth > 8) return { $drop: 'circular/deep' };
        if (Array.isArray(v)) {
            seen.add(v);
            return v.map((x, i) => encode(x, ctx, `${where}[${i}]`, depth + 1, seen));
        }
        if (!isPlain(v)) {
            stats.dropped.push(`${where} (${v.constructor?.name ?? 'object'})`);
            return { $drop: `instance of ${v.constructor?.name ?? '?'}` };
        }
        seen.add(v);
        const out = {};
        for (const [k, x] of Object.entries(v)) out[k] = encode(x, ctx, `${where}.${k}`, depth + 1, seen);
        return out;
    };

    // ---- walk ----
    const kidsOf = (fiber) => {
        const out = [];
        for (let c = fiber.child; c; c = c.sibling) out.push(...walk(c));
        return out;
    };
    const SKIP_TAGS = new Set(['SCRIPT', 'NOSCRIPT', 'NEXT-ROUTE-ANNOUNCER', 'NEXTJS-PORTAL', 'TEMPLATE', 'LINK', 'STYLE', 'META', 'TITLE']);

    function walk(fiber) {
        switch (fiber.tag) {
            case 6: // HostText
                return [{ k: 'text', text: fiber.memoizedProps }];
            case 5: // HostComponent
            case 27: { // HostSingleton
                const el = fiber.stateNode;
                if (SKIP_TAGS.has(el.tagName)) return [];
                const attrs = [...el.attributes].map((a) => [a.name, a.value]);
                // A host element whose only child is a string gets no text fiber: React sets textContent directly.
                const c = fiber.memoizedProps?.children;
                const kids = typeof c === 'string' || typeof c === 'number' ? [{ k: 'text', text: String(c) }] : kidsOf(fiber);
                const node = { k: 'el', tag: el.tagName.toLowerCase(), svg: el.namespaceURI === 'http://www.w3.org/2000/svg', attrs, kids };
                if (gotoOf.has(fiber)) node.goto = gotoOf.get(fiber);
                tagX(fiber, node);
                return [node];
            }
            case 26: // HostHoistable (<link>, <style>, <title>)
                return [];
            case 4: { // HostPortal: rendered elsewhere in the document (open dialogs, menus). Spike2: exported in place.
                stats.portals += 1;
                return kidsOf(fiber);
            }
            case 22: // Offscreen (hidden Suspense / Activity content)
                if (fiber.memoizedProps?.mode === 'hidden') {
                    stats.hidden += 1;
                    return [];
                }
                return kidsOf(fiber);
            case 0: case 1: case 11: case 14: case 15: {
                // Dev-only tooling the app mounts in development (react-hook-form's <DevTool>: the pink "Show dev
                // panel" square at the top right and its hidden panel) is not part of the UI: not exported.
                const nm = fiber.type?.displayName ?? fiber.type?.name ?? fiber.type?.render?.name ?? '';
                if (nm === 'DevTool') { stats.devOnly = (stats.devOnly ?? 0) + 1; return []; }
                const p = pathOf(fiber);
                if (p) return [kitNode(fiber, p)];
                return kidsOf(fiber);
            }
            default:
                return kidsOf(fiber);
        }
    }

    // The fiber an element passed into a kit instance became: same props object; else (cloneElement, Radix Slot) the
    // first unused fiber of the same type (and className) in the kit's subtree.
    function findFiber(x, ctx) {
        let f = ctx.byProps.get(x.props);
        if (!f && ctx.appOwned) f = ctx.appOwned.find((g) => !ctx.used.has(g) && (g.elementType === x.type || g.type === x.type));
        if (!f && ctx.kit) {
            const want = x.props?.className;
            const search = (g) => {
                for (let c = g.child; c; c = c.sibling) {
                    if (!ctx.used.has(c) && (c.elementType === x.type || c.type === x.type) && c.memoizedProps?.className === want) return c;
                    const r = search(c);
                    if (r) return r;
                }
                return null;
            };
            f = search(ctx.kit);
            if (f) stats.slotMatched = (stats.slotMatched ?? 0) + 1;
        }
        if (f) ctx.used.add(f);
        return f;
    }

    // IR from a React element that has no fiber (never rendered).
    function fromElement(x) {
        if (x == null || typeof x === 'boolean') return { k: 'text', text: '' };
        if (typeof x === 'string' || typeof x === 'number') return { k: 'text', text: String(x) };
        const p = kitPath.get(x.type);
        const props = x.props ?? {};
        const kidsOf = (c) => (c === undefined ? [] : (Array.isArray(c) ? c.flat(Infinity) : [c]).filter((y) => y != null && typeof y !== 'boolean').map(fromElement));
        if (p) {
            stats.unrenderedKit = (stats.unrenderedKit ?? 0) + 1;
            const ctx = { byProps: new Map(), used: new Set() };
            const enc = {};
            for (const [k, v] of Object.entries(props)) if (k !== 'children') enc[k] = encode(v, ctx, `${p}.${k}`);
            const c = props.children;
            const mode = typeof c === 'string' || typeof c === 'number' ? 'text' : c === undefined ? 'none' : c === false || c === null ? String(c) : 'nodes';
            return { k: 'kit', path: p, props: enc, kids: kidsOf(c), childrenMode: mode, unused: 0 };
        }
        if (typeof x.type === 'string') {
            const attrs = Object.entries(props).filter(([k, v]) => k !== 'children' && (typeof v === 'string' || typeof v === 'number')).map(([k, v]) => [k === 'className' ? 'class' : k, String(v)]);
            return { k: 'el', tag: x.type, attrs, kids: kidsOf(props.children) };
        }
        return { k: 'missing', type: x.type?.displayName || x.type?.name || '?' };
    }

    // Collects the fibers inside a kit instance whose owner is outside it: what the app passed in.
    function kitNode(fiber, p) {
        stats.kit[p] = (stats.kit[p] ?? 0) + 1;
        const inside = new Set();
        const mark = (f) => {
            inside.add(f);
            if (f.alternate) inside.add(f.alternate);
            for (let c = f.child; c; c = c.sibling) mark(c);
        };
        mark(fiber);
        const appOwned = [];
        const collect = (f) => {
            for (let c = f.child; c; c = c.sibling) {
                const owner = c._debugOwner;
                // Text fibers carry no owner of their own in some cases: treat them through their parent.
                const outside = c.tag === 6 ? false : owner != null && !inside.has(owner);
                if (outside) appOwned.push(c);
                else { if (c.tag === 4) stats.kitPortals = (stats.kitPortals ?? 0) + 1; collect(c); }
            }
        };
        collect(fiber);
        const ctx = { byProps: new Map(appOwned.map((f) => [f.memoizedProps, f])), used: new Set(), appOwned, kit: fiber };
        const props = {};
        const raw = fiber.memoizedProps ?? {};
        for (const [k, v] of Object.entries(raw)) {
            if (k === 'children') continue;
            props[k] = encode(v, ctx, `${p}.${k}`);
        }
        let kids = [];
        const ch = raw.children;
        let childrenMode = 'none';
        if (typeof ch === 'string' || typeof ch === 'number') {
            kids = [{ k: 'text', text: String(ch) }];
            childrenMode = 'text';
        } else if (ch === false || ch === null) {
            childrenMode = String(ch);
        } else if (ch !== undefined) {
            childrenMode = 'nodes';
            // Children that are text mixed with elements: React creates text fibers that we skipped above;
            // emit the children prop in order, matching elements to their fibers.
            const flat = [];
            const flatten = (x) => {
                if (Array.isArray(x)) x.forEach(flatten);
                else flat.push(x);
            };
            flatten(ch);
            for (const x of flat) {
                if (x == null || typeof x === 'boolean') continue;
                if (typeof x === 'string' || typeof x === 'number') kids.push({ k: 'text', text: String(x) });
                else if (isElement(x)) {
                    let f = ctx.byProps.get(x.props);
                    if (!f) {
                        // cloneElement / Radix Slot (asChild) give the fiber a new props object: match by type, in order.
                        f = appOwned.find((g) => !ctx.used.has(g) && (g.elementType === x.type || g.type === x.type));
                        if (f) stats.typeMatched = (stats.typeMatched ?? 0) + 1;
                    }
                    if (!f) {
                        // cloneElement with a ref (Radix Slot) also moves the owner inside the kit: search the whole
                        // kit subtree for a fiber of the same type and className.
                        const want = x.props?.className;
                        const search = (g) => {
                            for (let c = g.child; c; c = c.sibling) {
                                if (!ctx.used.has(c) && (c.elementType === x.type || c.type === x.type) && c.memoizedProps?.className === want) return c;
                                const r = search(c);
                                if (r) return r;
                            }
                            return null;
                        };
                        f = search(fiber);
                        if (f) stats.slotMatched = (stats.slotMatched ?? 0) + 1;
                    }
                    if (f) {
                        ctx.used.add(f);
                        kids.push(...walk(f));
                    } else {
                        // Not rendered by the kit (e.g. a hidden branch), or rendered under a different props object.
                        // Not rendered by the kit (the kit hid it: a one-tab Tabs.List, a closed dialog). Emit it from
                        // the element itself when it is a kit component or a host element, so the canvas gets the
                        // same children and makes the same decision; an app component cannot be expanded without fibers.
                        kids.push(fromElement(x));
                    }
                } else if (typeof x === 'function') {
                    kids.push({ k: 'missing', type: 'render-function child' });
                }
            }
        }
        const unused = appOwned.filter((f) => !ctx.used.has(f)).length;
        const node = { k: 'kit', path: p, props, kids, childrenMode, unused };
        if (gotoOf.has(fiber)) node.goto = gotoOf.get(fiber);
        tagX(fiber, node);
        return node;
    }

    const html = document.documentElement;
    const body = walk(rootFiber)[0];
    return {
        htmlAttrs: [...html.attributes].map((a) => [a.name, a.value]),
        body,
        stats,
        kitCount: kitPath.size,
    };
}
