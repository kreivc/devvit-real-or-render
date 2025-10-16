export type InitResponse = {
  type: 'init';
  levelName: string;
  levelData: string;
  username: string;
};

export type RoRenderBackendData = {
  id: number;
  imageKey: string;
  isAI: boolean;
  pairId: string;
  gameDate: string;
  source: string;
};

export type DailyGameData = {
  id: string;
  real: string;
  render: string;
  source: string;
};
