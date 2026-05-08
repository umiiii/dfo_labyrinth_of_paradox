interface TopBarProps {
  level: number;
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <div
      className="relative w-full flex items-center"
      style={{
        height: 56,
        background:
          'linear-gradient(180deg, rgba(38, 22, 12, 0.95) 0%, rgba(20, 12, 6, 0.95) 100%)',
        borderBottom: '2px solid rgba(180, 130, 60, 0.45)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
      }}
    >
      {/* Center-left: title */}
      <div
        className="title-text absolute"
        style={{
          left: 100,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 38,
        }}
      >
        {title}
      </div>
    </div>
  );
}
