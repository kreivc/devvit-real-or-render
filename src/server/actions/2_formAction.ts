import { Router } from 'express';
import { media, reddit, context } from '@devvit/web/server';
import { JsonValue } from '@devvit/web/shared';
import { DailyGameData, RoRenderBackendData } from '../../shared/types/api';

export const formAction = (router: Router): void => {
  router.post('/internal/form/post-daily-game-form', async (req, res): Promise<void> => {
    try {
      const { date } = req.body;
      console.log(`Form action triggered. Saving ${date} to processing queue.`);
      const { subredditName } = context;

      const dataUrl = `https://ugupzznjxhwwpowfhpmh.supabase.co/functions/v1/proxy-daily-game/${date}`

      const response = await fetch(dataUrl);
      const gameDataJson = await response.json() as RoRenderBackendData[];

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

      // Upload base template with date dynamically rendered
      // const baseTemplateUrl = `data:image/png;base64,${thumbSplash}`;

      // console.log('uploading base template asset');
      // const asset = await media.upload({
      //   type: 'image',
      //   url: baseTemplateUrl,
      // });


      // submit post with date in description
      await reddit.submitCustomPost({
        subredditName: subredditName,
        title: `Daily Game - ${date}`,
        postData: {
          gameData: transformedDataWithMedia as JsonValue,
          date: date as string,
        },
        splash: {
          appDisplayName: 'Real or Render',
          backgroundUri: 'transparent.png', // prevent tile background
        }
      });

      res.status(200).json({
        showToast: {
          appearance: 'success',
          text: `Successfully posted daily game ${date}`,
        },
      });

      console.log('post submitted successfully');

      /* ========== End Focus - Queue level data ========== */
    } catch (error) {
      console.error(`Error in form action: ${error}`);
      res.status(400).json({
        showToast: {
          text: `Form action failed: ${error}`,
        },
      });
    }
  });
  router.post('/internal/form/override-post-daily-game-form', async (req, res): Promise<void> => {
    try {
      const { targetId, gameData } = req.body;

      const post = await reddit.getPostById(targetId as `t3_${string}`);
      const postData = await post.getPostData();
      const date = postData!.date as string;
      const gameDataJson: RoRenderBackendData[] = JSON.parse(gameData as string);


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

      await post.setPostData({
        gameData: transformedDataWithMedia as JsonValue,
        date: date as string,
      });

      res.status(200).json({
        showToast: {
          appearance: 'success',
          text: `Post daily game overridden`,
        },
        navigateTo: post
      });
    } catch (error) {
      console.error(`Error in form action: ${error}`);
      res.status(400).json({
        showToast: {
          text: `Form action failed: ${error}`,
        },
      });
    }
  });
};
