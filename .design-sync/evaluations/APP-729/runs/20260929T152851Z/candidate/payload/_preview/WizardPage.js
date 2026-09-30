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

  // .design-sync/previews/WizardPage.tsx
  var WizardPage_exports = {};
  __export(WizardPage_exports, {
    Default: () => Default,
    FinalStep: () => FinalStep,
    NextDropdown: () => NextDropdown
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

  // .design-sync/previews/WizardPage.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var AppProviders = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DebugContextProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.TranslationsProvider, { translations: ds_exports.enTranslations, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BlockNavigationContextProvider, { children: props.children }) }) });
  var createDaoSteps = [
    { id: "network", order: 0, meta: { name: "Network" } },
    { id: "metadata", order: 1, meta: { name: "Describe your DAO" } },
    { id: "governance", order: 2, meta: { name: "Governance" } }
  ];
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.WizardPage.Container,
    {
      finalStep: "Deploy your DAO",
      initialSteps: createDaoSteps,
      onSubmit: () => void 0,
      submitLabel: "Deploy your DAO",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.WizardPage.Step,
        {
          description: "Select the blockchain your DAO will live on. This cannot be changed after deployment.",
          id: "network",
          meta: { name: "Network" },
          order: 0,
          title: "Select your network",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex w-full flex-col gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.InputText,
              {
                defaultValue: "Ethereum Mainnet",
                helpText: "The DAO contracts will be deployed on this network.",
                label: "Network"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.InputText,
              {
                helpText: "Appears on the DAO explorer and in wallets.",
                label: "DAO name",
                placeholder: "e.g. Builders Collective"
              }
            )
          ] })
        }
      )
    }
  ) });
  var FinalStep = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.WizardPage.Container,
    {
      initialSteps: [
        { id: "review", order: 0, meta: { name: "Review" } }
      ],
      onSubmit: () => void 0,
      submitHelpText: "Deploying the DAO requires an on-chain transaction and gas fees.",
      submitLabel: "Deploy your DAO",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.WizardPage.Step,
        {
          description: "Double-check the settings below. Governance settings can be changed later through a proposal.",
          id: "review",
          meta: { name: "Review" },
          order: 0,
          title: "Review your DAO",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Card, { className: "flex flex-col gap-3 p-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "Name" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800 text-sm", children: "Builders Collective" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "Network" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800 text-sm", children: "Ethereum Mainnet" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-500 text-sm", children: "Governance" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800 text-sm", children: "Token voting (ERC-20)" })
            ] })
          ] })
        }
      )
    }
  ) });
  var NextDropdown = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.WizardPage.Container,
    {
      finalStep: "Publish proposal",
      initialSteps: [
        {
          id: "metadata",
          order: 0,
          meta: { name: "Describe proposal" }
        },
        { id: "actions", order: 1, meta: { name: "Actions" } }
      ],
      onSubmit: () => void 0,
      submitLabel: "Publish proposal",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.WizardPage.Step,
        {
          description: "Give voters the context they need to make a decision.",
          id: "metadata",
          meta: { name: "Describe proposal" },
          nextDropdownItems: [
            { label: "Continue to actions" },
            { label: "Save as draft" }
          ],
          order: 0,
          title: "Describe your proposal",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex w-full flex-col gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.InputText,
              {
                defaultValue: "Fund the Q3 grants program",
                label: "Title"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.TextArea,
              {
                label: "Summary",
                placeholder: "What should the DAO decide on?"
              }
            )
          ] })
        }
      )
    }
  ) });
  return __toCommonJS(WizardPage_exports);
})();
