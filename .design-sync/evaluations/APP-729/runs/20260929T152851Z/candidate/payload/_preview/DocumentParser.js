"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.GovUiKit;
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/DocumentParser.tsx
  var DocumentParser_exports = {};
  __export(DocumentParser_exports, {
    HtmlSummary: () => HtmlSummary,
    ProposalBody: () => ProposalBody
  });
  init_define_import_meta_env();

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.GovUiKit;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/DocumentParser.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var proposalMarkdown = `# AIP-42: Fund the Q3 2026 Grants Program

This proposal allocates **250,000 USDC** from the DAO treasury to the community grants program for Q3 2026.

## Motivation

The grants program funded 14 projects in Q2, growing active contributors by *32%*. Continuing the program keeps momentum with builders and integrators.

## Specification

- Transfer 250,000 USDC to the grants multisig \`0x1a9C…35BC\`
- Grants committee reviews applications bi-weekly
- Unspent funds return to the treasury on October 1, 2026

## Voting

A simple majority with a 10% participation threshold is required for this proposal to pass.
`;
  var executionSummaryHtml = `
<h2>Execution summary</h2>
<p>Once approved, the following actions run <strong>atomically</strong> in a single transaction:</p>
<ol>
    <li>Approve <code>250000e6</code> USDC for the grants multisig</li>
    <li>Transfer the approved amount to <em>grants.aragondao.eth</em></li>
</ol>
<blockquote>
    <p>Actions were simulated successfully against a mainnet fork on July 14, 2026.</p>
</blockquote>
<p>Read the full committee charter at <a href="https://example.org/charter" title="Grants charter">example.org/charter</a>.</p>
`;
  var ProposalBody = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DocumentParser, { document: proposalMarkdown, immediatelyRender: false });
  var HtmlSummary = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DocumentParser, { document: executionSummaryHtml, immediatelyRender: false });
  return __toCommonJS(DocumentParser_exports);
})();
