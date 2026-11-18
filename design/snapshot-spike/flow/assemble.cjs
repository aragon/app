'use strict';
// Spike3: one canvas file per state exported by journey.cjs (states.json gives the order), plus board.json:
// rows -> [{file, title, w, h}] in order. Click targets recorded by the journey become links to the next state's file.
// Heights come from rendering each file (render-canvas.cjs). Usage: node assemble.cjs [--no-render]
const fs = require('node:fs');
const path = require('node:path');
const L = require('/home/user/app/design/baseline-check/lib.cjs');
const { makePrinter, fileFor } = require('./printer.cjs');
const { mergeStates } = require('./merge.cjs');
const IX = require('./interactions.cjs');
const INTERACTIONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'interactions.gd.json'), 'utf8'));

const HERE = __dirname;
const CANVAS = path.join(HERE, 'canvas');
const order = JSON.parse(fs.readFileSync(path.join(HERE, 'states.json'), 'utf8'));
const relink = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(relink);
    if (typeof n.goto === 'string' && !n.goto.endsWith('.dc.html')) n.goto = `${n.goto}.dc.html`;
    for (const v of Object.values(n)) if (v && typeof v === 'object') relink(v);
};
const rootClassOf = (st) => {
    const c = (attrs) => (attrs.find(([a]) => a === 'class') ?? [])[1] ?? '';
    return `${c(st.htmlAttrs)} ${c(st.body.attrs)}`.trim();
};
// Spike3 links: the node the journey recorded as "what leads to the next state" (goto) becomes a real <a href>:
// kit Button -> href (printer); a kit whose clicked button comes from an action object prop (Dialog.Footer
// primaryAction, EmptyState primaryButton: the kit spreads it into a Button) -> href in that object; a host <a> -> its
// href; another host element or kit -> wrapped in <a style="display:contents">; inputs, radios and buttons that are
// host elements cannot carry one (a link around them does not get the click) -> only the prev/next pill.
const NO_LINK_KIT = /(Radio|Checkbox|Switch|Toggle|Input|TextArea|Dropdown|Select)/;
const NO_LINK_TAG = new Set(['button', 'input', 'textarea', 'select', 'label', 'option']);
const linkify = (body) => {
    const done = [];
    const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
    const wrap = (n, file) => ({ k: 'el', tag: 'a', attrs: [['href', file], ['style', 'display:contents'], ['data-x-link', 'wrap']], kids: [n] });
    const visit = (container) => {
        for (const key of Object.keys(container)) {
            const n = container[key];
            if (!n || typeof n !== 'object') continue;
            if (typeof n.goto === 'string' && (n.k === 'el' || n.k === 'kit')) {
                const file = n.goto;
                const text = n.gotoText ?? '';
                if (n.k === 'kit' && n.path === 'Button') done.push({ how: 'kit Button href', node: 'Button', text, file });
                else if (n.k === 'kit') {
                    const actions = Object.entries(n.props ?? {}).filter(([, v]) => isObj(v) && typeof v.label === 'string');
                    const hit = actions.find(([, v]) => v.label === text) ?? (actions.length === 1 ? actions[0] : null);
                    if (hit) {
                        hit[1].href = file;
                        hit[1].onClick = { $undef: 1 };
                        delete n.goto;
                        done.push({ how: `href in ${n.path}.${hit[0]}`, node: n.path, text, file });
                    } else if (NO_LINK_KIT.test(n.path)) {
                        done.push({ how: 'fallback', why: `${n.path} cannot carry a link`, node: n.path, text, file });
                    } else {
                        delete n.goto;
                        container[key] = wrap(n, file);
                        done.push({ how: 'wrapped kit', node: n.path, text, file });
                    }
                } else {
                    const role = (n.attrs.find(([a]) => a === 'role') ?? [])[1];
                    if (n.tag === 'a') {
                        n.attrs = n.attrs.filter(([a]) => a !== 'href').concat([['href', file]]);
                        delete n.goto;
                        done.push({ how: 'host <a> href', node: 'a', text, file });
                    } else if (NO_LINK_TAG.has(n.tag) || /^(radio|checkbox|switch|button|option|textbox)$/.test(role ?? '')) {
                        done.push({ how: 'fallback', why: `host <${n.tag}${role ? ` role=${role}` : ''}> cannot carry a link`, node: n.tag, text, file });
                    } else {
                        delete n.goto;
                        container[key] = wrap(n, file);
                        done.push({ how: 'wrapped host element', node: n.tag, text, file });
                    }
                }
            }
            visit(container[key] === n ? n : container[key]);
        }
    };
    visit({ body });
    return done;
};
// Prev/next pill on every state (row order of states.json = board order), outside the app UI.
const rowOf = (id) => id.split('_')[1];
const pillFor = (i) => {
    const id = order[i].id;
    const prev = i > 0 && rowOf(order[i - 1].id) === rowOf(id) ? order[i - 1].id : null;
    const next = i < order.length - 1 && rowOf(order[i + 1].id) === rowOf(id) ? order[i + 1].id : null;
    const a = (to, label) => `<a href="${to}.dc.html" data-x-pill="${label === 'Next state →' ? 'next' : 'prev'}" style="display:inline-block;padding:6px 10px;border-radius:999px;background:#111827;color:#fff;font:600 12px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 1px 4px rgba(0,0,0,.3)">${label}</a>`;
    if (!prev && !next) return '';
    return `<!-- State stepping (not part of the app UI) -->\n<div class="x-state-pill" style="position:fixed;top:8px;right:8px;z-index:2147483647;display:flex;gap:6px;opacity:.9;pointer-events:auto">${prev ? a(prev, '← Previous') : ''}${next ? a(next, 'Next state →') : ''}</div>`;
};
const report = [];
// Interactions are hand-written (interactions.gd.json, applied by interactions.cjs); the rule-derived links (links.cjs) are gone.
const irs = Object.fromEntries(order.map(({ id }) => [id, JSON.parse(fs.readFileSync(path.join(HERE, 'ir', `${id}.json`), 'utf8'))]));
for (const [i, { id }] of order.entries()) {
    const st = irs[id];
    const ix = IX.apply(id, st, INTERACTIONS[id]);
    const root = mergeStates([[st.name, st.body]]);
    const pr = makePrinter({ canvasDir: CANVAS, states: [st.name] });
    const markup = root.kids.map((k) => pr.printNode(k, root.st, 1)).join('\n');
    const file = fileFor({ title: st.title, comment: `Exported from the running app (${st.name}): ${st.url}`, rootClass: rootClassOf(st), markup: `${markup}`, after: IX.anchors(ix.targets) + pillFor(i), vals: pr.vals, states: [st.name], extraLogic: ix.applied.length ? IX.LOGIC : '' });
    fs.writeFileSync(path.join(CANVAS, `${id}.dc.html`), file);
    report.push({ id, lines: file.split('\n').length, holes: pr.report.holes, gotos: pr.report.gotos, links: pr.report.links, missing: pr.report.missing, media: [...pr.mediaToFetch], interactions: ix.applied });
}
fs.writeFileSync(path.join(HERE, 'assemble-report.json'), JSON.stringify(report, null, 1));
console.log(`${report.length} files`);
