# Real or Render

A daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images.

## What is Real or Render?

Real or Render is an interactive daily challenge game that tests your ability to spot the difference between authentic photographs and AI-generated images. Built natively on Reddit's Devvit platform, the game presents 10 rounds of side-by-side image comparisons where you must identify which image is real and which was created by artificial intelligence.

Each day features a unique set of image pairs, and your performance is tracked with millisecond precision. Compete against other Reddit users on a daily leaderboard where accuracy matters more than speed, but both play a role in your final ranking.

### Game Flow

The game features a polished, mobile-first interface with four distinct screens:

1. **Title Screen**: Features an eye-catching ASCII art logo "REAL OR RENDER", displays how many players have competed today, and shows your previous results if you've already played
2. **Loading Screen**: Intelligently prefetches all 20 images (10 rounds × 2 images) with a real-time progress bar, ensuring zero lag during gameplay
3. **Game Screen**: 10 rounds of side-by-side image comparisons with a live timer tracking your performance down to the millisecond (MM:SS:mmm format)
4. **Results Screen**: Comprehensive summary showing your score, correct/incorrect breakdown, completion time, leaderboard ranking, and collapsible photo attribution section

### Key Features

- **Daily Challenge Model**: Fresh set of 10 image pairs every day, creating a shared experience for all players
- **Precision Timing**: Real-time timer updates every 10ms for smooth, accurate performance tracking
- **Smart Scoring Formula**: `(Correct × 1,000,000) + Time(ms)` - prioritizes accuracy while rewarding speed
- **Daily Leaderboards**: Redis-powered rankings showing your position among all players for that day
- **First-Play-Only Scoring**: Only your first daily attempt counts toward the leaderboard, preventing score grinding while allowing unlimited practice
- **Instant Gameplay**: All images prefetched and cached before the game starts - zero loading delays between rounds
- **Mobile-Optimized Design**: Fully responsive with 44px minimum touch targets, optimized for Reddit's mobile-heavy user base
- **Randomized Experience**: Round order shuffled using Fisher-Yates algorithm, image positions (left/right) randomized independently
- **Photo Attribution**: Collapsible sources section credits all photographers and image creators
- **Social Sharing**: Share your results via Web Share API or clipboard with formatted score summary
- **Practice Mode**: Play unlimited times after your first attempt - perfect for training your eye without leaderboard pressure

## What Makes This Game Innovative?

### 1. AI Literacy Training

Taps into the critical cultural conversation about AI-generated content. As synthetic media becomes more prevalent, the ability to distinguish real from AI-generated is an increasingly valuable skill. This game makes learning fun and competitive.

### 2. Fair Competition System

The first-play-only scoring prevents score grinding and memorization while still allowing unlimited practice. You can learn and improve without the pressure of every attempt counting, but your first daily score ensures everyone competes on equal footing.

### 3. Shared Daily Experience

Unlike games with random content, everyone plays the same 10 image pairs each day. This creates water-cooler moments - "Did you see round 7 today?" - and enables meaningful performance comparisons across the community.

### 4. Zero-Latency Architecture

Intelligent prefetching downloads all images before gameplay begins, then randomizes them client-side. This ensures instant round transitions without any loading spinners or delays that would break immersion and affect timing accuracy.

### 5. Native Reddit Integration

Built with Devvit to run directly in Reddit posts - no external websites, app downloads, or account creation needed. Play right in your feed with automatic Reddit authentication. The game lives where the community already is.

### 6. Transparent & Cheat-Proof

The scoring formula is public and easy to understand, but server-side validation prevents manipulation. Score calculation happens on the backend with checks for reasonable completion times and correct formula application.

### 7. Educational Entertainment

Players naturally develop pattern recognition skills for identifying AI artifacts - unusual textures, lighting inconsistencies, anatomical errors, distorted text. It's media literacy training disguised as entertainment.

### 8. Mobile-First Philosophy

Designed from the ground up for touch interfaces with responsive layouts, large tap targets (minimum 44×44px), and optimized image sizing. Recognizes that most Reddit users access content on mobile devices.

## Technology Stack

