import { getIconDict } from '@/lib/labyrinth-loader';
import FloorEditor from '@/components/FloorEditor';

export default async function EditorPage() {
  const iconDict = await getIconDict();
  return (
    <main className="wood-bg min-h-screen w-full">
      <FloorEditor iconDict={iconDict} />
    </main>
  );
}
