# 悖论迷宫 — 数据 Schema（POC）

> 旧契约（基于 `NodeType` 枚举 + `data/labyrinths/{level}-{no}.json`）已作废。
> 当前数据形态以 `data/floors/<floor_id>.json` 为单层迷宫单位，图标字典在 `data/icons.json`。

## 数据形状（来源：`types/labyrinth.ts`）

### Floor — 一层迷宫

```ts
interface Floor {
  schema_version: 1;
  floor_id: string;                       // e.g. "lab1_f1"
  name: string;
  grid: { cols: number; rows: number };
  nodes: FloorNode[];                     // 稀疏：未声明的格子为空（占位、不渲染）
  edges: FloorEdge[];                     // 仅声明非默认连通的边
}

interface FloorNode {
  row: number;
  col: number;
  icon_id: string;                        // 必填，对应 icons.json 的条目
  tier?: string;                          // 缺省 "fixed"
}

interface FloorEdge {
  from: [number, number];                 // [row, col]
  to:   [number, number];
}
```

### IconDict — 图标字典

```ts
type IconDict = Record<string, IconDef>;

interface IconDef {
  id: string;
  name: string;
  description: string;
  icon: Record<string, string>;           // tier -> sprite index 字符串
}
```

## 默认连通规则（loader 在 `deriveEdges` 中实现）

| 优先级 | 规则 | 说明 |
|---|---|---|
| 1 | 同行相邻 | 把每行已声明的节点按 col 升序排序，相邻两节点连一条边 |
| 2 | 中列纵向 | `col === 3` 的节点按 row 升序排序，相邻两节点连一条边 |
| 3 | 显式 edges | `floor.edges[]` 中每条 `[r1,c1]→[r2,c2]`；端点必须均已声明 |
| 4 | 去重 | 规范化端点顺序后去重，重复声明仅保留一条 |

## Icon 解析规则（`resolveIcon`）

- `node.tier` 缺省 → 取 `icon.icon["fixed"]`，hover 取 `icon.icon["hover"]`
- `node.tier = "rare"` → 取 `icon.icon["rare"]` 与 `icon.icon["rare_hover"]`
- 缺失 hover → 回落到 fixed
- 完全找不到 → 回落到 sprite `0.PNG` 并 `console.warn`
- 最终 URL：`/resources/stageicon.img/${index}.PNG`

## 文件归属

| 路径 | 用途 |
|---|---|
| `types/labyrinth.ts` | Floor / IconDict 等 TS 类型 |
| `data/floors/<floor_id>.json` | 单层迷宫数据；POC 仅 `lab1_f1.json` |
| `data/icons.json` | id → IconDef 字典 |
| `resources/icons.json` | 图标字典的可读数组形态（人工维护源） |
| `resources/stageicon.img/*.PNG` | 131 张 sprite 资产 |
| `lib/labyrinth-loader.ts` | `getFloor` / `getIconDict` / `deriveEdges` / `resolveIcon` |
| `components/LabyrinthBoard.tsx`、`MazeNode.tsx` | 渲染层 |
| `app/labyrinth/[level]/[no]/page.tsx` | 路由 → floor_id 映射；POC 仅 `1/1 → lab1_f1` |

## 共同约束

- JSON 文件用 UTF-8、2 空格缩进，无尾随逗号（合法 JSON）
- 节点稀疏存储；空格不必声明
- 边只声明"非默认"的连接；与默认规则重复的显式边会被去重保留单条
- Schema 扩展需先更新 `types/labyrinth.ts`
