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

  // .design-sync/previews/TextAreaRichText.tsx
  var TextAreaRichText_exports = {};
  __export(TextAreaRichText_exports, {
    Default: () => Default,
    States: () => States,
    WithContent: () => WithContent
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

  // .design-sync/previews/TextAreaRichText.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TextAreaRichText,
    {
      className: "w-full",
      helpText: "Formatting is stored as rich text and rendered on the proposal page.",
      label: "Proposal body",
      placeholder: "Write the full proposal…"
    }
  );
  var WithContent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TextAreaRichText,
    {
      className: "w-full",
      label: "Proposal body",
      value: "<h2>Fund the Q3 grants program</h2><p>This proposal allocates <strong>25,000 USDC</strong> from the treasury to the grants multisig. Funds are released in three milestones, reviewed by the <em>grants committee</em>.</p><ul><li>Milestone 1: 10,000 USDC on approval</li><li>Milestone 2: 10,000 USDC after mid-term report</li><li>Milestone 3: 5,000 USDC on final delivery</li></ul><p>Full details in the <a href='https://aragon.org' target='_blank'>forum discussion</a>.</p>"
    }
  );
  var States = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex w-full flex-col gap-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.TextAreaRichText,
      {
        alert: {
          message: "The proposal body cannot be empty.",
          variant: "critical"
        },
        label: "Proposal body",
        placeholder: "Write the full proposal…",
        variant: "critical"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.TextAreaRichText,
      {
        disabled: true,
        helpText: "Published proposals cannot be edited.",
        label: "Proposal body",
        value: "<p>This proposal has been published on-chain and is now read-only.</p>"
      }
    )
  ] });
  return __toCommonJS(TextAreaRichText_exports);
})();
