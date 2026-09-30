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
      function jsxs2(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs2 : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/Collapsible.tsx
  var Collapsible_exports = {};
  __export(Collapsible_exports, {
    CustomCollapsedLines: () => CustomCollapsedLines,
    Default: () => Default,
    Expanded: () => Expanded,
    WithOverlay: () => WithOverlay
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

  // .design-sync/previews/Collapsible.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var proposalSummary = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "This proposal requests 250,000 USDC from the DAO treasury to fund the ecosystem grants program for Q3 2026. The grants committee will allocate funds across up to 12 projects building governance tooling, with milestone-based disbursement and quarterly reporting back to the DAO. Unused funds return to the treasury at the end of the quarter." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "The program builds on the Q2 pilot, which funded 8 projects and produced 3 integrations now live on app.aragon.org. Applications are reviewed on a rolling basis, and each grant is capped at 40,000 USDC. The committee consists of 5 elected members serving six-month terms, and all funding decisions are published in the DAO forum before execution." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "If the proposal passes, the first tranche of 100,000 USDC will be transferred to the grants multisig within 7 days of execution. The remaining 150,000 USDC is unlocked after the mid-quarter report is approved by a simple-majority signaling vote." })
  ] });
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Collapsible,
    {
      buttonLabelClosed: "Read more",
      buttonLabelOpened: "Read less",
      children: proposalSummary
    }
  ) });
  var WithOverlay = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Collapsible,
    {
      buttonLabelClosed: "Read more",
      buttonLabelOpened: "Read less",
      overlayLines: 2,
      showOverlay: true,
      children: proposalSummary
    }
  ) });
  var Expanded = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Collapsible,
    {
      buttonLabelClosed: "Read more",
      buttonLabelOpened: "Read less",
      defaultOpen: true,
      children: proposalSummary
    }
  ) });
  var CustomCollapsedLines = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Collapsible,
    {
      buttonLabelClosed: "Show full description",
      buttonLabelOpened: "Hide description",
      collapsedLines: 5,
      children: proposalSummary
    }
  ) });
  return __toCommonJS(Collapsible_exports);
})();
