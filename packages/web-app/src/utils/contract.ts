// This file has been generated by james but committed by me

import {AugmentedEtherscanContractResponse} from 'containers/smartContractComposer/components/contractAddressValidation';
import {SmartContractAction} from './types';

export const actionsFilter = (search: string) => (a: SmartContractAction) =>
  a.type === 'function' &&
  (a.stateMutability === 'payable' || a.stateMutability === 'nonpayable') &&
  a.name.toLowerCase().includes(search.toLowerCase());

export interface NatspecDetails {
  keyword: string;
  name: string;
  tags: {
    [tag: string]: string | Record<string, string>; // Record is for @params tag
  };
}

export interface NatspecContract {
  name: string;
  superClasses: string[];
  tags: Record<string, string>;
  details: Record<string, NatspecDetails>;
}

function concatNatspecDetails(det0: NatspecDetails, det1: NatspecDetails) {
  return {
    keyword: det0.keyword || det1.keyword,
    name: det0.name || det1.name,
    tags: Object.assign({}, det0.tags, det1.tags),
  };
}

function scanWord(source: string, pos: number): [number, string] {
  const nextSpaceIdx = source.indexOf(' ', pos);
  return [nextSpaceIdx, source.substring(pos, nextSpaceIdx)];
}

export function scanNatspecBlock(
  source: string,
  pos: number,
  terminator: string
): [number, NatspecDetails] {
  let match = '';
  const scanMatches = ['\n'];
  let nextPos = -1;
  let ended = false;
  if (terminator) scanMatches.push(terminator);
  const details = {
    keyword: '',
    tags: {},
  } as NatspecDetails;

  let prevPos = pos;
  [match, pos] = scanFirst(source, pos, ['@', ...scanMatches]);

  let tag = '';
  let param = '';

  while (pos >= 0 && !ended) {
    if (match === '@') {
      [pos, tag] = scanWord(source, pos);
      if (tag === 'param') {
        pos = skipWhitespace(source, pos);
        [pos, param] = scanWord(source, pos);
      }
      pos = skipWhitespace(source, pos);

      let posEnd: number;
      [match, posEnd] = scanFirst(source, pos, scanMatches);
      if (match === terminator || pos < 0) {
        ended = true;
      }

      const comment = source.substring(pos, posEnd).trim();

      if (tag === 'param') {
        if (details.tags[tag]) {
          const params = details.tags[tag] as Record<string, string>;
          params[param] = comment;
        } else {
          details.tags[tag] = {[param]: comment};
        }
      } else {
        details.tags[tag] = comment;
      }

      pos = posEnd;
    } else if (match === terminator) {
      ended = true;
    } else if (match === '\n') {
      if (tag) {
        const line = source.substring(prevPos, pos).trim();
        const currentTag = details.tags[tag];
        if (typeof currentTag === 'object') {
          currentTag[param] += '\n' + line;
        } else {
          details.tags[tag] += '\n' + line;
        }
      }
    }

    if (terminator === '') {
      [match, nextPos] = scanFirst(source, pos, ['///', '\n']);
      if (match === '\n' || nextPos < 0) {
        ended = true;
      } else {
        pos = nextPos;
      }
    }

    if (ended) break;

    prevPos = pos;
    [match, pos] = scanFirst(source, pos, ['@', ...scanMatches]);
  }

  return [pos, details];
}

/** Extracts the natspec from Solidity source code.
 * The output data is structured by contract/function/natspec tag and then optionally
 * for the params tag, a list of the params. Includes multiline natspec tags so the
 * text may be quite long. Includes superClasses property for a contract to allow
 * retrieval of natspec data for functions which have the @inheritdoc tag.
 */
export function extractNatSpec(source: string) {
  let pos = 0,
    posEnd = 0;
  let match = '';
  let currentContract: NatspecContract = {
    name: '',
    superClasses: [],
    tags: {},
    details: {},
  };
  const natspec = {} as Record<string, NatspecContract>;
  let natspecDetails: NatspecDetails = {
    keyword: '',
    name: '',
    tags: {},
  };
  let newDetails: NatspecDetails;

  while (pos >= 0) {
    [match, pos] = scanFirst(source, pos, [
      '/*',
      '//',
      'contract ',
      'function ',
      'error ',
      'event ',
      'constructor(',
      'constructor ',
    ]);

    if (pos < 0) break;

    switch (match) {
      case '/*':
        if (source[pos] === '*') {
          [pos, newDetails] = scanNatspecBlock(source, pos + 1, '*/');
          natspecDetails = concatNatspecDetails(natspecDetails, newDetails);
        } else {
          [match, pos] = scanFirst(source, pos, ['*/']);
        }
        break;
      case '//':
        if (source[pos] === '/') {
          [pos, newDetails] = scanNatspecBlock(source, pos + 1, '');
          natspecDetails = concatNatspecDetails(natspecDetails, newDetails);
        } else {
          [match, pos] = scanFirst(source, pos, ['\n']);
        }
        break;
      case 'contract ': {
        pos = skipWhitespace(source, pos);
        let name: string;
        [pos, name] = scanWord(source, pos);
        [match, pos] = scanFirst(source, pos, ['is', '{']);
        const superClasses: string[] = [];
        while (match !== '{') {
          [match, posEnd] = scanFirst(source, pos, [',', '{']);
          superClasses.push(source.substring(pos, posEnd - 1).trim());
          pos = posEnd;
        }
        currentContract = {
          name,
          superClasses,
          tags: natspecDetails.tags as Record<string, string>,
          details: {},
        };
        natspec[name] = currentContract;
        natspecDetails = {
          keyword: '',
          name: '',
          tags: {},
        };
        break;
      }
      default: {
        pos = skipWhitespace(source, pos);
        if (match.slice(-1) === '(') pos--;
        [, posEnd] = scanFirst(source, pos, [' ', '(']);
        if (pos < 0) break;
        natspecDetails.name = source.substring(pos, posEnd - 1);
        natspecDetails.keyword = match.slice(0, -1);
        if (natspecDetails.keyword === 'constructor') {
          natspecDetails.name = `constructor for ${currentContract.name}`;
        }
        currentContract.details[natspecDetails.name] = natspecDetails;
        natspecDetails = {
          keyword: '',
          name: '',
          tags: {},
        };
        pos = posEnd;
        break;
      }
    }
  }

  return natspec;
}

