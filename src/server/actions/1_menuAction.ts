﻿/*
 * Registers an action for a subreddit level menu. This menu is defined in the devvit.json.
 * See https://developers.reddit.com/docs/capabilities/client/menu-actions
 *
 * u/beach-brews
 */

import { Router } from 'express';

export const menuAction = (router: Router): void => {
  router.post('/internal/menu/provide-data', async (_req, res): Promise<void> => {
    try {
      /* ========== Start Focus - Display a form to the user ========== */

      // See https://developers.reddit.com/docs/capabilities/client/forms
      // Show a form to enter a level name + game data for the level
      // NOTE: Currently, this will "overwrite" the level data for the given level name
      console.log('Menu action triggered. Showing form to user.');
      res.json({
        showForm: {
          name: 'createGameForm',
          form: {
            fields: [
              {
                type: 'string',
                name: 'date',
                label: 'Date',
                required: true,
              },
              {
                type: 'string',
                name: 'gameData',
                label: 'Game Data',
                required: true,
              },
            ],
          },
          data: {
            date: new Date().toISOString().split('T')[0],
            gameData: '',
          },
        },
      });

      /* ========== End Focus - Display a form to the user ========== */
    } catch (error) {
      console.error(`Error in menu action: ${error}`);
      res.status(400).json({
        status: 'error',
        message: 'Menu action failed',
      });
    }
  });

  router.post('/internal/menu/post-daily-game', async (_req, res): Promise<void> => {
    try {
      res.json({
        showForm: {
          name: 'postDailyGameForm',
          form: {
            fields: [
              {
                type: 'string',
                name: 'date',
                label: 'Date',
                required: true,
              },
            ],
          },
          data: {
            date: new Date().toISOString().split('T')[0],
          },
        },
      });

      /* ========== End Focus - Display a form to the user ========== */
    } catch (error) {
      console.error(`Error in menu action: ${error}`);
      res.status(400).json({
        status: 'error',
        message: 'Menu action failed',
      });
    }
  });
};
