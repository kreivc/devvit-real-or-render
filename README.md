## **Inspiration**

We were inspired by two main trends: the rise of "Real or AI" photo challenges and the massive popularity of daily games like Wordle. We found that most existing "real or AI" games were too short and not challenging enough. We wanted to combine these concepts to create the definitive, most engaging version of a "real or render" daily challenge, complete with scoring and a competitive leaderboard.

## **What it does**

Real or Render is a daily game where players face 10 rounds, trying to distinguish between a real photograph and an AI-generated image.

- **Gameplay:** Players can hover to zoom (on web) or hold & drag (on the Mobile Browser) or hold (on Reddit app) to inspect the images closely using magnifier before clicking their choice for the "REAL" photo.
- **Scoring & Leaderboard:** A global leaderboard ranks all players based on two factors: the number of **correct answers** and the **total time** taken.
- **Anti-Cheating:** Every player gets the same 10 image pairs each day, but the order of the rounds _and_ the left/right position of the images are randomized for every game to make cheating difficult.
- **Transparency:** After finishing, players see their final score and rank. They can also view the "Photo Sources" to see the original, real photos. We exclusively use Pexels, which has a clear anti-AI content policy, ensuring our "real" images are authentic.
- **Community Sharing:** From the results screen, players can post their score directly to the comment section. To keep the competition fair, only the **first game score** of the day counts towards the leaderboard and is eligible for sharing. Replays are allowed but will not be recorded.

## **How we built it**

We built the game using the **Devvit (React) template**, which was very easy to get started with. We already had an existing web version of this game, so we brought in our existing styles and components as a baseline.

This is where **Kiro** became essential to our workflow and developer experience:

1. We first used **Planning Mode** to describe our core game features (like the daily logic, 10-round system, and leaderboard scoring). Kiro generated a great functional starting point, but the styling didn't match our vision.
2. We then used the **Vibe Code** feature. We pointed Kiro at our existing style folders and components and asked it to adapt the new Devvit code to "vibe" with our established design language. It worked like a charm, perfectly matching our styles with only minor adjustments to margins and padding needed from us.

## **Challenges we ran into**

Our main challenge was deciding between a normal app and the `inline (beta)` experience. We chose `inline` for a much better and more integrated player experience, but this created a new problem: the splash screen for an inline post (`backgroundURI`) is just a static image.

We tried designing three different static images, but none felt engaging enough. We wanted a custom, animated splash screen.

**Our Solution:** We built a fully custom splash screen _inside_ the app itself. To prevent Reddit's default tiled background from flashing on load, we set the app's `backgroundURI` to a **transparent PNG**. This tricks the client into showing no background, allowing our custom splash screen to be the first thing the user sees. Our biggest challenge then shifted to designing a beautiful and eye-catching splash screen that felt native to the experience.

## **Accomplishments that we're proud of**

We're incredibly proud of finishing the project so much faster than we anticipated, and we have **Kiro** to thank for that. The "Vibe Code" feature was a true game-changer for integrating our design and saving us days of work.

We're also proud of the app's final polish and performance. It feels smooth, responsive, and achieved a **93 on our Lighthouse performance test**, which is fantastic for a game running inside a webview. Finally, we're very proud of our clever workaround for the inline splash screen.

## **What we learned**

We learned that building games on Devvit is incredibly fun and rewarding. The positive feedback, comments, and high player count we received after cross-posting to Reddit's gaming communities were extremely motivating.

Technically, we learned a clever solution for the inline post's static splash screen. Most importantly, our experience with **Kiro** showed us how much faster we can develop. It made us feel like "nothing is impossible" and has completely changed our perspective on meeting tight deadlines.

## **What's next for Real or Render**

We have a lot of ideas for the future! Our top priorities are adding more community and engagement features like **daily streaks** and **achievements**.

Our biggest planned feature is to build a **user-submission system**. We want to let users upload their _own_ real photos, which we can then use to create AI-generated counterparts for future challenges. We would, of course, give a shout-out to the original photographer in the game. This will require building a robust validation pipeline to ensure all submitted images are genuine.
