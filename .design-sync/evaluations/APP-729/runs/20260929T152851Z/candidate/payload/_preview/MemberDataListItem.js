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

  // .design-sync/previews/MemberDataListItem.tsx
  var MemberDataListItem_exports = {};
  __export(MemberDataListItem_exports, {
    Default: () => Default,
    Delegate: () => Delegate,
    MemberGrid: () => MemberGrid,
    Minimal: () => Minimal
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

  // .design-sync/previews/MemberDataListItem.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var blockiesFallback = "data:image/png;base64,";
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "max-w-80", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.MemberDataListItem.Structure,
    {
      address: "0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD",
      avatarSrc: blockiesFallback,
      delegationCount: 9,
      tokenAmount: 12500,
      tokenSymbol: "ANT"
    }
  ) }) });
  var Delegate = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "max-w-80", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.MemberDataListItem.Structure,
    {
      address: "0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786",
      avatarSrc: blockiesFallback,
      delegationCount: 1,
      ensName: "cgero.eth",
      isDelegate: true,
      tokenAmount: 48e4,
      tokenSymbol: "ANT"
    }
  ) }) });
  var Minimal = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "max-w-80", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.MemberDataListItem.Structure,
    {
      address: "0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5",
      avatarSrc: blockiesFallback
    }
  ) }) });
  var MemberGrid = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-3 gap-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.MemberDataListItem.Structure,
      {
        address: "0x17366cae2b9c6C3055e9e3C78936a69006BE5409",
        avatarSrc: blockiesFallback,
        delegationCount: 24,
        ensName: "builder.eth",
        tokenAmount: 12e5,
        tokenSymbol: "ANT"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.MemberDataListItem.Structure,
      {
        address: "0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8",
        avatarSrc: blockiesFallback,
        delegationCount: 3,
        tokenAmount: 56e3,
        tokenSymbol: "ANT"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.MemberDataListItem.Skeleton, {})
  ] }) });
  return __toCommonJS(MemberDataListItem_exports);
})();
