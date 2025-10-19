# Requirements Document

## Introduction

Real or Render is a daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day presents a unique set of 10 image pairs, and players compete on a daily leaderboard based on accuracy and speed. The game features image prefetching for instant gameplay, real-time timer tracking, score calculation, and persistent leaderboards using Redis.

## Requirements

### Requirement 1: Title Screen and Game Entry

**User Story:** As a player, I want to see an engaging title screen with game information before starting, so that I understand what the game is about and can see how many people have played today.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL display an ASCII art title "REAL OR RENDER" using the provided ASCII text
2. WHEN the title screen is displayed THEN the system SHALL show a "Play" button below the ASCII title
3. WHEN the title screen is displayed THEN the system SHALL show the total number of players who have played on the current date
4. IF the user has already played today THEN the system SHALL display their previous results on the title screen
5. WHEN the user has already played today THEN the system SHALL still allow them to play again but indicate that subsequent plays won't count toward the leaderboard
6. WHEN the user clicks the "Play" button THEN the system SHALL transition to the game screen

### Requirement 2: Image Prefetching and Loading State

**User Story:** As a player, I want all game images to be preloaded before gameplay starts, so that I experience instant image loading during the game without any delays.

#### Acceptance Criteria

1. WHEN the user clicks "Play" THEN the system SHALL display a loading message "Preparing the game"
2. WHEN loading begins THEN the system SHALL prefetch all 10 rounds of image pairs (20 images total)
3. WHEN prefetching images THEN the system SHALL cache them to disk for instant retrieval
4. WHEN all images are successfully cached THEN the system SHALL automatically start the game
5. IF image prefetching fails THEN the system SHALL display an error message and allow retry

### Requirement 3: Game Round Randomization

**User Story:** As a player, I want each gameplay session to feel unique, so that I can't memorize patterns from previous attempts.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL randomize the order of the 10 rounds
2. WHEN displaying each round THEN the system SHALL randomly position the real image on either the left or right side
3. WHEN randomizing THEN the system SHALL ensure each round's left/right positioning is independent
4. WHEN the user plays multiple times THEN the system SHALL generate different randomization each time

### Requirement 4: Gameplay and Timer

**User Story:** As a player, I want to play through 10 rounds of image comparison with a running timer, so that I can test my skills and compete on speed.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL start a timer at 00:00:000 (minutes:seconds:milliseconds)
2. WHEN the timer is running THEN the system SHALL update the display in real-time on the frontend
3. WHEN a round is displayed THEN the system SHALL show "Round X / 10" at the top
4. WHEN a round is displayed THEN the system SHALL show two images side by side
5. WHEN a round is displayed THEN the system SHALL show the question "Which image is REAL?"
6. WHEN a round is displayed THEN the system SHALL show the instruction "Click on the photograph (not the AI-generated image)"
7. WHEN the user clicks an image THEN the system SHALL record whether the answer is correct or incorrect
8. WHEN the user clicks an image THEN the system SHALL immediately advance to the next round
9. WHEN displaying game progress THEN the system SHALL show "Correct: X" and "Incorrect: X" counters at the bottom
10. WHEN all 10 rounds are completed THEN the system SHALL stop the timer

### Requirement 5: Game Data Structure

**User Story:** As a developer, I need the game to work with the provided data structure from postData, so that the game integrates properly with the Devvit platform.

#### Acceptance Criteria

1. WHEN the game receives postData THEN the system SHALL parse it as type DailyGameData[]
2. WHEN parsing DailyGameData THEN the system SHALL extract fields: id, real, render, and source
3. WHEN using game data THEN the system SHALL use the "real" field for the real image URL
4. WHEN using game data THEN the system SHALL use the "render" field for the AI-generated image URL
5. WHEN using game data THEN the system SHALL use the "source" field for attribution in the results screen

### Requirement 6: Results Screen

**User Story:** As a player, I want to see my game results after completing all rounds, so that I know how well I performed.

#### Acceptance Criteria

