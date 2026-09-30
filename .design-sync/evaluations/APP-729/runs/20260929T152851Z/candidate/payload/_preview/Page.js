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

  // .design-sync/previews/Page.tsx
  var Page_exports = {};
  __export(Page_exports, {
    Default: () => Default,
    MainWithAction: () => MainWithAction,
    WithAside: () => WithAside
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

  // .design-sync/previews/Page.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var AppProviders = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DebugContextProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.TranslationsProvider, { translations: ds_exports.enTranslations, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BlockNavigationContextProvider, { children: props.children }) }) });
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "h-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.Page.Header,
      {
        breadcrumbs: [
          { href: "/", label: "Explore" },
          { label: "Builders Collective" }
        ],
        description: "A collective of independent builders funding open-source public goods through onchain governance.",
        stats: [
          { label: "Proposals", value: 128 },
          { label: "Members", value: "2.4K" },
          { label: "Treasury", value: "3.2M", suffix: "USD" }
        ],
        title: "Builders Collective"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.Content, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.Main, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.Page.MainSection,
      {
        description: "Latest governance activity across all processes.",
        title: "Proposals",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Card, { className: "flex flex-col gap-1 p-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "Fund the Q3 grants program" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm", children: "Active — ends in 3 days" })
        ] })
      }
    ) }) })
  ] }) });
  var WithAside = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Page.Content, { className: "pb-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.Main, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.MainSection, { title: "Members", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Card, { className: "flex flex-col gap-1 p-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "2,412 token holders" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm", children: "Voting power delegated to 148 addresses" })
    ] }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.Aside, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Page.AsideCard, { title: "Details", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DefinitionList.Container, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "Network", children: "Ethereum Mainnet" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DefinitionList.Item, { term: "ENS", children: "builders.dao.eth" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Link, { href: "https://forum.aragon.org", isExternal: true, children: "Governance forum" })
    ] }) })
  ] }) }) });
  var MainWithAction = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.Content, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Page.Main,
    {
      action: { label: "Create proposal" },
      fullWidth: true,
      title: "Proposals",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Page.MainSection, { inset: false, title: "All proposals", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col gap-3 pt-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Card, { className: "flex flex-col gap-1 p-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "Fund the Q3 grants program" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm", children: "Active — 64% approval" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Card, { className: "flex flex-col gap-1 p-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "Add security council body" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm", children: "Pending — starts tomorrow" })
        ] })
      ] }) })
    }
  ) }) }) });
  return __toCommonJS(Page_exports);
})();
