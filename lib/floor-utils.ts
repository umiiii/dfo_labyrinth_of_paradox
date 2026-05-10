import type {
  Floor,
  FloorNode,
  IconDict,
  DerivedEdge,
  NodeKey,
  ResolvedIcon,
  RewardItem,
} from '@/types/labyrinth';

const SPRITE_BASE = '/resources/stageicon.img';

const nodeKey = (r: number, c: number): NodeKey => `${r}_${c}` as NodeKey;

export function deriveEdges(floor: Floor): DerivedEdge[] {
  const present = new Set<NodeKey>(
    floor.nodes.map((n) => nodeKey(n.row, n.col)),
  );
  const out = new Map<string, DerivedEdge>();

  const add = (a: NodeKey, b: NodeKey) => {
    if (a === b) return;
    if (!present.has(a) || !present.has(b)) return;
    const [lo, hi] = a < b ? [a, b] : [b, a];
    out.set(`${lo}|${hi}`, { from: lo, to: hi });
  };

  // Rule 1: same row neighbors
  const byRow = new Map<number, FloorNode[]>();
  for (const n of floor.nodes) {
    let list = byRow.get(n.row);
    if (!list) {
      list = [];
      byRow.set(n.row, list);
    }
    list.push(n);
  }
  byRow.forEach((list) => {
    list.sort((a, b) => a.col - b.col);
    for (let i = 0; i < list.length - 1; i++) {
      add(
        nodeKey(list[i].row, list[i].col),
        nodeKey(list[i + 1].row, list[i + 1].col),
      );
    }
  });

  // Rule 2: middle column (col === 3) vertical
  const mid = floor.nodes
    .filter((n) => n.col === 3)
    .sort((a, b) => a.row - b.row);
  for (let i = 0; i < mid.length - 1; i++) {
    add(nodeKey(mid[i].row, 3), nodeKey(mid[i + 1].row, 3));
  }

  // Rule 3: explicit edges
  for (const e of floor.edges) {
    const a = nodeKey(e.from[0], e.from[1]);
    const b = nodeKey(e.to[0], e.to[1]);
    if (!present.has(a) || !present.has(b)) {
      console.warn(
        `[deriveEdges] floor=${floor.floor_id} explicit edge references missing node: ${a} -> ${b}`,
      );
      continue;
    }
    add(a, b);
  }

  const result: DerivedEdge[] = [];
  out.forEach((edge) => result.push(edge));
  return result;
}

export function resolveIcon(
  dict: IconDict,
  iconId: string,
  tier?: string,
): ResolvedIcon {
  const def = dict[iconId];
  if (!def) {
    console.warn(`[resolveIcon] missing icon_id: ${iconId}`);
    return { fixed: `${SPRITE_BASE}/0.PNG`, hover: `${SPRITE_BASE}/0.PNG` };
  }
  const t = tier ?? 'fixed';
  const fixedIdx = def.icon[t] ?? def.icon['fixed'];
  const hoverIdx = def.icon[`${t}_hover`] ?? def.icon['hover'] ?? fixedIdx;
  if (fixedIdx === undefined) {
    console.warn(
      `[resolveIcon] icon_id=${iconId} has no tier "${t}" and no "fixed" fallback`,
    );
    return { fixed: `${SPRITE_BASE}/0.PNG`, hover: `${SPRITE_BASE}/0.PNG` };
  }
  return {
    fixed: `${SPRITE_BASE}/${fixedIdx}.PNG`,
    hover: `${SPRITE_BASE}/${hoverIdx ?? fixedIdx}.PNG`,
  };
}

export function resolveRewards(
  rewards: RewardItem[] | undefined,
  tier?: string,
): RewardItem[] {
  if (!rewards || rewards.length === 0) return [];
  const out: RewardItem[] = [];
  for (const r of rewards) {
    if (r.image.includes('{tier}')) {
      if (!tier) continue;
      out.push({ ...r, image: r.image.replace('{tier}', tier) });
    } else {
      out.push(r);
    }
  }
  return out;
}
