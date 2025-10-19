/*
 * Registers the splash screen configuration for the Real or Render game.
 * The splash screen is displayed in the Reddit feed before users launch the full game.
 * 
 * See https://developers.reddit.com/docs/capabilities/server/splash-screen
 */

import { Router } from 'express';
import { context } from '@devvit/web/server';

export const splashScreenAction = (router: Router): void => {
  router.get('/splash', async (_req, res): Promise<void> => {
    try {
      const { postData } = context;

      // Get the game date from post data if available
      const gameDate = postData?.date as string | undefined;
      const formattedDate = gameDate
        ? new Date(gameDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        : 'Today';

      // Get player count if available
      const playerCount = postData?.playerCount as number | undefined;
      const playerCountText = playerCount
        ? `${playerCount} player${playerCount !== 1 ? 's' : ''} today`
        : 'Be the first to play today!';

      // Return splash screen configuration
      res.json({
        // Main content area
        content: {
          type: 'vstack',
          alignment: 'center middle',
          gap: 'medium',
          padding: 'large',
          backgroundColor: 'neutral-background',
          children: [
            // Hero visual - Camera vs Robot with dramatic styling
            {
              type: 'vstack',
              alignment: 'center middle',
              gap: 'small',
              padding: 'medium',
              backgroundColor: 'neutral-background-weak',
              cornerRadius: 'large',
              children: [
                {
                  type: 'hstack',
                  alignment: 'center middle',
                  gap: 'large',
                  children: [
                    {
                      type: 'text',
                      text: '📷',
                      style: {
                        size: 'xxlarge',
                      },
                    },
                    {
                      type: 'vstack',
                      alignment: 'center middle',
                      gap: 'none',
                      children: [
                        {
                          type: 'text',
                          text: 'VS',
                          style: {
                            size: 'xlarge',
                            weight: 'bold',
                            color: 'primary',
                          },
                        },
                      ],
                    },
                    {
                      type: 'text',
                      text: '🤖',
                      style: {
                        size: 'xxlarge',
                      },
                    },
                  ],
                },
                // Main title with enhanced styling
                {
                  type: 'text',
                  text: 'REAL OR RENDER',
                  style: {
                    font: 'mono',
                    size: 'xxlarge',
                    color: 'primary',
                    weight: 'bold',
                  },
                },
              ],
            },

            // Compelling tagline
            {
              type: 'vstack',
              alignment: 'center middle',
              gap: 'xsmall',
              padding: 'small',
              children: [
                {
                  type: 'text',
                  text: '🧠 Can You Spot the AI?',
                  style: {
                    size: 'xlarge',
                    weight: 'bold',
                    color: 'neutral-content-strong',
                  },
                },
                {
                  type: 'text',
                  text: 'Test your eye against artificial intelligence',
                  style: {
                    size: 'medium',
                    color: 'neutral-content',
                  },
                },
              ],
            },

            // Daily challenge badge with player stats
            {
              type: 'vstack',
              alignment: 'center middle',
              gap: 'small',
              padding: 'medium',
              backgroundColor: 'primary-background',
              cornerRadius: 'large',
              children: [
                {
                  type: 'text',
                  text: `🗓️ Daily Challenge`,
                  style: {
                    size: 'large',
                    weight: 'bold',
                    color: 'primary',
                  },
                },
                {
                  type: 'text',
                  text: formattedDate,
                  style: {
                    size: 'medium',
                    weight: 'bold',
                    color: 'neutral-content-strong',
                  },
                },
                {
                  type: 'spacer',
                  size: 'xsmall',
                },
                {
                  type: 'text',
                  text: `👥 ${playerCountText}`,
                  style: {
                    size: 'medium',
                    color: 'neutral-content',
                  },
                },
              ],
            },

            // Spacer for visual breathing room
            {
              type: 'spacer',
              size: 'medium',
            },

            // Game features in a compact, scannable format
            {
              type: 'vstack',
              alignment: 'start top',
              gap: 'small',
              padding: 'medium',
              backgroundColor: 'neutral-background-weak',
              cornerRadius: 'large',
              children: [
                {
                  type: 'text',
                  text: '✨ What Awaits You:',
                  style: {
                    size: 'large',
                    weight: 'bold',
                    color: 'neutral-content-strong',
                  },
                },
                {
                  type: 'spacer',
                  size: 'xsmall',
                },
                {
                  type: 'hstack',
                  alignment: 'start middle',
                  gap: 'small',
                  children: [
                    {
                      type: 'text',
                      text: '🔍',
                      style: {
                        size: 'large',
                      },
                    },
                    {
                      type: 'text',
                      text: 'Magnifier tool for pixel-perfect inspection',
                      style: {
                        size: 'medium',
                        color: 'neutral-content-strong',
                      },
                    },
                  ],
                },
                {
                  type: 'hstack',
                  alignment: 'start middle',
                  gap: 'small',
                  children: [
                    {
                      type: 'text',
                      text: '🎯',
                      style: {
                        size: 'large',
                      },
                    },
                    {
                      type: 'text',
                      text: '10 mind-bending rounds',
                      style: {
                        size: 'medium',
                        color: 'neutral-content-strong',
                      },
                    },
                  ],
                },
                {
                  type: 'hstack',
                  alignment: 'start middle',
                  gap: 'small',
                  children: [
                    {
                      type: 'text',
                      text: '⏱️',
                      style: {
                        size: 'large',
                      },
                    },
                    {
                      type: 'text',
                      text: 'Race against the clock',
                      style: {
                        size: 'medium',
                        color: 'neutral-content-strong',
                      },
                    },
                  ],
                },
                {
                  type: 'hstack',
                  alignment: 'start middle',
                  gap: 'small',
                  children: [
                    {
                      type: 'text',
                      text: '🏆',
                      style: {
                        size: 'large',
                      },
                    },
                    {
                      type: 'text',
                      text: 'Climb the daily leaderboard',
                      style: {
                        size: 'medium',
                        color: 'neutral-content-strong',
                      },
                    },
                  ],
                },
              ],
            },

            // Spacer
            {
              type: 'spacer',
              size: 'medium',
            },

            // Challenge hook with social proof
            {
              type: 'vstack',
              alignment: 'center middle',
              gap: 'small',
              padding: 'medium',
              backgroundColor: 'warning-background',
              cornerRadius: 'large',
              children: [
                {
                  type: 'text',
                  text: '⚡ Think You Can Beat the AI?',
                  style: {
                    size: 'large',
                    weight: 'bold',
                    color: 'warning',
                  },
                },
                {
                  type: 'text',
                  text: 'Average score: 6-7 out of 10',
                  style: {
                    size: 'medium',
                    color: 'neutral-content',
                  },
                },
                {
                  type: 'text',
                  text: 'Can you do better?',
                  style: {
                    size: 'small',
                    color: 'neutral-content-weak',
                    weight: 'bold',
                  },
                },
              ],
            },
          ],
        },

        // Launch button with compelling CTA
        button: {
          text: '🎮 Launch Challenge',
          style: 'primary',
        },
      });
    } catch (error) {
      console.error(`Error in splash screen action: ${error}`);
      res.status(500).json({
        error: 'Failed to generate splash screen',
      });
    }
  });
};
