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

  // .design-sync/previews/DefinitionList.tsx
  var DefinitionList_exports = {};
  __export(DefinitionList_exports, {
    Default: () => Default,
    WithComponentChildren: () => WithComponentChildren,
    WithLinkAndCopy: () => WithLinkAndCopy
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

  // .design-sync/previews/DefinitionList.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DefinitionList.Container, { className: "w-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Proposal threshold", children: "1,000 ANT" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Support threshold", children: "> 50%" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Minimum participation", children: "15% (1.2M of 8M ANT)" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Voting duration", children: "7 days" })
  ] });
  var WithLinkAndCopy = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DefinitionList.Container, { className: "w-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.DefinitionList.Item,
      {
        copyValue: "0xba9E9Be7859560EF2805476f7997cD4ebE7BaF27",
        term: "Token contract",
        children: "0xba9E...aF27"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.DefinitionList.Item,
      {
        link: { href: "https://app.aragon.org" },
        term: "Website",
        children: "app.aragon.org"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.DefinitionList.Item,
      {
        description: "Aragon OSx v1.4",
        link: { href: "https://etherscan.io" },
        term: "Operating system",
        children: "0x1234...1234"
      }
    )
  ] });
  var WithComponentChildren = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DefinitionList.Container, { className: "w-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Status", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tag, { label: "Active", variant: "success" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Description", children: "Transfer 250,000 USDC from the treasury to the grants multisig to fund the Q3 2026 ecosystem grants program, with milestone-based disbursement and quarterly reporting." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Created by", children: "0xF2a1...9c3D" })
  ] });
  return __toCommonJS(DefinitionList_exports);
})();
