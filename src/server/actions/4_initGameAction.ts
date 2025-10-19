/*
 * Registers an API action to initialize the "game", by fetching the game data stored in redis.
 *
 * u/beach-brews
 */

import { Router } from 'express';
import { context, reddit, redis } from '@devvit/web/server';

export const initGameAction = (router: Router): void => {
  router.get(
    '/api/init',
    async (_req, res): Promise<void> => {
      try {

        /* ========== Start Focus - Fetch from redis + return result ========== */

        // Confirm post data exists
        const { postData } = context;
        if (!postData) {
          console.error('API Init Error: postData not found in devvit context');
          res.status(400).json({
            status: 'error',
            message: 'postData is required but missing from context',
          });
          return;
        }

        // Get username
        const username = await reddit.getCurrentUsername();

        // Check if this is a daily game post (has gameData and date)
        if (postData.gameData && postData.date) {
          res.json({
            type: 'init',
            gameData: postData.gameData,
            date: postData.date,
            username: username ?? 'anonymous',
          });
          return;
        }

        // Otherwise, check for legacy level-based format
        if (!postData.levelName || typeof postData.levelName !== 'string') {
          console.error('API Init Error: postData.levelName not found in devvit context');
          res.status(400).json({
            status: 'error',
            message: 'postData.levelName is required but missing from context',
          });
          return;
        }

        // Fetch level data
        const levelData = await redis.get(`level:${postData.levelName}`);

        // Fail if level data is missing
        if (!levelData) {
          console.error('API Init Error: levelData not found in redis');
          res.status(400).json({
            status: 'error',
            message: 'levelData is required but missing from redis',
          });
          return;
        }

        // Return legacy format
        res.json({
          type: 'init',
          levelName: postData.levelName,
          levelData: levelData,
          username: username ?? 'anonymous',
        });

        /* ========== End Focus - Fetch from redis + return result ========== */

      } catch (error) {
        console.error(`Error in init action: ${error}`);
        res.status(400).json({
          status: 'error',
          message: 'Init action failed'
        });
      }
    });
}
