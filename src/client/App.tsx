import { context } from '@devvit/web/client';
import { DailyGameData } from '../shared/types/api';




// Render game
export const App = () => {
  const { subredditName, postData } = context
  const gameData = postData?.gameData as DailyGameData[] | undefined

  if (!gameData) return null;

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4">
      <div className="flex flex-col items-center gap-2">
        <h1>{subredditName}</h1>
        <p>{JSON.stringify(gameData)}</p>
      </div>
    </div>
  );
};
