# Implementation Plan

## Overview

This implementation plan transforms the Real or Render game design into actionable coding tasks. The game is built on Reddit's Devvit platform using React for the client and Express for the server, with Redis for data persistence. Tasks are organized to build incrementally, starting with core data structures and progressing through each game screen to the final leaderboard integration.

## Current Status

The project has basic scaffolding in place:
- ✅ Basic Devvit project structure with client/server/shared folders
- ✅ Express server setup with router configuration
- ✅ React client with Vite build system
- ✅ Basic DailyGameData type defined in shared types
- ⏳ No game components or API endpoints implemented yet

## Implementation Tasks

- [x] 1. Update shared types and create game state interfaces
  - Modify `src/shared/types/api.ts` to add request/response types for all API endpoints
  - Create types for: SaveScoreRequest, SaveScoreResponse, LeaderboardRequest, LeaderboardResponse, CheckPlayedRequest, CheckPlayedResponse
  - Create GameState, GameRound, TitleScreenState, LoadingState, and ResultsState interfaces
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Implement server API endpoints for game functionality
  - ✅ Created `/api/save-score` POST endpoint to save player scores to Redis
  - ✅ Created `/api/leaderboard` GET endpoint to retrieve leaderboard data
  - ✅ Created `/api/check-played-today` GET endpoint to check if user has played today
  - ✅ Implemented score calculation formula: (Correct × 1,000,000) + Time(ms)
  - ✅ Implemented first-play-only logic using Redis keys `player:${userId}:${date}`
  - ✅ Used Redis sorted set `leaderboard:daily:${date}` for leaderboard storage
  - ✅ Registered endpoints in server index
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 3. Create game utility functions
  - Create `src/client/utils/gameHelpers.ts` for game logic utilities
  - Implement randomizeRounds function to shuffle round order
  - Implement randomizeImagePosition function for left/right positioning
  - Implement transformGameData function to convert DailyGameData to GameRound format
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Create TitleScreen component
  - Create `src/client/components/TitleScreen.tsx` component
  - Display ASCII art title "REAL OR RENDER"
  - Show total players count for current date
  - Display previous results if user has already played today
  - Show "Play" button (or "Play Again" with warning if already played)
  - Fetch player count and previous results from `/api/check-played-today` endpoint
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5. Create LoadingScreen component with image prefetching
  - Create `src/client/components/LoadingScreen.tsx` component
  - Display "Preparing the game" loading message
  - Implement image prefetching logic for all 20 images (10 rounds × 2 images)
  - Use browser Image API to preload and cache images
  - Show progress indicator during loading
  - Handle prefetch errors with retry button
  - Auto-transition to game screen on successful load
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Create GameScreen component with timer
  - Create `src/client/components/GameScreen.tsx` component
  - Implement real-time timer starting at 00:00:000 (MM:SS:mmm format)
  - Display round counter "Round X / 10"
  - Show two side-by-side clickable images
  - Display question "Which image is REAL?" and instruction text
  - Show "Correct: X" and "Incorrect: X" counters at bottom
  - Handle image click to record answer and advance to next round
  - Stop timer after 10 rounds complete
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 7. Create ResultsScreen component
  - Create `src/client/components/ResultsScreen.tsx` component
  - Display "Game Complete! 🎉" header
  - Show current date in YYYY-MM-DD format
  - Display correct count (green) and incorrect count (red)
  - Show total time in MM:SS format
  - Display score as "X / 10"
  - Show current ranking "Rank #X of Y players"
  - Add "Share Results 🎉", "Play Again", and "Back to Home" buttons
  - Implement collapsible "Photo Sources" section with source attributions
  - Call `/api/save-score` endpoint on mount to save score
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_

- [x] 8. Integrate all components in App.tsx with state management
  - Update `src/client/App.tsx` to manage game flow state machine
  - Implement state transitions: TitleScreen → LoadingScreen → GameScreen → ResultsScreen
  - Pass game data and state between components
  - Handle "Play Again" and "Back to Home" navigation
  - Ensure proper data flow from postData through all screens
  - _Requirements: 1.6, 2.4, 4.8, 6.9, 6.10_

- [x] 9. Implement mobile-responsive styling
  - Add responsive CSS for all components using Tailwind
  - Ensure images scale properly on mobile screens
  - Make ASCII title responsive with appropriate font sizing
  - Ensure touch targets are minimum 44×44px
  - Test layout on mobile breakpoints (<768px)
  - Optimize image display for side-by-side layout on small screens
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Add error handling and edge cases
  - Implement error handling for failed API calls in all components
  - Add error messages for image loading failures
  - Handle Redis connection failures gracefully in server endpoints
  - Add input validation for all server endpoints
  - Display user-friendly error messages with retry options
  - _Requirements: 2.5, 7.3, 7.4, 9.3, 9.4_

- [ ]* 11. Create custom hook for timer functionality
  - Create `src/client/hooks/useTimer.ts` custom hook
  - Encapsulate timer logic with start, stop, and elapsed time state
  - Update every 10ms for smooth display
  - Return formatted time string (MM:SS:mmm)
  - _Requirements: 4.1, 4.2_

- [ ]* 12. Create utility functions for formatting and calculations
  - Create `src/client/utils/formatters.ts` for time and date formatting
  - Add functions for: formatTime, formatDate, calculateScore, validateScore
  - _Requirements: 6.2, 6.5, 7.1_

- [ ]* 13. Add comprehensive error logging
  - Add console.error logging for all error scenarios
  - Log API failures with request/response details
  - Log Redis operation failures
  - Add client-side error boundary for React errors
  - _Requirements: All error handling requirements_

## Notes

- Tasks marked with `*` are optional enhancements that improve code organization but are not required for core functionality
- All API endpoints must start with `/api/` per Devvit platform requirements
- Redis keys follow the pattern: `leaderboard:daily:YYYY-MM-DD` and `player:${userId}:YYYY-MM-DD`
- Score formula prioritizes accuracy: (Correct × 1,000,000) + Time(ms)
- Only the first daily play counts toward the leaderboard
- All images must be prefetched before gameplay starts for instant loading
