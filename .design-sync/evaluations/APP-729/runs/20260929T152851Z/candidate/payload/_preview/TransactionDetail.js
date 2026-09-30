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

  // .design-sync/previews/TransactionDetail.tsx
  var TransactionDetail_exports = {};
  __export(TransactionDetail_exports, {
    CustomTitle: () => CustomTitle,
    ExecutionDialog: () => ExecutionDialog
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

  // .design-sync/previews/TransactionDetail.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var noop = () => void 0;
  var forceDialogOpenCss = `
    [data-state='open'] { opacity: 1 !important; transform: none !important; }
`;
  var ForceDialogOpen = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: forceDialogOpenCss });
  var ExecutionDialog = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.GukModulesProvider, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForceDialogOpen, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Dialog.Root, { open: true, useFocusTrap: false, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.TransactionDetail.Root, { onClose: noop, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.TransactionDetailSummary,
      {
        chainId: 1,
        date: 16984321e5,
        executedBy: {
          address: "0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD",
          helptext: "SPP v1.3",
          href: "/processes/core",
          label: "Core"
        },
        proposalHref: "/proposals/CRE-54",
        proposalId: "CRE-54",
        totalActions: 5,
        transactionHash: "0x9aaa5c2e7f1d3b8a6c4e0f2d9b7a5c3e1f8d6b4a2c0e9f7d5b3a1c8e6f4d2b0c"
      }
    ) }) })
  ] });
  var CustomTitle = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.GukModulesProvider, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForceDialogOpen, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Dialog.Root, { open: true, useFocusTrap: false, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.TransactionDetail.Root, { onClose: noop, title: "Treasury withdrawal", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.TransactionDetailSummary,
      {
        chainId: 1,
        date: 169704e7,
        executedBy: {
          address: "0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
        },
        totalActions: 2,
        transactionHash: "0x8f5b7c2f2ad5e304bd53a4a8bcbd11a4a58ab48b93c6e7f4e14a3d3c3b7f90aa"
      }
    ) }) })
  ] });
  return __toCommonJS(TransactionDetail_exports);
})();
