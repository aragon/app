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

  // .design-sync/previews/Dialog.tsx
  var Dialog_exports = {};
  __export(Dialog_exports, {
    Default: () => Default,
    WizardFooter: () => WizardFooter
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

  // .design-sync/previews/Dialog.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var forceOpenStyles = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: ".ds-force-open { opacity: 1 !important; transform: none !important; }" });
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    forceOpenStyles,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      ds_exports.Dialog.Root,
      {
        containerClassName: "ds-force-open",
        modal: false,
        open: true,
        overlayClassName: "ds-force-open",
        size: "md",
        useFocusTrap: false,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.Dialog.Header,
            {
              description: "Delegate your voting power to another member of the DAO. You can undelegate at any time.",
              onClose: () => void 0,
              title: "Delegate voting power"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Dialog.Content, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col gap-3 pb-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800", children: "alice.eth" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "120.5K ANT" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm", children: "Your 4,200 ANT voting power will count towards proposals voted on by alice.eth once the delegation transaction is confirmed on-chain." })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.Dialog.Footer,
            {
              primaryAction: { label: "Delegate" },
              secondaryAction: { label: "Cancel" }
            }
          )
        ]
      }
    )
  ] });
  var WizardFooter = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    forceOpenStyles,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      ds_exports.Dialog.Root,
      {
        containerClassName: "ds-force-open",
        modal: false,
        open: true,
        overlayClassName: "ds-force-open",
        size: "md",
        useFocusTrap: false,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Dialog.Header, { onClose: () => void 0, title: "Publish proposal" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Dialog.Content, { description: "Review the transaction details before publishing your proposal on-chain.", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col gap-2 pb-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "Network" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800 text-sm", children: "Ethereum Mainnet" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "Estimated gas fee" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800 text-sm", children: "0.0042 ETH" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "Voting starts" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800 text-sm", children: "Immediately after publishing" })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.Dialog.Footer,
            {
              primaryAction: { label: "Publish proposal" },
              secondaryAction: { label: "Back" },
              variant: "wizard"
            }
          )
        ]
      }
    )
  ] });
  return __toCommonJS(Dialog_exports);
})();
