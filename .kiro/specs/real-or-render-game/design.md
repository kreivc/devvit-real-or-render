# Design Document: Real or Render Game

## Overview

Real or Render is a daily challenge game built on Reddit's Devvit platform where players distinguish between real photographs and AI-generated images. The game presents 10 rounds of image pairs, tracks player performance with a timer, and maintains daily leaderboards using Redis for data persistence.

### Key Design Decisions

- **Daily Challenge Model**: Each date has a unique set of 10 image pairs, creating a shared experience for all players
- **First-Play-Only Scoring**: Only the first daily attempt counts toward the leaderboard to prevent score grinding while still allowing practice plays
- **Image Prefetching**: All images are cached before gameplay starts to ensure instant loading and smooth user experience
- **Score Formula**: `(Correct × 1,000,000) + Time(ms)` prioritizes accuracy over speed while still rewarding faster completion
- **Mobile-First Design**: Optimized for Reddit's primarily mobile user base with responsive layouts and touch-friendly interactions

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Reddit Post (Devvit)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Client (React App)                     │ │
│  │  - Title Screen                                     │ │
│  │  - Loading State                                    │ │
│  │  - Game Screen (10 rounds)                         │ │
│  │  - Results Screen                                   │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │ HTTP (fetch)                         │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │           Server (Express + Devvit)                 │ │
│  │  - /api/save-score                                  │ │
│  │  - /api/leaderboard                                 │ │
│  │  - /api/check-played-today                         │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │              Redis (Devvit)                         │ │
│  │  - leaderboard:daily:YYYY-MM-DD (sorted set)       │ │
│  │  - player:userId:YYYY-MM-DD (hash)                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express server with Devvit SDK
- **Data Layer**: Redis (via Devvit)
- **Platform**: Devvit Web (runs in Reddit post webview)

## Components and Interfaces

### Client Components

#### 1. TitleScreen Component

**Purpose**: Entry point showing game branding and player statistics

**State**:
```typescript
interface TitleScreenState {
  totalPlayersToday: number;
  userPlayedToday: boolean;
  previousScore?: {
    correct: number;
    incorrect: number;
    time: number;
    rank: number;
  };
}
```

**UI Elements**:
- ASCII art title "REAL OR RENDER"
- Player count display: "X players have played today"
- Previous results (if played today)
- "Play" button (or "Play Again" if already played)
- Warning message if subsequent play won't count

**Design Rationale**: Provides context and social proof before gameplay, showing daily participation to encourage engagement.

#### 2. LoadingScreen Component

**Purpose**: Prefetch and cache all game images before gameplay

**State**:
```typescript
interface LoadingState {
  status: 'loading' | 'success' | 'error';
  progress: number; // 0-100
  errorMessage?: string;
}
```

**Behavior**:
- Fetches all 20 images (10 rounds × 2 images)
- Uses browser cache API or image preloading
- Shows progress indicator
- Auto-transitions to game on success
- Provides retry button on failure

**Design Rationale**: Eliminates loading delays during gameplay, ensuring smooth user experience and accurate timing.

#### 3. GameScreen Component

**Purpose**: Main gameplay interface for 10 rounds of image comparison

**State**:
```typescript
interface GameState {
  rounds: GameRound[];
  currentRoundIndex: number;
  correctCount: number;
  incorrectCount: number;
  startTime: number;
  elapsedTime: number; // milliseconds
  userAnswers: boolean[]; // true = correct, false = incorrect
}

interface GameRound {
  id: string;
  realImageUrl: string;
  renderImageUrl: string;
  source: string;
  realImagePosition: 'left' | 'right'; // randomized
}
```

**UI Elements**:
- Round counter: "Round X / 10"
- Timer display: "MM:SS:mmm"
- Two side-by-side images (clickable)
- Question text: "Which image is REAL?"
- Instruction: "Click on the photograph (not the AI-generated image)"
- Score counters: "Correct: X" and "Incorrect: X"

**Behavior**:
- Timer updates every 10ms for smooth display
- Click on image records answer and advances to next round
- No visual feedback on correctness during gameplay (maintains flow)
- Randomizes round order on game start
- Randomizes left/right position for each round

**Design Rationale**: 
- No immediate feedback keeps players engaged without interruption
- Real-time timer creates urgency and competitive element
- Randomization prevents pattern memorization

