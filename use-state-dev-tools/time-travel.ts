import { ObjectDiff, PrimitiveDiff } from './diff';

const GLOBAL_NAMESPACE = '_STATE_DEV_TOOLS_';

export type DiffHistoryEntry = PrimitiveDiff | ObjectDiff;

export interface DiffNamespace {
  diffs: DiffHistoryEntry[];
}

export interface DiffNamespaces {
  [key: string]: DiffNamespace;
}

declare global {
  var _STATE_DEV_TOOLS_: DiffNamespaces;
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
  g[GLOBAL_NAMESPACE][namespaceId].diffs.push(diff);
}

function setupNamespace(namespaceId: string) {
  const g = globalObject();
  g[GLOBAL_NAMESPACE] = g[GLOBAL_NAMESPACE] || {};
  g[GLOBAL_NAMESPACE][namespaceId] = g[GLOBAL_NAMESPACE][namespaceId] || {
    diffs: [],
  };
}

function globalObject() {
  return globalThis || global || window;
}
