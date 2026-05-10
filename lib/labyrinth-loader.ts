import { promises as fs } from 'fs';
import path from 'path';
import type { Floor, IconDict } from '@/types/labyrinth';

export { deriveEdges, resolveIcon } from './floor-utils';

const FLOORS_DIR = path.join(process.cwd(), 'data', 'floors');
const ICONS_PATH = path.join(process.cwd(), 'data', 'icons.json');
const AREA_DESCRIPTIONS_PATH = path.join(
  process.cwd(),
  'data',
  'area-descriptions.json',
);
const REWARDS_DIR = path.join(process.cwd(), 'public', 'rewards');
const KNOWN_TIERS = [
  'uncommon',
  'rare',
  'unique',
  'legendary',
  'epic',
  'primeval',
] as const;

export interface RewardOption {
  value: string;
  label: string;
  tiered: boolean;
  availableTiers?: string[];
}

async function readJsonOrNull<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'ENOENT'
    ) {
      return null;
    }
    throw err;
  }
}

export async function getFloor(floorId: string): Promise<Floor | null> {
  return readJsonOrNull<Floor>(path.join(FLOORS_DIR, `${floorId}.json`));
}

export async function listFloors(): Promise<Floor[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(FLOORS_DIR);
  } catch {
    return [];
  }
  const loaded = await Promise.all(
    entries
      .filter((f) => f.endsWith('.json'))
      .map((f) => readJsonOrNull<Floor>(path.join(FLOORS_DIR, f))),
  );
  return loaded.filter((f): f is Floor => !!f);
}

export async function getIconDict(): Promise<IconDict> {
  const dict = await readJsonOrNull<IconDict>(ICONS_PATH);
  return dict ?? {};
}

export async function getAreaDescriptions(): Promise<Record<string, string>> {
  const dict = await readJsonOrNull<Record<string, string>>(
    AREA_DESCRIPTIONS_PATH,
  );
  return dict ?? {};
}

export async function getRewardOptions(): Promise<RewardOption[]> {
  let files: string[];
  try {
    files = await fs.readdir(REWARDS_DIR);
  } catch {
    return [];
  }
  const png = files.filter((f) => /\.PNG$/i.test(f));

  const tieredBases = new Map<string, Set<string>>();
  const staticStems = new Set<string>();

  for (const f of png) {
    const stem = f.replace(/\.PNG$/i, '');
    const tier = KNOWN_TIERS.find((t) => stem.endsWith(`_${t}`));
    if (tier) {
      const base = stem.slice(0, -tier.length - 1);
      let set = tieredBases.get(base);
      if (!set) {
        set = new Set();
        tieredBases.set(base, set);
      }
      set.add(tier);
    } else {
      staticStems.add(stem);
    }
  }

  const out: RewardOption[] = [];
  Array.from(tieredBases.entries()).forEach(([base, tiers]) => {
    out.push({
      value: `/rewards/${base}_{tier}.PNG`,
      label: `${base} (按 tier)`,
      tiered: true,
      availableTiers: KNOWN_TIERS.filter((t) => tiers.has(t)),
    });
  });
  Array.from(staticStems).forEach((stem) => {
    out.push({
      value: `/rewards/${stem}.PNG`,
      label: stem,
      tiered: false,
    });
  });
  out.sort((a, b) => a.label.localeCompare(b.label));
  return out;
}
