/*
 * Game API endpoints for Real or Render game
 * Handles score saving, leaderboard retrieval, and play status checking
 */

import { Router } from 'express';
import { context, reddit, redis } from '@devvit/web/server';
import type {
  SaveScoreRequest,
  SaveScoreResponse,
  LeaderboardResponse,
  CheckPlayedResponse,
  PostCommentRequest,
  PostCommentResponse,
  TopPlayer,
} from '../../shared/types/api';

/**
 * Helper function to get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return dateStr || '';
}

/**
 * Helper function to calculate score
 * Formula: (Correct × 1,000,000) + Time(ms)
 */
function calculateScore(correctGuesses: number, timeMs: number): number {
  return correctGuesses * 1_000_000 + timeMs;
}

export const gameApiActions = (router: Router): void => {
  /**
   * POST /api/save-score
   * Saves player score to Redis (first play only)
   */
  router.post('/api/save-score', async (req, res): Promise<void> => {
    try {
      const body = req.body as SaveScoreRequest;
      const { userId, score, date, correctGuesses, timeMs } = body;

      // Validate input
      if (!userId || !date || typeof score !== 'number' || typeof correctGuesses !== 'number' || typeof timeMs !== 'number') {
        res.status(400).json({
          success: false,
          saved: false,
          message: 'Invalid request data. Required: userId, score, date, correctGuesses, timeMs',
        } as SaveScoreResponse);
        return;
      }

      // Verify score matches formula
      const expectedScore = calculateScore(correctGuesses, timeMs);
      if (score !== expectedScore) {
        res.status(400).json({
          success: false,
          saved: false,
          message: 'Invalid score calculation',
        } as SaveScoreResponse);
        return;
      }

      // Verify reasonable time (at least 5 seconds for 10 rounds)
      if (timeMs < 5000) {
        res.status(400).json({
          success: false,
          saved: false,
          message: 'Invalid completion time',
        } as SaveScoreResponse);
        return;
      }

      // Verify correct guesses is within valid range
      if (correctGuesses < 0 || correctGuesses > 10) {
        res.status(400).json({
          success: false,
          saved: false,
          message: 'Invalid correct guesses count',
        } as SaveScoreResponse);
        return;
      }

      // Check if user has already played today
      const playerKey = `player:${userId}:${date}`;
      const leaderboardKey = `leaderboard:daily:${date}`;
      const hasPlayed = await redis.exists(playerKey);

      if (hasPlayed) {
        // User already played today, don't save score but return their original score
        const playerData = await redis.hGetAll(playerKey);
        const originalCorrect = parseInt(playerData.correct || '0', 10);
        const originalTimeMs = parseInt(playerData.time || '0', 10);

        // Get total players
        const totalPlayers = await redis.zCard(leaderboardKey);

        // Get user's rank from leaderboard (calculate reverse rank manually)
        const forwardRankIndex = await redis.zRank(leaderboardKey, userId);
        const rank = forwardRankIndex !== null && forwardRankIndex !== undefined ? totalPlayers - forwardRankIndex : undefined;

        res.json({
          success: true,
          saved: false,
          rank,
          totalPlayers,
          originalScore: {
            correct: originalCorrect,
            timeMs: originalTimeMs,
          },
          message: 'Score not saved. Only first daily play counts toward leaderboard.',
        } as SaveScoreResponse);
        return;
      }

      // Save score to leaderboard sorted set
      await redis.zAdd(leaderboardKey, { member: userId, score });

      // Save player data to hash
      await redis.hSet(playerKey, {
        correct: correctGuesses.toString(),
        time: timeMs.toString(),
      });

      // Get total players
      const totalPlayers = await redis.zCard(leaderboardKey);

      // Get user's rank (calculate reverse rank manually)
      const forwardRankIndex = await redis.zRank(leaderboardKey, userId);
      const rank = forwardRankIndex !== null && forwardRankIndex !== undefined ? totalPlayers - forwardRankIndex : undefined;

      res.json({
        success: true,
        saved: true,
        rank,
        totalPlayers,
        message: 'Score saved successfully!',
      } as SaveScoreResponse);
    } catch (error) {
      console.error('Error in save-score endpoint:', error);
      res.status(500).json({
        success: false,
        saved: false,
        message: 'Failed to save score. Please try again.',
      } as SaveScoreResponse);
    }
  });

  /**
   * GET /api/leaderboard
   * Retrieves leaderboard data for a specific date
   */
  router.get('/api/leaderboard', async (req, res): Promise<void> => {
    try {
      const date = (req.query.date as string) || getCurrentDate();
      const userId = req.query.userId as string | undefined;

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
        return;
      }

      const leaderboardKey = `leaderboard:daily:${date}`;

      // Get total players
      const totalPlayers = await redis.zCard(leaderboardKey);

      // Get top 5 players with scores (descending order)
      const topPlayersData = await redis.zRange(leaderboardKey, 0, 4, { reverse: true, by: 'rank' });

      // Fetch player data and usernames in parallel for better performance
      const playerIds = topPlayersData.map(entry => entry.member);

      // Get all player data from Redis in parallel
      const playerDataPromises = playerIds.map(playerId =>
        redis.hGetAll(`player:${playerId}:${date}`)
      );
      const allPlayerData = await Promise.all(playerDataPromises);

      // Get all user info from Reddit API in parallel
      const userInfoPromises = playerIds.map(async (playerId) => {
        try {
          // Ensure playerId has the correct format for getUserById
          const formattedId = playerId.startsWith('t2_') ? playerId : `t2_${playerId}`;
          const user = await reddit.getUserById(formattedId as `t2_${string}`);
          return { playerId, user };
        } catch (error) {
          console.error(`Failed to fetch user info for ${playerId}:`, error);
          return { playerId, user: null };
        }
      });
      const userInfos = await Promise.all(userInfoPromises);

      // Get all snoovatar URLs in parallel
      const snoovatarPromises = userInfos.map(async ({ playerId, user }) => {
        try {
          const snoovatar = user ? await reddit.getSnoovatarUrl(user.username) || '' : '';
          return { playerId, snoovatar };
        } catch (error) {
          console.error(`Failed to fetch snoovatar for ${playerId}:`, error);
          return { playerId, snoovatar: '' };
        }
      });
      const snoovatarResults = await Promise.all(snoovatarPromises);

      // Create lookup maps for fast access
      const userInfoMap = new Map(userInfos.map(({ playerId, user }) => [playerId, user]));
      const snoovatarMap = new Map(snoovatarResults.map(({ playerId, snoovatar }) => [playerId, snoovatar]));

      // Build top players array
      const topPlayers: TopPlayer[] = topPlayersData.map((entry, index) => {
        const playerId = entry.member;
        const score = entry.score;
        const playerData = allPlayerData[index] || {};
        const user = userInfoMap.get(playerId);

        return {
          rank: index + 1,
          username: user?.username || playerId,
          score,
          correct: parseInt(playerData.correct || '0', 10),
          timeMs: parseInt(playerData.time || '0', 10),
          snoovatar: snoovatarMap.get(playerId) || '',
        };
      });

      // Get user-specific data if userId provided
      let userRank: number | undefined;
      let userScore: number | undefined;

      if (userId) {
        // Calculate reverse rank manually
        const forwardRankIndex = await redis.zRank(leaderboardKey, userId);
        userRank = forwardRankIndex !== null && forwardRankIndex !== undefined ? totalPlayers - forwardRankIndex : undefined;

        const scoreValue = await redis.zScore(leaderboardKey, userId);
        userScore = scoreValue !== null ? scoreValue : undefined;
      }

      res.json({
        date,
        totalPlayers,
        userRank,
        userScore,
        topPlayers,
      } as LeaderboardResponse);
    } catch (error) {
      console.error('Error in leaderboard endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve leaderboard. Please try again.',
      });
    }
  });

  /**
   * GET /api/check-played-today
   * Checks if user has already played today and returns their score if they have
   */
  router.get('/api/check-played-today', async (req, res): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      const date = (req.query.date as string) || getCurrentDate();

      // Validate input
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId is required',
        });
        return;
      }

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
        return;
      }

      const playerKey = `player:${userId}:${date}`;
      const leaderboardKey = `leaderboard:daily:${date}`;

      // Check if player has played
      const hasPlayed = await redis.exists(playerKey);

      // Get total players for today
      const totalPlayersToday = await redis.zCard(leaderboardKey);

      if (!hasPlayed) {
        res.json({
          played: false,
          totalPlayersToday,
        } as CheckPlayedResponse);
        return;
      }

      // Get player data
      const playerData = await redis.hGetAll(playerKey);
      const correct = parseInt(playerData.correct || '0', 10);
      const timeMs = parseInt(playerData.time || '0', 10);
      const incorrect = 10 - correct;

      // Get player rank (calculate reverse rank manually)
      const forwardRankIndex = await redis.zRank(leaderboardKey, userId);
      const rank = forwardRankIndex !== null && forwardRankIndex !== undefined ? totalPlayersToday - forwardRankIndex : 0;

      res.json({
        played: true,
        totalPlayersToday,
        score: {
          correct,
          incorrect,
          timeMs,
          rank,
        },
      } as CheckPlayedResponse);
    } catch (error) {
      console.error('Error in check-played-today endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check play status. Please try again.',
      });
    }
  });

  /**
   * POST /api/post-comment
   * Posts a comment on the current post with the user's score
   */
  router.post('/api/post-comment', async (_req, res): Promise<void> => {
    try {
      const body = _req.body as PostCommentRequest;
      const { comment, score, time } = body;

      // Get current post context
      const { postId } = context;
      if (!postId) {
        res.status(400).json({
          success: false,
          message: 'Post context not available',
        } as PostCommentResponse);
        return;
      }

      // Build comment text
      let commentText = `🎮 **Real or Render Score**\n\n`;
      commentText += `Score: **${score}/10**\n`;
      commentText += `Time: **${time}**\n`;

      // if (rank && totalPlayers) {
      //   commentText += `Rank: **#${rank}** of **${totalPlayers}**\n`;
      // }

      if (comment && comment.trim()) {
        commentText += `\n---\n\n${comment.trim()}`;
      }

      // Post comment to Reddit
      const submittedComment = await reddit.submitComment({
        id: postId,
        text: commentText,
        runAs: "USER"
      });

      res.json({
        success: true,
        commentId: submittedComment.id,
        message: 'Comment posted successfully!',
      } as PostCommentResponse);
    } catch (error) {
      console.error('Error in post-comment endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to post comment. Please try again.',
      } as PostCommentResponse);
    }
  });
};