- [Devvit](https://developers.reddit.com/): Reddit's developer platform for building immersive games
- [React](https://react.dev/): Frontend UI framework with TypeScript
- [TypeScript](https://www.typescriptlang.org/): Type-safe development across client and server
- [Express](https://expressjs.com/): Backend API server with RESTful endpoints
- [Redis](https://redis.io/): Data persistence for leaderboards and player scores
- [Vite](https://vite.dev/): Fast build tool for both client and server
- [Tailwind CSS](https://tailwindcss.com/): Utility-first styling for responsive design

## How to Play

### Starting the Game

1. **Find the Post**: Look for a Real or Render game post in your Reddit feed or subreddit
2. **View Title Screen**: You'll see:
   - The iconic "REAL OR RENDER" ASCII art logo in blue
   - How many players have played today (e.g., "5 players have played today")
   - Your previous results if you've already played (score, time, and rank)
   - A warning if subsequent plays won't count toward the leaderboard
3. **Click Play**: Hit the blue "Play" button to start (or "Play Again" for practice rounds)

### Loading Phase

1. **Watch the Progress**: A loading screen appears with:
   - An animated spinner
   - "Preparing the game" message
   - A progress bar showing image loading (0-100%)
2. **Wait for Prefetch**: All 20 images (10 rounds × 2 images) are downloaded and cached
3. **Auto-Start**: Once loading hits 100%, the game automatically begins

### During Gameplay

1. **Round Display**: Each round shows:

   - **Top Left**: Round counter (e.g., "Round 1 / 10")
   - **Top Right**: Real-time timer in MM:SS:mmm format (updates every 10ms)
   - **Center**: Two images side by side
   - **Question**: "Which image is REAL?"
   - **Instructions**: "Click on the photograph (not the AI-generated image)"
   - **Bottom**: Score counters showing "Correct: X" (green) and "Incorrect: X" (red)

2. **Make Your Choice**:

   - Click on the image you think is the real photograph
   - Images have hover effects (blue border, slight scale) for visual feedback
   - Touch-friendly on mobile with large tap targets

3. **Instant Progression**:

   - No delay between rounds - immediately advances to the next image pair
   - No feedback on whether you were right or wrong (keeps the flow going)
   - Timer continues running throughout all 10 rounds

4. **Visual Feedback**:
   - Images scale slightly on hover/press
   - Blue border highlights on hover
   - Smooth transitions between rounds

### Scoring System

The scoring formula is designed to prioritize accuracy while rewarding speed:

**Formula**: `Score = (Correct Guesses × 100,000,000) - Time in Milliseconds`

**Examples**:

- 10/10 correct in 45.5 seconds = 1,000,000,000 - 45,500 = **999,954,500 points**
- 9/10 correct in 30.2 seconds = 900,000,000 - 30,200 = **899,969,800 points**
- 8/10 correct in 25.0 seconds = 800,000,000 - 25,000 = **799,975,000 points**

**Key Points**:

- Higher scores are better
- Each correct answer is worth 100 million points
- Time acts as a tiebreaker (faster is better)
- Getting one more correct is worth ~27.8 hours of time difference

### After Completing

1. **Results Screen Shows**:

   - "Game Complete! 🎉" header
   - Current date (YYYY-MM-DD)
   - Your score out of 10 in large text
   - Correct count (green) and incorrect count (red) in separate boxes
   - Total time in MM:SS format
   - Your ranking (e.g., "Rank #3 of 15 players") if this was your first play
   - Note if the score wasn't saved (already played today)

2. **Action Buttons**:

   - **Share Results 🎉** (green): Share your score via Web Share API or copy to clipboard
   - **Play Again** (blue): Start a new game immediately (goes to loading screen)
   - **Back to Home** (gray): Return to the title screen

3. **Photo Sources**:
   - Collapsible section at the bottom
   - Click to expand and see attribution for all 10 image pairs
   - Shows "Round X: [source attribution]" for each round

### Tips for Success

- **Look for Details**: AI-generated images often have subtle inconsistencies in:

  - Textures (skin, fabric, surfaces)
  - Lighting and shadows
  - Proportions and symmetry
  - Background elements

- **Check Hands and Text**: AI commonly struggles with:

  - Fingers (wrong number, weird angles)
  - Hands (unnatural positions)
  - Readable text (gibberish or distorted letters)
  - Small details like jewelry or accessories

- **Trust Your Instincts**: Sometimes an image just "feels" off - that's your brain detecting AI artifacts

- **Practice Makes Perfect**: Play multiple times to train your eye (even if only the first counts for the leaderboard!)

- **Speed vs Accuracy**: Remember, one correct answer is worth ~16 minutes of time, so accuracy matters more than speed

## Development Setup

> Make sure you have Node 22 downloaded on your machine before running!

### Initial Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run login` to authenticate with Reddit
4. Run `npm run dev` to start the development server

## Development Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app to Reddit
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Project Structure

```
src/
├── client/              # React frontend
│   ├── components/      # Game components (TitleScreen, GameScreen, etc.)
│   ├── hooks/          # Custom React hooks (useTimer)
│   ├── utils/          # Utility functions (gameHelpers, formatters)
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── server/             # Express backend
│   ├── actions/        # API endpoint handlers
│   │   ├── 4_initGameAction.ts      # Game initialization
│   │   └── 5_gameApiActions.ts      # Score/leaderboard APIs
│   └── index.ts        # Server setup
└── shared/             # Shared types
    └── types/
        └── api.ts      # TypeScript interfaces
```

## Current Implementation Status

### ✅ Completed

- **Backend Infrastructure**

  - ✅ Redis-based leaderboard system with daily keys
  - ✅ Score saving endpoint with first-play-only logic
  - ✅ Leaderboard retrieval with top 10 players
  - ✅ Play status checking endpoint
  - ✅ Score calculation and validation
  - ✅ Game data initialization from Redis

- **Type System**

  - ✅ Complete TypeScript interfaces for all API endpoints
  - ✅ Game state types (GameRound, GameState, etc.)
  - ✅ Request/response types for client-server communication

- **Game Utilities**
  - ✅ Round randomization (Fisher-Yates shuffle)
  - ✅ Image position randomization (left/right)
  - ✅ Game data transformation utilities

### 🚧 In Progress

- **Frontend Components**

  - ⏳ TitleScreen component
  - ⏳ LoadingScreen with image prefetching
  - ⏳ GameScreen with timer and round progression
  - ⏳ ResultsScreen with leaderboard display
  - ⏳ Mobile-responsive styling

- **Game Features**
  - ⏳ Real-time timer display
  - ⏳ Image prefetching system
  - ⏳ Score sharing functionality
  - ⏳ Photo source attribution display

## API Endpoints

### POST `/api/save-score`

Saves player's first daily score to the leaderboard.

**Request:**

```typescript
{
  userId: string;
  score: number;
  date: string; // YYYY-MM-DD
  correctGuesses: number;
  timeMs: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  saved: boolean; // false if already played today
  rank?: number;
  totalPlayers?: number;
  message?: string;
}
```

### GET `/api/leaderboard?date=YYYY-MM-DD&userId=xxx`

Retrieves leaderboard data for a specific date.

**Response:**

```typescript
{
  date: string;
  totalPlayers: number;
  userRank?: number;
  userScore?: number;
  topPlayers: Array<{
    rank: number;
    username: string;
    score: number;
    correct: number;
    timeMs: number;
  }>;
}
```

### GET `/api/check-played-today?userId=xxx&date=YYYY-MM-DD`

Checks if user has already played today.

**Response:**

```typescript
{
  played: boolean;
  totalPlayersToday: number;
  score?: {
    correct: number;
    incorrect: number;
    timeMs: number;
    rank: number;
  };
}
```

## Redis Data Schema

### Leaderboard Sorted Set

**Key:** `leaderboard:daily:YYYY-MM-DD`

**Type:** Sorted Set (ZSET)

**Score Formula:** `(correctGuesses × 100,000,000) - timeInMilliseconds`

### Player Data Hash

**Key:** `player:${userId}:YYYY-MM-DD`

**Type:** Hash

**Fields:**

- `correct`: Number of correct guesses (0-10)
- `time`: Completion time in milliseconds

## Contributing

This game is built for Reddit's Devvit platform. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test using `npm run dev`
5. Submit a pull request

## License

See LICENSE file for details.

## Cursor Integration

This project comes with a pre-configured Cursor environment. To get started, [download Cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
