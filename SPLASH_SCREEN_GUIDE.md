# Real or Render - Splash Screen Guide

## Overview

The splash screen is the first thing players see when they encounter your game in the Reddit feed. It's been designed to be visually compelling and encourage clicks while showcasing the game's unique "Real or Render" concept.

## Visual Design

### Theme & Styling
- **Dark Mode First**: Matches the game's dark theme with high contrast elements
- **Monospace Typography**: Uses mono font for the title to give it a technical, digital feel
- **Color Palette**: 
  - Primary blue for key elements and CTAs
  - Warning yellow/orange for challenge hooks
  - Neutral grays for supporting text
  - Background cards for visual hierarchy

### Layout Structure

The splash screen follows a vertical stack layout with these key sections:

1. **Hero Visual** (Top)
   - Camera 📷 vs Robot 🤖 emoji battle
   - "REAL OR RENDER" title in bold monospace
   - Establishes the core concept immediately

2. **Tagline**
   - "🧠 Can You Spot the AI?"
   - Clear value proposition
   - Invites player curiosity

3. **Daily Challenge Badge**
   - Shows current date
   - Displays player count with dynamic text
   - Creates FOMO and social proof

4. **Feature List**
   - 🔍 Magnifier tool
   - 🎯 10 rounds
   - ⏱️ Timed gameplay
   - 🏆 Leaderboard
   - Scannable format with emojis

5. **Challenge Hook** (Bottom)
   - "⚡ Think You Can Beat the AI?"
   - Social proof: "Average score: 6-7 out of 10"
   - Direct challenge to player ego

6. **Launch Button**
   - "🎮 Launch Challenge"
   - Primary style (blue)
   - Clear call-to-action

## Dynamic Content

The splash screen adapts based on real-time data:

### Player Count
- **No players yet**: "Be the first to play today!"
- **One player**: "1 player today"
- **Multiple players**: "X players today"

### Date Display
- Formatted as: "Month Day, Year" (e.g., "Oct 17, 2025")
- Updates automatically each day

## Implementation Details

### File Location
`apps/devvit/src/server/actions/6_splashScreenAction.ts`

### Endpoint
`GET /splash`

### Response Format
Returns JSON with Devvit's splash screen schema:
```typescript
{
  content: {
    type: 'vstack',
    // ... layout configuration
  },
  button: {
    text: '🎮 Launch Challenge',
    style: 'primary'
  }
}
```

### Data Sources
- `postData.date`: Game date from post metadata
- `postData.playerCount`: Number of players who've played today
- Both are optional and have fallback values

## Best Practices Applied

### ✅ Mobile-First Design
- Large touch targets
- Readable text sizes
- Vertical scrolling layout
- Emoji icons for visual clarity

### ✅ Clear Value Proposition
- Immediately shows what the game is about
- Lists concrete features
- Sets expectations (10 rounds, timed, leaderboard)

### ✅ Social Proof
- Shows player count
- Mentions average score
- Creates competitive motivation

### ✅ Visual Hierarchy
- Most important info at top (hero + tagline)
- Supporting details in middle (features)
- Call-to-action at bottom (challenge hook + button)

### ✅ Compelling Copy
- Action-oriented language ("Launch Challenge", "Beat the AI")
- Creates curiosity ("Can You Spot the AI?")
- Uses social proof ("Most people score 6-7")
- Challenges player ego ("Think you can do better?")

## Testing the Splash Screen

### Local Development
1. Run `npm run dev` in the project directory
2. Open the playtest URL provided by Devvit
3. The splash screen appears in the Reddit feed before launching

### What to Check
- [ ] All text is readable and properly formatted
- [ ] Emojis display correctly
- [ ] Player count updates dynamically
- [ ] Date shows current date
- [ ] Launch button is prominent and clickable
- [ ] Layout looks good on mobile and desktop
- [ ] Colors match the game's dark theme

## Customization Tips

### Changing the Button Text
Edit the `button.text` property:
```typescript
button: {
  text: '🎮 Your Custom Text Here',
  style: 'primary',
}
```

### Adjusting Colors
Devvit provides these color options:
- `primary` - Blue (main brand color)
- `warning` - Yellow/Orange (attention)
- `neutral-content-strong` - High contrast text
- `neutral-content` - Normal text
- `neutral-content-weak` - Subtle text

### Adding/Removing Features
Edit the feature list in the `children` array. Each feature follows this pattern:
```typescript
{
  type: 'hstack',
  alignment: 'start middle',
  gap: 'small',
  children: [
    {
      type: 'text',
      text: '🎯', // Emoji icon
      style: { size: 'large' }
    },
    {
      type: 'text',
      text: 'Your feature description',
      style: {
        size: 'medium',
        color: 'neutral-content-strong'
      }
    }
  ]
}
```

## Resources

- [Devvit Splash Screen Documentation](https://developers.reddit.com/docs/capabilities/server/splash-screen)
- [Devvit UI Components](https://developers.reddit.com/docs/capabilities/ui-components)
- Project README: `apps/devvit/README.md`

## Notes

- The splash screen is rendered server-side and cached by Reddit
- Changes require redeployment to see in production
- Test thoroughly in the playtest environment before deploying
- Keep text concise - users scroll quickly through feeds
- Use emojis strategically for visual interest and scannability
