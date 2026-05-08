import type { FloorNode, IconDef, ResolvedIcon } from '@/types/labyrinth';

interface MazeNodeProps {
  node: FloorNode;
  iconDef: IconDef | undefined;
  resolved: ResolvedIcon;
  size?: number;
}

export default function MazeNode({
  node,
  iconDef,
  resolved,
  size = 60,
}: MazeNodeProps) {
  const label = iconDef?.name ?? node.icon_id;
  return (
    <div
      className="group relative flex items-center justify-center"
      style={{ width: size, height: size }}
      data-row={node.row}
      data-col={node.col}
      data-icon-id={node.icon_id}
      data-tier={node.tier ?? 'fixed'}
      title={iconDef ? `${iconDef.name}\n${iconDef.description}` : node.icon_id}
    >
      <img
        src={resolved.fixed}
        alt={label}
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none transition-opacity duration-150 group-hover:opacity-0"
      />
      <img
        src={resolved.hover}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      />
    </div>
  );
}
