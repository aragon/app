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

  // .design-sync/previews/TransactionDataListItem.tsx
  var TransactionDataListItem_exports = {};
  __export(TransactionDataListItem_exports, {
    Deposit: () => Deposit,
    Execution: () => Execution,
    Failed: () => Failed,
    Pending: () => Pending,
    Withdraw: () => Withdraw
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

  // .design-sync/previews/TransactionDataListItem.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var Deposit = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TransactionDataListItem.Structure,
    {
      amountUsd: 4531.25,
      chainId: 1,
      date: 1698765432e3,
      hash: "0x8f5b7c2f2ad5e304bd53a4a8bcbd11a4a58ab48b93c6e7f4e14a3d3c3b7f90aa",
      status: ds_exports.TransactionStatus.SUCCESS,
      tokenAmount: 2500,
      tokenSymbol: "USDC",
      type: ds_exports.TransactionType.DEPOSIT
    }
  ) });
  var Withdraw = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TransactionDataListItem.Structure,
    {
      amountUsd: 2812.5,
      chainId: 1,
      date: 169704e7,
      hash: "0x1c9a4d7b0f3e2a5c8b6d4f1e9a7c5b3d2f0e8a6c4b2d0f9e7a5c3b1d8f6e4a2c",
      status: ds_exports.TransactionStatus.SUCCESS,
      tokenAmount: 1.5,
      tokenSymbol: "ETH",
      type: ds_exports.TransactionType.WITHDRAW
    }
  ) });
  var Failed = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TransactionDataListItem.Structure,
    {
      amountUsd: 187.4,
      chainId: 1,
      date: 1698e9,
      hash: "0x3e7d9f1b5a2c8e4f6d0b9a7c3e5f1d8b2a4c6e0f9d7b5a3c1e8f4d2b6a0c9e7f",
      status: ds_exports.TransactionStatus.FAILED,
      tokenAmount: 0.1,
      tokenSymbol: "ETH",
      type: ds_exports.TransactionType.DEPOSIT
    }
  ) });
  var Execution = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TransactionDataListItem.Structure,
    {
      actionCount: 5,
      chainId: 1,
      date: 16984321e5,
      hash: "0x9aaa5c2e7f1d3b8a6c4e0f2d9b7a5c3e1f8d6b4a2c0e9f7d5b3a1c8e6f4d2b0c",
      label: "Token Voting",
      status: ds_exports.TransactionStatus.SUCCESS,
      type: ds_exports.TransactionType.EXECUTION
    }
  ) });
  var Pending = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.TransactionDataListItem.Structure,
    {
      chainId: 1,
      date: 169889e7,
      hash: "0x5d2f8a1c9e7b3f6d0a4c2e8f1b9d7a5c3e0f6d4b2a8c1e9f7d3b5a0c6e2f8d4b",
      status: ds_exports.TransactionStatus.PENDING,
      tokenAmount: 1e4,
      tokenSymbol: "DAI",
      type: ds_exports.TransactionType.DEPOSIT
    }
  ) });
  return __toCommonJS(TransactionDataListItem_exports);
})();
