interface EdgeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function EdgeLine({ x1, y1, x2, y2 }: EdgeLineProps) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#f3c14b"
      strokeDasharray="6 4"
      strokeWidth={3}
      strokeLinecap="round"
      opacity={0.95}
    />
  );
}