#### 4. ResultsScreen Component

**Purpose**: Display game completion summary and leaderboard position

**State**:
```typescript
interface ResultsState {
  correct: number;
  incorrect: number;
  totalTime: number; // milliseconds
  score: number;
  rank: number;
  totalPlayers: number;
  date: string; // YYYY-MM-DD
  sources: string[];
  scoreSaved: boolean;
  showSources: boolean;
}
```

**UI Elements**:
- Header: "Game Complete! 🎉"
- Date display
- Correct count (green text)
- Incorrect count (red text)
- Time display: "MM:SS"
- Score: "X / 10"
- Rank: "Rank #X of Y players"
- "Share Results 🎉" button
- "Play Again" button
- "Back to Home" button
- Collapsible "Photo Sources" section

**Design Rationale**: 
- Clear visual hierarchy emphasizes performance metrics
- Social sharing encourages viral growth
- Source attribution respects content creators

### Server Endpoints

#### POST /api/save-score

**Purpose**: Save player's first daily score to leaderboard

**Request**:
```typescript
interface SaveScoreRequest {
  userId: string;
  score: number;
  date: string; // YYYY-MM-DD
  correctGuesses: number;
  timeMs: number;
}
```

**Response**:
```typescript
interface SaveScoreResponse {
  success: boolean;
  saved: boolean; // false if already played today
  rank?: number;
  totalPlayers?: number;
  message?: string;
}
```

**Logic**:
1. Check if user has played today using Redis key `player:${userId}:${date}`
2. If not played:
   - Save score to sorted set: `ZADD leaderboard:daily:${date} ${score} ${userId}`
   - Save player data: `HSET player:${userId}:${date} correct ${correctGuesses} time ${timeMs}`
   - Get rank: `ZRANK leaderboard:daily:${date} ${userId}`
   - Get total: `ZCARD leaderboard:daily:${date}`
3. If already played, return `saved: false`

**Design Rationale**: First-play-only prevents score manipulation while Redis sorted sets provide efficient ranking.

#### GET /api/leaderboard

**Purpose**: Retrieve leaderboard data for a specific date

**Request**:
```typescript
interface LeaderboardRequest {
  date: string; // YYYY-MM-DD
  userId?: string; // optional, for user-specific rank
}
```

**Response**:
```typescript
interface LeaderboardResponse {
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

**Logic**:
1. Get total players: `ZCARD leaderboard:daily:${date}`
2. Get top 10: `ZRANGE leaderboard:daily:${date} 0 9 WITHSCORES REV`
3. If userId provided:
   - Get rank: `ZREVRANK leaderboard:daily:${date} ${userId}`
   - Get score: `ZSCORE leaderboard:daily:${date} ${userId}`
   - Get player data: `HGETALL player:${userId}:${date}`
4. Fetch usernames from Reddit API for display

**Design Rationale**: Separate endpoint allows flexible leaderboard queries without coupling to score saving.

#### GET /api/check-played-today

**Purpose**: Check if user has already played today

**Request**:
```typescript
interface CheckPlayedRequest {
  userId: string;
  date: string; // YYYY-MM-DD
}
```

**Response**:
```typescript
interface CheckPlayedResponse {
  played: boolean;
  score?: {
    correct: number;
    incorrect: number;
    timeMs: number;
    rank: number;
  };
}
```

**Logic**:
1. Check existence: `EXISTS player:${userId}:${date}`
2. If exists, fetch data: `HGETALL player:${userId}:${date}`
3. Get rank: `ZREVRANK leaderboard:daily:${date} ${userId}`

**Design Rationale**: Enables title screen to show previous results and warn about non-scoring replays.

## Data Models

### Redis Schema

#### Leaderboard Sorted Set

**Key**: `leaderboard:daily:YYYY-MM-DD`

**Type**: Sorted Set (ZSET)

**Structure**:
- **Member**: userId (string)
- **Score**: calculated score (number)

**Score Calculation**:
```
score = (correctGuesses × 1,000,000) + timeInMilliseconds
```

**Example**:
- 10/10 correct in 45.5 seconds = 10,000,000 + 45,500 = 10,045,500
- 8/10 correct in 30.2 seconds = 8,000,000 + 30,200 = 8,030,200

**Design Rationale**: 
- Multiplier ensures accuracy is primary ranking factor
- Time as tiebreaker rewards speed
- Higher scores are better (use ZREVRANK for rankings)

#### Player Data Hash

**Key**: `player:${userId}:YYYY-MM-DD`

**Type**: Hash

**Fields**:
```
correct: number (0-10)
time: number (milliseconds)
```

**Design Rationale**: Stores detailed player data for results display without cluttering sorted set.

### Game Data Structure

**Source**: Post data from Devvit (provided externally)

```typescript
interface DailyGameData {
  id: string; // unique identifier for the round
  real: string; // URL to real photograph
  render: string; // URL to AI-generated image
  source: string; // attribution text
}

