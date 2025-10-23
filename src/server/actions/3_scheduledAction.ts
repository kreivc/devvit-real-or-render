/*
 * Registers an action that is called by the Devvit scheduler. This schedule is defined in the devvit.json.
 * See https://developers.reddit.com/docs/capabilities/server/scheduler
 *
 * u/beach-brews
 */

import { Router } from 'express';
import { media, reddit, context } from '@devvit/web/server';
import { DailyGameData, RoRenderBackendData } from '../../shared/types/api';
import { thumbSplash } from '../../shared/config/appIcon';
import { JsonValue } from '@devvit/web/shared';

export const scheduledAction = (router: Router): void => {
  router.post(
    '/internal/scheduler/create-game-post',
    async (_req, res): Promise<void> => {
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const { subredditName } = context;
        const dataUrl = `https://ugupzznjxhwwpowfhpmh.supabase.co/functions/v1/proxy-daily-game/${currentDate}`

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
        const baseTemplateUrl = `data:image/png;base64,${thumbSplash}`;

        console.log('uploading base template asset');
        const asset = await media.upload({
          type: 'image',
          url: baseTemplateUrl,
        });


        // submit post with date in description
        await reddit.submitCustomPost({
          subredditName: subredditName,
          title: `Daily Game - ${currentDate}`,
          postData: {
            gameData: transformedDataWithMedia as JsonValue,
            date: currentDate as string,
          },
          splash: {
            appDisplayName: 'Real or Render',
            backgroundUri: asset.mediaUrl,
            description: `Daily Challenge: ${currentDate}`,
            heading: 'Can You Spot Real or Render?',
          }
        });

        res.status(200).json({
          showToast: {
            status: 'success',
            message: `Successfully posted daily game ${currentDate}`,
          },
        });

        console.log('post submitted successfully');
      } catch (error) {
        console.error(`Error in scheduled action: ${error}`);
        res.status(400).json({
          status: 'error',
          message: 'Scheduled action failed'
        });
      }
    });
}
