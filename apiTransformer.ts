import fs from 'fs';

const DATE = '2025-10-15';

type Data = {
  id: number;
  imageKey: string;
  isAI: boolean;
  pairId: string;
  gameDate: string;
  source: string;
};

type TransformedData = {
  id: string;
  real: string;
  render: string;
  source: string;
};

export const transformData = async () => {
  try {
    const response = await fetch(`https://api.real-or-render.com/daily-game/${DATE}`);
    const data: Data[] = await response.json();
    const pairMap: Record<string, { real?: string; render?: string; source?: string }> = {};
    data.forEach((item) => {
      if (!pairMap[item.pairId]) {
        pairMap[item.pairId] = {};
      }
      if (item.isAI) {
        pairMap[item.pairId].render =
          `https://pub-216211e810364ec381af7be06d5fec4a.r2.dev/${item.imageKey}`;
      } else {
        pairMap[item.pairId].real =
          `https://pub-216211e810364ec381af7be06d5fec4a.r2.dev/${item.imageKey}`;
      }
      pairMap[item.pairId].source = item.source;
    });

    const transformedData: TransformedData[] = Object.entries(pairMap).map(
      ([pairId, { real, render, source }]) => ({
        id: pairId,
        real: real ?? '',
        render: render ?? '',
        source: source ?? '',
      })
    );

    const fileName = DATE.replace(/-/g, '');

    fs.writeFileSync(
      `./src/server/game/${fileName}.ts`,
      `export const game${fileName} = ${JSON.stringify(transformedData, null, 2)}`
    );

    // add import to index.ts
    fs.appendFileSync(`./src/server/game/index.ts`, `export * from './${fileName}';\n`);

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

await transformData();