1. WHEN the game completes THEN the system SHALL display "Game Complete! 🎉" as the header
2. WHEN showing results THEN the system SHALL display the current date in YYYY-MM-DD format
3. WHEN showing results THEN the system SHALL display the number of correct answers in green
4. WHEN showing results THEN the system SHALL display the number of incorrect answers in red
5. WHEN showing results THEN the system SHALL display the total time taken in MM:SS format
6. WHEN showing results THEN the system SHALL display the score as "X / 10"
7. WHEN showing results THEN the system SHALL display current ranking
8. WHEN showing results THEN the system SHALL display a "Share Results 🎉" button
9. WHEN showing results THEN the system SHALL display a "Play Again" button
10. WHEN showing results THEN the system SHALL display a "Back to Home" button
11. WHEN showing results THEN the system SHALL display a collapsible "Photo Sources" section
12. WHEN "Photo Sources" is expanded THEN the system SHALL list all source attributions from the game data

### Requirement 7: Score Calculation and Storage

**User Story:** As a player, I want my first daily score to be saved to the leaderboard, so that I can compete with other players.

#### Acceptance Criteria

1. WHEN the game completes THEN the system SHALL calculate the score as: (Correct Guesses × 1,000,000) + (Time in Milliseconds)
2. WHEN the score is calculated THEN the system SHALL call an internal API endpoint to save the score
3. WHEN saving the score THEN the system SHALL only save if this is the user's first play of the day
4. WHEN saving to Redis THEN the system SHALL use the command: ZADD leaderboard:daily:YYYY-MM-DD score userId
5. WHEN the date changes THEN the system SHALL create a new leaderboard key for the new date
6. IF the user has already played today THEN the system SHALL NOT save subsequent scores

### Requirement 8: Leaderboard Data Retrieval

**User Story:** As a player, I want to see my rank and the top players, so that I can understand how I compare to others.

#### Acceptance Criteria

1. WHEN displaying leaderboard information THEN the system SHALL use ZRANK to get the user's rank
2. WHEN displaying leaderboard information THEN the system SHALL use ZCARD to get the total number of players for the date
3. WHEN displaying leaderboard information THEN the system SHALL use ZRANGE to get the top 10 players
4. WHEN retrieving leaderboard data THEN the system SHALL use the key format: leaderboard:daily:YYYY-MM-DD
5. WHEN the user hasn't played yet THEN the system SHALL show total players without showing a rank

### Requirement 9: API Endpoints

**User Story:** As a developer, I need server endpoints to handle score saving and leaderboard retrieval, so that the client can interact with Redis data.

#### Acceptance Criteria

1. WHEN implementing server endpoints THEN the system SHALL create a POST endpoint at /api/save-score
2. WHEN /api/save-score is called THEN the system SHALL accept: userId, score, date, and correctGuesses
3. WHEN /api/save-score is called THEN the system SHALL check if the user has already played today
4. WHEN /api/save-score is called THEN the system SHALL return success status and whether the score was saved
5. WHEN implementing server endpoints THEN the system SHALL create a GET endpoint at /api/leaderboard
6. WHEN /api/leaderboard is called THEN the system SHALL accept a date parameter
7. WHEN /api/leaderboard is called THEN the system SHALL return: user rank, total players, and top 10 players
8. WHEN /api/leaderboard is called THEN the system SHALL return player usernames and scores

### Requirement 10: Mobile-Responsive Design

**User Story:** As a mobile player, I want the game to work well on my phone screen, so that I can play comfortably on any device.

#### Acceptance Criteria

1. WHEN the game is displayed on mobile THEN the system SHALL render images in a responsive layout
2. WHEN on small screens THEN the system SHALL ensure images are appropriately sized and clickable
3. WHEN displaying text THEN the system SHALL use readable font sizes on mobile devices
4. WHEN displaying the ASCII title THEN the system SHALL ensure it scales appropriately for mobile screens
5. WHEN displaying buttons THEN the system SHALL ensure they are large enough for touch interaction
