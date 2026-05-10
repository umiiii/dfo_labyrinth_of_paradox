import { getIconDict, getRewardOptions } from '@/lib/labyrinth-loader';
import FloorEditor from '@/components/FloorEditor';

export default async function EditorPage() {
  const [iconDict, rewardOptions] = await Promise.all([
    getIconDict(),
    getRewardOptions(),
  ]);
  return (
    <main className="wood-bg h-screen w-full overflow-y-auto">
      <FloorEditor iconDict={iconDict} rewardOptions={rewardOptions} />
    </main>
  );
}
