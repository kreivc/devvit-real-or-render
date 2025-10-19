# Splash Screen Implementation

## Overview

The splash screen is the first thing players see when they encounter your Real or Render game in their Reddit feed. It's designed to be visually compelling and clearly communicate what the game is about, encouraging users to click "Play Now" and launch the full game experience.

## What is a Splash Screen?

A splash screen is a preview interface that appears in Reddit posts before users launch your Devvit app. It serves as:
- **Marketing material**: Attracts attention and explains the game
- **Loading optimization**: Allows the main app to load in the background
- **User experience**: Sets expectations for what players will experience

## Implementation Details

### File Location
- **Server Action**: `apps/devvit/src/server/actions/6_splashScreenAction.ts`
- **Configuration**: `apps/devvit/devvit.json` (splash endpoint registered)
- **Server Registration**: `apps/devvit/src/server/index.ts` (action imported and registered)

### Configuration in devvit.json

```json
"post": {
  "dir": "dist/client",
  "entrypoints": {
    "default": {
      "entry": "index.html",
      "inline": true,
      "splash": "/splash"
    }
  }
}
```

The `"splash": "/splash"` line tells Devvit to call the `/splash` endpoint to get the splash screen configuration.

### Endpoint Structure

The splash screen is served via a GET endpoint at `/splash` that returns a JSON configuration object describing the layout, content, and styling.

## Current Design

### Visual Hierarchy

1. **Hero Section**
   - 🤖 vs 📷 emoji (eye-catching visual)
   - "REAL OR RENDER" title in monospace font (brand identity)
   - "Can You Spot the AI?" tagline (value proposition)
   - Daily challenge date badge (creates urgency)

2. **Feature List** (in a card-style container)
   - ✓ 10 rounds of real vs AI images
   - ⏱️ Race against the clock
   - 🏆 Compete on daily leaderboard
   - 🎯 Train your AI detection skills

3. **Call to Action**
   - "Think you can tell the difference?" (challenge/intrigue)
   - "🎮 Play Now" button (primary action)

### Design Principles

- **Mobile-first**: Optimized for small screens where most Reddit users browse
- **Clear value proposition**: Immediately communicates what the game is
- **Visual appeal**: Uses emojis and structured layout for engagement
- **Brand consistency**: Monospace font matches the ASCII art in the main game
- **Urgency**: "Daily Challenge" creates FOMO (fear of missing out)

## Customization Guide

### Changing the Title

```typescript
{
  type: 'text',
  text: 'YOUR GAME NAME',
  style: {
    font: 'mono',  // Options: 'mono', 'sans', 'serif'
    size: 'xlarge', // Options: 'xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge'
    color: 'primary', // Options: 'primary', 'secondary', 'success', 'warning', 'danger', 'neutral-content-strong', 'neutral-content-weak'
    weight: 'bold', // Options: 'regular', 'bold'
  },
}
```

### Adding/Removing Features

The feature list is in the `children` array of the card container. Each feature follows this pattern:

```typescript
{
  type: 'hstack',
  alignment: 'start middle',
  gap: 'small',
  children: [
    {
      type: 'text',
      text: '🎯', // Icon/emoji
      style: {
        size: 'large',
      },
    },
    {
      type: 'text',
      text: 'Your feature description',
      style: {
        size: 'medium',
        color: 'neutral-content-strong',
      },
    },
  ],
}
```

### Changing the Button Text

```typescript
button: {
  text: '🎮 Play Now', // Change this text
  style: 'primary', // Options: 'primary', 'secondary', 'plain'
}
```

### Using Dynamic Data

The splash screen has access to `postData` from the context, allowing you to display dynamic information:

```typescript
const { postData } = context;
const gameDate = postData?.date as string | undefined;
const playerCount = postData?.playerCount as number | undefined;

// Use in your content
{
  type: 'text',
  text: `${playerCount || 0} players today`,
  style: { size: 'medium' }
}
```

## Layout Components

### Available Component Types

1. **vstack**: Vertical stack (children arranged top to bottom)
2. **hstack**: Horizontal stack (children arranged left to right)
3. **text**: Text content with styling
4. **spacer**: Empty space for layout control
5. **image**: Display images (requires media URL)

