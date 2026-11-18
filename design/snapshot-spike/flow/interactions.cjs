'use strict';
// Spike3 flow: applies the hand-written interactions file (interactions.gd.json) to a state's IR before printing.
// Each control is found by kind + label/option + scope (page | dialog) and must match exactly one node, else assemble
// fails. Behaviours become handlers ({$js}, printed as-is by printer.cjs) that call the screen's xGo / xPick methods
// (LOGIC below); navigation clicks a hidden real anchor of the same screen (mechanism B), one per target (anchors()).
const norm = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
const textOf = (n) => {
    if (!n || typeof n !== 'object') return typeof n === 'string' ? n : '';
    if (Array.isArray(n)) return n.map(textOf).join(' ');
    if (n.k === 'text') return n.text;
    let t = n.kids ? textOf(n.kids) : '';
    if (n.k === 'kit' && n.props?.children) t += ` ${textOf(n.props.children)}`;
    return t;
};
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function nodesOf(body) {
    const out = [];
    const visit = (n, inDialog) => {
        if (!n || typeof n !== 'object') return;
        if (Array.isArray(n)) return n.forEach((x) => visit(x, inDialog));
        let d = inDialog;
        if (n.k === 'kit') {
            if (n.path === 'Dialog.Root' || n.path === 'Dialog.Content') d = true;
            out.push({ n, scope: d ? 'dialog' : 'page' });
        }
        for (const [k, v] of Object.entries(n)) if (k !== 'attrs' && v && typeof v === 'object') visit(v, d);
    };
    visit(body, false);
    return out;
}
const hasOption = (n, value) => {
    let hit = false;
    const visit = (x) => {
        if (hit || !x || typeof x !== 'object') return;
        if (Array.isArray(x)) return x.forEach(visit);
        if (x.k === 'kit' && /^(RadioCard|Radio)$/.test(x.path) && x.props?.value === value) hit = true;
        for (const [k, v] of Object.entries(x)) if (k !== 'attrs' && v && typeof v === 'object') visit(v);
    };
    visit(n.kids);
    return hit;
};

function find(ir, c) {
    const all = nodesOf(ir.body).filter((x) => x.scope === c.scope);
    const hits = [];
    for (const { n } of all) {
        if (c.kind === 'button' && n.path === 'Button' && norm(n.props?.['aria-label'] || textOf(n.kids) || textOf(n.props?.children)) === c.label) hits.push({ set: (js) => { n.props.onClick = js; } });
        if (c.kind === 'action') for (const v of Object.values(n.props ?? {})) if (isObj(v) && !v.k && v.label === c.label) hits.push({ set: (js) => { v.onClick = js; delete v.href; } });
        if (c.kind === 'close' && n.path === 'Dialog.Header' && n.props?.onClose) hits.push({ set: (js) => { n.props.onClose = js; } });
        if (c.kind === 'radios' && n.path === 'RadioGroup' && hasOption(n, c.option)) hits.push({ n, set: (js) => { n.props.onValueChange = js; } });
    }
    return hits;
}

// Mutates the IR; returns {targets, applied}. Throws when a control does not match exactly one node.
function apply(id, ir, controls) {
    const targets = new Set();
    const applied = [];
    for (const c of controls ?? []) {
        const hits = find(ir, c);
        const what = `${id}: ${c.kind} ${c.label ?? c.option ?? 'X'} (${c.scope})`;
        if (hits.length !== 1) throw new Error(`${what} matched ${hits.length} nodes`);
        const [h] = hits;
        if (c.kind === 'radios') {
            if (c.selectable || c.onPick) {
                // Uncontrolled: the choice changes on click (same initial selection as exported).
                if ('value' in h.n.props) { h.n.props.defaultValue = h.n.props.value; delete h.n.props.value; }
            }
            if (c.onPick) {
                Object.values(c.onPick).forEach((t) => targets.add(t));
                h.set({ $js: `(v) => this.xPick(v, ${JSON.stringify(c.onPick)})` });
            }
            applied.push(`${what}: ${c.onPick ? `onPick ${JSON.stringify(c.onPick)}` : 'selectable'}`);
            continue;
        }
        const g = c.go;
        if (typeof g === 'string') targets.add(g);
        else if (g.byRadio) Object.values(g.byRadio).forEach((t) => targets.add(t));
        else [g.ifFilled, g.else].filter(Boolean).forEach((t) => targets.add(t));
        h.set({ $js: `(e) => this.xGo(e, ${JSON.stringify({ scope: c.scope, go: g })})` });
        applied.push(`${what}: ${JSON.stringify(g)}`);
    }
    return { targets: [...targets], applied };
}

const anchors = (targets) => (targets.length ? `<!-- Navigation targets of this screen's interactions (interactions.gd.json), clicked by its handlers -->\n${targets.map((t) => `<a id="x-nav-${t}" href="${t}.dc.html" style="display:none">${t}</a>`).join('\n')}\n` : '');

// Methods of the screen's Component (fileFor extraLogic).
const LOGIC = `	// Interactions (spike3/interactions.gd.json): navigation = click on a hidden anchor of this screen.
	xRoot(scope) { const d = [...document.querySelectorAll('[role=dialog]')].pop(); return scope === 'dialog' && d ? d : document; }
	xField(root, label) {
		const norm = (t) => String(t || '').replace(/\\s+/g, ' ').trim();
		for (const l of root.querySelectorAll('label')) {
			// the kit's label also holds help text and "Optional": match the element whose own text is the label
			if (![l, ...l.querySelectorAll('*')].some((x) => norm(x.textContent) === label)) continue;
			const byFor = l.htmlFor && document.getElementById(l.htmlFor);
			if (byFor && /^(INPUT|TEXTAREA)$/.test(byFor.tagName)) return byFor;
			for (let p = l; p && p !== root; p = p.parentElement) { const f = p.querySelector('input:not([type=hidden]),textarea'); if (f) return f; }
		}
		return null;
	}
	xTarget(go, scope) {
		if (typeof go === 'string') return go;
		const root = this.xRoot(scope);
		if (go.byRadio) {
			const r = [...root.querySelectorAll('[role=radio]')].find((x) => x.getAttribute('aria-checked') === 'true' && x.getAttribute('value') in go.byRadio);
			return r ? go.byRadio[r.getAttribute('value')] : null;
		}
		const filled = go.fields.every((label) => { const f = this.xField(root, label); return !!f && f.value.trim() !== ''; });
		return filled ? go.ifFilled : go.else;
	}
	xNav(target) { const a = target && document.getElementById('x-nav-' + target); if (a) a.click(); }
	xGo(e, spec) { this.xNav(this.xTarget(spec.go, spec.scope)); }
	xPick(v, map) { this.xNav(map[v]); }
`;

module.exports = { apply, anchors, LOGIC };
