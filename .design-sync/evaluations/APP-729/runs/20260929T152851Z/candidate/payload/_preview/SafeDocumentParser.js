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

  // .design-sync/previews/SafeDocumentParser.tsx
  var SafeDocumentParser_exports = {};
  __export(SafeDocumentParser_exports, {
    ProposalBody: () => ProposalBody,
    SanitizedHtmlSummary: () => SanitizedHtmlSummary
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

  // .design-sync/previews/SafeDocumentParser.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var proposalMarkdown = `# AIP-57: Renew the security council mandate

This proposal renews the **security council** for another 12-month term and adjusts its emergency powers.

## Motivation

The council responded to 3 incidents in the last term with a median response time of *41 minutes*. Renewing the mandate keeps an emergency backstop in place while the DAO transitions to fully onchain governance.

## Specification

- Re-appoint the 5 sitting members to the council multisig \`0x9bF1…22Ad\`
- Reduce the emergency execution window from 48h to 24h
- Publish a public post-mortem within 7 days of any emergency action

## Voting

Approval requires a 66% supermajority with a 15% participation threshold.
`;
  var executionSummaryHtml = `
<h2>Execution summary</h2>
<p>On approval, the following actions execute <strong>atomically</strong>:</p>
<ol>
    <li>Grant <code>EXECUTE_EMERGENCY_PERMISSION</code> to the council multisig</li>
    <li>Set the execution window parameter to <em>86400 seconds</em></li>
</ol>
<blockquote>
    <p>Simulated successfully against a mainnet fork on July 14, 2026.</p>
</blockquote>
<p>Full charter: <a href="https://example.org/security-council" title="Council charter">example.org/security-council</a>.</p>
`;
  var ProposalBody = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.SafeDocumentParser, { document: proposalMarkdown, immediatelyRender: false });
  var SanitizedHtmlSummary = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.SafeDocumentParser,
    {
      document: `${executionSummaryHtml}<script>alert('xss')<\/script>`,
      immediatelyRender: false
    }
  );
  return __toCommonJS(SafeDocumentParser_exports);
})();