### Alignment Options

- **Horizontal**: `start`, `center`, `end`
- **Vertical**: `top`, `middle`, `bottom`
- **Combined**: `center middle`, `start top`, etc.

### Spacing Options

- **gap**: Space between children (`xsmall`, `small`, `medium`, `large`, `xlarge`)
- **padding**: Internal spacing (`xsmall`, `small`, `medium`, `large`, `xlarge`)

### Styling Options

- **backgroundColor**: Background color for containers
- **cornerRadius**: Rounded corners (`small`, `medium`, `large`, `full`)
- **borderColor**: Border color
- **borderWidth**: Border thickness

## Best Practices

### Do's ✅

- **Keep it concise**: Users should understand the game in 3-5 seconds
- **Use emojis**: They're eye-catching and universally understood
- **Show value**: Explain why someone should play
- **Create urgency**: "Daily challenge" encourages immediate action
- **Match branding**: Use consistent fonts/colors with your main app
- **Test on mobile**: Most Reddit users are on mobile devices

### Don'ts ❌

- **Don't overload**: Too much text or too many features overwhelms
- **Don't use tiny text**: Ensure readability on small screens
- **Don't hide the button**: Make the CTA obvious and prominent
- **Don't use complex layouts**: Keep it simple and scannable
- **Don't forget accessibility**: Use good color contrast

## Testing

### Local Testing

1. Run `npm run dev` in the project directory
2. Open the playtest URL provided by Devvit
3. The splash screen will appear in the post preview
4. Click "Play Now" to test the transition to the full game

### What to Test

- [ ] Splash screen loads without errors
- [ ] All text is readable on mobile
- [ ] Emojis display correctly
- [ ] Button is clearly visible and clickable
- [ ] Layout looks good on different screen sizes
- [ ] Dynamic data (date, etc.) displays correctly
- [ ] Transition to full game works smoothly

## Advanced Customization

### Adding Images

You can include images in your splash screen (must be uploaded to Reddit's media service):

```typescript
{
  type: 'image',
  url: 'https://your-media-url.com/image.png',
  description: 'Alt text for accessibility',
  width: 200,
  height: 200,
}
```

### Creating a Grid Layout

Use nested hstacks and vstacks:

```typescript
{
  type: 'vstack',
  gap: 'small',
  children: [
    {
      type: 'hstack',
      gap: 'small',
      children: [
        { type: 'text', text: 'Item 1' },
        { type: 'text', text: 'Item 2' },
      ],
    },
    {
      type: 'hstack',
      gap: 'small',
      children: [
        { type: 'text', text: 'Item 3' },
        { type: 'text', text: 'Item 4' },
      ],
    },
  ],
}
```

### Conditional Content

Show different content based on conditions:

```typescript
const features = [];

if (isNewPlayer) {
  features.push({
    type: 'text',
    text: '🎉 First time? Welcome!',
  });
}

if (hasPlayedToday) {
  features.push({
    type: 'text',
    text: '✓ Already played today',
  });
}

// Use features array in your content
```

## Resources

- **Devvit Splash Screen Docs**: https://developers.reddit.com/docs/capabilities/server/splash-screen
- **Devvit UI Components**: https://developers.reddit.com/docs/capabilities/ui-components
- **Reddit Design System**: https://www.reddit.com/design

## Troubleshooting

### Splash screen not appearing
- Check that `devvit.json` has the `"splash": "/splash"` configuration
- Verify the endpoint is registered in `src/server/index.ts`
- Check server logs for errors

### Layout looks broken
- Verify all component types are valid
- Check that alignment values are correct
- Ensure nested structures are properly closed

### Button not working
- Verify button configuration is at the root level of the response
- Check that `style` is one of: `primary`, `secondary`, `plain`

### Dynamic data not showing
- Verify `postData` is being passed correctly when creating posts
- Check that data types match expectations
- Add error handling for missing data

## Future Enhancements

Consider adding:
- Player statistics (total players, average score)
- Preview of today's image difficulty
- Streak counter for returning players
- Social proof (friends who played)
- Achievement badges
- Seasonal themes

---

**Need help?** Check the Devvit documentation or ask in the Reddit developer community!
