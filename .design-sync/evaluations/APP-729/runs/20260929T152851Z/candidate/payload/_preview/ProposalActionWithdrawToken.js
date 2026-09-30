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

  // .design-sync/previews/ProposalActionWithdrawToken.tsx
  var ProposalActionWithdrawToken_exports = {};
  __export(ProposalActionWithdrawToken_exports, {
    EthTransfer: () => EthTransfer,
    StablecoinTransfer: () => StablecoinTransfer
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

  // .design-sync/previews/ProposalActionWithdrawToken.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var baseAction = {
    from: "0x25716fB10298638eD386A5A5dD2E9233D213F442",
    to: "0xC8da4C1d9BB59DD32ac39A925933188b7c66c311",
    data: "",
    value: "0",
    inputData: null
  };
  var usdcLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%232775CA'/%3E%3Ctext x='32' y='42' font-family='Arial' font-size='30' font-weight='bold' fill='white' text-anchor='middle'%3E%24%3C/text%3E%3C/svg%3E";
  var ethLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23627EEA'/%3E%3Cpath d='M32 10 L32 34 L46 32 Z' fill='white' opacity='0.8'/%3E%3Cpath d='M32 10 L18 32 L32 34 Z' fill='white'/%3E%3Cpath d='M32 38 L18 35 L32 54 L46 35 Z' fill='white' opacity='0.9'/%3E%3C/svg%3E";
  var StablecoinTransfer = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.ProposalActionWithdrawToken,
    {
      action: {
        ...baseAction,
        type: ds_exports.ProposalActionType.WITHDRAW_TOKEN,
        sender: {
          address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          name: "Patito DAO Treasury"
        },
        receiver: {
          address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          name: "grants.patito.eth"
        },
        token: {
          name: "USD Coin",
          symbol: "USDC",
          logo: usdcLogo,
          priceUsd: "1.00",
          decimals: 6,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        },
        amount: "50000"
      },
      index: 0
    }
  ) });
  var EthTransfer = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.ProposalActionWithdrawToken,
    {
      action: {
        ...baseAction,
        type: ds_exports.ProposalActionType.WITHDRAW_TOKEN,
        sender: {
          address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        },
        receiver: {
          address: "0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE"
        },
        token: {
          name: "Ethereum",
          symbol: "ETH",
          logo: ethLogo,
          priceUsd: "3421.55",
          decimals: 18,
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        },
        amount: "12.5"
      },
      index: 1
    }
  ) });
  return __toCommonJS(ProposalActionWithdrawToken_exports);
})();
