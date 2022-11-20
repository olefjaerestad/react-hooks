import { Diff, ObjectDiff, PrimitiveDiff } from './diff';

const GLOBAL_NAMESPACE = '_STATE_DEV_TOOLS_';

type StateName = string;

export type StateEntry = {
  diff: Diff;
};

export interface StateNamespace {
  stateEntries: StateEntry[];
}

export interface StateNamespaces {
  [uniqueStateName: StateName]: StateNamespace;
}

export interface StateDevTools {
  stateNamespaces: StateNamespaces;
}

declare global {
  var _STATE_DEV_TOOLS_: StateDevTools;
}

/**
 * Stores the provided `diff` in the provided diff `namepace`.
 */
export function storeDiff(namespaceId: string, diff: ObjectDiff | PrimitiveDiff) {
  const g = globalObject();
  setupNamespace(namespaceId);
  g[GLOBAL_NAMESPACE].stateNamespaces[namespaceId].stateEntries.push({ diff });
}

function setupNamespace(namespaceId: string) {
  const g = globalObject();
  g[GLOBAL_NAMESPACE] = g[GLOBAL_NAMESPACE] || {};
  g[GLOBAL_NAMESPACE].stateNamespaces = g[GLOBAL_NAMESPACE].stateNamespaces || {};
  g[GLOBAL_NAMESPACE].stateNamespaces[namespaceId] = g[GLOBAL_NAMESPACE].stateNamespaces[namespaceId] || {
    stateEntries: [],
  };
}

function globalObject() {
  return globalThis || global || window;
}
