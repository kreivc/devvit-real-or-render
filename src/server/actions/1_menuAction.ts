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
