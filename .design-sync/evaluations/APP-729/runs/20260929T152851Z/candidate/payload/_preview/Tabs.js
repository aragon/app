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

  // .design-sync/previews/Tabs.tsx
  var Tabs_exports = {};
  __export(Tabs_exports, {
    Default: () => Default,
    Underlined: () => Underlined,
    WithIconsAndDisabled: () => WithIconsAndDisabled
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

  // .design-sync/previews/Tabs.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Tabs.Root, { className: "w-full", defaultValue: "proposals", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Tabs.List, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { label: "Proposals", value: "proposals" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { label: "Members", value: "members" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { label: "Treasury", value: "treasury" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "proposals", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "3 active proposals are open for voting." }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "members", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "128 members hold voting power." }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "treasury", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "The treasury holds 5 assets." }) })
  ] });
  var Underlined = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Tabs.Root, { className: "w-full", defaultValue: "votes", isUnderlined: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Tabs.List, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { label: "Votes", value: "votes" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { label: "Actions", value: "actions" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { label: "Details", value: "details" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "votes", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "84 votes cast so far — 72% in favor." }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "actions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "2 on-chain actions will execute if the proposal passes." }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "details", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "Created by 0xba9E...aF27 on July 12, 2026." }) })
  ] });
  var WithIconsAndDisabled = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Tabs.Root, { className: "w-full", defaultValue: "assets", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Tabs.List, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.Tabs.Trigger,
        {
          iconRight: ds_exports.IconType.APP_ASSETS,
          label: "Assets",
          value: "assets"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.Tabs.Trigger,
        {
          iconRight: ds_exports.IconType.APP_TRANSACTIONS,
          label: "Transactions",
          value: "transactions"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Trigger, { disabled: true, label: "Streams", value: "streams" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "assets", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "ETH, USDC and ANT held by the DAO." }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: "transactions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pt-4 text-neutral-500", children: "Latest deposit: 2.4 ETH on July 14, 2026." }) })
  ] });
  return __toCommonJS(Tabs_exports);
})();
