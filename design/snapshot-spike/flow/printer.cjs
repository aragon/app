'use strict';
// Spike2: prints exported IR (extract-in-page.js) as canvas markup. Unlike the spike's export.cjs it prints a MERGED
// tree of several states of one journey (merge.cjs): every node knows the states it exists in (`st`), and per state its
// attributes / props / text. A node present in fewer states than its parent gets an <sc-if>; a value that differs
// between states becomes a hole whose renderVals entry picks by the current state. Click targets recorded while
// driving the app (`gotoBy`) become handlers that switch the state.
const fs = require('node:fs');
const path = require('node:path');
const L = require('/home/user/app/design/baseline-check/lib.cjs');

const SCREENS = L.SCREENS;
const ROUTES = new Map(SCREENS.screens.filter((s) => s.route).map((s) => [s.route, s.artboard]));

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'source', 'col', 'area', 'wbr']);
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\{\{/g, '{&#123;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\{\{/g, '{&#123;');
const kebab = (k) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const same = (values) => values.every((v) => JSON.stringify(v) === JSON.stringify(values[0]));

function makePrinter({ canvasDir, states }) {
    const report = { holes: 0, stateHoles: 0, ifs: 0, gotos: [], links: { mapped: [], unmapped: [] }, inputs: [], missing: [], workarounds: new Set() };
    const vals = [];
    const addVal = (base, src) => {
        const n = `${base.replace(/[^a-zA-Z0-9]/g, '_')}${vals.length}`;
        vals.push([n, src]);
        report.holes += 1;
        return n;
    };
    const ifCache = new Map();
    const ifVal = (st) => {
        const key = st.join(',');
        if (!ifCache.has(key)) {
            ifCache.set(key, addVal(`in_${st.length === 1 ? st[0] : 'n'}_`, `${JSON.stringify(st)}.includes(view)`));
        }
        return ifCache.get(key);
    };

    const mediaToFetch = new Set();
    const mapUrl = (name, value) => {
        if (typeof value !== 'string') return value;
        if (value.includes('/_next/static/media/')) {
            return value.replace(/(?:https?:\/\/[^/"')\s]+)?\/_next\/static\/media\/([^"')\s?]+)/g, (full, file) => {
                mediaToFetch.add(file);
                return `app-export-assets/${file}`;
            });
        }
        if (name === 'href' && value.startsWith('/')) {
            // Links that leave the flow: an app route with a drawn screen opens that screen; anything else goes nowhere.
            const route = value.split(/[?#]/)[0];
            const art = ROUTES.get(route);
            if (art) {
                report.links.mapped.push(`${route} -> ${art}`);
                return art;
            }
            report.links.unmapped.push(route);
            return '#';
        }
        if (name === 'src' || /mock-assets\.aragon\.test/.test(value)) {
            let v = value;
            if (v.startsWith('/_next/image')) v = new URL(v, 'http://x').searchParams.get('url') ?? v;
            const m = v.match(/mock-assets\.aragon\.test\/(token|avatar)\/([a-z0-9-]+)\.(?:svg|png)/);
            if (m) return `assets/mock/${m[1]}/${m[2]}.svg`;
            if (name === 'src' && v.startsWith('/')) {
                const file = path.join('/home/user/app/apps/app/public', v.split('?')[0]);
                if (fs.existsSync(file)) {
                    const rel = `app-public${v.split('?')[0]}`;
                    fs.mkdirSync(path.dirname(path.join(canvasDir, rel)), { recursive: true });
                    fs.copyFileSync(file, path.join(canvasDir, rel));
                    return rel;
                }
            }
            return v;
        }
        return value;
    };

    const toJS = (v, key = '') => {
        if (typeof v === 'string') return JSON.stringify(mapUrl(key, v));
        if (typeof v === 'number' && Math.abs(v - L.NOW_MS) < 2 * 365 * 864e5 && v > 1e12) {
            const d = v - L.NOW_MS;
            const days = d / 864e5;
            return Number.isInteger(days) ? `now + ${days} * day` : Number.isInteger(d / 36e5) ? `now + ${d / 36e5} * hour` : `now + ${d}`;
        }
        if (v === null || typeof v !== 'object') return v === undefined ? 'undefined' : JSON.stringify(v);
        if (Array.isArray(v)) return `[${v.map((x) => toJS(x)).join(', ')}]`;
        if ('$js' in v) return v.$js; // hand-written interaction handler (interactions.cjs)
        if ('$fn' in v) return 'noop';
        if ('$undef' in v || '$drop' in v) return 'undefined';
        if ('$date' in v) {
            const t = Date.parse(v.$date);
            return Math.abs(t - L.NOW_MS) < 2 * 365 * 864e5 ? `new Date(${toJS(t)})` : `new Date(${JSON.stringify(v.$date)})`;
        }
        if ('$bigint' in v) return `${v.$bigint}n`;
        if ('$el' in v) return v.$el ? irToJS(v.$el) : 'null';
        if ('$comp' in v) { report.workarounds.add('components passed as props exported as render functions (renderVals)'); return `memo(${JSON.stringify(`c${curState}${compSeq++}`)}, () => ${irToJS(v.$comp.length ? v.$comp : [{ k: 'text', text: '' }])})`; }
        return `{ ${Object.entries(v)
            .filter(([, x]) => !(x && typeof x === 'object' && ('$drop' in x || '$undef' in x)))
            .map(([k, x]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${toJS(x, k)}`)
            .join(', ')} }`;
    };
    const styleObj = (s) =>
        `{ ${s
            .split(';')
            .map((d) => d.trim())
            .filter(Boolean)
            .map((d) => {
                const i = d.indexOf(':');
                const k = d.slice(0, i).trim();
                const key = k.startsWith('--') ? JSON.stringify(k) : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                return `${key}: ${JSON.stringify(d.slice(i + 1).trim())}`;
            })
            .join(', ')} }`;
    function irToJS(nodes) {
        const list = Array.isArray(nodes) ? nodes : [nodes];
        const one = (n) => {
            if (n.k === 'text') return JSON.stringify(n.text);
            if (n.k === 'el') {
                const props = n.attrs.map(([a, v]) => {
                    if (a === 'class') return `className: ${JSON.stringify(v)}`;
                    if (a === 'for') return `htmlFor: ${JSON.stringify(v)}`;
                    if (a === 'style') return `style: ${styleObj(v)}`;
                    return `${JSON.stringify(a)}: ${JSON.stringify(mapUrl(a, v))}`;
                });
                if (n.goto) props.push(`onClick: go(${JSON.stringify({ [curState]: n.goto })})`);
                return `h(${JSON.stringify(n.tag)}, { ${props.join(', ')} }${n.kids.map((k) => `, ${one(k)}`).join('')})`;
            }
            if (n.k === 'kit') {
                const hasChange = n.props.onChange && n.props.onChange.$fn;
                const props = Object.entries(n.props)
                    .filter(([, x]) => !(x && typeof x === 'object' && ('$drop' in x || '$undef' in x)))
                    .filter(([k]) => !(n.goto && k === 'onClick'))
                    .map(([k, x]) => `${hasChange && k === 'value' && n.path !== 'TextAreaRichText' ? 'defaultValue' : k}: ${toJS(x, k)}`);
                if (n.goto && n.path === 'Button' && /\.dc\.html$/.test(n.goto)) { props.push(`href: ${JSON.stringify(n.goto)}`); report.gotos.push(`Button (inside a component prop): href ${n.goto}`); }
                else if (n.goto) { props.push(`onClick: go(${JSON.stringify({ [curState]: n.goto })})`); report.gotos.push(`${n.path} (inside a component prop): ${curState}->${n.goto}`); }
                if (n.path === '$FormProvider') return `h(window.ExportFormProvider, null${n.kids.map((k) => `, ${one(k)}`).join('')})`;
                return `h(GovUiKit.${n.path}, { ${props.join(', ')} }${n.kids.map((k) => `, ${one(k)}`).join('')})`;
            }
            return 'null';
        };
        return list.length === 1 ? one(list[0]) : `h(React.Fragment, null${list.map((k) => `, ${one(k)}`).join('')})`;
    }

    // A value that may differ per state: literal when equal everywhere, else a pick() hole.
    let curState = '';
    let compSeq = 0;
    const perState = (m, getJS) => {
        const js = m.st.map((s) => { curState = s; return getJS(s); });
        if (same(js)) return { same: true, js: js[0] };
        report.stateHoles += 1;
        return { same: false, js: `pick({ ${m.st.map((s, i) => `${JSON.stringify(s)}: ${js[i]}`).join(', ')} })` };
    };
    const gotoHole = (m) => {
        const entries = Object.entries(m.gotoBy ?? {});
        if (!entries.length) return null;
        report.gotos.push(`${m.k === 'kit' ? m.path : m.tag}: ${entries.map(([a, b]) => `${a}->${b}`).join(', ')}`);
        return addVal('go', `go(${JSON.stringify(Object.fromEntries(entries))})`);
    };

    function printNode(m, parentSt, depth) {
        const ind = '\t'.repeat(depth);
        const body = printBare(m, depth + (sameSt(m.st, parentSt) ? 0 : 1));
        if (sameSt(m.st, parentSt)) return body;
        report.ifs += 1;
        return `${ind}<sc-if value="{{${ifVal(m.st)}}}">\n${body}\n${ind}</sc-if>`;
    }
    const sameSt = (a, b) => a.length === b.length;

    function printBare(m, depth) {
        const ind = '\t'.repeat(depth);
        const first = m.st[0];
        if (m.k === 'text') {
            const p = perState(m, (s) => JSON.stringify(m.textBy[s]));
            if (p.same) return `${ind}${escText(m.textBy[first])}`;
            return `${ind}{{${addVal('txt', p.js)}}}`;
        }
        if (m.k === 'missing') {
            report.missing.push(m.type);
            return `${ind}<!-- not exported: ${m.type} -->`;
        }
        const kids = () => m.kids.map((k) => printNode(k, m.st, depth + 1)).join('\n');
        if (m.k === 'el') {
            const names = [...new Set(m.st.flatMap((s) => m.attrsBy[s].map(([a]) => a)))].filter(
                (a) => !['srcset', 'loading', 'decoding', 'data-nimg'].includes(a),
            );
            let attrs = '';
            for (const a of names) {
                const get = (s) => (m.attrsBy[s].find(([x]) => x === a) ?? [])[1];
                const p = perState(m, (s) => JSON.stringify(mapUrl(a, get(s) ?? (a === 'class' ? '' : undefined)) ?? null));
                if (p.same) {
                    const v = get(first);
                    if (v !== undefined) attrs += ` ${a}="${escAttr(mapUrl(a, v))}"`;
                } else attrs += ` ${a}="{{${addVal(a, p.js)}}}"`;
            }
            if (m.tag === 'form') {
                attrs += ' onSubmit="{{preventSubmit}}"';
                report.workarounds.add('forms get onSubmit=preventSubmit (a submit would reload the artboard)');
            }
            const g = gotoHole(m);
            if (g) attrs += ` onClick="{{${g}}}"`;
            if (VOID.has(m.tag)) return `${ind}<${m.tag}${attrs}>`;
            if (m.kids.length === 0) return `${ind}<${m.tag}${attrs}></${m.tag}>`;
            if (m.kids.every((k) => k.k === 'text' && sameSt(k.st, m.st) && same(k.st.map((s) => k.textBy[s])))) {
                return `${ind}<${m.tag}${attrs}>${m.kids.map((k) => escText(k.textBy[first])).join('')}</${m.tag}>`;
            }
            return `${ind}<${m.tag}${attrs}>\n${kids()}\n${ind}</${m.tag}>`;
        }
        if (m.k === 'kit') {
            if (m.path === 'Tooltip') return m.kids.map((k) => printNode(k, m.st, depth)).join('\n');
            const propsOf = (s) => (m.path === 'GukModulesProvider' || m.path === '$FormProvider' ? {} : m.propsBy[s]);
            const names = [...new Set(m.st.flatMap((s) => Object.keys(propsOf(s))))];
            const anyFn = (re) => names.some((k) => re.test(k) && m.st.some((s) => propsOf(s)[k] && propsOf(s)[k].$fn));
            // Inputs: the app's are controlled (value + onChange); on the canvas the value becomes the initial value, so
            // typing works without state. Rich text takes its value as initial content anyway.
            const uncontrolled = anyFn(/^onChange$/) && m.path !== 'TextAreaRichText';
            const rename = (k) => {
                if (uncontrolled && k === 'value') return 'defaultValue';
                if (k === 'checked' && anyFn(/^onCheckedChange/)) return 'defaultChecked';
                return k;
            };
            if (uncontrolled && names.includes('value')) report.inputs.push(`${m.path}: value -> defaultValue`);
            if (names.includes('checked') && anyFn(/^onCheckedChange/)) report.inputs.push(`${m.path}: checked -> defaultChecked`);
            let gotoProp = null;
            if (m.gotoBy && Object.keys(m.gotoBy).length) {
                gotoProp = names.includes('onClick') || m.path === 'Button' ? 'onClick' : (['onClose', 'onSelect', 'onOpenChange', 'onValueChange'].find((k) => names.includes(k)) ?? 'onClick');
            }
            const attrs = [];
            const capital = [];
            for (const k of names) {
                if (k === gotoProp) continue;
                const raw = m.st.map((s) => propsOf(s)[k]);
                if (raw.every((v) => v === undefined || (v && typeof v === 'object' && ('$undef' in v || '$drop' in v)))) continue;
                if (/^[A-Z]/.test(k)) {
                    capital.push(k);
                    continue;
                }
                const strings = raw.every((v) => typeof v === 'string');
                const p = perState(m, (s) => toJS(propsOf(s)[k], k));
                if (p.same && strings) attrs.push(` ${kebab(rename(k))}="${escAttr(mapUrl(k, raw[0]))}"`);
                else attrs.push(` ${kebab(rename(k))}="{{${addVal(rename(k), p.js)}}}"`);
            }
            const fileTarget = gotoProp && Object.values(m.gotoBy).find((t) => /\.dc\.html$/.test(t));
            if (fileTarget && m.path === 'Button') {
                // Spike3: per-state files; the clicked button is a link to the next state's file.
                attrs.push(` href="${escAttr(fileTarget)}"`);
                report.gotos.push(`Button: href ${fileTarget}`);
            } else if (gotoProp) attrs.push(` ${kebab(gotoProp)}="{{${gotoHole(m)}}}"`);
            if (capital.length) {
                const p = perState(m, (s) => toJS(Object.fromEntries(capital.map((k) => [k, propsOf(s)[k]]))));
                attrs.push(` dc-props="{{${addVal('dcProps', p.js)}}}"`);
            }
            const open = `${ind}<x-import component-from-global-scope="${m.path === '$FormProvider' ? 'ExportFormProvider' : `GovUiKit.${m.path}`}"${attrs.join('')}`;
            const mode = m.modeBy[first];
            if (mode === 'false' || mode === 'null') return `${open} children="{{${addVal('no', mode)}}}"></x-import>`;
            if (mode === 'text') {
                const t = m.kids[0];
                const p = perState(t, (s) => JSON.stringify(t.textBy[s]));
                if (p.same && sameSt(t.st, m.st)) return `${open} children="${escAttr(t.textBy[first])}"></x-import>`;
                return `${open} children="{{${addVal('txt', p.js)}}}"></x-import>`;
            }
            if (m.kids.length === 0) return `${open}></x-import>`;
            if (m.path === 'DefinitionList.Container') {
                const rows = m.kids.map((k, i) =>
                    i < m.kids.length - 1 && k.k === 'kit'
                        ? `${ind}\t<div class="border-b border-neutral-100">\n${printNode(k, m.st, depth + 2)}\n${ind}\t</div>`
                        : printNode(k, m.st, depth + 1),
                );
                return `${open}>\n${rows.join('\n')}\n${ind}</x-import>`;
            }
            return `${open}>\n${kids()}\n${ind}</x-import>`;
        }
        return '';
    }

    return { printNode, vals, report, mediaToFetch };
}

// The artboard file around printed markup.
function fileFor({ title, comment, rootClass, markup, after = '', vals, states, preview, extraHead = '', extraLogic = '' }) {
    const valsSrc = vals.map(([n, s]) => `\t\t\t${n}: ${s},`).join('\n');
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="app-export.css">
${extraHead}<script src="ds/aragon-gov-ui-kit/components/lib/react-hook-form.js"></script>
<script src="ds/aragon-gov-ui-kit/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{margin:0}
</style>
</helmet>
<!-- ${comment} -->
<div class="${escAttr(rootClass)}">
${markup}
</div>
${after}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":${preview ?? 900}}}'>
// The app's react-hook-form FormProvider, replaced by one with its own form (kit inputs call useFormContext).
window.ExportFormProvider = window.ExportFormProvider || ((p) => { const m = ReactHookForm.useForm(); return React.createElement(ReactHookForm.FormProvider, m, p.children); });
// GENERATED by spike3/assemble.cjs from exports of the running app. States: ${states.join(', ')}.
class Component extends DCLogic {
	state = { view: ${JSON.stringify(states[0])} };
${extraLogic}	renderVals() {
		const h = React.createElement;
		const noop = () => undefined;
		const now = Date.now();
		const hour = 3600000;
		const day = 24 * hour;
		const view = this.state.view;
		const pick = (m) => (view in m ? m[view] : Object.values(m)[0]);
		const go = (m) => (e) => {
			if (e && e.preventDefault) e.preventDefault();
			const t = m[this.state.view];
			if (t && /\.dc\.html$/.test(t)) { const a = document.createElement('a'); a.href = t; document.body.appendChild(a); a.click(); a.remove(); return; }
			if (t) this.setState({ view: t });
		};
		const preventSubmit = (e) => e.preventDefault();
		const memo = (k, f) => { this.__c = this.__c || {}; return this.__c[k] || (this.__c[k] = f); };
		return {
			preventSubmit,
${valsSrc}
		};
	}
}
</script>
</body>
</html>
`;
}

module.exports = { makePrinter, fileFor };
