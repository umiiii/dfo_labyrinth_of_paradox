import { notFound } from 'next/navigation';
import { getFloor, getIconDict } from '@/lib/labyrinth-loader';
import TopBar from '@/components/TopBar';
import BottomBar from '@/components/BottomBar';
import LabyrinthBoard from '@/components/LabyrinthBoard';
import Pager from '@/components/Pager';

interface Params {
  params: { level: string; no: string };
}

const FLOOR_ROUTES: Record<string, string> = {
  '1/1': 'lab1_f1_11221',
  '1/2': 'lab1_f1_12321',
  '1/3': 'lab1_f1_13322',
  '1/4': 'lab1_f1_22113',
  '1/5': 'lab1_f1_23132',
};

export default async function LabyrinthPage({ params }: Params) {
  const level = Number(params.level);
  const no = Number(params.no);

  if (![1, 2, 3].includes(level)) notFound();
  if (!Number.isInteger(no) || no < 1) notFound();

  const floorId = FLOOR_ROUTES[`${level}/${no}`];
  if (!floorId) notFound();

  const floor = await getFloor(floorId);
  if (!floor) notFound();

  const iconDict = await getIconDict();

  return (
    <main className="wood-bg w-screen h-screen flex items-center justify-center overflow-hidden">
      <div
        className="relative shadow-2xl"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          aspectRatio: '16 / 9',
          background: '#1a0e06',
          border: '1px solid rgba(120,80,40,0.5)',
        }}
      >
        <TopBar level={level} title={floor.name} />

        <div
          className="relative"
          style={{ height: 'calc(100% - 56px - 56px)' }}
        >
          <LabyrinthBoard floor={floor} iconDict={iconDict} />
          <Pager level={level} no={no} max={5} />
        </div>

        <BottomBar />
      </div>
    </main>
  );
}
