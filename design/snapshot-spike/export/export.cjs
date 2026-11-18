'use strict';
// Spike: export a running app page as a .dc.html canvas screen by walking the React fiber tree.
// Usage: node export.cjs <route> <OutName> [--canvas <dir>]
//   writes <canvas>/<OutName>.dc.html and <canvas>/app-export.css (+ fonts/images it references)
const fs = require('node:fs');
const path = require('node:path');
const L = require('/home/user/app/design/baseline-check/lib.cjs');

const SPIKE = __dirname;
const args = process.argv.slice(2);
const route = args[0];
const outName = args[1];
const canvasDir = args.includes('--canvas') ? args[args.indexOf('--canvas') + 1] : path.join(SPIKE, 'canvas');
const timing = {};
const tick = (label, t0) => {
    timing[label] = Date.now() - t0;
};

// ---------- printers ----------
const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'source', 'col', 'area', 'wbr']);
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\{\{/g, '{&#123;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\{\{/g, '{&#123;');
const kebab = (k) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const report = { holes: 0, fnProps: new Set(), droppedProps: new Set(), elProps: new Set(), missing: [], styleOnKit: [], workarounds: new Set(), images: new Set() };
const vals = []; // [name, jsSource]
const valName = (base) => {
    const n = `${base.replace(/[^a-zA-Z0-9]/g, '_')}${vals.length}`;
    return n;
};
const addVal = (base, src) => {
    const n = valName(base);
    vals.push([n, src]);
    report.holes += 1;
    return n;
};

// Images: map the app's URLs to canvas files.
const mediaToFetch = new Set();
const mapUrl = (name, value) => {
    if (typeof value === 'string' && value.includes('/_next/static/media/')) {
        // Static images the app imports (backgrounds, logos): copied next to the screen.
        return value.replace(/(?:https?:\/\/[^/"')\s]+)?\/_next\/static\/media\/([^"')\s?]+)/g, (full, file) => {
            mediaToFetch.add(file);
            report.workarounds.add('app static images (/_next/static/media) copied to app-export-assets/');
            return `app-export-assets/${file}`;
        });
    }
    if (name === 'src' || name === 'href' || /mock-assets\.aragon\.test/.test(value)) {
        let v = value;
        if (v.startsWith('/_next/image')) {
            v = new URL(v, 'http://x').searchParams.get('url') ?? v;
        }
        const m = v.match(/mock-assets\.aragon\.test\/(token|avatar)\/([a-z0-9-]+)\.(?:svg|png)/);
        if (m) {
            report.workarounds.add('image URLs (IPFS gateway / Next image optimizer + mock host) rewritten to canvas assets/mock files');
            return `assets/mock/${m[1]}/${m[2]}.svg`;
        }
        if (name === 'src' && v.startsWith('/')) {
            const file = path.join('/home/user/app/apps/app/public', v.split('?')[0]);
            if (fs.existsSync(file)) {
                const rel = `app-public${v.split('?')[0]}`;
                fs.mkdirSync(path.dirname(path.join(canvasDir, rel)), { recursive: true });
                fs.copyFileSync(file, path.join(canvasDir, rel));
                report.images.add(rel);
                return rel;
            }
        }
        return v;
    }
    return value;
};

// JS source of an encoded prop value (for renderVals).
const toJS = (v) => {
    if (typeof v === 'string') return JSON.stringify(mapUrl('', v));
    if (typeof v === 'number' && Math.abs(v - L.NOW_MS) < 2 * 365 * 864e5 && v > 1e12) {
        // A timestamp near the reference time: written as an offset from now, so relative labels ("3 days left") read
        // as in the app on any day (the hand-drawn screens' convention).
        report.workarounds.add('timestamps near the reference time written as offsets from Date.now()');
        const d = v - L.NOW_MS;
        const days = d / 864e5;
        return Number.isInteger(days) ? `now + ${days} * day` : Number.isInteger(d / 36e5) ? `now + ${d / 36e5} * hour` : `now + ${d}`;
    }
    if (v && typeof v === 'object' && '$date' in v) {
        const t = Date.parse(v.$date);
        if (Math.abs(t - L.NOW_MS) < 2 * 365 * 864e5) return `new Date(${toJS(t)})`;
    }
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return `[${v.map(toJS).join(', ')}]`;
    if ('$fn' in v) return 'noop';
    if ('$undef' in v) return 'undefined';
    if ('$date' in v) return `new Date(${JSON.stringify(v.$date)})`;
    if ('$bigint' in v) return `${v.$bigint}n`;
    if ('$drop' in v) return 'undefined';
    if ('$el' in v) return v.$el ? irToJS(v.$el) : 'null';
    return `{ ${Object.entries(v)
        .filter(([, x]) => !(x && typeof x === 'object' && ('$drop' in x || '$undef' in x)))
        .map(([k, x]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${toJS(x)}`)
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
// IR -> React.createElement source (for elements passed in non-children props).
function irToJS(nodes) {
    const list = Array.isArray(nodes) ? nodes : [nodes];
    const one = (n) => {
        if (n.k === 'text') return JSON.stringify(n.text);
        if (n.k === 'missing') return 'null';
        if (n.k === 'el') {
            const props = n.attrs.map(([a, v]) => {
                if (a === 'class') return `className: ${JSON.stringify(v)}`;
                if (a === 'for') return `htmlFor: ${JSON.stringify(v)}`;
                if (a === 'style') return `style: ${styleObj(v)}`;
                return `${JSON.stringify(a)}: ${JSON.stringify(mapUrl(a, v))}`;
            });
            return `h(${JSON.stringify(n.tag)}, { ${props.join(', ')} }${n.kids.map((k) => `, ${one(k)}`).join('')})`;
        }
        if (n.k === 'kit') {
            const props = Object.entries(n.props)
                .filter(([, x]) => !(x && typeof x === 'object' && ('$drop' in x || '$undef' in x)))
                .map(([k, x]) => `${k}: ${toJS(x)}`);
            return `h(GovUiKit.${n.path}, { ${props.join(', ')} }${n.kids.map((k) => `, ${one(k)}`).join('')})`;
        }
        return 'null';
    };
    return list.length === 1 ? one(list[0]) : `h(React.Fragment, null${list.map((k) => `, ${one(k)}`).join('')})`;
}

// IR -> markup. Indentation uses tabs: the canvas runtime drops whitespace-only text without a space character,
// so tab indentation adds no text nodes (no stray children counted by DataList pagination, no gaps).
function irToHTML(n, depth) {
    const ind = '\t'.repeat(depth);
    if (n.k === 'text') return `${ind}${escText(n.text)}`;
    if (n.k === 'missing') {
        report.missing.push(n.type);
        return `${ind}<!-- not exported: ${n.type} -->`;
    }
    if (n.k === 'el') {
        const cls = (n.attrs.find(([a]) => a === 'class') ?? [])[1] ?? '';
        if (/(^| )space-[xy]-/.test(cls) && /(^| )flex( |$)/.test(cls) && n.kids.some((k) => k.k === 'kit')) {
            // Tailwind space-x/y sets margins on siblings (> :not(:last-child)); the canvas wrapper around a mounted
            // kit component takes no margin. In a flex box the same spacing is a gap.
            report.workarounds.add('space-x/y-N on a flex parent of kit components rewritten to gap-x/y-N (canvas wrapper takes no margin)');
            const fixed = cls.replace(/(^| )space-([xy])-(\S+)/g, (_, pre, axis, v) => `${pre}gap-${axis}-${v}`);
            n = { ...n, attrs: n.attrs.map(([a, v]) => [a, a === 'class' ? fixed : v]) };
        }
        const attrs = n.attrs
            .filter(([a]) => a !== 'srcset' && a !== 'loading' && a !== 'decoding' && a !== 'data-nimg')
            .map(([a, v]) => {
                const mv = mapUrl(a, v);
                if (a === 'src' && mv !== v) report.workarounds.add('image URLs rewritten from /_next/image + mock host to canvas assets');
                return ` ${a}="${escAttr(mv)}"`;
            })
            .join('');
        if (VOID.has(n.tag)) return `${ind}<${n.tag}${attrs}>`;
        if (n.kids.length === 0) return `${ind}<${n.tag}${attrs}></${n.tag}>`;
        // Text-only (or short) content stays on one line.
        if (n.kids.every((k) => k.k === 'text')) return `${ind}<${n.tag}${attrs}>${n.kids.map((k) => escText(k.text)).join('')}</${n.tag}>`;
        return `${ind}<${n.tag}${attrs}>\n${n.kids.map((k) => irToHTML(k, depth + 1)).join('\n')}\n${ind}</${n.tag}>`;
    }
    if (n.k === 'kit' && n.path === 'Tooltip' && n.props.triggerAsChild === true) {
        // Pitfall 8: Radix asChild breaks under the canvas wrapper. A closed tooltip shows only its trigger: draw that.
        report.workarounds.add('Tooltip with triggerAsChild replaced by its trigger (pitfall 8)');
        return n.kids.map((k) => irToHTML(k, depth)).join('\n');
    }
    if (n.k === 'kit' && n.path === 'GukModulesProvider') {
        // The app's provider carries wagmi config, a QueryClient and the Next.js Link/Image components: the canvas
        // supplies its own environment, so the provider is mounted without props (as the hand-drawn screens do).
        report.workarounds.add('GukModulesProvider mounted without the app\'s props (wagmi config, QueryClient, Next Link/Img)');
        n = { ...n, props: {} };
    }
    if (n.k === 'kit') {
        const attrs = [];
        const capital = [];
        for (const [k, v] of Object.entries(n.props)) {
            if (v && typeof v === 'object' && '$drop' in v) {
                report.droppedProps.add(`${n.path}.${k}: ${v.$drop}`);
                continue;
            }
            if (v && typeof v === 'object' && '$undef' in v) continue;
            if (v && typeof v === 'object' && '$fn' in v) report.fnProps.add(`${n.path}.${k}`);
            if (v && typeof v === 'object' && '$el' in v) report.elProps.add(`${n.path}.${k}`);
            if (k === 'style') report.styleOnKit.push(n.path);
            if (/^[A-Z]/.test(k)) {
                capital.push([k, v]);
                continue;
            }
            if (typeof v === 'string') attrs.push(` ${kebab(k)}="${escAttr(mapUrl(k, v))}"`);
            else attrs.push(` ${kebab(k)}="{{${addVal(k, toJS(v))}}}"`);
        }
        if (capital.length) {
            report.workarounds.add('props with a capital first letter passed through dc-props');
            attrs.push(` dc-props="{{${addVal('dcProps', toJS(Object.fromEntries(capital)))}}}"`);
        }
        const open = `${ind}<x-import component-from-global-scope="GovUiKit.${n.path}"${attrs.join('')}`;
        if (n.childrenMode === 'false' || n.childrenMode === 'null') {
            report.workarounds.add('children={false} passed as a hole (pitfall 9)');
            return `${open} children="{{${addVal('no', String(n.childrenMode === 'false' ? false : null))}}}"></x-import>`;
        }
        if (n.childrenMode === 'text') {
            // The runtime always passes element content as an array; kit components that expect a string child
            // (DefinitionList.Item, Link) get it as the children attribute instead (pitfall 2).
            report.workarounds.add('text-only children passed as the children attribute (pitfall 2)');
            return `${open} children="${escAttr(n.kids[0].text)}"></x-import>`;
        }
        if (n.kids.length === 0) return `${open}></x-import>`;
        if (n.path === 'DefinitionList.Container') {
            // Pitfall 2: the canvas wraps each mounted component, which defeats the kit's :last-child divider rule.
            // Every row but the last gets its divider from a wrapper (the same rule the hand-drawn .dl-row adds).
            report.workarounds.add('DefinitionList rows wrapped for their divider (pitfall 2)');
            const rows = n.kids.map((k, i) =>
                i < n.kids.length - 1 && k.k === 'kit'
                    ? `${ind}\t<div class="border-b border-neutral-100">\n${irToHTML(k, depth + 2)}\n${ind}\t</div>`
                    : irToHTML(k, depth + 1),
            );
            return `${open}>\n${rows.join('\n')}\n${ind}</x-import>`;
        }
        return `${open}>\n${n.kids.map((k) => irToHTML(k, depth + 1)).join('\n')}\n${ind}</x-import>`;
    }
    return '';
}

// ---------- CSS ----------
const exportCss = async (page) => {
    const sheets = await page.evaluate(() =>
        [...document.styleSheets].map((s) => ({
            href: s.href,
            text: s.href ? null : [...s.cssRules].map((r) => r.cssText).join('\n'),
            owner: s.ownerNode?.getAttribute?.('data-precedence') ?? s.ownerNode?.tagName,
        })),
    );
    const parts = [];
    const fontDir = path.join(canvasDir, 'app-export-assets');
    fs.mkdirSync(fontDir, { recursive: true });
    for (const s of sheets) {
        let text = s.text;
        if (s.href) {
            const r = await page.request.get(s.href);
            text = await r.text();
        }
        if (!text) continue;
        // Skip the spike harness's own motion/dev-hiding style (lib.cjs pageSetup).
        if (!s.href && text.includes('nextjs-portal')) continue;
        const base = s.href ?? `${L.APP_URL}/`;
        const urls = [...text.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]).filter((u) => !u.startsWith('data:'));
        for (const u of new Set(urls)) {
            const abs = new URL(u, base);
            if (!abs.href.startsWith(L.APP_URL)) continue;
            const name = path.basename(abs.pathname);
            const file = path.join(fontDir, name);
            if (!fs.existsSync(file)) {
                const r = await page.request.get(abs.href);
                if (r.ok()) fs.writeFileSync(file, await r.body());
            }
            text = text.split(u).join(`app-export-assets/${name}`);
        }
        parts.push(`/* ==== ${s.href ? new URL(s.href).pathname : `inline <style> (${s.owner})`} ==== */\n${text}`);
    }
    const css = parts.join('\n\n');
    fs.writeFileSync(path.join(canvasDir, 'app-export.css'), css);
    return { sheets: sheets.length, bytes: css.length, lines: css.split('\n').length };
};

// ---------- main ----------
(async () => {
    const tAll = Date.now();
    let t0 = Date.now();
    const browser = await L.launch();
    const seed = L.workspaceSeed();
    const wallet = args.includes('--wallet');
    const D = require('/home/user/app/design/baseline-check/data.cjs');
    const initScripts = [seed.script];
    if (wallet) initScripts.push(require('/home/user/app/design/baseline-check/wallet-inject.cjs')(D.PEOPLE[0].address));
    const context = await L.newContext(browser, { initScripts });
    const page = await context.newPage();
    if (wallet) await L.gotoConnected(page, route, D.PEOPLE[0].ens);
    else await L.goto(page, route);
    if (args.includes('--fill-proposal')) {
        // The same steps as capture-wizards.cjs (create-proposal-step1-filled).
        await page.getByRole('textbox').first().fill('Fund the Q2 2027 Ecosystem Grants Program');
        await page.locator('textarea').first().fill('Allocate 300,000 USDC to the Ecosystem Grants Program to fund integrations, tooling and research during Q2 2027.');
        await page.locator('[contenteditable="true"]').first().click();
        await page.keyboard.type('Over the last two quarters Meridian has grown routed volume by 38%. This proposal continues the grants program ratified in MGP-8.');
        await L.settle(page);
    }
    tick('load+settle', t0);
    await page.evaluate(() => window.scrollTo(0, 0));

    t0 = Date.now();
    // The gov-ui-kit module namespace as the app loaded it: Turbopack keeps its module cache in a closure, so a
    // one-line module is registered through the public TURBOPACK.push and instantiated as a "runtime module"; it
    // imports the kit by its module id (found in the kit's chunk) and hands the namespace to the page.
    const kitModuleId = await page.evaluate(async () => {
        const script = [...document.scripts].find((s) => s.src.includes('gov-ui-kit_dist'));
        if (!script) return null;
        const text = await (await fetch(script.src)).text();
        const m = text.match(/"(\[project\][^"]*gov-ui-kit\/dist\/index\.es\.js \[app-client\] \(ecmascript\))"/);
        if (!m) return null;
        TURBOPACK.push([script, 'spike-kit-probe', (ctx) => { window.__spikeKit = ctx.i(m[1]); }]);
        TURBOPACK.push({ otherChunks: [], runtimeModuleIds: ['spike-kit-probe'] });
        for (let i = 0; i < 50 && !window.__spikeKit; i++) await new Promise((r) => setTimeout(r, 20));
        return window.__spikeKit ? m[1] : null;
    });
    tick('find-kit-module', t0);
    if (!kitModuleId) throw new Error('kit module not found');

    t0 = Date.now();
    const extract = fs.readFileSync(path.join(SPIKE, 'extract-in-page.js'), 'utf8');
    const result = await page.evaluate(
        ({ src, id }) => {
            const kit = window.__spikeKit;
            // biome-ignore lint: spike
            const fn = (0, eval)(src);
            return fn(kit);
        },
        { src: extract, id: kitModuleId },
    );
    tick('fiber-walk', t0);

    t0 = Date.now();
    const bodyAttrs = result.body.attrs;
    const bodyKids = result.body.kids;
    const markup = bodyKids.map((k) => irToHTML(k, 1)).join('\n');
    const htmlClass = (result.htmlAttrs.find(([a]) => a === 'class') ?? [])[1] ?? '';
    const bodyClass = (bodyAttrs.find(([a]) => a === 'class') ?? [])[1] ?? '';
    const valsSrc = vals.map(([n, s]) => `\t\t\t${n}: ${s},`).join('\n');
    const file = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${outName} (exported)</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="app-export.css">
<script src="ds/aragon-gov-ui-kit/components/lib/react-hook-form.js"></script>
<script src="ds/aragon-gov-ui-kit/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{margin:0}
</style>
</helmet>
<!-- Exported from the running app: ${route}. <html class="${escAttr(htmlClass)}"> <body class="${escAttr(bodyClass)}"> -->
<div class="${escAttr(`${htmlClass} ${bodyClass}`.trim())}">
${markup}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":900}}'>
class Component extends DCLogic {
	renderVals() {
		const h = React.createElement;
		const noop = () => undefined;
		const now = Date.now();
		const hour = 3600000;
		const day = 24 * hour;
		return {
${valsSrc}
		};
	}
}
</script>
</body>
</html>
`;
    fs.mkdirSync(canvasDir, { recursive: true });
    fs.writeFileSync(path.join(canvasDir, `${outName}.dc.html`), file);
    fs.mkdirSync(path.join(canvasDir, 'app-export-assets'), { recursive: true });
    tick('print', t0);

    for (const file of mediaToFetch) {
        const r = await page.request.get(`${L.APP_URL}/_next/static/media/${file}`);
        if (r.ok()) fs.writeFileSync(path.join(canvasDir, 'app-export-assets', file), await r.body());
    }
    t0 = Date.now();
    const css = await exportCss(page);
    tick('css', t0);
    timing.total = Date.now() - tAll;
    await browser.close();
    const summary = {
        route,
        file: path.join(canvasDir, `${outName}.dc.html`),
        lines: file.split('\n').length,
        bytes: file.length,
        kitModuleId,
        kitExportsMapped: result.kitCount,
        kitInstances: result.stats.kit,
        portalsSkipped: result.stats.portals,
        hiddenSkipped: result.stats.hidden,
        holes: report.holes,
        fnProps: [...report.fnProps],
        droppedProps: [...report.droppedProps],
        elementProps: [...report.elProps],
        missingChildren: report.missing,
        styleOnKit: report.styleOnKit,
        workarounds: [...report.workarounds],
        css,
        timing,
    };
    fs.writeFileSync(path.join(SPIKE, `${outName}.export-report.json`), JSON.stringify(summary, null, 1));
    console.log(JSON.stringify(summary, null, 1));
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
