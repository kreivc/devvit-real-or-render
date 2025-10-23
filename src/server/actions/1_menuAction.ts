import { Router } from 'express';

export const menuAction = (router: Router): void => {
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
                defaultValue: new Date().toISOString().split('T')[0],
              },
            ],
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

  router.post('/internal/menu/override-post-daily-game', async (req, res): Promise<void> => {
    const { targetId } = req.body;

    try {
      res.json({
        showForm: {
          name: 'overridePostDailyGameForm',
          form: {
            fields: [
              {
                type: 'string',
                name: 'targetId',
                label: 'Target ID',
                required: true,
                defaultValue: targetId,
              },
              {
                type: 'string',
                name: 'gameData',
                label: 'Game Data',
                required: true,
                defaultValue: "[]"
              },
            ],
          }
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