type GameDataSet = DailyGameData[]; // Array of 10 rounds
```

**Design Rationale**: Simple structure provided by platform, no need for complex data transformation.

## Error Handling

### Client-Side Errors

#### Image Loading Failures

**Scenario**: One or more images fail to prefetch

**Handling**:
- Display error message: "Failed to load game images. Please check your connection."
- Provide "Retry" button
- Log error details for debugging
- Don't proceed to game until all images loaded

**Design Rationale**: Prevents broken gameplay experience from missing images.

#### API Call Failures

**Scenario**: Server endpoint returns error or times out

**Handling**:
- Display user-friendly error message
- Provide "Try Again" button
- Allow offline gameplay (score won't save)
- Cache results locally for retry

**Design Rationale**: Graceful degradation allows gameplay even with connectivity issues.

### Server-Side Errors

#### Redis Connection Failures

**Scenario**: Redis operations fail

**Handling**:
```typescript
try {
  await redis.zadd(key, score, userId);
} catch (error) {
  console.error('Redis error:', error);
  return {
    success: false,
    message: 'Failed to save score. Please try again.'
  };
}
```

**Design Rationale**: Explicit error responses allow client to handle gracefully.

#### Invalid Request Data

**Scenario**: Client sends malformed data

**Handling**:
- Validate all inputs
- Return 400 Bad Request with specific error message
- Log validation failures

**Example**:
```typescript
if (!userId || !date || typeof score !== 'number') {
  return res.status(400).json({
    success: false,
    message: 'Invalid request data'
  });
}
```

**Design Rationale**: Prevents data corruption and provides clear feedback.

## Testing Strategy

### Unit Tests

**Client Components**:
- TitleScreen: Renders correctly with/without previous scores
- GameScreen: Timer accuracy, round progression, answer recording
- ResultsScreen: Score calculation, rank display
- Image prefetching logic

**Server Endpoints**:
- Score calculation formula
- Redis key generation
- First-play-only logic
- Leaderboard ranking logic

**Design Rationale**: Focus on business logic and calculations that are prone to errors.

### Integration Tests

**Client-Server Communication**:
- Save score flow (first play vs. replay)
- Leaderboard data retrieval
- Error handling for failed requests

**Redis Operations**:
- Sorted set operations (ZADD, ZRANK, ZRANGE)
- Hash operations (HSET, HGETALL)
- Key expiration (if implemented)

**Design Rationale**: Ensures components work together correctly.

### Manual Testing

**Gameplay Flow**:
1. Load title screen → verify player count
2. Click Play → verify loading screen
3. Complete 10 rounds → verify timer accuracy
4. View results → verify score and rank
5. Play again → verify non-scoring behavior

**Mobile Testing**:
- Test on various screen sizes
- Verify touch interactions
- Check image scaling
- Validate ASCII art rendering

**Design Rationale**: Human testing catches UX issues that automated tests miss.

### Performance Testing

**Metrics to Monitor**:
- Image prefetch time (target: <5 seconds for 20 images)
- Timer update frequency (target: 60fps)
- API response times (target: <500ms)
- Redis operation latency (target: <100ms)

**Design Rationale**: Ensures smooth gameplay experience across devices.

## Mobile-Responsive Design

### Layout Strategy

**Breakpoints**:
- Mobile: <768px (primary target)
- Tablet: 768px-1024px
- Desktop: >1024px

**Image Display**:
```css
.game-images {
  display: flex;
  flex-direction: row; /* side-by-side on all sizes */
  gap: 1rem;
  max-width: 100%;
}

