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

  // .design-sync/previews/ProposalActions.tsx
  var ProposalActions_exports = {};
  __export(ProposalActions_exports, {
    Default: () => Default,
    Loading: () => Loading,
    TokenTransfers: () => TokenTransfers,
    VerifiedDecoded: () => VerifiedDecoded
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

  // .design-sync/previews/ProposalActions.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var tokenLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%233164FA'/%3E%3Cpath d='M32 14l14 26H18z' fill='white'/%3E%3C/svg%3E";
  var noOp = () => void 0;
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 640 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.ProposalActions.Root, { actionsCount: 2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.ProposalActions.Container, { emptyStateDescription: "Proposal has no actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.ProposalActions.Item,
        {
          action: (0, ds_exports.generateProposalActionChangeMembers)({
            inputData: {
              function: "addMembers",
              contract: "Multisig",
              parameters: []
            },
            members: [
              {
                address: "0xC8da4C1d9BB59DD32ac39A925933188b7c66c311"
              }
            ],
            to: "0x96208a79d4f3386922ebEc815EF1C0d02b48Eb70"
          }),
          index: 0
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.ProposalActions.Item,
        {
          action: (0, ds_exports.generateProposalActionChangeSettings)({
            inputData: {
              function: "updateSettings",
              contract: "Multisig",
              parameters: []
            },
            existingSettings: [
              {
                term: "Proposal creation",
                definition: "Any address"
              }
            ],
            proposedSettings: [
              {
                term: "Proposal creation",
                definition: "Only members"
              }
            ],
            to: "0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d"
          }),
          index: 1
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalActions.Footer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Button, { className: "text-nowrap", size: "md", children: "Execute actions" }) })
  ] }) }) });
  var TokenTransfers = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 640 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    ds_exports.ProposalActions.Root,
    {
      actionsCount: 2,
      expandedActions: ["0"],
      onExpandedActionsChange: noOp,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.ProposalActions.Container, { emptyStateDescription: "Proposal has no actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.ProposalActions.Item,
            {
              action: (0, ds_exports.generateProposalActionWithdrawToken)({
                sender: {
                  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                },
                receiver: {
                  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
                  name: "grants.eth"
                },
                token: {
                  name: "Aragon",
                  symbol: "ARA",
                  logo: tokenLogo,
                  priceUsd: "1.24",
                  decimals: 18,
                  address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"
                },
                amount: "50000",
                inputData: {
                  function: "transfer",
                  contract: "ARA Token",
                  parameters: []
                }
              }),
              index: 0
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.ProposalActions.Item,
            {
              action: (0, ds_exports.generateProposalActionTokenMint)({
                to: "0x80CB2f4f9B403C4C418C597d96c95FE14FD344a6",
                receiver: {
                  address: "0x15b4bfc1c85ffbdb6d7d0eb9f30c49657dfb1f5b",
                  name: "contributors.eth",
                  currentBalance: "500",
                  newBalance: "1500"
                },
                inputData: {
                  function: "mint",
                  contract: "Governance Token",
                  parameters: []
                }
              }),
              index: 1
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalActions.Footer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Button, { className: "text-nowrap", size: "md", children: "Execute actions" }) })
      ]
    }
  ) }) });
  var VerifiedDecoded = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 640 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.ProposalActions.Root,
    {
      actionsCount: 1,
      expandedActions: ["0"],
      onExpandedActionsChange: noOp,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalActions.Container, { emptyStateDescription: "Proposal has no actions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.ProposalActions.Item,
        {
          action: {
            type: "unknown",
            from: "0x1D03D98c0aec1f8e8354b74A126C6cEcB55E79c4",
            to: "0xf067de59A16D9C252BD4319C34B8858ef96c0aa8",
            value: "0",
            data: "0x414bf389000000000000000000000000be9f61555f50dd6167f2772e9cf7519790d96624",
            inputData: {
              function: "exactInputSingle",
              contract: "Uniswap V3: Router",
              parameters: [
                {
                  name: "tokenIn",
                  type: "address",
                  value: "0xbe9F61555F50DD6167f2772e9CF7519790d96624",
                  notice: "The token in"
                },
                {
                  name: "tokenOut",
                  type: "address",
                  value: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                  notice: "The token out"
                },
                {
                  name: "fee",
                  type: "uint24",
                  value: "3000"
                },
                {
                  name: "recipient",
                  type: "address",
                  value: "0x80CB2f4f9B403C4C418C597d96c95FE14FD344a6"
                }
              ]
            }
          },
          index: 0
        }
      ) })
    }
  ) }) });
  var Loading = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 640 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.ProposalActions.Root, { actionsCount: 2, isLoading: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalActions.Container, { emptyStateDescription: "Proposal has no actions" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalActions.Footer, {})
  ] }) }) });
  return __toCommonJS(ProposalActions_exports);
})();