/**
 * Collapse inheritance tree of a map of NatspecContracts into a single NatspecDetails object.
 * @param natspec The map of NatspecContracts to collapse.
 * @param contract The name of the contract to collapse.
 * @returns The contract with the NatspecDetails added for all inherited functions.
 */
export function collapseNatspec(
  natspec: Record<string, NatspecContract>,
  contract: string
): NatspecContract {
  const collapsed = {...natspec[contract]};
  for (const superClass of collapsed.superClasses) {
    if (!natspec[superClass]) continue;
    const superNatspec = collapseNatspec(natspec, superClass);
    collapsed.details = Object.fromEntries(
      Object.entries(collapsed.details).map(([name, details]) => {
        if (details.tags['inheritdoc'] !== undefined) {
          const inheritDetails =
            natspec[details.tags['inheritdoc'] as string]?.details[name];
          if (inheritDetails !== undefined) {
            delete details.tags['inheritdoc'];
            details.tags = {...inheritDetails.tags, ...details.tags};
          }
        }
        if (Object.keys(details.tags).length === 0) {
          const superDetails = superNatspec.details[name];
          return [name, superDetails !== undefined ? superDetails : details];
        }
        return [name, details];
      })
    );
    collapsed.details = {...superNatspec.details, ...collapsed.details};
  }
  return collapsed;
}

/** Starts scanning str at start to find the first match from searches. If multiple matches complete at the
 * same position in str, it prefers the one which is listed first in searches.
 */
export const scanFirst = (
  str: string,
  start: number,
  searches: string[]
): [string, number] => {
  const matches: [number, number][] = [];
  for (let idx = start; idx < str.length; idx++) {
    for (let matchIdx = 0; matchIdx < matches.length; matchIdx++) {
      const [srchIdx, pos] = matches[matchIdx];
      if (searches[srchIdx][pos + 1] === str[idx]) {
        matches[matchIdx][1]++;
        if (pos + 2 === searches[srchIdx].length) {
          return [searches[srchIdx], idx + 1];
        }
      } else {
        matches.splice(matchIdx, 1);
        matchIdx--;
      }
    }

    for (let srchIdx = 0; srchIdx < searches.length; srchIdx++) {
      if (searches[srchIdx][0] === str[idx]) {
        matches.push([srchIdx, 0]);
        if (1 === searches[srchIdx].length) {
          return [searches[srchIdx], idx + 1];
        }
      }
    }
  }
  return ['', -1];
};

export const skipWhitespace = (str: string, start: number) => {
  let pos = start;
  while (' \t\n\r\v'.indexOf(str[pos]) > -1 && pos < str.length) pos++;
  return pos;
};

export function parseSourceCode(input: string) {
  input = input.trim();

  if (input.startsWith('{')) {
    const sources_obj = JSON.parse(input.slice(1, input.length - 1)).sources;
    let sources = '';

    for (const method_name in sources_obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (sources_obj.hasOwnProperty(method_name)) {
        sources = sources + sources_obj[method_name].content;
      }
    }

    return sources;
  } else {
    return input;
  }
}

export const flattenNatSpecTags = (
  NatSpec: Record<string, NatspecContract>
) => {
  const flatTags: Record<string, unknown> = {};

  Object.values(NatSpec).map(contract => {
    Object.values(contract.details).map(
      details => (flatTags[details.name] = details.tags)
    );
  });

  return flatTags;
};

export function attachEtherNotice(
  SourceCode: AugmentedEtherscanContractResponse['SourceCode'],
  ContractName: string,
  ABI: SmartContractAction[]
): SmartContractAction[] {
  const parsedSourceCode = parseSourceCode(SourceCode);
  const EtherNotice = extractNatSpec(parsedSourceCode);
  const collapsedNatspec = collapseNatspec(EtherNotice, ContractName);
  const notices = collapsedNatspec.details;

  return ABI.map(action => {
    if (action.type === 'function' && notices?.[action.name]) {
      action.notice = notices[action.name].tags.notice as string;
    }

    return action;
  });
}
