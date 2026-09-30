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

  // .design-sync/previews/DataList.tsx
  var DataList_exports = {};
  __export(DataList_exports, {
    EmptyFilteredState: () => EmptyFilteredState,
    LoadingState: () => LoadingState,
    MemberList: () => MemberList,
    ProposalList: () => ProposalList
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

  // .design-sync/previews/DataList.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var sortItems = [
    { value: "date_desc", label: "Newest first", type: "DESC" },
    { value: "date_asc", label: "Oldest first", type: "ASC" }
  ];
  var proposals = [
    {
      id: "PIP-23",
      title: "Fund grants wave 4 with 250k USDC",
      summary: "Allocate treasury funds to the next wave of ecosystem grants.",
      status: "Active",
      variant: "info"
    },
    {
      id: "PIP-22",
      title: "Reduce support threshold to 55%",
      summary: "Update the token voting plugin governance settings.",
      status: "Executed",
      variant: "success"
    },
    {
      id: "PIP-21",
      title: "Onboard security council multisig",
      summary: "Grant the security council permission to veto emergency actions.",
      status: "Rejected",
      variant: "critical"
    }
  ];
  var ProposalList = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    ds_exports.DataList.Root,
    {
      entityLabel: "Proposals",
      itemsCount: proposals.length,
      pageSize: 3,
      state: "idle",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ds_exports.DataList.Filter,
          {
            activeSort: "date_desc",
            onSearchValueChange: () => void 0,
            onSortChange: () => void 0,
            placeholder: "Search proposals",
            sortItems
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Container, { children: proposals.map((proposal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          ds_exports.DataList.Item,
          {
            className: "flex flex-col gap-1 py-4",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-normal text-base text-neutral-800 leading-tight", children: proposal.title }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  ds_exports.Tag,
                  {
                    label: proposal.status,
                    variant: proposal.variant
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-neutral-500 text-sm leading-normal", children: [
                proposal.id,
                " · ",
                proposal.summary
              ] })
            ]
          },
          proposal.id
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Pagination, {})
      ]
    }
  );
  var members = [
    { address: "0x4aB3…9f21", name: "alice.eth", votingPower: "12,400 ARA" },
    { address: "0x88Cd…01ba", name: "bob.eth", votingPower: "8,150 ARA" },
    { address: "0x1eF0…77c3", name: "carol.eth", votingPower: "5,020 ARA" },
    { address: "0x9A02…d411", name: "dan.eth", votingPower: "1,930 ARA" }
  ];
  var MemberList = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    ds_exports.DataList.Root,
    {
      entityLabel: "Members",
      itemsCount: 12,
      pageSize: 4,
      state: "idle",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Container, { children: members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          ds_exports.DataList.Item,
          {
            className: "flex flex-row items-center gap-3 py-4",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-8 shrink-0 rounded-full bg-primary-100" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex grow flex-col", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-base text-neutral-800 leading-tight", children: member.name }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm leading-normal", children: member.address })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-500 text-sm leading-normal", children: member.votingPower })
            ]
          },
          member.address
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Pagination, {})
      ]
    }
  );
  var ProposalSkeleton = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DataList.Item, { className: "flex flex-row items-center gap-3 py-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StateSkeletonCircular, { size: "md" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex grow flex-col gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StateSkeletonBar, { size: "md", width: "60%" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StateSkeletonBar, { size: "sm", width: "35%" })
    ] })
  ] });
  var LoadingState = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DataList.Root, { entityLabel: "Proposals", pageSize: 3, state: "initialLoading", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Container, { SkeletonElement: ProposalSkeleton }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Pagination, {})
  ] });
  var EmptyFilteredState = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DataList.Root, { entityLabel: "Proposals", itemsCount: 0, state: "filtered", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.DataList.Filter,
      {
        activeSort: "date_desc",
        onResetFiltersClick: () => void 0,
        onSearchValueChange: () => void 0,
        onSortChange: () => void 0,
        placeholder: "Search proposals",
        searchValue: "treasury swap",
        sortItems
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.DataList.Container,
      {
        emptyFilteredState: {
          heading: "No proposals found",
          description: "Your filters did not match any proposals. Reset the filters and try again."
        }
      }
    )
  ] });
  return __toCommonJS(DataList_exports);
})();
