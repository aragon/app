'use strict';
// Spike2: merges the exported IR of several states into one tree. Children are aligned by a longest common
// subsequence on a node signature (host element: tag + class; kit instance: component; text: any text), so what is the
// same UI in two states stays ONE node (an input keeps what was typed when the state changes) and what differs
// becomes per-state values or nodes that exist only in some states.
const lift = (n, s) => {
    const m = { k: n.k, st: [s] };
    if (n.k === 'text') m.textBy = { [s]: n.text };
    else if (n.k === 'el') Object.assign(m, { tag: n.tag, attrsBy: { [s]: n.attrs } });
    else if (n.k === 'kit') Object.assign(m, { path: n.path, propsBy: { [s]: n.props }, modeBy: { [s]: n.childrenMode } });
    else if (n.k === 'missing') m.type = n.type;
    if (n.goto) m.gotoBy = { [s]: n.goto };
    m.kids = (n.kids ?? []).map((k) => lift(k, s));
    return m;
};
const cls = (attrs) => (attrs.find(([a]) => a === 'class') ?? [])[1] ?? '';
const compat = (m, n) => {
    if (m.k !== n.k) return 0;
    if (n.k === 'text') return 1;
    if (n.k === 'el') return m.tag === n.tag && cls(m.attrsBy[m.st[0]]) === cls(n.attrs) ? 2 : 0;
    if (n.k === 'kit') return m.path === n.path && m.modeBy[m.st[0]] === n.childrenMode ? 2 : 0;
    return 0;
};
function mergeInto(m, n, s) {
    m.st.push(s);
    if (n.k === 'text') m.textBy[s] = n.text;
    if (n.k === 'el') m.attrsBy[s] = n.attrs;
    if (n.k === 'kit') {
        m.propsBy[s] = n.props;
        m.modeBy[s] = n.childrenMode;
    }
    if (n.goto) m.gotoBy = { ...(m.gotoBy ?? {}), [s]: n.goto };
    m.kids = align(m.kids, n.kids ?? [], s);
    return m;
}
function align(mk, nk, s) {
    const a = mk.length;
    const b = nk.length;
    const dp = Array.from({ length: a + 1 }, () => new Array(b + 1).fill(0));
    for (let i = a - 1; i >= 0; i--) {
        for (let j = b - 1; j >= 0; j--) {
            const c = compat(mk[i], nk[j]);
            dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1], c ? c + dp[i + 1][j + 1] : 0);
        }
    }
    const out = [];
    let i = 0;
    let j = 0;
    while (i < a || j < b) {
        if (i < a && j < b) {
            const c = compat(mk[i], nk[j]);
            if (c && dp[i][j] === c + dp[i + 1][j + 1]) {
                out.push(mergeInto(mk[i], nk[j], s));
                i++;
                j++;
                continue;
            }
        }
        if (i < a && (j >= b || dp[i][j] === dp[i + 1][j])) out.push(mk[i++]);
        else out.push(lift(nk[j++], s));
    }
    return out;
}
// states: [[name, rootIR]] -> merged root.
const mergeStates = (states) => {
    let root = null;
    for (const [s, ir] of states) {
        root = root ? mergeInto(root, ir, s) : lift(ir, s);
    }
    return root;
};
module.exports = { mergeStates, lift };
