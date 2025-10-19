import { Router } from 'express';
import { media, reddit, redis } from '@devvit/web/server';
import { JsonObject } from '@devvit/web/shared';
import { DailyGameData, RoRenderBackendData } from '../../shared/types/api';

export const formAction = (router: Router): void => {
  router.post('/internal/form/create-game-form', async (req, res): Promise<void> => {
    try {
      const { date, gameData } = req.body;

      const gameDataJson: RoRenderBackendData[] = JSON.parse(gameData);

      const pairMap: Record<string, { real?: string; render?: string; source?: string }> = {};
      gameDataJson.forEach((item) => {
        if (!pairMap[item.pairId]) {
          pairMap[item.pairId] = {};
        }

        // Add null checks to fix "Object is possibly 'undefined'" lint error
        const pairEntry = pairMap[item.pairId];
        if (!pairEntry) return; // defensive, but should not happen

        if (item.isAI) {
          pairEntry.render = `https://pub-216211e810364ec381af7be06d5fec4a.r2.dev/${item.imageKey}`;
        } else {
          pairEntry.real = `https://pub-216211e810364ec381af7be06d5fec4a.r2.dev/${item.imageKey}`;
        }
        pairEntry.source = item.source;
      });

      const transformedData: DailyGameData[] = Object.entries(pairMap).map(
        ([pairId, { real, render, source }]) => ({
          id: pairId,
          real: real ?? '',
          render: render ?? '',
          source: source ?? '',
        })
      );

      const realResponses = await Promise.all(
        transformedData.map(async (item) => {
          const mediaAsset = await media.upload({
            url: item.real,
            type: 'image',
          });

          return mediaAsset.mediaUrl
        })
      );

      const renderResponses = await Promise.all(
        transformedData.map(async (item) => {
          const mediaAsset = await media.upload({
            url: item.render,
            type: 'image',
          });

          return mediaAsset.mediaUrl
        })
      );

      const transformedDataWithMedia = transformedData.map((item, index) => ({
        ...item,
        real: realResponses[index],
        render: renderResponses[index],
      }));

      console.log(`Form action triggered. Saving ${date} and ${gameData} to processing queue.`);
      console.log(transformedDataWithMedia);

      const key = `daily:${date}`;
      await redis.set(key, JSON.stringify(transformedDataWithMedia));

      // Display success to user
      res.status(200).json({
        showToast: {
          appearance: 'success',
          text: `Successfully seeded game data ${date}`,
        },
      });

      /* ========== End Focus - Queue level data ========== */
    } catch (error) {
      console.error(`Error in form action: ${error}`);
      res.status(400).json({
        status: 'error',
        message: 'Form action failed',
      });
    }
  });

  router.post('/internal/form/post-daily-game-form', async (req, res): Promise<void> => {
    try {
      const { date } = req.body;
      console.log(`Form action triggered. Saving ${date} to processing queue.`);

      const gameData = await redis.get(`daily:${date}`);
      if (!gameData) {
        res.status(200).json({
          showToast: {
            text: 'No game data found',
          },
        });
        return;
      }

      console.log('gameData', gameData);
      const gameDataJson: JsonObject = JSON.parse(gameData ?? '');

      // submit post
      await reddit.submitCustomPost({
        subredditName: 'real_or_render_dev',
        title: `Daily Game - ${date}`,
        postData: {
          gameData: gameDataJson,
          date: date,
        },
        splash: {
          appDisplayName: 'Real or Render',
          backgroundUri: 'ror_thumb.png',
          description: date,
          heading: 'Can You Spot Real or Render?',
        }
      });

      res.status(200).json({
        showToast: {
          appearance: 'success',
          text: `Successfully posted daily game ${date}`,
        },
      });

      /* ========== End Focus - Queue level data ========== */
    } catch (error) {
      console.error(`Error in form action: ${error}`);
      res.status(400).json({
        status: 'error',
        message: 'Form action failed',
      });
    }
  });
};
