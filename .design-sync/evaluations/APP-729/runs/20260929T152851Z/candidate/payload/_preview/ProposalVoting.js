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

  // .design-sync/previews/ProposalVoting.tsx
  var ProposalVoting_exports = {};
  __export(ProposalVoting_exports, {
    MultiBody: () => MultiBody,
    MultiStage: () => MultiStage,
    SimpleGovernance: () => SimpleGovernance,
    SingleStageMultisig: () => SingleStageMultisig
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

  // .design-sync/previews/ProposalVoting.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var PAST_START = 1698e9;
  var FUTURE_END = 17523456e5;
  var safeBrand = {
    label: "Safe{Wallet}",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2312FF80'/%3E%3Cpath d='M32 16a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12z' fill='%23121312'/%3E%3C/svg%3E"
  };
  var tokenVotes = [
    {
      voter: {
        address: "0x17366cae2b9c6C3055e9e3C78936a69006BE5409",
        name: "cgero.eth"
      },
      isDelegate: true,
      voteIndicator: "yes",
      votingPower: 47289374,
      tokenSymbol: "ARA"
    },
    {
      voter: {
        address: "0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5",
        name: "sio.eth"
      },
      voteIndicator: "yes",
      votingPower: 1238948,
      tokenSymbol: "ARA"
    },
    {
      voter: { address: "0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05" },
      voteIndicator: "no",
      votingPower: 849500,
      tokenSymbol: "ARA"
    }
  ];
  var multisigVotes = [
    {
      voter: {
        address: "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7",
        name: "ens.eth"
      },
      voteIndicator: "approve"
    },
    {
      voter: { address: "0x650235a0889CAe912673AAD13Ff75d1F1A175487" },
      voteIndicator: "approve"
    },
    {
      voter: { address: "0xDCFfFFA68464A4AFC96EEf885844631A439cE625" },
      voteIndicator: "approve"
    }
  ];
  var TokenVotingContent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.ProposalVoting.BreakdownToken,
      {
        minParticipation: 15,
        supportThreshold: 50,
        tokenSymbol: "ARA",
        tokenTotalSupply: 9451231259,
        totalAbstain: 0,
        totalNo: 849500,
        totalYes: 48528322,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Button, { className: "md:self-start", size: "md", variant: "primary", children: "Vote on proposal" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalVoting.Votes, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.DataList.Root, { entityLabel: "Votes", itemsCount: tokenVotes.length, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Container, { children: tokenVotes.map((vote) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.VoteDataListItem.Structure,
        {
          ...vote
        },
        vote.voter.address
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Pagination, {})
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.ProposalVoting.Details,
      {
        settings: [
          { term: "Strategy", definition: "1 Token → 1 Vote" },
          { term: "Voting options", definition: "Yes, Abstain, or No" },
          { term: "Minimum support", definition: ">50%" },
          {
            term: "Minimum participation (Quorum)",
            definition: "≥1.42B of 9.45B ARA (≥15%)"
          },
          { term: "Early execution", definition: "Yes" },
          { term: "Vote replacement", definition: "No" },
          { term: "Minimum duration", definition: "7 days" }
        ]
      }
    )
  ] });
  var MultisigContent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.ProposalVoting.BreakdownMultisig,
      {
        approvalsAmount: multisigVotes.length,
        membersCount: 10,
        minApprovals: 4
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalVoting.Votes, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      ds_exports.DataList.Root,
      {
        entityLabel: "Votes",
        itemsCount: multisigVotes.length,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Container, { children: multisigVotes.map((vote) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.VoteDataListItem.Structure,
            {
              ...vote
            },
            vote.voter.address
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.DataList.Pagination, {})
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.ProposalVoting.Details,
      {
        settings: [
          { term: "Strategy", definition: "1 Address → 1 Vote" },
          { term: "Voting options", definition: "Approve" },
          { term: "Minimum approval", definition: "4 of 10" }
        ]
      }
    )
  ] });
  var ExternalBodyContent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Tabs.Content, { value: ds_exports.ProposalVotingTab.BREAKDOWN, children: "External Body Breakdown" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.ProposalVoting.Details,
      {
        settings: [{ term: "Address", definition: "0xc273…74C7" }]
      }
    )
  ] });
  var SimpleGovernance = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 560 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.ProposalVoting.Container,
    {
      endDate: FUTURE_END,
      status: ds_exports.ProposalStatus.ACTIVE,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.ProposalVoting.BodyContent,
        {
          name: "0xc273…74C7",
          status: ds_exports.ProposalStatus.ACTIVE,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenVotingContent, {})
        }
      )
    }
  ) }) });
  var SingleStageMultisig = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 560 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.ProposalVoting.StageContainer,
    {
      activeStage: "0",
      onStageClick: () => void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ds_exports.ProposalVoting.Stage,
        {
          name: "Security Council Stage",
          status: ds_exports.ProposalStatus.EXPIRED,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ds_exports.ProposalVoting.BodyContent,
            {
              name: "Security Council",
              status: ds_exports.ProposalStatus.EXPIRED,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultisigContent, {})
            }
          )
        }
      )
    }
  ) }) });
  var MultiStage = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 560 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    ds_exports.ProposalVoting.StageContainer,
    {
      activeStage: "0",
      onStageClick: () => void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ds_exports.ProposalVoting.Stage,
          {
            endDate: FUTURE_END,
            name: "Security Council Stage",
            startDate: PAST_START,
            status: ds_exports.ProposalStatus.ACTIVE,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.ProposalVoting.BodyContent,
              {
                name: "Security Council",
                status: ds_exports.ProposalStatus.ACTIVE,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultisigContent, {})
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ds_exports.ProposalVoting.Stage,
          {
            name: "Token Holders Stage",
            status: ds_exports.ProposalStatus.PENDING,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.ProposalVoting.BodyContent,
              {
                name: "Token Community",
                status: ds_exports.ProposalStatus.PENDING,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenVotingContent, {})
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ds_exports.ProposalVoting.Stage,
          {
            name: "Safe Stage",
            status: ds_exports.ProposalStatus.PENDING,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.ProposalVoting.BodyContent,
              {
                bodyBrand: safeBrand,
                name: "0xd100…11E9",
                status: ds_exports.ProposalStatus.PENDING,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalBodyContent, {})
              }
            )
          }
        )
      ]
    }
  ) }) });
  var MultiBody = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.GukModulesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", maxWidth: 560 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.ProposalVoting.StageContainer,
    {
      activeStage: "0",
      onStageClick: () => void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        ds_exports.ProposalVoting.Stage,
        {
          bodyList: ["token", "safe"],
          endDate: FUTURE_END,
          name: "Community Stage",
          startDate: PAST_START,
          status: ds_exports.ProposalStatus.ACTIVE,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.ProposalVoting.BodySummary, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.ProposalVoting.BodySummaryList, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ProposalVoting.BodySummaryListItem, { id: "token", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex grow flex-col gap-3", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "Token Holders" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    ds_exports.Progress,
                    {
                      thresholdIndicator: 60,
                      value: 30,
                      variant: "neutral"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-neutral-800", children: "30 of 60 ARA" })
                ] }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  ds_exports.ProposalVoting.BodySummaryListItem,
                  {
                    bodyBrand: safeBrand,
                    id: "safe",
                    children: "Founders Approval"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-center text-neutral-500 md:text-right", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-neutral-800", children: "1 body" }),
                " ",
                "required to approve"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.ProposalVoting.BodyContent,
              {
                bodyId: "token",
                name: "Token Holders",
                status: ds_exports.ProposalStatus.ACTIVE,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenVotingContent, {})
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ds_exports.ProposalVoting.BodyContent,
              {
                bodyBrand: safeBrand,
                bodyId: "safe",
                hideTabs: [ds_exports.ProposalVotingTab.VOTES],
                name: "founders.safe.eth",
                status: ds_exports.ProposalStatus.ACTIVE,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalBodyContent, {})
              }
            )
          ]
        }
      )
    }
  ) }) });
  return __toCommonJS(ProposalVoting_exports);
})();
