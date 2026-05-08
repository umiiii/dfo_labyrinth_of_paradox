import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wood-bg w-screen h-screen flex flex-col items-center justify-center">
      <div
        className="px-8 py-6 text-center"
        style={{
          background:
            'linear-gradient(180deg, rgba(38, 22, 12, 0.95) 0%, rgba(20, 12, 6, 0.95) 100%)',
          border: '1px solid rgba(180,130,60,0.6)',
          borderRadius: 6,
          color: '#f0d49a',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        <div className="title-text text-2xl mb-2">迷宫未找到</div>
        <div className="text-sm mb-4 opacity-80">该区域的迷宫数据缺失</div>
        <Link
          href="/labyrinth/3/1"
          className="inline-block px-4 py-2 rounded gold-text"
          style={{
            background:
              'linear-gradient(180deg, rgba(60,40,22,0.95) 0%, rgba(35,22,12,0.95) 100%)',
            border: '1px solid rgba(180,130,60,0.6)',
          }}
        >
          返回第3区域
        </Link>
      </div>
    </main>
  );
}
