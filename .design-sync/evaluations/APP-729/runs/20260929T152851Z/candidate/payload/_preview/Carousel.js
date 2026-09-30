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

  // .design-sync/previews/Carousel.tsx
  var Carousel_exports = {};
  __export(Carousel_exports, {
    Default: () => Default,
    Marquee: () => Marquee
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

  // .design-sync/previews/Carousel.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var featuredDaos = [
    {
      name: "Builders Collective",
      members: "1.2k members",
      proposals: "48 proposals"
    },
    {
      name: "Aragon Grants",
      members: "640 members",
      proposals: "31 proposals"
    },
    {
      name: "Treasury Guild",
      members: "215 members",
      proposals: "12 proposals"
    },
    {
      name: "Ecosystem Fund",
      members: "3.4k members",
      proposals: "96 proposals"
    },
    { name: "Ops Council", members: "18 members", proposals: "54 proposals" }
  ];
  var DaoCard = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex w-64 shrink-0 flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-5 shadow-neutral-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex size-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-500", children: props.name.slice(0, 1) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-semibold text-base text-neutral-800", children: props.name }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-neutral-500 text-sm", children: [
      props.members,
      " · ",
      props.proposals
    ] })
  ] });
  var Default = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Carousel, { gap: 16, initialOffset: 0, isDraggable: true, children: featuredDaos.map((dao) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DaoCard, { ...dao }, dao.name)) }) });
  var Marquee = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Carousel, { gap: 16, speed: 40, speedOnHoverFactor: 0.2, children: featuredDaos.slice(0, 4).map((dao) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DaoCard, { ...dao }, dao.name)) }) });
  return __toCommonJS(Carousel_exports);
})();
