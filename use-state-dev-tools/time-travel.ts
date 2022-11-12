import { Diff, ObjectDiff, PrimitiveDiff } from './diff';

const GLOBAL_NAMESPACE = '_STATE_DEV_TOOLS_';

export type DiffHistoryEntry = {
  diff: Diff;
};

export interface StateNamespace {
  diffs: DiffHistoryEntry[];
}

export interface StateNamespaces {
  [key: string]: StateNamespace;
}

export interface GlobalNamespace {
  stateNamespaces: StateNamespaces;
}

declare global {
  var _STATE_DEV_TOOLS_: GlobalNamespace;
}

/**
 * Stores the provided `diff` in the provided diff `namepace`.
 */
export function storeDiff(
  namespaceId: string,
  diff: ObjectDiff | PrimitiveDiff
) {
  const g = globalObject();
  setupNamespace(namespaceId);
  g[GLOBAL_NAMESPACE].stateNamespaces[namespaceId].diffs.push({ diff });
}

function setupNamespace(namespaceId: string) {
  const g = globalObject();
  g[GLOBAL_NAMESPACE] = g[GLOBAL_NAMESPACE] || {};
  g[GLOBAL_NAMESPACE].stateNamespaces =
    g[GLOBAL_NAMESPACE].stateNamespaces || {};
  g[GLOBAL_NAMESPACE].stateNamespaces[namespaceId] = g[GLOBAL_NAMESPACE]
    .stateNamespaces[namespaceId] || {
    diffs: [],
  };
}

function globalObject() {
  return globalThis || global || window;
}