.game-image {
  flex: 1;
  max-width: 50%;
  aspect-ratio: 1;
  object-fit: cover;
  cursor: pointer;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .game-images {
    gap: 0.5rem;
  }
  
  .game-image {
    border-radius: 4px;
  }
}
```

**Typography**:
- Mobile: Base font 14px, headers 18-24px
- Desktop: Base font 16px, headers 20-32px
- ASCII title: Scales with viewport width

**Touch Targets**:
- Minimum 44×44px for all interactive elements
- Images are large enough for easy tapping
- Buttons have adequate padding

**Design Rationale**: Mobile-first approach ensures optimal experience for majority of Reddit users.

### ASCII Art Handling

**Challenge**: ASCII art may not scale well on small screens

**Solution**:
```css
.ascii-title {
  font-family: monospace;
  white-space: pre;
  font-size: clamp(8px, 2vw, 16px);
  line-height: 1;
  overflow-x: auto;
}
```

**Alternative**: Provide simplified version for very small screens

**Design Rationale**: Preserves branding while maintaining readability.

## Performance Optimizations

### Image Prefetching Strategy

**Implementation**:
```typescript
async function prefetchImages(rounds: DailyGameData[]): Promise<void> {
  const imageUrls = rounds.flatMap(r => [r.real, r.render]);
  
  const promises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  });
  
  await Promise.all(promises);
}
```

**Design Rationale**: Parallel loading minimizes wait time, browser caching ensures instant display.

### Timer Optimization

**Implementation**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setElapsedTime(Date.now() - startTime);
  }, 10); // Update every 10ms
  
  return () => clearInterval(interval);
}, [startTime]);
```

**Design Rationale**: 10ms interval provides smooth display without excessive CPU usage.

### Redis Key Expiration

**Optional Enhancement**:
```typescript
// Expire old leaderboards after 30 days
await redis.expire(`leaderboard:daily:${date}`, 30 * 24 * 60 * 60);
```

**Design Rationale**: Prevents unbounded Redis memory growth while preserving recent history.

## Security Considerations

### Input Validation

**Server-Side**:
- Validate all user inputs (userId, score, date)
- Sanitize date format (YYYY-MM-DD only)
- Verify score is within valid range (0-10,000,000 + reasonable time)
- Rate limit API endpoints

**Design Rationale**: Prevents malicious data injection and score manipulation.

### Authentication

**Devvit Handling**:
- User authentication handled by Devvit platform
- userId provided by Devvit context (trusted)
- No need for custom auth implementation

**Design Rationale**: Leverage platform security rather than reinventing.

### Score Integrity

**Validation**:
```typescript
// Verify score matches formula
const expectedScore = (correctGuesses * 1_000_000) + timeMs;
if (score !== expectedScore) {
  return { success: false, message: 'Invalid score' };
}

// Verify reasonable time (e.g., not less than 5 seconds)
if (timeMs < 5000) {
  return { success: false, message: 'Invalid completion time' };
}
```

**Design Rationale**: Prevents client-side score manipulation.

## Future Enhancements

### Potential Features (Out of Scope)

1. **Historical Leaderboards**: View past daily leaderboards
2. **Streak Tracking**: Track consecutive days played
3. **Difficulty Levels**: Easy/Medium/Hard image sets
4. **Multiplayer Mode**: Real-time head-to-head matches
5. **Achievement System**: Badges for milestones
6. **Image Reporting**: Flag inappropriate images

**Design Rationale**: Document potential features without committing to implementation.

## Deployment Considerations

### Build Process

1. Client builds to `dist/client/` (HTML, CSS, JS)
2. Server builds to `dist/server/index.cjs` (CommonJS)
3. Devvit packages and deploys to Reddit infrastructure

### Environment Variables

**Not Required**: Game uses only Devvit-provided services (Redis, Reddit API)

### Monitoring

**Metrics to Track**:
- Daily active players
- Average completion time
- Error rates (client and server)
- Redis operation latency

**Design Rationale**: Data-driven insights for future improvements.

---

## Summary

This design provides a complete architecture for the Real or Render game, balancing simplicity with robustness. Key design principles include:

1. **User Experience First**: Image prefetching and smooth gameplay
2. **Mobile Optimization**: Responsive design for Reddit's mobile-heavy audience
3. **Data Integrity**: First-play-only scoring and server-side validation
4. **Scalability**: Efficient Redis operations and daily key rotation
5. **Platform Integration**: Leverages Devvit capabilities appropriately

The design addresses all requirements while maintaining flexibility for future enhancements.
