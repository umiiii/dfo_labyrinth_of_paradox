import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '悖论迷宫',
  description: 'Paradox Labyrinth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
